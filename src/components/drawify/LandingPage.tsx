'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Wand2, Mail, Lock, ArrowRight, Loader2, Brush, Sun, Moon } from 'lucide-react';
import Logo from './Logo';

interface LandingPageProps {
  theme?: 'light' | 'dark';
  onThemeChange?: (theme: 'light' | 'dark') => void;
  onAuthSuccess: () => void;
}

const SHOWCASE_ITEMS = [
  {
    title: "Sketched Cat",
    prompt: "A fluffy watercolor orange cat, detailed strokes",
    imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop&q=80",
    svgPaths: (
      // Cat face and ears outline
      <path
        d="M 40,80 C 40,80 50,40 60,50 C 70,60 130,60 140,50 C 150,40 160,80 160,80 C 160,80 170,110 160,130 C 150,150 130,160 100,160 C 70,160 50,150 40,130 C 30,110 40,80 40,80 Z"
        className="draw-path"
      />
    ),
    details: (
      <>
        {/* Whiskers */}
        <path d="M 25,110 L 50,115 M 20,120 L 48,122 M 25,130 L 50,128" className="draw-path delay-1" />
        <path d="M 175,110 L 150,115 M 180,120 L 152,122 M 175,130 L 150,128" className="draw-path delay-1" />
        {/* Eyes */}
        <ellipse cx="75" cy="100" rx="6" ry="10" className="draw-path delay-2" fill="none" />
        <ellipse cx="125" cy="100" rx="6" ry="10" className="draw-path delay-2" fill="none" />
        {/* Nose and mouth */}
        <path d="M 100,115 L 96,120 L 104,120 Z M 100,120 C 95,125 90,125 90,130 M 100,120 C 105,125 110,125 110,130" className="draw-path delay-3" />
      </>
    )
  },
  {
    title: "Sketched Rocket",
    prompt: "Futuristic digital art of a rocket ascending to space",
    imageUrl: "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=600&auto=format&fit=crop&q=80",
    svgPaths: (
      // Rocket body
      <path
        d="M 100,40 C 110,70 120,100 120,140 L 80,140 C 80,100 90,70 100,40 Z"
        className="draw-path"
      />
    ),
    details: (
      <>
        {/* Fins */}
        <path d="M 80,120 L 60,145 L 80,140" className="draw-path delay-1" />
        <path d="M 120,120 L 140,145 L 120,140" className="draw-path delay-1" />
        <path d="M 100,120 L 100,140" className="draw-path delay-2" />
        {/* Window */}
        <circle cx="100" cy="85" r="10" className="draw-path delay-2" />
        {/* Flame */}
        <path d="M 85,145 C 85,170 100,185 100,185 C 100,185 115,170 115,145 Z" className="draw-path flame-path delay-3" />
      </>
    )
  },
  {
    title: "Sketched Flower",
    prompt: "Vibrant oil painting of a blooming rose, dramatic lighting",
    imageUrl: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600&auto=format&fit=crop&q=80",
    svgPaths: (
      // Flower outer petals
      <path
        d="M 100,90 C 80,70 60,90 80,110 C 60,130 90,140 100,125 C 110,140 140,130 120,110 C 140,90 120,70 100,90 Z"
        className="draw-path"
      />
    ),
    details: (
      <>
        {/* Flower inner spiral */}
        <path d="M 100,98 C 90,102 93,115 102,112 C 107,110 105,103 100,105" className="draw-path delay-1" />
        {/* Stem and leaves */}
        <path d="M 100,125 L 100,180" className="draw-path delay-2" />
        <path d="M 100,145 C 115,140 125,145 125,145 C 125,145 115,155 100,150" className="draw-path delay-3" />
        <path d="M 100,155 C 85,155 75,160 75,160 C 75,160 85,170 100,165" className="draw-path delay-3" />
      </>
    )
  }
];

export default function LandingPage({ theme = 'light', onThemeChange, onAuthSuccess }: LandingPageProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Showcase state
  const [showcaseIndex, setShowcaseIndex] = useState(0);
  const [showcaseStage, setShowcaseStage] = useState<'drawing' | 'scanning' | 'revealed'>('drawing');

  useEffect(() => {
    // Stage controller loop:
    // 0s-2.2s: Drawing sketch
    // 2.2s-3.5s: Scanning line
    // 3.5s-6.5s: Rendered image reveal
    // 6.5s: Next item

    const stageTimer = setInterval(() => {
      setShowcaseStage(prev => {
        if (prev === 'drawing') return 'scanning';
        if (prev === 'scanning') return 'revealed';
        return 'drawing';
      });
    }, 2200);

    return () => clearInterval(stageTimer);
  }, []);

  useEffect(() => {
    if (showcaseStage === 'drawing') {
      setShowcaseIndex(prev => (prev + 1) % SHOWCASE_ITEMS.length);
    }
  }, [showcaseStage]);

  const currentShowcase = SHOWCASE_ITEMS[showcaseIndex];

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        onAuthSuccess();
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        if (data.session) {
          onAuthSuccess();
        } else {
          setSuccessMsg('Registration successful! Check your email for confirmation.');
          if (data.user) {
            setTimeout(() => {
              onAuthSuccess();
            }, 3000);
          }
        }
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestContinue = () => {
    sessionStorage.setItem('drawify_guest_session', 'true');
    onAuthSuccess();
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col lg:flex-row bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white overflow-x-hidden transition-colors duration-200">
      {/* Background decoration elements */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-purple-500/5 dark:bg-purple-900/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-blue-500/5 dark:bg-blue-900/10 blur-[150px] pointer-events-none" />

      {/* Floating Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <Button
          onClick={() => onThemeChange?.(theme === 'light' ? 'dark' : 'light')}
          variant="outline"
          size="icon"
          className="rounded-full bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 backdrop-blur-md shadow-sm"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5 text-yellow-400" />}
        </Button>
      </div>

      {/* LEFT COLUMN: Animated Showcase */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-16 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-900/60 bg-slate-100/40 dark:bg-slate-950 relative overflow-hidden transition-colors duration-200">
        {/* Dot pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-20 dark:opacity-40 pointer-events-none" />

        <div className="max-w-xl w-full z-10 space-y-8 flex flex-col items-center text-center lg:text-left lg:items-start">
          <Logo iconSize={40} className="mb-2" />
          
          <div className="space-y-4">
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] font-headline">
              Draw it simple.<br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-500 bg-clip-text text-transparent">
                Watch it morph.
              </span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
              Create a basic marker doodle on our canvas, select an art style preset, and watch our Gemini 2.0 AI transform it into a gorgeous finished painting in seconds.
            </p>
          </div>

          {/* Sketch Transformation Box */}
          <div className="relative w-full h-[280px] bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center p-4 overflow-hidden shadow-xl dark:shadow-2xl backdrop-blur-sm group transition-all duration-200">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-20" />

            {/* Stage: DRAWING or SCANNING (The neon SVG lines) */}
            {(showcaseStage === 'drawing' || showcaseStage === 'scanning') && (
              <svg className="w-full h-full max-w-[200px] max-h-[200px]" viewBox="0 0 200 200">
                <g stroke="#a855f7" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  {currentShowcase.svgPaths}
                  {currentShowcase.details}
                </g>
              </svg>
            )}

            {/* Stage: REVEALED (The rendered image) */}
            {showcaseStage === 'revealed' && (
              <div className="absolute inset-0 flex items-center justify-center p-4 animate-fade-in">
                <div className="relative w-full h-full max-w-[220px] max-h-[220px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 p-1 shadow-inner">
                  <img
                    src={currentShowcase.imageUrl}
                    alt={currentShowcase.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute bottom-2 left-2 right-2 bg-white/90 dark:bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded border border-slate-200 dark:border-slate-800/80 text-[10px] text-slate-700 dark:text-slate-300 truncate">
                    🤖 {currentShowcase.prompt}
                  </div>
                </div>
              </div>
            )}

            {/* LASER SCANNING LINE EFFECT */}
            {showcaseStage === 'scanning' && (
              <div className="absolute top-0 bottom-0 w-1.5 bg-gradient-to-t from-purple-500 via-indigo-400 to-blue-500 shadow-[0_0_15px_#a855f7] animate-laser-scan pointer-events-none" />
            )}

            {/* Floating details badge */}
            <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 font-semibold tracking-wider uppercase shadow-sm">
              {showcaseStage === 'drawing' && '✏️ AI Sketching...'}
              {showcaseStage === 'scanning' && '⚡ Scanning Design...'}
              {showcaseStage === 'revealed' && '✨ AI Enhanced Art'}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400 justify-center lg:justify-start">
            <span className="flex items-center gap-1.5"><Brush className="h-3.5 w-3.5 text-blue-600 dark:text-blue-500" /> Presets for Painters</span>
            <span>•</span>
            <span className="flex items-center gap-1.5"><Wand2 className="h-3.5 w-3.5 text-purple-600 dark:text-purple-500" /> Auto-Subject Locking</span>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Auth Panel */}
      <div className="w-full lg:w-[460px] flex flex-col justify-center p-8 bg-white/40 dark:bg-slate-950/40 relative transition-colors duration-200">
        <div className="max-w-md w-full mx-auto space-y-6">
          <Card className="border border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl dark:shadow-2xl text-slate-900 dark:text-white transition-colors duration-200">
            <CardHeader className="pb-2">
              <Tabs defaultValue="signin" onValueChange={(val) => {
                setActiveTab(val as 'signin' | 'signup');
                setErrorMsg(null);
                setSuccessMsg(null);
              }} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-1">
                  <TabsTrigger value="signin" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 text-slate-500 dark:text-slate-400 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white shadow-sm dark:shadow-none font-semibold text-xs">
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 text-slate-500 dark:text-slate-400 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white shadow-sm dark:shadow-none font-semibold text-xs">
                    Sign Up
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="pt-3">
                <CardDescription className="text-slate-500 dark:text-slate-400 text-xs">
                  {activeTab === 'signin' 
                    ? 'Log in with your email to fetch drawing vault libraries and settings.'
                    : 'Create a design account to store persistent drawings in cloud history.'
                  }
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-2">
              {errorMsg && (
                <div className="rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 p-3 text-xs text-red-700 dark:text-red-400 font-medium">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="rounded-lg bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900/50 p-3 text-xs text-green-700 dark:text-green-400 font-medium">
                  {successMsg}
                </div>
              )}

              <form onSubmit={activeTab === 'signin' ? handleSignIn : handleSignUp} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 text-xs font-semibold">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@college.edu"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus-visible:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 text-xs font-semibold">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus-visible:ring-purple-500"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-purple-600/10 h-10 font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      {activeTab === 'signin' ? 'Signing In...' : 'Registering...'}
                    </>
                  ) : (
                    <>
                      {activeTab === 'signin' ? 'Sign In to Workspace' : 'Create Account'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                <span className="flex-shrink mx-4 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Or</span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              </div>

              {/* Guest Entry Button */}
              <Button
                type="button"
                onClick={handleGuestContinue}
                variant="outline"
                className="w-full border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white font-semibold"
              >
                Continue as Guest
                <Wand2 className="ml-2 h-4 w-4 text-purple-600 dark:text-purple-400 animate-pulse" />
              </Button>
            </CardContent>
          </Card>

          <div className="text-center text-[10px] text-slate-400 dark:text-slate-600">
            Drawify College Design Lab Project &copy; {new Date().getFullYear()}
          </div>
        </div>
      </div>

      {/* Inline styles for path drawing, glowing, and scanning */}
      <style jsx global>{`
        .draw-path {
          stroke-dasharray: 600;
          stroke-dashoffset: 600;
          animation: drawStroke 2.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        .delay-1 {
          animation-delay: 0.3s;
        }
        
        .delay-2 {
          animation-delay: 0.6s;
        }
        
        .delay-3 {
          animation-delay: 0.9s;
        }
        
        @keyframes drawStroke {
          to {
            stroke-dashoffset: 0;
          }
        }

        .flame-path {
          animation: drawStroke 2.2s cubic-bezier(0.4, 0, 0.2, 1) forwards, flameFlicker 0.15s ease-in-out infinite alternate;
        }

        @keyframes flameFlicker {
          to {
            transform: scale(0.95) translateY(1px);
            opacity: 0.9;
          }
        }

        @keyframes laserScan {
          0% {
            left: 0%;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            left: 100%;
            opacity: 0;
          }
        }

        .animate-laser-scan {
          animation: laserScan 1.3s linear forwards;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
