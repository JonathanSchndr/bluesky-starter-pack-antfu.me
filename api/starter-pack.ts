import { defineEventHandler } from 'h3'
import { AtpAgent } from '@atproto/api'
import { CronJob } from 'cron'

// Types
interface UserMetrics {
  handle: string
  displayName: string
  description: string
  followers: number
  following: number
  postsCount: number
  followerScore: number
  postsScore: number
  interactionsScore: number
  lastActive: string
  score?: number
}

interface StarterPack {
  name: string
  description: string
  lastUpdated: string
  users: UserMetrics[]
}

interface BlueskyList {
  name: string
  description: string
  avatar?: string
  purpose: 'app.bsky.graph.defs#modlist' | 'app.bsky.graph.defs#curatelist'
  createdAt: string
}

// Global variables
let starterPackData: StarterPack | null = null
let isUpdating = false
let agent: AtpAgent | null = null

// Helper for retry logic
async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  let lastError: any

  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      console.error(`Attempt ${i + 1} failed:`, error)
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
      }
    }
  }

  throw lastError
}

// Initialize ATP agent
async function initializeAgent(): Promise<AtpAgent> {
  const newAgent = new AtpAgent({
    service: 'https://bsky.social',
  })

  await withRetry(async () => {
    await newAgent.login({
      identifier: process.env.BLUESKY_USERNAME!,
      password: process.env.BLUESKY_PASSWORD!
    })
  })

  return newAgent
}

async function fetchAllFollows(handle: string): Promise<Set<string>> {
  if (!agent) throw new Error('Agent not initialized')

  const follows = new Set<string>()
  let cursor: string | undefined

  try {
    do {
      const response = await withRetry(async () =>
        agent!.app.bsky.graph.getFollows({
          actor: handle,
          limit: 100,
          cursor
        })
      )

      response.data.follows.forEach(follow => {
        follows.add(follow.handle)
      })

      cursor = response.data.cursor
    } while (cursor)

    return follows
  } catch (error) {
    console.error(`Error fetching follows for ${handle}:`, error)
    return new Set()
  }
}

function calculatePostsPerDay(postDates: Date[]): number {
  try {
    if (postDates.length === 0) return 0
    if (postDates.length === 1) return 1

    // Sort dates newest to oldest
    const sortedDates = [...postDates].sort((a, b) => b.getTime() - a.getTime())

    // Calculate time range in days between newest and oldest post
    const newestDate = sortedDates[0]
    const oldestDate = sortedDates[sortedDates.length - 1]
    const daysDiff = Math.max(
      1,
      (newestDate.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    // Calculate average posts per day
    const postsPerDay = Math.min(50, postDates.length / daysDiff)

    // Round to 2 decimal places
    return Math.round(postsPerDay * 100) / 100
  } catch (error) {
    console.error('Error calculating posts per day:', error)
    return 0
  }
}

function calculateAverageInteractions(feed: any[]): number {
  try {
    const interactions = feed.map(item => {
      const likes = Number(item.post.likeCount) || 0
      const reposts = Number(item.post.repostCount) || 0
      const replies = Number(item.post.replyCount) || 0
      return likes + reposts + replies
    })

    return interactions.length > 0
      ? Math.round((interactions.reduce((a, b) => a + b, 0) / interactions.length) * 100) / 100
      : 0
  } catch {
    return 0
  }
}

function calculateScores(user: {
  followers: number,
  postsPerDay: number,
  avgInteractions: number
}): {
  followerScore: number,
  postsScore: number,
  interactionsScore: number,
  score: number
} {
  // Calculate individual scores on a scale of 0-100
  const followerScore = Math.round(Math.log10(user.followers + 1) * 10 * 100) / 100
  const postsScore = Math.round(user.postsPerDay * 10 * 100) / 100
  const interactionsScore = Math.round(Math.log10(user.avgInteractions + 1) * 10 * 100) / 100

  // Calculate final score with weights
  const followerWeight = 0.4
  const postsWeight = 0.35
  const interactionsWeight = 0.25

  const score = Math.round(
    (followerScore * followerWeight +
    postsScore * postsWeight +
    interactionsScore * interactionsWeight) * 100
  ) / 100

  return {
    followerScore,
    postsScore,
    interactionsScore,
    score
  }
}

async function analyzeUser(handle: string): Promise<UserMetrics | null> {
  if (!agent) throw new Error('Agent not initialized')

  try {
    const [profile, posts] = await Promise.all([
      withRetry(async () =>
        agent!.app.bsky.actor.getProfile({
          actor: handle
        })
      ),
      withRetry(async () =>
        agent!.app.bsky.feed.getAuthorFeed({
          actor: handle,
          limit: 50
        })
      )
    ])

    const postDates = posts.data.feed
      .map(post => {
        try {
          const date = new Date(post.post.indexedAt)
          return date.getTime() ? date : null
        } catch {
          return null
        }
      })
      .filter((date): date is Date => date !== null)

    const defaultDate = new Date().toISOString()
    const postsPerDay = calculatePostsPerDay(postDates)
    const avgInteractions = calculateAverageInteractions(posts.data.feed)

    // Calculate scores
    const scores = calculateScores({
      followers: profile.data.followersCount ?? 0,
      postsPerDay,
      avgInteractions
    })

    return {
      handle: profile.data.handle,
      displayName: profile.data.displayName || handle,
      description: profile.data.description || '',
      followers: profile.data.followersCount || 0,
      following: profile.data.followsCount || 0,
      postsCount: profile.data.postsCount || 0,
      followerScore: scores.followerScore,
      postsScore: scores.postsScore,
      interactionsScore: scores.interactionsScore,
      lastActive: postDates.length > 0 ? postDates[0].toISOString() : defaultDate,
      score: scores.score
    }
  } catch (error) {
    console.error(`Error analyzing user ${handle}:`, error)
    return null
  }
}

async function analyzeAntfuNetwork(): Promise<UserMetrics[]> {
  if (!agent) throw new Error('Agent not initialized')

  const users = new Map<string, UserMetrics>()
  const ANTFU_HANDLE = 'antfu.me'

  try {
    const follows = await fetchAllFollows(ANTFU_HANDLE)
    console.log(`Found ${follows.size} users followed by ${ANTFU_HANDLE}`)

    const batchSize = 5
    const handles = Array.from(follows)

    for (let i = 0; i < handles.length; i += batchSize) {
      const batch = handles.slice(i, i + batchSize)
      const results = await Promise.all(
        batch.map(handle => analyzeUser(handle))
      )

      results.forEach((user, index) => {
        if (user) {
          users.set(batch[index], user)
        }
      })

      if (i + batchSize < handles.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    return Array.from(users.values())
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 150)
  } catch (error) {
    console.error('Error analyzing network:', error)
    throw error
  }
}

async function updateBlueskyList(users: UserMetrics[]): Promise<void> {
  if (!agent) throw new Error('Agent not initialized')

  try {
    console.log('Updating Bluesky list...')

    const existingLists = await agent.app.bsky.graph.getLists({
      actor: process.env.BLUESKY_USERNAME!
    })

    const listData: BlueskyList = {
      name: 'Top Tech Voices',
      description: 'Top 150 most active and influential tech voices from @antfu.me network, automatically curated.',
      purpose: 'app.bsky.graph.defs#curatelist',
      createdAt: new Date().toISOString()
    }

    let listUri: string
    let listCid: string
    const existingList = existingLists.data.lists.find(list => list.name === listData.name)

    if (existingList) {
      console.log('Updating existing list...')
      const result = await agent.com.atproto.repo.putRecord({
        repo: agent.session?.did!,
        collection: 'app.bsky.graph.list',
        rkey: existingList.uri.split('/').pop()!,
        record: listData
      })
      listUri = existingList.uri
      listCid = result.data.cid
    } else {
      console.log('Creating new list...')
      const result = await agent.com.atproto.repo.createRecord({
        repo: agent.session?.did!,
        collection: 'app.bsky.graph.list',
        record: listData
      })
      listUri = result.data.uri
      listCid = result.data.cid
    }

    // Get current list members
    const currentMembers = new Set<string>()
    let cursor: string | undefined

    do {
      const members = await agent.app.bsky.graph.getList({
        list: listUri,
        cursor
      })

      members.data.items.forEach(member => {
        currentMembers.add(member.subject.did)
      })

      cursor = members.data.cursor
    } while (cursor)

    // Update list members
    console.log('Updating list members...')
    const batchSize = 10

    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize)

      for (const user of batch) {
        try {
          const profile = await agent.app.bsky.actor.getProfile({
            actor: user.handle
          })

          if (!currentMembers.has(profile.data.did)) {
            await agent.com.atproto.repo.createRecord({
              repo: agent.session?.did!,
              collection: 'app.bsky.graph.listitem',
              record: {
                list: listUri,
                subject: profile.data.did,
                createdAt: new Date().toISOString()
              }
            })
            console.log(`Added ${user.handle} to list`)
          }
        } catch (error) {
          console.error(`Failed to add ${user.handle} to list:`, error)
        }
      }

      if (i + batchSize < users.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    console.log('Successfully updated Bluesky list')
  } catch (error) {
    console.error('Failed to update Bluesky list:', error)
    throw error
  }
}

async function updateStarterPack(): Promise<void> {
  if (isUpdating) return

  isUpdating = true
  try {
    console.log('Starting network analysis...')
    const users = await analyzeAntfuNetwork()

    starterPackData = {
      name: 'Top Tech Voices from @antfu.me Network',
      description: 'Top 150 most active and influential users followed by @antfu.me',
      lastUpdated: new Date().toISOString(),
      users
    }

    await updateBlueskyList(users)

    console.log(`Updated starter pack with ${users.length} users`)
  } catch (error) {
    console.error('Failed to update starter pack:', error)
  } finally {
    isUpdating = false
  }
}

// Initialize and start updates
(async () => {
  try {
    console.log('Initializing ATP agent...')
    agent = await initializeAgent()
    console.log('Successfully logged into Bluesky')

    await updateStarterPack()

    // Daily update at 2 AM UTC
    new CronJob('0 2 * * *', updateStarterPack, null, true)
  } catch (error) {
    console.error('Failed to initialize:', error)
  }
})()

// API Route Handler
export default defineEventHandler(async () => {
  if (!agent) {
    return {
      success: false,
      error: 'Server is not properly initialized'
    }
  }

  if (!starterPackData) {
    return {
      success: false,
      error: 'Starter pack is still initializing'
    }
  }

  return {
    success: true,
    data: starterPackData,
    lastUpdated: new Date(starterPackData.lastUpdated)
  }
})