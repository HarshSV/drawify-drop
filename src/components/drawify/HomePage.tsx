'use client';

import React, { useEffect, useState } from 'react';
import TextToDrawing from '@/components/drawify/TextToDrawing';
import ImproveDrawing from '@/components/drawify/ImproveDrawing';
import HistoryList from '@/components/drawify/HistoryList';
import Logo from '@/components/drawify/Logo';
import { supabase } from '@/lib/supabase';
import { Brush, Wand2, FolderOpen, LogOut, User, Menu, X, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HomePageProps {
  theme?: 'light' | 'dark';
  onThemeChange?: (theme: 'light' | 'dark') => void;
}

export default function HomePage({ theme = 'light', onThemeChange }: HomePageProps) {
  const [activeView, setActiveView] = useState<'text-to-drawing' | 'improve-drawing' | 'drawing-history'>('text-to-drawing');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const isGuest = sessionStorage.getItem('drawify_guest_session') === 'true' || localStorage.getItem('drawify_guest_session') === 'true';
      if (isGuest) {
        setUserEmail('Guest User');
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    };

    fetchUser();
  }, []);

  const handleSignOut = async () => {
    sessionStorage.removeItem('drawify_guest_session');
    localStorage.removeItem('drawify_guest_session');
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden relative transition-colors duration-200">
      {/* Background decorations matching the Landing Page */}
      <div className="absolute top-[-10%] right-[-10%] h-[400px] w-[400px] rounded-full bg-purple-500/5 dark:bg-purple-900/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] h-[400px] w-[400px] rounded-full bg-blue-500/5 dark:bg-blue-900/10 blur-[150px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-35 dark:opacity-20 pointer-events-none" />

      {/* Floating Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <Button
          onClick={() => onThemeChange?.(theme === 'light' ? 'dark' : 'light')}
          variant="outline"
          size="icon"
          className="rounded-full bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-105 dark:hover:bg-slate-800 backdrop-blur-md shadow-sm h-9.5 w-9.5"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5 text-yellow-400" />}
        </Button>
      </div>

      {/* MOBILE HEADER FOR SIDEBAR TOGGLE */}
      <div className="lg:hidden absolute top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800">
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* LEFT SIDEBAR PANEL */}
      <aside className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-64 border-r border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl flex flex-col justify-between p-5 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="space-y-8">
          {/* Logo Section */}
          <div className="flex items-center pt-2">
            <Logo iconSize={32} />
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <button
              onClick={() => { setActiveView('text-to-drawing'); setSidebarOpen(false); }}
              className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                activeView === 'text-to-drawing'
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-600/20 dark:to-purple-600/20 border-purple-200 dark:border-purple-500/50 text-purple-700 dark:text-white shadow-sm dark:shadow-lg dark:shadow-purple-600/5'
                  : 'bg-transparent border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40'
              }`}
            >
              <Brush className={`h-4.5 w-4.5 ${activeView === 'text-to-drawing' ? 'text-blue-600 dark:text-blue-400' : ''}`} />
              Text to Drawing
            </button>

            <button
              onClick={() => { setActiveView('improve-drawing'); setSidebarOpen(false); }}
              className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                activeView === 'improve-drawing'
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-600/20 dark:to-purple-600/20 border-purple-200 dark:border-purple-500/50 text-purple-700 dark:text-white shadow-sm dark:shadow-lg dark:shadow-purple-600/5'
                  : 'bg-transparent border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40'
              }`}
            >
              <Wand2 className={`h-4.5 w-4.5 ${activeView === 'improve-drawing' ? 'text-purple-600 dark:text-purple-400' : ''}`} />
              Improve Drawing
            </button>

            <button
              onClick={() => { setActiveView('drawing-history'); setSidebarOpen(false); }}
              className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                activeView === 'drawing-history'
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-600/20 dark:to-purple-600/20 border-purple-200 dark:border-purple-500/50 text-purple-700 dark:text-white shadow-sm dark:shadow-lg dark:shadow-purple-600/5'
                  : 'bg-transparent border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40'
              }`}
            >
              <FolderOpen className={`h-4.5 w-4.5 ${activeView === 'drawing-history' ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
              Drawing Vault
            </button>
          </nav>
        </div>

        {/* User Account / Sign Out Section */}
        {userEmail && (
          <div className="border-t border-slate-200 dark:border-slate-800/80 pt-4 space-y-2">
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60">
              <User className="h-4 w-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate" title={userEmail}>
                {userEmail}
              </span>
            </div>
            <Button
              onClick={handleSignOut}
              variant="ghost"
              size="sm"
              className="w-full justify-start text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-destructive dark:hover:bg-destructive/10 transition-colors flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        )}
      </aside>

      {/* OVERLAY FOR MOBILE SIDEBAR CLOSURE */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* RIGHT WORKSPACE AREA */}
      <main className="flex-1 flex flex-col overflow-hidden relative p-4 lg:p-6 justify-center items-center">
        <div className="w-full max-w-5xl h-full flex flex-col justify-center">
          {activeView === 'text-to-drawing' && <TextToDrawing theme={theme} />}
          {activeView === 'improve-drawing' && <ImproveDrawing theme={theme} />}
          {activeView === 'drawing-history' && <HistoryList />}
        </div>
      </main>
    </div>
  );
}
