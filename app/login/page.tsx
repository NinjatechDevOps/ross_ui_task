'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Login from '@/src/features/auth/components/Login';
import { useAppDispatch } from '@/src/store/hooks';
import { resetVotingState } from '@/src/features/voting/store/votingSlice';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(resetVotingState());
    
    const email = localStorage.getItem('email');
    if (email) {
      router.replace('/');
    }
  }, [router, dispatch]);

  return <Login onLogin={() => router.replace('/')} />;
} 