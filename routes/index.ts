import { defineEventHandler } from 'h3'

export default defineEventHandler(async () => {
  // Fetch data from our API
  const response = await fetch('https://bluesky-starter-pack-antfume-production.up.railway.app/api/starter-pack')
  const data = await response.json()

  if (!data.success) {
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Error - Top Tech Voices</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-100 min-h-screen flex items-center justify-center">
          <div class="text-center">
            <h1 class="text-2xl font-bold text-red-600 mb-4">Error Loading Rankings</h1>
            <p class="text-gray-600">Please try again later</p>
            <button onclick="location.reload()"
                    class="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Retry
            </button>
          </div>
        </body>
      </html>
    `
  }

  const top3 = data.data.users.slice(0, 3)

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Top Tech Voices from @antfu.me Network</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
        <style>
          body {
            font-family: 'Inter', sans-serif;
          }
          .card-hover {
            transition: transform 0.2s ease-in-out;
          }
          .card-hover:hover {
            transform: translateY(-4px);
          }
        </style>
      </head>
      <body class="bg-gray-100 min-h-screen">
        <div class="container mx-auto px-4 py-8">
          <!-- Header -->
          <header class="text-center mb-12">
            <h1 class="text-4xl font-bold text-gray-900 mb-2">Top Tech Voices</h1>
            <p class="text-gray-600">Based on @antfu.me's network</p>
          </header>

          <!-- Top 3 Cards -->
          <div class="flex flex-wrap justify-center gap-8 mb-12">
            ${top3.map((user, index) => `
              <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm relative card-hover">
                <!-- Position Medal -->
                <div class="absolute -top-4 -right-4 w-12 h-12 ${
                  index === 0 ? 'bg-yellow-400' :
                  index === 1 ? 'bg-gray-400' : 'bg-yellow-700'
                } rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  ${index + 1}
                </div>

                <!-- Profile Info -->
                <div class="text-center">
                  <h2 class="text-xl font-bold text-gray-900 mb-2">${user.displayName}</h2>
                  <a href="https://bsky.app/profile/${user.handle}"
                     target="_blank"
                     class="text-blue-500 hover:text-blue-700 mb-4 inline-block transition">
                    @${user.handle}
                  </a>
                  <p class="text-gray-600 mb-4 line-clamp-2 min-h-12">${user.description || 'No description'}</p>
                </div>

                <!-- Stats Grid -->
                <div class="grid grid-cols-2 gap-4 text-center mb-4">
                  <div class="bg-gray-50 rounded-lg p-3">
                    <p class="text-gray-600 text-sm">Followers</p>
                    <p class="text-2xl font-bold text-gray-900">
                      ${new Intl.NumberFormat('en-US', {
                        notation: user.followers > 10000 ? 'compact' : 'standard',
                        maximumFractionDigits: 1
                      }).format(user.followers)}
                    </p>
                  </div>
                  <div class="bg-gray-50 rounded-lg p-3">
                    <p class="text-gray-600 text-sm">Posts</p>
                    <p class="text-2xl font-bold text-gray-900">
                      ${new Intl.NumberFormat('en-US', {
                        notation: user.postsCount > 10000 ? 'compact' : 'standard',
                        maximumFractionDigits: 1
                      }).format(user.postsCount)}
                    </p>
                  </div>
                </div>

                <!-- Scores -->
                <div class="space-y-2">
                  <div class="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg transition">
                    <span class="text-gray-600">Follower Score</span>
                    <span class="font-bold">${user.followerScore.toFixed(1)}</span>
                  </div>
                  <div class="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg transition">
                    <span class="text-gray-600">Posts Score</span>
                    <span class="font-bold">${user.postsScore.toFixed(1)}</span>
                  </div>
                  <div class="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg transition">
                    <span class="text-gray-600">Interactions Score</span>
                    <span class="font-bold">${user.interactionsScore.toFixed(1)}</span>
                  </div>
                  <div class="mt-4 pt-4 border-t">
                    <div class="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                      <span class="text-gray-900 font-bold">Total Score</span>
                      <span class="text-xl font-bold text-blue-600">${user.score?.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Footer -->
          <div class="text-center">
            <a href="/api/starter-pack"
               class="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition transform hover:-translate-y-0.5">
              View Full Rankings
            </a>
            <p class="mt-4 text-gray-600">
              Last updated: ${new Date(data.data.lastUpdated).toLocaleString()}
            </p>
            <div class="mt-8 text-sm text-gray-500">
              <p>Built by <a href="https://bsky.app/profile/jonathanschndr.de"
                            class="text-blue-500 hover:text-blue-700 transition">@jonathanschndr.de</a></p>
              <p>Source code on <a href="https://github.com/JonathanSchndr/bluesky-starter-pack-antfu.me"
                                  class="text-blue-500 hover:text-blue-700 transition">GitHub</a></p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `
})