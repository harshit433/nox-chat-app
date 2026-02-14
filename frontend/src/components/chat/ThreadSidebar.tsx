'use client';

import type { Thread } from '@/lib/api';

interface ThreadSidebarProps {
  threads: Thread[];
  selectedThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  onNewThread: () => void;
  isLoading?: boolean;
}

export function ThreadSidebar({
  threads,
  selectedThreadId,
  onSelectThread,
  onNewThread,
  isLoading,
}: ThreadSidebarProps) {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950/50">
      <div className="flex h-14 items-center border-b border-zinc-800 px-4">
        <button
          onClick={onNewThread}
          className="flex flex-1 items-center justify-center gap-2 rounded-md bg-white py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path d="M11.75 4.5a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5h-4.5a.75.75 0 0 1 0-1.5h4.5v-4.5a.75.75 0 0 1 .75-.75Z" />
          </svg>
          New thread
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded-md bg-zinc-800/50"
              />
            ))}
          </div>
        ) : threads.length === 0 ? (
          <p className="px-3 py-4 text-center text-sm text-zinc-500">
            No threads yet
          </p>
        ) : (
          <div className="space-y-0.5">
            {threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => onSelectThread(thread.id)}
                className={`w-full rounded-md px-3 py-2.5 text-left text-sm transition-colors ${
                  selectedThreadId === thread.id
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                }`}
              >
                <span className="line-clamp-2 block">{thread.title}</span>
                <span className="mt-0.5 block text-xs text-zinc-500">
                  {new Date(thread.updatedAt).toLocaleDateString()}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
