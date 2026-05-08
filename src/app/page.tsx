'use client';
import dynamic from 'next/dynamic';
import LoadingSpinner from '@/components/drawify/LoadingSpinner';

const HomePage = dynamic(() => import('@/components/drawify/HomePage'), {
  loading: () => (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
      <LoadingSpinner />
    </div>
  ),
  ssr: false,
});

export default function Page() {
  return <HomePage />;
}
