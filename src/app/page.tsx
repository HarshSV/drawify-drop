'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import LoadingSpinner from '@/components/drawify/LoadingSpinner';
import LandingPage from '@/components/drawify/LandingPage';
import { supabase } from '@/lib/supabase';

const HomePage = dynamic(() => import('@/components/drawify/HomePage'), {
  loading: () => (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-950 text-white">
      <LoadingSpinner />
    </div>
  ),
  ssr: false,
});

export default function Page() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('drawify_theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    // Migrate old guest session to sessionStorage to prevent auto-login on new browser sessions
    if (typeof window !== 'undefined' && localStorage.getItem('drawify_guest_session') === 'true') {
      sessionStorage.setItem('drawify_guest_session', 'true');
      localStorage.removeItem('drawify_guest_session');
    }

    // 1. Initialize theme from localStorage, default to light
    const savedTheme = localStorage.getItem('drawify_theme') as 'light' | 'dark';
    const initialTheme = savedTheme || 'light';
    setTheme(initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Handle chunk loading errors (auto-reload on HMR out of sync)
    const handleChunkError = (event: ErrorEvent) => {
      const errorMsg = event.message || '';
      const isChunkError = 
        errorMsg.includes('Failed to load chunk') || 
        errorMsg.includes('Loading chunk') || 
        errorMsg.includes('error loading dynamically imported module') ||
        (event.error && typeof event.error.message === 'string' && event.error.message.includes('Failed to load chunk'));
      
      if (isChunkError) {
        console.warn('Chunk loading error detected, triggering auto-reload...', event);
        event.preventDefault();
        window.location.reload();
      }
    };

    window.addEventListener('error', handleChunkError);

    const checkSession = async () => {
      // 2. Check guest session first
      const isGuest = sessionStorage.getItem('drawify_guest_session');
      if (isGuest === 'true') {
        setIsAuthenticated(true);
        setCheckingAuth(false);
        return;
      }

      // 3. Check active Supabase session
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setIsAuthenticated(true);
        }
      } catch (e) {
        console.error('Error checking auth session:', e);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkSession();

    // 4. Listen to auth state updates
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setIsAuthenticated(true);
      } else {
        // Reset if we don't have a guest session active either
        if (sessionStorage.getItem('drawify_guest_session') !== 'true') {
          setIsAuthenticated(false);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('error', handleChunkError);
    };
  }, []);

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-950 dark:bg-slate-950 text-white">
        <LoadingSpinner />
      </div>
    );
  }

  if (isAuthenticated) {
    return <HomePage theme={theme} onThemeChange={handleThemeChange} />;
  }

  return <LandingPage theme={theme} onThemeChange={handleThemeChange} onAuthSuccess={() => setIsAuthenticated(true)} />;
}
