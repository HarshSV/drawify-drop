'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

export default function Header() {
  const [userEmail, setUserEmail] = useState<string | null>(null);

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
    // Force reload to trigger Page component redirection
    window.location.reload();
  };

  return (
    <header className="flex h-16 w-full items-center justify-between border-b px-4 md:px-8 bg-card shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
        </div>
        <span className="text-xl font-bold tracking-tight font-headline bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Drawify
        </span>
      </div>
      
      {userEmail && (
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border bg-muted/30 text-xs font-medium text-muted-foreground">
            <User className="h-3.5 w-3.5 text-primary" />
            {userEmail}
          </div>
          <Button
            onClick={handleSignOut}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-1.5"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      )}
    </header>
  );
}
