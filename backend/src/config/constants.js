/**
 * Application constants
 */

import { env } from './env.js';

export const PORT = env.PORT;
export const JWT_SECRET = env.JWT_SECRET;

/**
 * Hardcoded credentials seeded into DB for development/demo
 */
export const HARDCODED_USERS = [
  { email: 'admin@nox.ai', password: 'admin123' },
  { email: 'demo@nox.ai', password: 'demo123' },
  { email: 'test@nox.ai', password: 'test123' },
];
