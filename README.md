# Bluesky Starter Pack antfu.me

A Nitro-powered server that generates and maintains a curated starter pack of the top 150 tech influencers from @antfu.me's Bluesky network. The server analyzes and ranks users based on follower counts, posting frequency, and engagement rates.

## 🌟 Features

- **Automated Curation**: Identifies top 150 tech voices from @antfu.me's following list
- **Smart Ranking System**:
  - Follower count (40% weight)
  - Posting frequency (35% weight)
  - Engagement rates (25% weight)
- **Daily Updates**: Automatic refresh at 2 AM UTC
- **REST API**: Simple access to current starter pack
- **TypeScript**: Fully typed for better developer experience

## 📋 Technical Requirements

- Node.js (v18 or higher)
- npm or yarn
- A Bluesky account for API access

## 🚀 Installation & Setup

1. **Clone repository**
   ```bash
   git clone https://github.com/username/bluesky-starter-pack-antfu.me.git
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

## 🔌 API Usage & Testing

### GET /api/starter-pack

Retrieves the current starter pack.

#### Using curl
```bash
curl http://localhost:3000/api/starter-pack
```

#### Using JavaScript/TypeScript
```typescript
// Using fetch
async function getStarterPack() {
  try {
    const response = await fetch('http://localhost:3000/api/starter-pack')
    const data = await response.json()
    console.log(data)
  } catch (error) {
    console.error('Error:', error)
  }
}

// Using axios
import axios from 'axios'

async function getStarterPack() {
  try {
    const response = await axios.get('http://localhost:3000/api/starter-pack')
    console.log(response.data)
  } catch (error) {
    console.error('Error:', error)
  }
}
```

#### Using Python
```python
import requests

response = requests.get('http://localhost:3000/api/starter-pack')
data = response.json()
print(data)
```

#### Response Format
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
        "postsPerDay": 3.5,
        "avgInteractions": 25.7,
        "lastActive": "2024-11-01T12:00:00.000Z",
        "activityScore": 85.4
      }
    ]
  }
}
```

### Troubleshooting API Access

If you encounter a 404 error, verify:

1. Server is running (`npm run dev` or `npm start`)
2. Correct file structure as shown above
3. Port configuration in `.env` matches your request
4. No cached builds (try cleaning and rebuilding):
   ```bash
   rm -rf .output
   rm -rf node_modules
   npm install
   npm run dev
   ```

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

## 💬 Support

For questions or issues:
1. Check existing issues in the repository
2. Open a new issue with detailed description
3. Contact the development team

---

Built with ❤️ for the tech community