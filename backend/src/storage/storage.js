/**
 * MongoDB storage - replaces file-based storage
 */

import { User } from '../models/User.js';
import { Thread } from '../models/Thread.js';
import { Message } from '../models/Message.js';
import { HARDCODED_USERS } from '../config/constants.js';

function toUserDto(doc) {
  if (!doc) return null;
  const d = doc.toObject ? doc.toObject() : doc;
  return {
    id: d._id?.toString() ?? d.id,
    email: d.email,
    password: d.password,
  };
}

function toThreadDto(doc) {
  if (!doc) return null;
  const d = doc.toObject ? doc.toObject() : doc;
  return {
    id: d._id?.toString() ?? d.id,
    userId: d.userId,
    title: d.title,
    createdAt: d.createdAt?.toISOString?.() ?? d.createdAt,
    updatedAt: d.updatedAt?.toISOString?.() ?? d.updatedAt,
    parentMessageId: d.parentMessageId ?? null,
    parentThreadId: d.parentThreadId ?? null,
  };
}

function toMessageDto(doc) {
  if (!doc) return null;
  const d = doc.toObject ? doc.toObject() : doc;
  return {
    id: d._id?.toString() ?? d.id,
    role: d.role,
    content: d.content,
    timestamp: d.createdAt?.toISOString?.() ?? d.createdAt ?? d.timestamp,
    replyTo: d.replyTo ?? undefined,
    isContext: d.isContext ?? false,
  };
}

/**
 * Initialize storage - seed hardcoded users if they don't exist
 */
export async function initStorage() {
  for (const { email, password } of HARDCODED_USERS) {
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (!exists) {
      await User.create({ email: email.toLowerCase(), password });
    }
  }
}

/**
 * Find user by email
 */
export async function findUserByEmail(email) {
  const doc = await User.findOne({ email: email.trim().toLowerCase() }).lean();
  return doc ? toUserDto(doc) : null;
}

/**
 * Save (create) user
 */
export async function saveUser(user) {
  const doc = await User.create({
    email: user.email.trim().toLowerCase(),
    password: user.password,
  });
  return toUserDto(doc);
}

/**
 * Get all threads for a user
 */
export async function getThreads(userId) {
  const docs = await Thread.find({ userId })
    .sort({ updatedAt: -1 })
    .lean();
  return docs.map(toThreadDto);
}

/**
 * Create a new thread
 */
export async function createThread(userId, options = {}) {
  const { title, parentMessageId, parentThreadId } = options;
  const doc = await Thread.create({
    userId,
    title: title || 'New chat',
    parentMessageId: parentMessageId || null,
    parentThreadId: parentThreadId || null,
  });
  return toThreadDto(doc);
}

/**
 * Get a thread by id (must belong to user)
 */
export async function getThread(userId, threadId) {
  const doc = await Thread.findOne({ _id: threadId, userId }).lean();
  return doc ? toThreadDto(doc) : null;
}

/**
 * Get a thread by id only (for MCP - no ownership check)
 */
export async function getThreadById(threadId) {
  const doc = await Thread.findOne({ _id: threadId }).lean();
  return doc ? toThreadDto(doc) : null;
}

/**
 * Update thread
 */
export async function updateThread(userId, threadId, updates) {
  const doc = await Thread.findOneAndUpdate(
    { _id: threadId, userId },
    { ...updates, updatedAt: new Date() },
    { new: true }
  ).lean();
  return doc ? toThreadDto(doc) : null;
}

/**
 * Get messages for a thread
 */
export async function getMessages(threadId) {
  const docs = await Message.find({ threadId }).sort({ createdAt: 1 }).lean();
  return docs.map(toMessageDto);
}

/**
 * Add message to thread and return updated list
 */
export async function addMessage(threadId, message) {
  const doc = await Message.create({
    threadId,
    role: message.role,
    content: message.content,
    replyTo: message.replyTo ?? null,
    isContext: message.isContext ?? false,
  });
  const all = await Message.find({ threadId }).sort({ createdAt: 1 }).lean();
  return all.map(toMessageDto);
}
