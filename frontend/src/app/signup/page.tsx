'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthForm } from '@/components/auth/AuthForm';
import { useAuth } from '@/contexts/AuthContext';

export default function SignUpPage() {
  const { user, isLoading, signUp } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/chat');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-pulse rounded-full border-2 border-white border-t-transparent" />
      </div>
    );
  }

  if (user) return null;

  return <AuthForm mode="signup" onSubmit={signUp} />;
}
