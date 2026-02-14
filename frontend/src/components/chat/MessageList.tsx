'use client';

import type { Message } from '@/lib/api';

interface MessageListProps {
  messages: Message[];
  onReply?: (message: Message) => void;
}

export function MessageList({ messages, onReply }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="text-zinc-500">No messages yet</p>
        <p className="mt-1 text-sm text-zinc-600">
          Start a conversation with NoX
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="mx-auto max-w-2xl space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`group relative max-w-[85%] rounded-lg px-4 py-2.5 ${
                msg.role === 'user'
                  ? 'bg-white text-black'
                  : msg.isContext
                    ? 'border border-zinc-700 bg-zinc-900/80 text-zinc-300'
                    : 'bg-zinc-800/80 text-zinc-100'
              }`}
            >
              {msg.isContext && (
                <span className="mb-1 block text-xs text-zinc-500">
                  Replying to:
                </span>
              )}
              <p className="text-sm leading-relaxed">{msg.content}</p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <p
                  className={`text-xs ${
                    msg.role === 'user' ? 'text-zinc-600' : 'text-zinc-500'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                {onReply && !msg.isContext && (
                  <button
                    onClick={() => onReply(msg)}
                    className="rounded px-1.5 py-0.5 text-xs text-zinc-500 opacity-0 transition-opacity hover:bg-zinc-700/50 hover:text-white group-hover:opacity-100"
                  >
                    Reply
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
