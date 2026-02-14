/**
 * MCP Server - exposes NoX Chat tools for AI agents
 * Tools: list_threads, read_messages, send_assistant_message
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  findUserByEmail,
  getThreads,
  getThreadById,
  getMessages,
  addMessage,
} from '../storage/storage.js';

/**
 * Create a new MCP server instance with NoX Chat tools
 */
export function createMcpServer() {
  const server = new McpServer({
    name: 'nox-chat-mcp',
    version: '1.0.0',
  });

  // List threads for a user by email
  server.registerTool(
    'list_threads',
    {
      description: 'List all chat threads for a user. Provide the user email to get their threads.',
      inputSchema: {
        email: z.string().email().describe('User email address'),
      },
    },
    async ({ email }) => {
      const user = await findUserByEmail(email.trim().toLowerCase());
      if (!user) {
        return {
          content: [{ type: 'text', text: JSON.stringify({ error: 'User not found', threads: [] }) }],
        };
      }
      const threads = await getThreads(user.id);
      return {
        content: [{ type: 'text', text: JSON.stringify({ threads }, null, 2) }],
      };
    }
  );

  // Read messages in a thread
  server.registerTool(
    'read_messages',
    {
      description: 'Read all messages in a chat thread. Use the thread ID from list_threads.',
      inputSchema: {
        threadId: z.string().describe('Thread ID'),
      },
    },
    async ({ threadId }) => {
      const thread = await getThreadById(threadId);
      if (!thread) {
        return {
          content: [{ type: 'text', text: JSON.stringify({ error: 'Thread not found', messages: [] }) }],
        };
      }
      const messages = await getMessages(threadId);
      return {
        content: [{ type: 'text', text: JSON.stringify({ thread: thread.title, messages }, null, 2) }],
      };
    }
  );

  // Send an assistant (NoX) message to a thread
  server.registerTool(
    'send_assistant_message',
    {
      description:
        'Send a message as NoX (the AI assistant) to a user in a specific thread. Use this to inject assistant responses.',
      inputSchema: {
        threadId: z.string().describe('Thread ID to send the message to'),
        content: z.string().min(1).describe('The message content to send as NoX'),
      },
    },
    async ({ threadId, content }) => {
      const thread = await getThreadById(threadId);
      if (!thread) {
        return {
          content: [{ type: 'text', text: JSON.stringify({ error: 'Thread not found' }) }],
        };
      }
      const trimmed = content.trim();
      if (!trimmed) {
        return {
          content: [{ type: 'text', text: JSON.stringify({ error: 'Message content cannot be empty' }) }],
        };
      }
      const messages = await addMessage(threadId, {
        role: 'assistant',
        content: trimmed,
      });
      const lastMsg = messages[messages.length - 1];
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              messageId: lastMsg.id,
              content: lastMsg.content,
              timestamp: lastMsg.timestamp,
            }),
          },
        ],
      };
    }
  );

  return server;
}
