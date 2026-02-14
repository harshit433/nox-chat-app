/**
 * Environment configuration with validation
 */

function getEnv(key, defaultValue) {
  const value = process.env[key] ?? defaultValue;
  return value;
}

function requireEnv(key) {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  NODE_ENV: getEnv('NODE_ENV', 'development'),
  PORT: parseInt(getEnv('PORT', '4000'), 10),
  JWT_SECRET: getEnv('JWT_SECRET', 'nox-chat-secret-key-change-in-production'),
  MONGODB_URI: getEnv('MONGODB_URI', 'mongodb://localhost:27017/nox-chat'),
};

export function validateEnv() {
  if (env.NODE_ENV === 'production') {
    if (!env.JWT_SECRET || env.JWT_SECRET.includes('change-in-production')) {
      throw new Error('JWT_SECRET must be set in production');
    }
    if (!env.MONGODB_URI || env.MONGODB_URI.includes('localhost')) {
      throw new Error('MONGODB_URI must point to production database');
    }
  }
}
