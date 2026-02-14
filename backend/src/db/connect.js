/**
 * MongoDB connection
 */

import mongoose from 'mongoose';
import { env } from '../config/env.js';

function sanitizeUri(uri) {
  try {
    return uri.replace(/:([^:@]+)@/, ':***@');
  } catch {
    return '(hidden)';
  }
}

export async function connectDb() {
  const uri = env.MONGODB_URI;
  console.log('[MongoDB] Connecting to', sanitizeUri(uri));

  try {
    await mongoose.connect(uri);
    console.log('[MongoDB] Connected successfully');
  } catch (err) {
    console.error('[MongoDB] Connection failed:', err.message);
    console.error('[MongoDB] Error code:', err.code || 'N/A');
    if (err.reason) {
      console.error('[MongoDB] Reason:', JSON.stringify(err.reason, null, 2));
    }

    if (err.code === 'ECONNREFUSED') {
      console.error(
        '[MongoDB] Connection refused. Is MongoDB running?\n' +
          '  - Local: run `mongod` or start MongoDB service\n' +
          '  - Cloud: use MongoDB Atlas (https://cloud.mongodb.com)'
      );
    } else if (err.message?.includes('bad auth') || err.message?.includes('authentication failed')) {
      console.error(
        '[MongoDB] Auth failed. Check:\n' +
          '  1. Username and password in MONGODB_URI are correct\n' +
          '  2. Password has no special chars - if it does, URL-encode them (e.g. @ → %40)\n' +
          '  3. Database user exists in Atlas: Security → Database Access\n' +
          '  4. User has read/write access to the database'
      );
    }

    throw err;
  }
}

export async function disconnectDb() {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  } catch (err) {
    console.error('MongoDB disconnect error:', err.message);
  }
}
