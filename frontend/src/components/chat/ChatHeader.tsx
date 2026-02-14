'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function ChatHeader() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    signOut();
    router.replace('/signin');
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-4 backdrop-blur-sm">
      <h1 className="text-lg font-light tracking-tight text-white">NoX</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-zinc-500">{user?.email}</span>
        <button
          onClick={handleSignOut}
          className="rounded-md px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
