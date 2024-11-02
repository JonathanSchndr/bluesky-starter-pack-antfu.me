# Bluesky Starter Pack antfu.me

**Important:** It is currently a list and not a starter pack, as this has not yet been implemented in the offcial api. This will be added as soon as it is available. However, the functionality of the list will remain the same. The list is available here: https://bsky.app/profile/jonathanschndr.de/lists/3l7ykssg2522z

A Nitro-powered server that analyzes @antfu.me's Bluesky network to rank and curate the top 150 tech voices based on engagement metrics. The system provides both an API endpoint and an automatically updated Bluesky list.

## 🌟 Features

- **Smart Ranking System**:
  - Follower Score (40% weight)
  - Posts Score (35% weight)
  - Interactions Score (25% weight)
- **Daily Updates**: Automatic refresh at 2 AM UTC
- **REST API**: Simple access to current rankings
- **Bluesky List**: Auto-updated curated list
- **TypeScript**: Fully typed for better developer experience

## 📋 Technical Requirements

- Node.js (v18 or higher)
- npm or yarn
- A Bluesky account for API access

## 🔌 Live Access Points

- **API Endpoint**: [https://bluesky-starter-pack-antfume-production.up.railway.app/api/starter-pack](https://bluesky-starter-pack-antfume-production.up.railway.app/api/starter-pack)
- **Bluesky List**: [https://bsky.app/profile/jonathanschndr.de/lists/3l7ykssg2522z](https://bsky.app/profile/jonathanschndr.de/lists/3l7ykssg2522z)

## 📁 Project Structure

```
bluesky-starter-pack-antfu.me/
├── api/
│   └── starter-pack.ts      # API route & main logic
├── nitro.config.ts          # Nitro base configuration
├── .env                     # Environment variables
├── .gitignore              # Git ignore rules
├── package.json            # Project dependencies
└── README.md               # Documentation
```

## 🚀 Installation & Setup

1. **Clone repository**
   ```bash
   git clone https://github.com/JonathanSchndr/bluesky-starter-pack-antfu.me.git
   cd bluesky-starter-pack-antfu.me
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   NITRO_PORT=3000
   BLUESKY_USERNAME=your-username.bsky.social
   BLUESKY_PASSWORD=your-password
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## 🔌 API Response Format

### GET /api/starter-pack

```json
{
  "success": true,
  "data": {
    "name": "Top Tech Voices from @antfu.me Network",
    "description": "Top 150 most active and influential users followed by @antfu.me",
    "lastUpdated": "2024-11-02T00:00:00.000Z",
    "users": [
      {
        "handle": "user.bsky.social",
        "displayName": "User Name",
        "description": "Bio",
        "followers": 1000,
        "following": 500,
        "postsCount": 1200,
        "followerScore": 30.10,
        "postsScore": 45.50,
        "interactionsScore": 28.70,
        "lastActive": "2024-11-01T12:00:00.000Z",
        "score": 35.24
      }
    ]
  }
}
```

## 🔢 Scoring System

The ranking system uses three main components:

1. **Follower Score (40%)**
   - Logarithmic scaling of follower count
   - `Math.log10(followers + 1) * 10`

2. **Posts Score (35%)**
   - Based on posting frequency
   - Limited to realistic maximum
   - `postsPerDay * 10`

3. **Interactions Score (25%)**
   - Average engagements per post
   - Includes likes, reposts, and replies
   - `Math.log10(avgInteractions + 1) * 10`

Final score is weighted average of these components, scaled 0-100.

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Clean build files
rm -rf .output
```

## 📝 Environment Variables

| Variable | Description |
|----------|-------------|
| `NITRO_PORT` | Server port (default: 3000) |
| `BLUESKY_USERNAME` | Your Bluesky username (with .bsky.social) |
| `BLUESKY_PASSWORD` | Your Bluesky password |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Known Issues & Solutions

1. **API Rate Limits**
   ```
   Error: Too many requests
   ```
   Solution: The server implements automatic rate limiting and waiting periods.

2. **Authentication Errors**
   ```
   Error: Authentication failed
   ```
   Solution: Check your Bluesky credentials in the `.env` file.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Credits

- [@antfu](https://github.com/antfu) for the amazing tech community
- [Bluesky](https://bsky.app) for the API
- [Nitro](https://nitro.unjs.io/) for the server framework
- [Railway](https://railway.app) for hosting

## 💬 Support

For questions or issues:
1. Check existing issues in the repository
2. Open a new issue with detailed description
3. Contact via Bluesky: [@jonathanschndr.de](https://bsky.app/profile/jonathanschndr.de)

---

Built with ❤️ for the tech community