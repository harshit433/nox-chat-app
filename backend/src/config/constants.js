/**
 * Application constants and configuration
 */

export const PORT = process.env.PORT || 4000;
export const JWT_SECRET = process.env.JWT_SECRET || 'nox-chat-secret-key-change-in-production';
export const STORAGE_PATH = process.env.STORAGE_PATH || './data';

/**
 * Hardcoded credentials for allowed sign-in (development/demo)
 * In production, replace with proper database and hashed passwords
 */
export const HARDCODED_USERS = [
  { id: 'user-1', email: 'admin@nox.ai', password: 'admin123' },
  { id: 'user-2', email: 'demo@nox.ai', password: 'demo123' },
  { id: 'user-3', email: 'test@nox.ai', password: 'test123' },
];
