/**
 * Thread routes - create, list, get messages
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  getThreads,
  createThread,
  getThread,
  getMessages,
  addMessage,
  updateThread,
} from '../storage/storage.js';

const router = Router();
router.use(authMiddleware);

/**
 * GET /threads
 * List all threads for the authenticated user
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const threads = await getThreads(userId);
    res.json({ threads });
  } catch (err) {
    console.error('List threads error:', err);
    res.status(500).json({ error: 'Failed to list threads' });
  }
});

/**
 * POST /threads
 * Create a new thread. Optionally from a reply to a message.
 * Body: { title?, parentMessageId?, parentThreadId? }
 * When parentMessageId/parentThreadId are provided, the parent message is copied as context.
 */
router.post('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, parentMessageId, parentThreadId } = req.body || {};

    const thread = await createThread(userId, {
      title: title || 'New chat',
      parentMessageId: parentMessageId || null,
      parentThreadId: parentThreadId || null,
    });

    // If replying to a message, copy it as first message (context) in new thread
    if (parentMessageId && parentThreadId) {
      const parentMessages = await getMessages(parentThreadId);
      const parentMsg = parentMessages.find((m) => m.id === parentMessageId);
      if (parentMsg) {
        const contextMsg = {
          ...parentMsg,
          id: `msg-${Date.now()}-ctx`,
          replyTo: parentMessageId,
          isContext: true,
        };
        await addMessage(thread.id, contextMsg);
      }
    }

    res.status(201).json({ thread });
  } catch (err) {
    console.error('Create thread error:', err);
    res.status(500).json({ error: 'Failed to create thread' });
  }
});

/**
 * GET /threads/:threadId
 * Get a single thread (must belong to user)
 */
router.get('/:threadId', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { threadId } = req.params;
    const thread = await getThread(userId, threadId);
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }
    res.json({ thread });
  } catch (err) {
    console.error('Get thread error:', err);
    res.status(500).json({ error: 'Failed to get thread' });
  }
});

/**
 * GET /threads/:threadId/messages
 * Get all messages for a thread
 */
router.get('/:threadId/messages', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { threadId } = req.params;
    const thread = await getThread(userId, threadId);
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }
    const messages = await getMessages(threadId);
    res.json({ messages });
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

/**
 * POST /threads/:threadId/messages
 * Send a message to a thread
 */
router.post('/:threadId/messages', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { threadId } = req.params;
    const { content } = req.body;

    const thread = await getThread(userId, threadId);
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const trimmed = content.trim();
    if (!trimmed) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const userMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    const noxReply = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      role: 'assistant',
      content: `NoX: I received your message: "${trimmed}". How can I assist you further?`,
      timestamp: new Date().toISOString(),
    };

    await addMessage(threadId, userMessage);
    const messages = await addMessage(threadId, noxReply);

    // Update thread title from first user message if still default
    if (thread.title === 'New chat') {
      const shortTitle = trimmed.length > 40 ? trimmed.slice(0, 40) + '...' : trimmed;
      await updateThread(userId, threadId, { title: shortTitle });
    } else {
      await updateThread(userId, threadId, {});
    }

    res.json({ messages });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
