/**
 * NoX Chat API - Entry point
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { env, validateEnv } from './config/env.js';
import { connectDb } from './db/connect.js';
import { initStorage } from './storage/storage.js';
import authRoutes from './routes/auth.js';
import threadRoutes from './routes/threads.js';
import mcpRoutes from './mcp/routes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/threads', threadRoutes);
app.use('/mcp', mcpRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

async function start() {
  validateEnv();
  await connectDb();
  await initStorage();

  app.listen(env.PORT, () => {
    console.log(`NoX Chat API running at http://localhost:${env.PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start:', err.message);
  process.exit(1);
});
