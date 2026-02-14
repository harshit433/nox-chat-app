/**
 * API client for NoX Chat backend
 */

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('nox_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface User {
  id: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  replyTo?: string;
  isContext?: boolean;
}

export interface Thread {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  parentMessageId?: string | null;
  parentThreadId?: string | null;
}

export interface ThreadsResponse {
  threads: Thread[];
}

export interface ThreadResponse {
  thread: Thread;
}

export interface MessagesResponse {
  messages: Message[];
}

export const api = {
  async signIn(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Sign in failed');
    }
    return res.json();
  },

  async signUp(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Sign up failed');
    }
    return res.json();
  },

  async getThreads(): Promise<ThreadsResponse> {
    const res = await fetch(`${API_BASE}/threads`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to fetch threads');
    }
    return res.json();
  },

  async createThread(options?: {
    title?: string;
    parentMessageId?: string;
    parentThreadId?: string;
  }): Promise<ThreadResponse> {
    const res = await fetch(`${API_BASE}/threads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(options || {}),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to create thread');
    }
    return res.json();
  },

  async getThreadMessages(threadId: string): Promise<MessagesResponse> {
    const res = await fetch(`${API_BASE}/threads/${threadId}/messages`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to fetch messages');
    }
    return res.json();
  },

  async sendMessage(threadId: string, content: string): Promise<MessagesResponse> {
    const res = await fetch(`${API_BASE}/threads/${threadId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to send message');
    }
    return res.json();
  },
};
