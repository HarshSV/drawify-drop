'use client';

import React from 'react';

interface LogoProps {
  className?: string;
  iconSize?: number;
}

export default function Logo({ className = '', iconSize = 32 }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative flex items-center justify-center" style={{ width: iconSize, height: iconSize }}>
        {/* Glow effect in background */}
        <div className="absolute inset-0 rounded-full bg-purple-500/30 blur-md animate-pulse" />
        
        {/* Combined Palette & Wand SVG */}
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="relative text-white drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]"
        >
          {/* Palette outline */}
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 9.5 20 6.5 17 5.5C14 4.5 12 3 9 3C4.02944 3 0 7.02944 0 12C0 17.5228 4.47715 22 12 22Z" 
                className="text-purple-400"
                strokeWidth="1.8"
          />
          {/* Paint dots (filled with neon colors) */}
          <circle cx="7.5" cy="10.5" r="1.5" fill="#ef4444" stroke="#ef4444" strokeWidth="0" />
          <circle cx="11.5" cy="7.5" r="1.5" fill="#3b82f6" stroke="#3b82f6" strokeWidth="0" />
          <circle cx="16.5" cy="9.5" r="1.5" fill="#eab308" stroke="#eab308" strokeWidth="0" />
          <circle cx="15.5" cy="14.5" r="1.5" fill="#22c55e" stroke="#22c55e" strokeWidth="0" />
          
          {/* Palette hole */}
          <circle cx="7.5" cy="16.5" r="1.5" className="text-slate-950" fill="currentColor" stroke="currentColor" />

          {/* Magic wand shaft */}
          <path d="m13 10 7 7" className="text-white" strokeWidth="2.2" />
          
          {/* Wand tip sparkle star */}
          <path d="m19 9 .5 1.5 1.5.5-1.5.5-.5 1.5-.5-1.5-1.5-.5 1.5-.5Z" fill="#a855f7" stroke="#a855f7" strokeWidth="0" />
          <path d="m12 12 .5 1 .1.5-1-.5-.5.5.1-1-1-.5Z" fill="#a855f7" stroke="#a855f7" strokeWidth="0" />
        </svg>
      </div>
      <span className="text-2xl font-extrabold tracking-wider font-headline bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 dark:from-blue-400 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent">
        Drawify
      </span>
    </div>
  );
}
