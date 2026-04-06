# 🎬 YTClone — Full-Stack YouTube Clone (MERN)

A feature-complete YouTube-inspired video platform built with the MERN stack (MongoDB, Express, React, Node.js). Dark-themed, responsive, and production-ready architecture.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🏠 **Home Feed** | Grid of all videos with thumbnails, views, channel info |
| 🔐 **Auth** | JWT-based register/login with bcrypt password hashing |
| 🎬 **Watch Page** | HTML5 video player, auto-increments view count |
| 👍 **Like System** | Toggle like/unlike with optimistic UI update |
| 💬 **Comments** | Post & view comments (auth required to post) |
| 🔍 **Search** | Regex search across title, description and tags |
| 📤 **Upload** | Upload video + thumbnail files, creates DB entry |
| 🏷️ **Tags** | Clickable tags on watch page trigger search |
| 📱 **Responsive** | Mobile-friendly layout, sidebar hides on small screens |

---

## 🗂️ Project Structure

```
youtube-clone/
├── server/                     # Express + Node.js backend
│   ├── models/
│   │   ├── User.js             # username, email, password(hashed), avatar, subscribers
│   │   ├── Video.js            # title, description, videoUrl, thumbnailUrl, views, likes, tags
│   │   └── Comment.js          # text, author, video, likes
│   ├── routes/
│   │   ├── auth.js             # POST /api/auth/register, /api/auth/login
│   │   ├── videos.js           # GET,POST /api/videos | GET /api/videos/search | PUT /:id/like
│   │   ├── comments.js         # GET,POST /api/comments/:videoId
│   │   └── upload.js           # POST /api/upload/video, /api/upload/thumbnail
│   ├── middleware/
│   │   └── authMiddleware.js   # JWT verify, attaches req.user
│   ├── uploads/
│   │   ├── videos/             # Uploaded video files
│   │   └── thumbnails/         # Uploaded thumbnail images
│   ├── .env                    # Environment variables
│   ├── seed.js                 # Populates DB with 3 users + 12 videos + 12 comments
│   └── server.js               # Express app entry point (port 5000)
│
└── client/                     # React + Vite frontend
    └── src/
        ├── api/
        │   └── axios.js        # Axios instance with JWT interceptor
        ├── context/
        │   └── AuthContext.jsx # Auth state, login/logout, localStorage persistence
        ├── components/
        │   ├── Navbar.jsx      # Logo, search bar, auth-aware actions
        │   ├── Sidebar.jsx     # Category nav links
        │   ├── VideoCard.jsx   # Thumbnail card with metadata
        │   └── CommentSection.jsx # Load + post comments
        ├── pages/
        │   ├── Home.jsx        # Video grid feed
        │   ├── Watch.jsx       # Player + like + sidebar + comments
        │   ├── Search.jsx      # Search results grid
        │   ├── Upload.jsx      # File upload + video creation form
        │   ├── Login.jsx       # Sign in form
        │   └── Register.jsx    # Create account form
        ├── App.jsx             # Router + layout + protected routes
        └── index.css           # Full dark theme CSS (no component library)
```

---

## 🛠️ Tech Stack

**Backend**
- [Node.js](https://nodejs.org/) — Runtime
- [Express](https://expressjs.com/) — HTTP server & routing
- [MongoDB](https://www.mongodb.com/) — Database
- [Mongoose](https://mongoosejs.com/) — ODM / schema modeling
- [bcryptjs](https://www.npmjs.com/package/bcryptjs) — Password hashing
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) — JWT auth
- [multer](https://www.npmjs.com/package/multer) — File upload handling
- [dotenv](https://www.npmjs.com/package/dotenv) — Environment config
- [cors](https://www.npmjs.com/package/cors) — Cross-origin requests

**Frontend**
- [React 18](https://react.dev/) — UI library
- [Vite](https://vitejs.dev/) — Build tool & dev server
- [React Router v7](https://reactrouter.com/) — Client-side routing
- [Axios](https://axios-http.com/) — HTTP client

**Styling**
- Vanilla CSS with CSS custom properties (no component library)
- Dark theme, responsive grid, micro-animations

---

## ⚡ Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) (running locally on port 27017)

> Verify MongoDB is running:
> ```powershell
> Get-Service -Name MongoDB
> # Should show: Running
> ```
> If stopped: `net start MongoDB`

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd youtube-clone
```

### 2. Setup the Backend

```powershell
cd server

# Install dependencies
npm install

# Copy env (already included) — edit if needed
# .env contains: PORT, MONGODB_URI, JWT_SECRET
```

### 3. Seed the Database

```powershell
# From server/
node seed.js
```

Expected output:
```
Connected to MongoDB for seeding...
Cleared existing data.
Created 3 users.
Created 12 videos.
Created 12 comments.
✅ Database seeded successfully!
```

### 4. Start the Backend

```powershell
# From server/
node server.js
```

Expected output:
```
✅ Connected to MongoDB
🚀 Server running on http://localhost:5000
```

### 5. Setup & Start the Frontend

```powershell
cd ../client
npm install --legacy-peer-deps
npm run dev
```

Expected output:
```
VITE ready in XXms
➜  Local: http://localhost:5173/
```

---

## 🌐 App is now running at

| Service | URL |
|---|---|
| **Frontend** | http://localhost:5173 |
| **Backend API** | http://localhost:5000/api |
| **Health check** | http://localhost:5000/api/health |

---

## 🔑 Demo Credentials (after seeding)

```
Email: techguru@example.com   | Password: password123
Email: cooking@example.com    | Password: password123
Email: gamerz@example.com     | Password: password123
```

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Body | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | `{username, email, password}` | — |
| POST | `/api/auth/login` | `{email, password}` | — |

### Videos
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/videos` | All videos (populated) | — |
| GET | `/api/videos/:id` | Single video + increment views | — |
| GET | `/api/videos/search?q=` | Regex search on title/tags/description | — |
| POST | `/api/videos` | Create a new video | ✅ |
| PUT | `/api/videos/:id/like` | Toggle like | ✅ |

### Comments
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/comments/:videoId` | All comments for a video | — |
| POST | `/api/comments/:videoId` | Post a comment | ✅ |

### Upload
| Method | Endpoint | Body | Auth |
|---|---|---|---|
| POST | `/api/upload/video` | `multipart: video` | ✅ |
| POST | `/api/upload/thumbnail` | `multipart: thumbnail` | ✅ |

---

## 🎨 Design System (CSS Variables)

```css
--bg: #0f0f0f          /* Page background */
--surface: #1a1a1a     /* Cards, navbar */
--border: #2a2a2a      /* Dividers */
--text: #f1f1f1        /* Primary text */
--muted: #aaaaaa       /* Secondary text */
--accent: #ff0000      /* Brand red */
--radius: 8px          /* Border radius */
```

---

## 🧪 Testing Features

| Feature | Steps |
|---|---|
| Home feed | Open http://localhost:5173 — 12 videos load |
| Login | Click Sign In → `techguru@example.com` / `password123` |
| Watch video | Click any card → video plays, views increment |
| Like | Click 👍 on watch page (must be logged in) |
| Comment | Scroll below player → type + submit |
| Search | Type `gaming`, `cooking`, `react` in search bar |
| Upload | Sign in → click Upload → pick video + thumbnail + fill form |
| Tags | Click any `#tag` on a watch page → search results |

---

## ⚙️ Environment Variables

**`server/.env`**

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/youtube-clone
JWT_SECRET=yt_clone_super_secret_key_2024_xyz
```

> Change `JWT_SECRET` to a strong random string in production.

---

## 📝 Notes

- All 12 seed videos use the same public sample MP4 (`mov_bbb.mp4`). Real videos can be uploaded via the Upload page.
- Uploaded files are stored locally in `server/uploads/`. For production, replace with cloud storage (S3, Cloudinary, etc.)
- No TypeScript — intentionally plain JavaScript for simplicity.

---

## 📜 License

MIT
