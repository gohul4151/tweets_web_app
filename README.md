# FeedStack

A full-stack social media web app where users can post, like, comment, and interact with each other's content. Supports image/video uploads, nested comments, profile management, and shareable post links.

---

## Tech Stack

**Frontend**
- React 19 + Vite
- Tailwind CSS
- React Router DOM
- Lucide React (icons)

**Backend**
- Node.js + Express 5
- MongoDB + Mongoose
- JWT (cookie + Bearer token auth)
- Cloudinary (media storage)
- Multer (file uploads)
- bcrypt, Zod, cookie-parser

---

## Features

- **Auth** — Signup, login, logout with JWT (HttpOnly cookie + Bearer token)
- **Posts** — Create posts with optional image/video, title, description, tags
- **Feed** — Browse all posts or filter by user
- **Reactions** — Like / dislike posts and comments
- **Comments** — Nested comments (replies), like/dislike comments
- **Post management** — Edit or delete your own posts
- **Profile** — Upload/remove profile picture, change username, change password
- **Account deletion** — Full cleanup of posts, comments, media, and account
- **User search** — Search users by name
- **Public share** — Shareable post link accessible without login
- **Dark / Light theme** — Persisted in localStorage

---

## Project Structure

```
tweets_web_app/
├── backend/
│   ├── index.js          # Express app, all API routes
│   ├── db.js             # Mongoose models (users, posts, comments)
│   ├── auth.js           # JWT middleware
│   ├── upload.js         # Post upload route
│   ├── uploadprofile.js  # Profile picture upload route
│   ├── getallpost.js     # Feed route
│   ├── getmypost.js      # My posts route
│   ├── getviewuserpost.js# View another user's posts
│   ├── comments.js       # Comment routes
│   ├── countcomment.js   # Comment count helper
│   ├── cloudinary.js     # Cloudinary config
│   ├── cloudinaryUtils.js# Async delete helper
│   ├── timeAgo.js        # Relative time formatter
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.jsx               # Router, auth check, theme
    │   └── components/
    │       ├── home.jsx          # Main feed layout
    │       ├── post.jsx          # Single post card
    │       ├── upload_post.jsx   # Create post form
    │       ├── post_update.jsx   # Edit post form
    │       ├── your_post.jsx     # My posts view
    │       ├── viewprofile.jsx   # Profile settings
    │       ├── username.jsx      # View another user's profile
    │       ├── get_post_share.jsx# Public shareable post view
    │       ├── share.jsx         # Share modal
    │       ├── delete.jsx        # Delete post confirmation
    │       ├── reply_delete.jsx  # Delete comment/reply
    │       ├── login.jsx         # Login form
    │       ├── signup.jsx        # Signup form
    │       └── useDebounce.jsx   # Debounce hook (search)
    └── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB URI
- Cloudinary account

### 1. Backend

```bash
cd backend
npm install
```

Create a `.env` file:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CORS_ORIGINS=http://localhost:5173
PORT=3000
```

```bash
npm start          # production
npm run dev        # with nodemon
```

### 2. Frontend

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
VITE_BACKEND_URL=http://localhost:3000
```

```bash
npm run dev        # development
npm run build      # production build
```

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/signup` | — | Register new user |
| POST | `/login` | — | Login, sets cookie |
| GET | `/profile` | ✓ | Get current user info |
| GET | `/mytotalpost` | ✓ | Get post count + profile |
| PUT | `/changeusername` | ✓ | Update username |
| PUT | `/changepassword` | ✓ | Update password |
| POST | `/putpost` | ✓ | Create post (multipart) |
| GET | `/getpost` | ✓ | Get all posts (feed) |
| GET | `/getmypost` | ✓ | Get my posts |
| PUT | `/editpost/:id` | ✓ | Edit post metadata |
| DELETE | `/deletepost/:id` | ✓ | Delete post + media |
| POST | `/post/:id/likeon` | ✓ | Like a post |
| POST | `/post/:id/likeoff` | ✓ | Remove like |
| POST | `/post/:id/dislikeon` | ✓ | Dislike a post |
| POST | `/post/:id/dislikeoff` | ✓ | Remove dislike |
| GET | `/post/:id/likedby` | ✓ | List users who liked |
| POST | `/post/:id/comments` | ✓ | Add comment / reply |
| GET | `/post/:id/comments` | ✓ | Get comments |
| GET | `/comment/:id/replies` | ✓ | Get replies |
| POST | `/comment/:id/like` | ✓ | Like/toggle a comment |
| POST | `/comment/:id/dislike` | ✓ | Dislike/toggle a comment |
| DELETE | `/comment/:id` | ✓ | Delete comment + replies |
| GET | `/getuserpost/:name` | ✓ | View another user's posts |
| GET | `/search/users?q=` | ✓ | Search users by name |
| PUT/POST | `/updateprofilepicture` | ✓ | Upload profile picture |
| POST | `/removeprofilepicture` | ✓ | Reset to default picture |
| POST | `/deleteaccount` | ✓ | Delete account and all data |
| GET | `/sharepost/:id` | — | Public post view (no login needed) |

---

## Deployment

Set these environment variables on your hosting platform:

**Backend:**
```
MONGO_URI, JWT_SECRET, CLOUDINARY_*, CORS_ORIGINS, PORT
```
`CORS_ORIGINS` should be the production frontend URL (e.g. `https://your-app.vercel.app`).

**Frontend:**
```
VITE_BACKEND_URL=https://your-backend.render.com
```

The app auto-detects production vs local based on whether `CORS_ORIGINS` contains `https`, and adjusts cookie settings (`secure`, `sameSite`) accordingly.
