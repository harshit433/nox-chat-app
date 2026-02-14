# NoX Chat App

A production-grade chat web application for conversing with NoX, an AI agent. Built with Next.js (frontend) and Node.js (backend).

## Features

- **Authentication**: Sign in, sign up, and sign out flows
- **Threading**: Separate chat threads with sidebar; create new threads or reply to messages to branch into new threads
- **Chat**: Real-time messaging with NoX AI agent
- **Storage**: MongoDB (backend), localStorage for client-side auth cache (frontend)
- **Theme**: Professional, minimalistic black and white design

---

## Backend Architecture (Detailed)

The backend is a Node.js Express API that provides authentication and thread-based chat functionality. It uses MongoDB for persistence and JWT for stateless authentication.

### Directory Structure

```
backend/
├── src/
│   ├── config/           # Configuration and constants
│   │   ├── env.js        # Environment variable loading and validation
│   │   └── constants.js  # App constants, hardcoded demo users
│   ├── db/
│   │   └── connect.js    # MongoDB connection with error handling
│   ├── middleware/
│   │   ├── auth.js       # JWT verification for protected routes
│   │   ├── errorHandler.js  # Global error handling
│   │   └── asyncHandler.js  # Async route wrapper (available)
│   ├── models/          # Mongoose schemas
│   │   ├── User.js
│   │   ├── Thread.js
│   │   ├── Message.js
│   │   └── index.js
│   ├── mcp/
│   │   ├── server.js     # MCP tools (list_threads, read_messages, send_assistant_message)
│   │   └── routes.js     # POST /mcp handler
│   ├── routes/
│   │   ├── auth.js       # POST /signin, /signup
│   │   └── threads.js    # CRUD for threads and messages
│   ├── storage/
│   │   └── storage.js    # Data access layer (abstracts Mongoose)
│   └── index.js         # Entry point
├── .env                  # Environment variables (create from .env.example)
├── .env.example
└── package.json
```

### Startup Flow

1. **Load environment** – `dotenv/config` loads `.env` before any other imports
2. **Validate env** – `validateEnv()` enforces production requirements (JWT_SECRET, non-localhost MONGODB_URI)
3. **Connect to MongoDB** – `connectDb()` establishes connection with detailed error logging
4. **Seed data** – `initStorage()` creates hardcoded demo users if they don't exist
5. **Start server** – Express listens on `PORT`

### Configuration (`src/config/`)

| File | Purpose |
|------|---------|
| `env.js` | Reads `process.env`, provides defaults, `validateEnv()` for production checks |
| `constants.js` | Exports `PORT`, `JWT_SECRET`, and `HARDCODED_USERS` for seeding |

**Environment variables** (see `.env.example`):

- `PORT` – Server port (default: 4000)
- `NODE_ENV` – `development` or `production`
- `JWT_SECRET` – Secret for signing JWTs (required to be non-default in production)
- `MONGODB_URI` – MongoDB connection string (must not be localhost in production)

### Database Layer (`src/db/`)

**`connect.js`** – MongoDB connection with:

- Sanitized URI logging (password masked)
- Specific error handling for `ECONNREFUSED` and auth failures
- Helpful hints for Atlas setup (URL-encoding passwords, user permissions)

### Data Models (`src/models/`)

All models use Mongoose with `timestamps: true` and custom `toJSON` transforms for consistent API responses.

#### User

| Field | Type | Validation |
|-------|------|------------|
| email | String | required, unique, lowercase, email regex |
| password | String | required, min 6 chars |

- `toJSON` strips `password` and exposes `id` (from `_id`)

#### Thread

| Field | Type | Validation |
|-------|------|------------|
| userId | String | required, indexed |
| title | String | required, default "New chat", max 200 chars |
| parentMessageId | String | optional, for reply threads |
| parentThreadId | String | optional, for reply threads |

- Index: `{ userId: 1, updatedAt: -1 }` for efficient listing

#### Message

| Field | Type | Validation |
|-------|------|------------|
| threadId | String | required, indexed |
| role | String | required, enum: `user` \| `assistant` |
| content | String | required, trimmed |
| replyTo | String | optional |
| isContext | Boolean | optional, for quoted reply context |

- Index: `{ threadId: 1, createdAt: 1 }` for ordered message fetch

### Storage Layer (`src/storage/storage.js`)

Abstraction over Mongoose. Converts documents to DTOs with consistent shapes (`id`, ISO timestamps, etc.).

| Function | Description |
|----------|-------------|
| `initStorage()` | Seeds hardcoded users into DB on startup |
| `findUserByEmail(email)` | Returns user with `id`, `email`, `password` or null |
| `saveUser(user)` | Creates user, returns DTO |
| `getThreads(userId)` | Returns threads sorted by `updatedAt` desc |
| `createThread(userId, options)` | Creates thread, returns DTO |
| `getThread(userId, threadId)` | Returns thread if owned by user |
| `updateThread(userId, threadId, updates)` | Updates and returns thread |
| `getMessages(threadId)` | Returns messages sorted by `createdAt` |
| `addMessage(threadId, message)` | Appends message, returns full list |

### Middleware (`src/middleware/`)

| Middleware | Purpose |
|------------|---------|
| `authMiddleware` | Reads `Authorization: Bearer <token>`, verifies JWT, sets `req.user` (`userId`, `email`). Returns 401 if missing/invalid. |
| `errorHandler` | Catches errors, maps to HTTP status: ValidationError→400, duplicate key→409, CastError→400, JWT errors→401, else 500. |

### Routes

#### Auth (`/api/auth`)

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| POST | `/signin` | No | `{ email, password }` | `{ user: { id, email }, token }` |
| POST | `/signup` | No | `{ email, password }` | `{ user: { id, email }, token }` (201) |

- Signup: validates email/password, checks duplicate email, creates user, returns JWT (7d expiry)
- Signin: validates credentials against DB (including seeded users), returns JWT

#### Threads (`/api/threads`)

All thread routes require `Authorization: Bearer <token>`.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List user's threads |
| POST | `/` | Create thread. Body: `{ title?, parentMessageId?, parentThreadId? }`. If reply params present, copies parent message as first message with `isContext: true` |
| GET | `/:threadId` | Get single thread (404 if not found or not owned) |
| GET | `/:threadId/messages` | Get messages for thread |
| POST | `/:threadId/messages` | Send message. Body: `{ content }`. Appends user message + NoX reply, updates thread title from first message if "New chat" |

### Error Handling

- **400** – Validation failed, invalid ObjectId, bad request
- **401** – Missing/invalid/expired JWT, wrong credentials
- **404** – Thread not found
- **409** – Duplicate email (signup)
- **500** – Unhandled errors (with `error` message in JSON)

### MCP Server (`/mcp`)

The backend exposes an [MCP](https://modelcontextprotocol.io) (Model Context Protocol) server at `POST /mcp`. AI agents and MCP clients can connect to:

| Tool | Description |
|------|--------------|
| `list_threads` | List chat threads for a user. Args: `{ email }` |
| `read_messages` | Read messages in a thread. Args: `{ threadId }` |
| `send_assistant_message` | Send a NoX (assistant) message to a thread. Args: `{ threadId, content }` |

Example MCP client config (e.g. Claude Desktop, Cursor):

```json
{
  "mcpServers": {
    "nox-chat": {
      "url": "http://localhost:4000/mcp"
    }
  }
}
```

### Dependencies

| Package | Purpose |
|---------|---------|
| express | HTTP server |
| cors | CORS middleware |
| mongoose | MongoDB ODM |
| jsonwebtoken | JWT sign/verify |
| dotenv | Load `.env` |
| @modelcontextprotocol/sdk | MCP server |
| express-mcp-handler | MCP Express integration |
| zod | Schema validation |

### Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `start` | `node src/index.js` | Production run |
| `dev` | `node --watch src/index.js` | Development with file watch |

---

## Project Structure (Full)

```
nox-chat-app/
├── backend/          # Node.js Express API (see Backend Architecture above)
├── frontend/         # Next.js application
│   └── src/
│       ├── app/      # Pages and layout
│       ├── components/# Reusable UI components
│       ├── contexts/ # React contexts (Auth)
│       └── lib/      # API client and storage helpers
└── README.md
```

## Hardcoded Credentials (Backend)

Seeded into MongoDB on first run:

| Email        | Password  |
|-------------|-----------|
| admin@nox.ai | admin123 |
| demo@nox.ai  | demo123  |
| test@nox.ai  | test123  |

You can also sign up with new accounts.

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Backend

```bash
cd backend
cp .env.example .env   # Edit .env with your MONGODB_URI
npm install
npm run dev
```

API runs at `http://localhost:4000`.

**MongoDB setup:**

- **Local**: Run `mongod` or start MongoDB service. Use `MONGODB_URI=mongodb://localhost:27017/nox-chat`
- **Atlas**: Create free cluster at [cloud.mongodb.com](https://cloud.mongodb.com) → Database Access → Create user → Network Access → Add IP → Get connection string. Set `MONGODB_URI` in `.env`. If password has special chars, URL-encode them (e.g. `@` → `%40`).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:3000`

### Run Both

```bash
# Terminal 1
cd backend && npm install && npm run dev

# Terminal 2
cd frontend && npm install && npm run dev
```

## API Endpoints

| Method | Endpoint                        | Description                      |
|--------|----------------------------------|----------------------------------|
| GET    | /api/health                     | Health check                     |
| POST   | /api/auth/signin                | Sign in                          |
| POST   | /api/auth/signup                | Sign up                          |
| GET    | /api/threads                    | List threads (auth)              |
| POST   | /api/threads                   | Create thread (auth)             |
| GET    | /api/threads/:id               | Get thread (auth)                |
| GET    | /api/threads/:id/messages       | Get messages (auth)              |
| POST   | /api/threads/:id/messages       | Send message (auth)              |
| POST   | /mcp                            | MCP server (tools for AI agents)|

## Environment Variables

| Variable     | Description                    | Default                          |
|-------------|--------------------------------|----------------------------------|
| PORT        | Server port                    | 4000                             |
| NODE_ENV    | development / production      | development                      |
| JWT_SECRET  | JWT signing secret (required in prod) | (dev default)             |
| MONGODB_URI | MongoDB connection string      | mongodb://localhost:27017/nox-chat |
