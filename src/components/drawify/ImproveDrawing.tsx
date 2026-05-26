'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import React, { useCallback, useState } from 'react';
import type * as fabric from 'fabric';
import { Sparkles, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { improveDrawingAction, type ImproveDrawingState } from '@/lib/actions';
import LoadingSpinner from './LoadingSpinner';
import DrawingCanvas from './DrawingCanvas';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const initialState: ImproveDrawingState = {
  message: '',
  improvedDrawingDataUri: null,
  error: null,
};

function SubmitButton({ className, label = 'Improve My Drawing' }: { className?: string; label?: string }) {
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
          Analyzing & Rendering...
        </span>
      ) : (
        <span className="flex items-center gap-2 z-10">
          {label}
          <Wand2 className="h-4 w-4 shrink-0 transition-transform duration-500 group-hover:rotate-45 text-white" />
        </span>
      )}
    </Button>
  );
}

function ImproveResult({ improvedDrawingDataUri }: { improvedDrawingDataUri: string | null | undefined }) {
    const { pending } = useFormStatus();
    return (
        <div className="relative flex h-[300px] w-full items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 p-3 shadow-inner transition-colors duration-200">
            {/* Background canvas grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:1rem_1rem] opacity-20 dark:opacity-10 rounded-xl pointer-events-none" />
            
            {improvedDrawingDataUri ? (
              <Image
                src={improvedDrawingDataUri}
                alt="Improved drawing"
                fill
                sizes="(max-width: 768px) 100vw, 500px"
                className="object-contain rounded-lg p-3 relative z-10 animate-fade-in"
                priority
              />
            ) : (
                pending ? (
                  <div className="flex flex-col items-center gap-2 relative z-10 text-center px-4">
                    <LoadingSpinner />
                    <p className="text-xs text-purple-600 dark:text-purple-400 animate-pulse font-semibold mt-1">
                      AI is auto-detecting your drawing subject & rendering masterpiece...
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2.5 text-center max-w-xs relative z-10 px-4">
                    <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-sm text-purple-500/80 dark:text-purple-400/80">
                      <Sparkles className="h-6 w-6 animate-pulse text-purple-600 dark:text-purple-400" />
                    </div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Awaiting AI Painting</p>
                    <p className="text-[11px] text-slate-450 dark:text-slate-500 leading-normal">
                      Draw or upload on the left and click improve. The AI will auto-detect the subject and generate a high-end artwork.
                    </p>
                  </div>
                )
            )}
        </div>
    );
}

const ART_PRESETS = [
  { id: 'none', label: 'Default', icon: '🎨' },
  { id: 'watercolor', label: 'Watercolor', icon: '💧' },
  { id: 'oil', label: 'Oil Painting', icon: '🖌️' },
  { id: 'sketch', label: 'Pencil Sketch', icon: '✏️' },
  { id: 'anime', label: 'Anime/Manga', icon: '⚡' },
  { id: 'impressionism', label: 'Impressionism', icon: '🎭' },
  { id: 'digital', label: 'Concept Art', icon: '💻' }
];

export default function ImproveDrawing({ theme = 'light' }: { theme?: 'light' | 'dark' }) {
  const [state, formAction] = useActionState(improveDrawingAction, initialState);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [drawingData, setDrawingData] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('draw');
  const [selectedPreset, setSelectedPreset] = useState('none');

  const handleCanvasReady = useCallback((canvasInstance: fabric.Canvas) => {
    setCanvas(canvasInstance);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setDrawingData(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleFormAction = (formData: FormData) => {
    let dataUri: string | null = null;
    if (activeTab === 'draw' && canvas) {
        dataUri = canvas.toDataURL({ format: 'jpeg', quality: 0.8, multiplier: 1 });
    } else if (activeTab === 'upload') {
        dataUri = drawingData;
    }
    
    if (dataUri) {
        formData.set('photoDataUri', dataUri);
        formData.set('stylePreset', selectedPreset);
        formAction(formData);
    } else {
        console.error("No drawing data available.");
    }
  }

  return (
    <Card className="w-full border border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl dark:shadow-2xl text-slate-900 dark:text-white transition-colors duration-200">
      <form action={handleFormAction}>
        <CardContent className="space-y-4 pt-5">
          {/* Header Action Row */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800/60 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 font-headline">
                <Wand2 className="h-4.5 w-4.5 text-purple-600 dark:text-purple-400" />
                AI Sketch Enhancer
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Draw or upload a sketch below, select your painting style preset, and the AI will auto-detect the subject and refine it!
              </p>
            </div>
            <div className="w-full md:w-auto flex-shrink-0">
              <SubmitButton className="w-full md:w-60 h-11 text-sm font-semibold" label="Improve My Drawing" />
            </div>
          </div>

          {state.error?.photoDataUri && <p className="text-sm font-medium text-destructive">{state.error.photoDataUri[0]}</p>}
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

          {/* 2-Column Side-by-side workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Sketch Workspace */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Input Drawing Workspace</Label>
              <Tabs defaultValue="draw" onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 p-1 text-slate-550 dark:text-slate-400">
                  <TabsTrigger 
                    value="draw" 
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800/80 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white font-semibold text-xs shadow-sm dark:shadow-none animate-none"
                  >
                    Draw on Canvas
                  </TabsTrigger>
                  <TabsTrigger 
                    value="upload" 
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800/80 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white font-semibold text-xs shadow-sm dark:shadow-none animate-none"
                  >
                    Upload Drawing
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="draw" className="mt-2 outline-none">
                  <DrawingCanvas onCanvasReady={handleCanvasReady} theme={theme} />
                </TabsContent>
                <TabsContent value="upload" className="mt-2 space-y-2 outline-none">
                  <div className="flex flex-col gap-2">
                    <Input 
                      id="drawing-upload" 
                      type="file" 
                      accept="image/png, image/jpeg" 
                      onChange={handleFileChange} 
                      className="bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-650 text-xs cursor-pointer file:cursor-pointer"
                    />
                    <div className="relative h-[240px] w-full items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/60 p-2">
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:1rem_1rem] opacity-20 dark:opacity-10 rounded-lg pointer-events-none" />
                      {drawingData ? (
                        <Image src={drawingData} alt="Uploaded drawing" fill className="object-contain rounded-md p-2 relative z-10 animate-fade-in" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-slate-450 dark:text-slate-500 text-sm relative z-10 font-medium">
                          No drawing uploaded yet
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Column: AI Result */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-purple-600 dark:text-purple-400">AI Improved Masterpiece</Label>
              <ImproveResult improvedDrawingDataUri={state.improvedDrawingDataUri} />
            </div>
          </div>
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
