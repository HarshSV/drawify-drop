'use client';

import React, { useActionState, useState } from 'react';
import Image from 'next/image';
import { useFormStatus } from 'react-dom';
import { Sparkles, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { generateDrawingAction, type GenerateDrawingState } from '@/lib/actions';
import LoadingSpinner from './LoadingSpinner';

const initialState: GenerateDrawingState = {
  message: '',
  drawingDataUri: null,
  error: null,
};

const ART_PRESETS = [
  { id: 'none', label: 'Default', icon: '🎨' },
  { id: 'watercolor', label: 'Watercolor', icon: '💧' },
  { id: 'oil', label: 'Oil Painting', icon: '🖌️' },
  { id: 'sketch', label: 'Pencil Sketch', icon: '✏️' },
  { id: 'anime', label: 'Anime/Manga', icon: '⚡' },
  { id: 'impressionism', label: 'Impressionism', icon: '🎭' },
  { id: 'digital', label: 'Concept Art', icon: '💻' }
];

function SubmitButton({ className }: { className?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button 
      type="submit" 
      disabled={pending} 
      className={`relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white font-semibold shadow-md dark:shadow-purple-900/30 border border-purple-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] group flex items-center justify-center gap-2 ${className}`}
    >
      {/* Shimmer sweep overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0),45%,rgba(255,255,255,0.3),55%,rgba(255,255,255,0))] bg-[length:200%_100%] animate-shimmer pointer-events-none" />
      
      {pending ? (
        <span className="flex items-center gap-2 z-10">
          <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
          Generating Art...
        </span>
      ) : (
        <span className="flex items-center gap-2 z-10">
          Generate Drawing
          <Wand2 className="h-4 w-4 shrink-0 transition-transform duration-500 group-hover:rotate-45 text-white" />
        </span>
      )}
    </Button>
  );
}

function GenerationResult({ drawingDataUri }: { drawingDataUri: string | null | undefined }) {
    const { pending } = useFormStatus();

    return (
        <div className="relative flex h-[300px] w-full items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 p-3 shadow-inner transition-colors duration-200">
            {/* Background canvas grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:1rem_1rem] opacity-20 dark:opacity-10 rounded-xl pointer-events-none" />
            
            {drawingDataUri ? (
              <img
                src={drawingDataUri}
                alt="Generated drawing"
                className="w-full h-full object-contain rounded-lg p-3 relative z-10 animate-fade-in"
              />
            ) : (
              pending ? (
                <div className="flex flex-col items-center gap-2 relative z-10 text-center px-4">
                  <LoadingSpinner />
                  <p className="text-xs text-purple-600 dark:text-purple-400 animate-pulse font-semibold mt-1">
                    AI is rendering your custom prompt details...
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2.5 text-center max-w-sm relative z-10 px-4">
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-sm text-purple-500/80 dark:text-purple-400/80">
                    <Sparkles className="h-6 w-6 animate-pulse text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Your Masterpiece Easel</p>
                  <p className="text-[11px] text-slate-450 dark:text-slate-500 leading-normal">
                    Type a prompt description above, select a style preset, and generate. Your fully rendered artwork will appear here.
                  </p>
                </div>
              )
            )}
        </div>
    );
}

const SUGGESTIONS = [
  { text: "A cute astronaut cat floating in starry deep space, oil paint details", label: "🐱 Space Cat" },
  { text: "A mythical fairy castle floating in a glowing bubble over mountains", label: "🏰 Bubble Castle" },
  { text: "A cyberpunk neon fox running through futuristic rainy city streets", label: "🦊 Neon Fox" },
  { text: "A serene cozy log cabin nestled beside a crystal lake at sunset", label: "🌅 Sunset Cabin" }
];

export default function TextToDrawing({ theme = 'light' }: { theme?: 'light' | 'dark' }) {
  const [state, formAction] = useActionState(generateDrawingAction, initialState);
  const [selectedPreset, setSelectedPreset] = useState('none');
  const [prompt, setPrompt] = useState('');

  return (
    <Card className="w-full border border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl dark:shadow-2xl text-slate-900 dark:text-white transition-colors duration-200">
      <form action={formAction}>
        <CardContent className="space-y-4 pt-5">
          {/* Prompt input and Submit button at the top */}
          <div className="flex flex-col md:flex-row gap-3 items-end">
            <div className="flex-1 w-full space-y-1">
              <Label htmlFor="prompt" className="text-xs font-semibold text-slate-500 dark:text-slate-300">Describe what you want to draw</Label>
              <Textarea
                id="prompt"
                name="prompt"
                placeholder="e.g., a cute cat riding a skateboard in a city"
                rows={2}
                required
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="resize-none text-base w-full bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus-visible:ring-purple-500"
              />
            </div>
            <div className="w-full md:w-auto">
              <SubmitButton className="w-full md:w-48 h-[58px] text-base font-semibold" />
            </div>
          </div>

          {/* Interactive Prompt Suggestions */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-purple-500" /> Try Inspiring Prompts:
            </span>
            {SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPrompt(s.text)}
                className="text-[10px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-300 dark:hover:border-purple-900/50 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all font-semibold"
              >
                {s.label}
              </button>
            ))}
          </div>

          {state.error?.prompt && <p className="text-sm font-medium text-destructive">{state.error.prompt[0]}</p>}
          {state.error?._errors && <p className="text-sm font-medium text-destructive">{state.error._errors.join(', ')}</p>}

          {/* Artistic Presets Selector */}
          <div className="space-y-2 pt-1">
            <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Select Painting Style Preset</Label>
            <div className="flex flex-wrap gap-2">
              {ART_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedPreset(preset.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                    selectedPreset === preset.id
                      ? 'bg-purple-100 dark:bg-purple-600/35 border-purple-400 dark:border-purple-500 text-purple-700 dark:text-white shadow-sm dark:shadow-md dark:shadow-purple-600/10'
                      : 'bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40 shadow-xs'
                  }`}
                >
                  <span className="text-sm">{preset.icon}</span>
                  {preset.label}
                </button>
              ))}
            </div>
            <input type="hidden" name="stylePreset" value={selectedPreset} />
          </div>

          <GenerationResult drawingDataUri={state.drawingDataUri} />
        </CardContent>
      </form>
      <style jsx global>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite linear;
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
    </Card>
  );
}
