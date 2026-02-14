/**
 * File-based storage (simulates localStorage for backend)
 * Persists users, threads, and messages to JSON files
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { HARDCODED_USERS } from '../config/constants.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const THREADS_FILE = path.join(DATA_DIR, 'threads.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readJsonFile(filePath, defaultValue = {}) {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return defaultValue;
  }
}

async function writeJsonFile(filePath, data) {
  await ensureDataDir();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Initialize storage with hardcoded users
 */
export async function initStorage() {
  await ensureDataDir();
  const existingUsers = await readJsonFile(USERS_FILE, { users: [] });

  const userMap = new Map();
  [...HARDCODED_USERS, ...(existingUsers.users || [])].forEach((u) => {
    userMap.set(u.email, u);
  });
  const users = Array.from(userMap.values());
  await writeJsonFile(USERS_FILE, { users });
}

/**
 * Get all users
 */
export async function getUsers() {
  const data = await readJsonFile(USERS_FILE, { users: [] });
  return data.users || [];
}

/**
 * Find user by email
 */
export async function findUserByEmail(email) {
  const users = await getUsers();
  return users.find((u) => u.email === email) || null;
}

/**
 * Add or update user
 */
export async function saveUser(user) {
  const data = await readJsonFile(USERS_FILE, { users: [] });
  const users = data.users || [];
  const idx = users.findIndex((u) => u.email === user.email);
  if (idx >= 0) {
    users[idx] = { ...users[idx], ...user };
  } else {
    users.push(user);
  }
  await writeJsonFile(USERS_FILE, { users });
  return user;
}

// ─── Threads ─────────────────────────────────────────────────────────────

/**
 * Get all threads for a user
 */
export async function getThreads(userId) {
  const data = await readJsonFile(THREADS_FILE, {});
  const threads = data[userId] || [];
  return threads.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
}

/**
 * Create a new thread (optionally from a reply to a message)
 */
export async function createThread(userId, options = {}) {
  const { title, parentMessageId, parentThreadId } = options;
  const threadId = `thread-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const now = new Date().toISOString();

  const thread = {
    id: threadId,
    userId,
    title: title || 'New chat',
    createdAt: now,
    updatedAt: now,
    parentMessageId: parentMessageId || null,
    parentThreadId: parentThreadId || null,
  };

  const data = await readJsonFile(THREADS_FILE, {});
  const userThreads = data[userId] || [];
  userThreads.unshift(thread);
  data[userId] = userThreads;
  await writeJsonFile(THREADS_FILE, data);

  return thread;
}

/**
 * Get a thread by id (must belong to user)
 */
export async function getThread(userId, threadId) {
  const threads = await getThreads(userId);
  return threads.find((t) => t.id === threadId) || null;
}

/**
 * Update thread (e.g. title, updatedAt)
 */
export async function updateThread(userId, threadId, updates) {
  const data = await readJsonFile(THREADS_FILE, {});
  const threads = data[userId] || [];
  const idx = threads.findIndex((t) => t.id === threadId);
  if (idx < 0) return null;
  threads[idx] = { ...threads[idx], ...updates, updatedAt: new Date().toISOString() };
  data[userId] = threads;
  await writeJsonFile(THREADS_FILE, data);
  return threads[idx];
}

// ─── Messages (thread-scoped) ─────────────────────────────────────────────

/**
 * Get messages for a thread
 */
export async function getMessages(threadId) {
  const data = await readJsonFile(MESSAGES_FILE, {});
  return data[threadId] || [];
}

/**
 * Add message to thread and return updated list
 */
export async function addMessage(threadId, message) {
  const data = await readJsonFile(MESSAGES_FILE, {});
  const messages = data[threadId] || [];
  messages.push(message);
  data[threadId] = messages;
  await writeJsonFile(MESSAGES_FILE, data);
  return messages;
}
