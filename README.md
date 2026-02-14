# NoX Chat App

A production-grade chat web application for conversing with NoX, an AI agent. Built with Next.js (frontend) and Node.js (backend).

## Features

- **Authentication**: Sign in, sign up, and sign out flows
- **Threading**: Separate chat threads with sidebar; create new threads or reply to messages to branch into new threads
- **Chat**: Real-time messaging with NoX AI agent
- **Storage**: File-based storage (backend) and localStorage (frontend) for development
- **Theme**: Professional, minimalistic black and white design

## Project Structure

```
nox-chat-app/
├── backend/          # Node.js Express API
│   ├── src/
│   │   ├── config/    # Constants and configuration
│   │   ├── middleware/# Auth middleware
│   │   ├── routes/   # Auth and message routes
│   │   └── storage/  # File-based persistence
│   └── data/         # JSON storage (auto-created)
├── frontend/         # Next.js application
│   └── src/
│       ├── app/      # Pages and layout
│       ├── components/# Reusable UI components
│       ├── contexts/ # React contexts (Auth)
│       └── lib/      # API client and storage helpers
└── README.md
```

## Hardcoded Credentials (Backend)

For development, these accounts are pre-configured:

| Email        | Password  |
|-------------|-----------|
| admin@nox.ai | admin123 |
| demo@nox.ai  | demo123  |
| test@nox.ai  | test123  |

You can also sign up with new accounts.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Backend

```bash
cd backend
npm install
npm run dev
```

API runs at `http://localhost:4000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:3000`

### Run Both

From the project root:

```bash
# Terminal 1
cd backend && npm install && npm run dev

# Terminal 2
cd frontend && npm install && npm run dev
```

## API Endpoints

| Method | Endpoint                        | Description                      |
|--------|----------------------------------|----------------------------------|
| POST   | /api/auth/signin                 | Sign in with email/password      |
| POST   | /api/auth/signup                 | Register new account             |
| GET    | /api/threads                     | List threads (requires auth)     |
| POST   | /api/threads                    | Create thread (requires auth)    |
| GET    | /api/threads/:id/messages       | Get messages for thread          |
| POST   | /api/threads/:id/messages       | Send message to thread           |

## Environment Variables

**Backend** (optional):

- `PORT` - Server port (default: 4000)
- `JWT_SECRET` - JWT signing secret
- `STORAGE_PATH` - Path for data files
