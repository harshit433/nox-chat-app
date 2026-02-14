/**
 * localStorage helpers for auth, threads, and messages
 */

const TOKEN_KEY = 'nox_token';
const USER_KEY = 'nox_user';
const THREADS_KEY = 'nox_threads';
const MESSAGES_PREFIX = 'nox_messages_';

export interface StoredThread {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  parentMessageId?: string | null;
  parentThreadId?: string | null;
}

export interface StoredMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  replyTo?: string;
  isContext?: boolean;
}

export const storage = {
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
  },

  getUser(): { id: string; email: string } | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  setUser(user: { id: string; email: string }): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  removeUser(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(USER_KEY);
  },

  getThreads(userId: string): StoredThread[] {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(`${THREADS_KEY}_${userId}`);
    return raw ? JSON.parse(raw) : [];
  },

  setThreads(userId: string, threads: StoredThread[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`${THREADS_KEY}_${userId}`, JSON.stringify(threads));
  },

  getMessages(threadId: string): StoredMessage[] {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(`${MESSAGES_PREFIX}${threadId}`);
    return raw ? JSON.parse(raw) : [];
  },

  setMessages(threadId: string, messages: StoredMessage[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`${MESSAGES_PREFIX}${threadId}`, JSON.stringify(messages));
  },

  clearAuth(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
