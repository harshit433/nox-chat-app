'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api, type Message, type Thread } from '@/lib/api';
import { storage } from '@/lib/storage';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ThreadSidebar } from '@/components/chat/ThreadSidebar';
import { MessageList } from '@/components/chat/MessageList';
import { ChatInput } from '@/components/chat/ChatInput';

export default function ChatPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Load threads
  const loadThreads = useCallback(async () => {
    if (!user) return;
    setLoadingThreads(true);
    try {
      let serverThreads = (await api.getThreads()).threads;
      // Auto-create first thread if user has none
      if (serverThreads.length === 0) {
        const { thread } = await api.createThread();
        serverThreads = [thread];
      }
      storage.setThreads(user.id, serverThreads);
      setThreads(serverThreads);
      if (!selectedThreadId && serverThreads.length > 0) {
        setSelectedThreadId(serverThreads[0].id);
      }
    } catch {
      const cached = storage.getThreads(user.id);
      setThreads(cached);
      if (!selectedThreadId && cached.length > 0) {
        setSelectedThreadId(cached[0].id);
      }
    } finally {
      setLoadingThreads(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/signin');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    loadThreads();
  }, [user]);

  // Load messages when thread changes
  useEffect(() => {
    if (!user || !selectedThreadId) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      setLoadingMessages(true);
      const cached = storage.getMessages(selectedThreadId);
      setMessages(cached);

      try {
        const { messages: serverMessages } = await api.getThreadMessages(
          selectedThreadId
        );
        if (serverMessages.length > 0) {
          storage.setMessages(selectedThreadId, serverMessages);
          setMessages(serverMessages);
        }
      } catch {
        // Use cached if backend fails
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();
  }, [user, selectedThreadId]);

  const handleNewThread = async () => {
    if (!user) return;
    try {
      const { thread } = await api.createThread();
      const updated = [thread, ...threads];
      storage.setThreads(user.id, updated);
      setThreads(updated);
      setSelectedThreadId(thread.id);
      setMessages([]);
    } catch (err) {
      console.error('Create thread failed:', err);
    }
  };

  const handleReply = async (message: Message) => {
    if (!user || !selectedThreadId) return;
    try {
      const { thread } = await api.createThread({
        parentMessageId: message.id,
        parentThreadId: selectedThreadId,
      });
      const updated = [thread, ...threads];
      storage.setThreads(user.id, updated);
      setThreads(updated);
      setSelectedThreadId(thread.id);
      // Load messages for new thread (includes context message)
      const { messages: newMessages } = await api.getThreadMessages(thread.id);
      storage.setMessages(thread.id, newMessages);
      setMessages(newMessages);
    } catch (err) {
      console.error('Create reply thread failed:', err);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!user || !selectedThreadId) return;

    try {
      const { messages: updated } = await api.sendMessage(
        selectedThreadId,
        content
      );
      storage.setMessages(selectedThreadId, updated);
      setMessages(updated);
      // Refresh threads to update title/updatedAt
      loadThreads();
    } catch (err) {
      console.error('Send failed:', err);
      throw err;
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-pulse rounded-full border-2 border-white border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <ThreadSidebar
        threads={threads}
        selectedThreadId={selectedThreadId}
        onSelectThread={setSelectedThreadId}
        onNewThread={handleNewThread}
        isLoading={loadingThreads}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <ChatHeader />
        <div className="flex flex-1 flex-col overflow-hidden">
          {!selectedThreadId ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <p className="text-zinc-500">Select a thread or create a new one</p>
              <button
                onClick={handleNewThread}
                className="mt-4 rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200"
              >
                New thread
              </button>
            </div>
          ) : loadingMessages ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="h-8 w-8 animate-pulse rounded-full border-2 border-white border-t-transparent" />
            </div>
          ) : (
            <MessageList messages={messages} onReply={handleReply} />
          )}
          {selectedThreadId && (
            <ChatInput onSend={handleSendMessage} />
          )}
        </div>
      </div>
    </div>
  );
}
