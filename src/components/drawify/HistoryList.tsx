'use client';

import React, { useEffect, useState, startTransition } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trash2, RefreshCw, Sparkles, Image as ImageIcon, Calendar, Loader2 } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface Drawing {
  id: string;
  created_at: string;
  prompt: string;
  type: string;
  original_image_url: string | null;
  improved_image_url: string;
}

export default function HistoryList() {
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDrawing, setSelectedDrawing] = useState<Drawing | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const { data, error } = await supabase
        .from('drawings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching history:', error);
        setFetchError(error.message || JSON.stringify(error));
      } else {
        setDrawings(data || []);
      }
    } catch (e) {
      console.error(e);
      setFetchError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the dialog
    setDeletingId(id);
    try {
      const { error } = await supabase.from('drawings').delete().eq('id', id);
      if (error) {
        console.error('Error deleting drawing:', error);
      } else {
        setDrawings(prev => prev.filter(d => d.id !== id));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderGrid = (filteredDrawings: Drawing[]) => {
    if (fetchError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/20 text-slate-800 dark:text-slate-200">
          <ImageIcon className="h-12 w-12 text-red-500/60 mb-3 animate-pulse" />
          <p className="text-lg font-semibold text-red-600 dark:text-red-400">Database Connection Issue</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-lg">
            Failed to read from the <strong>drawings</strong> table. Make sure you have executed the database schema script from your Supabase SQL editor.
          </p>
          <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs font-mono rounded text-left max-w-lg w-full text-slate-650 dark:text-slate-400 overflow-x-auto">
            SQL File: supabase_setup.sql <br/>
            Error Details: {fetchError}
          </div>
          <Button onClick={fetchHistory} variant="outline" className="mt-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white">
            <RefreshCw className="h-4 w-4 mr-2" /> Retry Connection
          </Button>
        </div>
      );
    }

    if (filteredDrawings.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 shadow-sm">
          <ImageIcon className="h-12 w-12 text-slate-400 dark:text-slate-600 mb-3 animate-pulse" />
          <p className="text-lg font-semibold text-slate-800 dark:text-slate-300 font-headline">No drawings found in history</p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">Create some drawings in the other tabs to see them here!</p>
          <Button onClick={fetchHistory} variant="outline" className="mt-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white">
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[calc(100vh-270px)] overflow-y-auto pr-1 custom-scrollbar">
        {filteredDrawings.map((drawing) => (
          <Card
            key={drawing.id}
            onClick={() => setSelectedDrawing(drawing)}
            className="group cursor-pointer hover:border-purple-500/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md shadow-sm"
          >
            <CardHeader className="p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                  drawing.type === 'improve-drawing'
                    ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-500/40 text-purple-700 dark:text-purple-300'
                    : 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-500/40 text-blue-700 dark:text-blue-300'
                }`}>
                  {drawing.type === 'improve-drawing' ? (
                    <><Sparkles className="h-3 w-3" /> Improved</>
                  ) : (
                    <><ImageIcon className="h-3 w-3" /> Created</>
                  )}
                </span>
                <span className="text-[10px] text-slate-500 flex items-center gap-1 font-semibold">
                  <Calendar className="h-3 w-3 text-slate-400 dark:text-slate-600" />
                  {formatDate(drawing.created_at)}
                </span>
              </div>
              <CardTitle className="text-sm font-semibold line-clamp-2 pt-2 text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors font-sans">
                {drawing.prompt}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 relative h-48 w-full bg-slate-100/30 dark:bg-slate-950/40 overflow-hidden">
              {/* Background grid pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:1rem_1rem] opacity-20 dark:opacity-5 pointer-events-none" />
              <Image
                src={drawing.improved_image_url}
                alt={drawing.prompt}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-contain p-2 relative z-10 group-hover:scale-105 transition-transform duration-300"
              />
              {drawing.type === 'improve-drawing' && drawing.original_image_url && (
                <div className="absolute bottom-2 left-2 bg-white/90 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-[9px] text-slate-500 dark:text-slate-400 font-semibold px-2 py-0.5 rounded z-20 shadow-xs">
                  Before/After Available
                </div>
              )}
            </CardContent>
            <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/20">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                ID: {drawing.id.substring(0, 8)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => handleDelete(drawing.id, e)}
                disabled={deletingId === drawing.id}
                className="h-7 w-7 text-rose-500 hover:bg-rose-50 dark:text-rose-450 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-300 transition-colors"
                title="Delete from history"
              >
                {deletingId === drawing.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-rose-500" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4 w-full h-full flex flex-col">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-xl font-bold tracking-tight font-headline text-slate-900 dark:text-white">Drawing Vault</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Browse all AI generated and enhanced artwork saved in Supabase.</p>
        </div>
        <Button 
          onClick={fetchHistory} 
          variant="outline" 
          size="sm" 
          className="h-9 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-655 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center flex-grow min-h-[300px]">
          <LoadingSpinner />
        </div>
      ) : (
        <Tabs defaultValue="all" className="w-full flex-grow flex flex-col overflow-hidden" onValueChange={() => {}}>
          <TabsList className="grid w-full max-w-md grid-cols-3 h-10 mb-4 bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 p-1 text-slate-500 dark:text-slate-400 flex-shrink-0">
            <TabsTrigger value="all" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800/80 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white font-semibold text-xs shadow-sm dark:shadow-none animate-none">All</TabsTrigger>
            <TabsTrigger value="created" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800/80 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white font-semibold text-xs shadow-sm dark:shadow-none animate-none">Text to Drawing</TabsTrigger>
            <TabsTrigger value="improved" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800/80 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white font-semibold text-xs shadow-sm dark:shadow-none animate-none">AI Enhanced</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-0 flex-grow overflow-hidden">
            {renderGrid(drawings)}
          </TabsContent>
          <TabsContent value="created" className="mt-0 flex-grow overflow-hidden">
            {renderGrid(drawings.filter(d => d.type === 'text-to-drawing'))}
          </TabsContent>
          <TabsContent value="improved" className="mt-0 flex-grow overflow-hidden">
            {renderGrid(drawings.filter(d => d.type === 'improve-drawing'))}
          </TabsContent>
        </Tabs>
      )}

      {/* Compare/View Modal */}
      <Dialog open={selectedDrawing !== null} onOpenChange={(open) => { if (!open) setSelectedDrawing(null); }}>
        <DialogContent className="max-w-4xl w-[90vw] max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-900/95 border-slate-200 dark:border-slate-800/80 text-slate-900 dark:text-white backdrop-blur-xl">
          {selectedDrawing && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    selectedDrawing.type === 'improve-drawing' 
                      ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-500/40 text-purple-700 dark:text-purple-300' 
                      : 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-500/40 text-blue-700 dark:text-blue-300'
                  }`}>
                    {selectedDrawing.type === 'improve-drawing' ? 'AI Improved' : 'Text to Drawing'}
                  </span>
                  <DialogDescription className="text-slate-500 dark:text-slate-400">{formatDate(selectedDrawing.created_at)}</DialogDescription>
                </div>
                <DialogTitle className="text-xl font-headline pt-1 leading-snug text-slate-800 dark:text-slate-100">{selectedDrawing.prompt}</DialogTitle>
              </DialogHeader>

              {selectedDrawing.type === 'improve-drawing' && selectedDrawing.original_image_url ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Original Hand-Drawn Sketch</span>
                    <div className="relative h-80 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 overflow-hidden p-2">
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:1rem_1rem] opacity-20 dark:opacity-5 pointer-events-none" />
                      <Image
                        src={selectedDrawing.original_image_url}
                        alt="Original sketch"
                        fill
                        className="object-contain p-2 relative z-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                      <Sparkles className="h-4 w-4" /> AI Polished Drawing
                    </span>
                    <div className="relative h-80 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 overflow-hidden p-2">
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:1rem_1rem] opacity-20 dark:opacity-5 pointer-events-none" />
                      <Image
                        src={selectedDrawing.improved_image_url}
                        alt="Improved drawing"
                        fill
                        className="object-contain p-2 relative z-10"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center mt-4 bg-slate-50 dark:bg-slate-950/40 rounded-lg p-4 border border-dashed border-slate-200 dark:border-slate-800">
                  <div className="relative h-[400px] w-full max-w-xl overflow-hidden rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:1rem_1rem] opacity-20 dark:opacity-5 pointer-events-none" />
                    <Image
                      src={selectedDrawing.improved_image_url}
                      alt="Generated drawing"
                      fill
                      className="object-contain p-2 relative z-10"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedDrawing(null)}
                  className="border-slate-250 dark:border-slate-800 bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white font-semibold"
                >
                  Close
                </Button>
                <a
                  href={selectedDrawing.improved_image_url}
                  download={`drawify-${selectedDrawing.id.substring(0, 8)}.png`}
                  className="inline-flex items-center justify-center rounded-md text-sm font-semibold transition-all duration-200 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-purple-600/10 h-10 px-4 py-2"
                >
                  Download Drawing
                </a>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 9999px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </div>
  );
}
