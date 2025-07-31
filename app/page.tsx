'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import VotingDashboard from '@/src/features/voting/components/VotingDashboard';
import { VotingErrorBoundary } from '@/src/features/voting/components/VotingErrorBoundary';
import { DataFetchErrorBoundary } from '@/src/shared/components/DataFetchErrorBoundary';
const AdminDashboard = dynamic(() => import('@/src/features/admin/components/AdminDashboard'), { ssr: false });

export default function HomePage() {
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<'admin' | 'user' | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedEmail = localStorage.getItem('email');
    const storedRole = localStorage.getItem('role') as 'admin' | 'user' | null;
    if (storedEmail && storedRole) {
      setEmail(storedEmail);
      setRole(storedRole);
    } else {
      router.replace('/login');
    }
  }, [router]);

  if (!email || !role) {
    return null; // Redirecting
  }

  if (role === 'admin') {
    return (
      <DataFetchErrorBoundary>
        <AdminDashboard />
      </DataFetchErrorBoundary>
    );
  }

  return (
    <VotingErrorBoundary>
      <DataFetchErrorBoundary onRetry={() => window.location.reload()}>
        <VotingDashboard />
      </DataFetchErrorBoundary>
    </VotingErrorBoundary>
  );
}
