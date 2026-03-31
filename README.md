# NotesMind — AI-Powered Notes Learning Platform

A production-ready full-stack application for uploading, managing, and learning from notes using AI.

---

## 🏗️ Architecture Overview

```
notesapp/
├── backend/                  # Node.js + Express API
│   ├── controllers/          # Route handler logic
│   ├── models/               # Mongoose schemas (User, Note)
│   ├── routes/               # Express route definitions
│   ├── middleware/           # JWT auth, access control, rate limiting
│   ├── services/             # AI service (Claude API)
│   ├── utils/                # File upload, text extraction
│   └── server.js             # App entry point
│
└── frontend/                 # React (Vite) SPA
    └── src/
        ├── components/       # Layout, NoteCard, ChatPanel, QuizPanel
        ├── pages/            # Login, Register, Dashboard, Upload, NoteDetail, Search
        ├── context/          # AuthContext (JWT state)
        └── services/         # Axios API client
```

---

## ⚙️ Prerequisites

- **Node.js** v18+
- **MongoDB** (local or [MongoDB Atlas](https://cloud.mongodb.com))
- **Anthropic API Key** — get one at [console.groq.com](https://console.groq.com)

---

## 🚀 Quick Start

### 1. Clone and install

```bash
# Backend
cd notesapp/backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment variables

```bash
# In backend/
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/notesapp
JWT_SECRET=your_super_secret_jwt_key_change_in_production
GROQ_API_KEY=gsk_...your-key-here...
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MAX_FILE_SIZE=10485760
```

### 3. Start MongoDB

```bash
# If running locally:
mongod
# Or use MongoDB Atlas connection string in MONGODB_URI
```

### 4. Run the backend

```bash
cd backend
npm run dev
# ✅ MongoDB connected
# 🚀 Server running on port 5000
```

### 5. Run the frontend

```bash
cd frontend
npm run dev
# App available at http://localhost:5173
```

---

## 🌐 Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Backend server port | No (default: 5000) |
| `MONGODB_URI` | MongoDB connection string | ✅ Yes |
| `JWT_SECRET` | Secret for signing JWT tokens | ✅ Yes |
| `GROQ_API_KEY` | Groq API key | ✅ Yes |
| `NODE_ENV` | `development` or `production` | No |
| `CLIENT_URL` | Frontend URL for CORS | No (default: localhost:5173) |
| `MAX_FILE_SIZE` | Max upload size in bytes | No (default: 10MB) |

---

## 📡 API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | None | Register new user |
| POST | `/api/auth/login` | None | Login, returns JWT |
| GET | `/api/auth/me` | JWT | Get current user info |

### Notes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/notes` | Optional | List accessible notes |
| POST | `/api/notes/upload` | JWT | Upload new note (multipart) |
| GET | `/api/notes/:id` | Optional* | Get note detail |
| PUT | `/api/notes/:id` | Owner | Update note |
| DELETE | `/api/notes/:id` | Owner | Delete note |
| POST | `/api/notes/:id/summary` | JWT + Access | Generate AI summary |
| POST | `/api/notes/:id/chat` | JWT + Access + Limit | Chat with note (10/day) |
| GET | `/api/notes/:id/quiz` | JWT + Access + Limit | Generate quiz (5/day) |
| POST | `/api/notes/:id/bookmark` | JWT | Toggle bookmark |
| POST | `/api/notes/:id/share` | Owner | Share with email |

*Public notes accessible without auth

### Search
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/search?q=&type=text` | Optional | Text or semantic search |

---

## 🔐 Access Control Rules

| Action | Public Note | Private Note | Owner |
|--------|-------------|--------------|-------|
| View | ✅ Anyone | ❌ | ✅ |
| Chat (AI) | ✅ Logged-in | ❌ | ✅ |
| Quiz (AI) | ✅ Logged-in | ❌ | ✅ |
| Edit/Delete | ❌ | ❌ | ✅ |
| Share | ❌ | ❌ | ✅ |

---

## 🧠 AI Features

All AI features use **Claude llama-3.3-70b-versatile** via the Anthropic API.

- **Auto-tagging**: Tags generated on upload
- **Summary**: Key points, concepts, short explanation
- **Chat**: Context-aware Q&A limited to note content
- **Quiz**: 5 MCQs with explanations + 3 short-answer questions
- **Semantic Search**: Cosine similarity on text frequency vectors

### Rate Limits (per user, per day)
- Chat: **10 requests**
- Quiz: **5 requests**
- Resets every 24 hours

---

## 🏭 Production Deployment

### Backend (e.g., Railway, Render, EC2)
```bash
cd backend
npm start
```

### Frontend (e.g., Vercel, Netlify)
```bash
cd frontend
npm run build
# Deploy the dist/ folder
```

### Environment for production
- Set `NODE_ENV=production`
- Use a strong random `JWT_SECRET` (32+ chars)
- Use MongoDB Atlas for the database
- Set `CLIENT_URL` to your deployed frontend URL

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6 |
| Backend | Node.js, Express 4 |
| Database | MongoDB, Mongoose |
| Auth | JWT (jsonwebtoken), bcryptjs |
| AI | Groq API (llama-3.3-70b-versatile) |
| File Upload | Multer |
| PDF Parsing | pdf-parse |
| HTTP Client | Axios |
