/**
 * NoX Chat API - Entry point
 */

import express from 'express';
import cors from 'cors';
import { PORT } from './config/constants.js';
import { initStorage } from './storage/storage.js';
import authRoutes from './routes/auth.js';
import threadRoutes from './routes/threads.js';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/threads', threadRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

async function start() {
  await initStorage();
  app.listen(PORT, () => {
    console.log(`NoX Chat API running at http://localhost:${PORT}`);
  });
}

start().catch(console.error);
