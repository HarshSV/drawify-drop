'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { Button } from '@/components/ui/button';
import { Eraser, Pencil, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Slider } from '../ui/slider';
import { Separator } from '../ui/separator';

interface DrawingCanvasProps {
  onCanvasReady: (canvas: fabric.Canvas) => void;
  theme?: 'light' | 'dark';
}

const baseColors = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6", "#8b5cf6", "#d946ef", "#f43f5e"];

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ onCanvasReady, theme = 'light' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [brushColor, setBrushColor] = useState(theme === 'dark' ? '#ffffff' : '#000000');
  const [brushWidth, setBrushWidth] = useState(5);

  const colors = theme === 'dark' ? ["#ffffff", ...baseColors] : ["#000000", ...baseColors];

  useEffect(() => {
    const defaultColor = theme === 'dark' ? '#ffffff' : '#000000';
    setBrushColor(defaultColor);
  }, [theme]);

  useEffect(() => {
    if (canvasRef.current && containerRef.current) {
      const bgColor = theme === 'dark' ? '#0f172a' : '#ffffff';
      const defaultBrushColor = theme === 'dark' ? '#ffffff' : '#000000';

      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        isDrawingMode: true,
        backgroundColor: bgColor,
        width: containerRef.current.clientWidth,
        height: 240,
      });

      if (fabricCanvas.freeDrawingBrush) {
        fabricCanvas.freeDrawingBrush.color = defaultBrushColor;
        fabricCanvas.freeDrawingBrush.width = brushWidth;
      }

      setCanvas(fabricCanvas);
      onCanvasReady(fabricCanvas);
      
      const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            fabricCanvas.setDimensions({ width: entry.contentRect.width, height: 240 });
            fabricCanvas.renderAll();
        }
      });
      resizeObserver.observe(containerRef.current);

      return () => {
        resizeObserver.disconnect();
        fabricCanvas.dispose();
      };
    }
  }, [onCanvasReady]);

  // Update canvas background and brush color dynamically when theme changes
  useEffect(() => {
    if (canvas) {
      const bgColor = theme === 'dark' ? '#0f172a' : '#ffffff';
      canvas.set('backgroundColor', bgColor);
      canvas.renderAll();
      
      if (canvas.freeDrawingBrush) {
        // If brush is currently eraser mode, update eraser color to new background
        const oldBgColor = theme === 'dark' ? '#ffffff' : '#0f172a';
        if (canvas.freeDrawingBrush.color === oldBgColor || canvas.freeDrawingBrush.color === '#FCFDFD') {
          canvas.freeDrawingBrush.color = bgColor;
        } else {
          canvas.freeDrawingBrush.color = brushColor;
        }
      }
    }
  }, [theme, canvas, brushColor]);

  useEffect(() => {
    if (canvas && canvas.freeDrawingBrush) {
      // Only set color if not in eraser mode (eraser matches the canvas background)
      const bgColor = theme === 'dark' ? '#0f172a' : '#ffffff';
      if (canvas.freeDrawingBrush.color !== bgColor && canvas.freeDrawingBrush.color !== '#FCFDFD') {
        canvas.freeDrawingBrush.color = brushColor;
      }
      canvas.isDrawingMode = true;
    }
  }, [brushColor, canvas, theme]);

  useEffect(() => {
    if (canvas && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = brushWidth;
      canvas.isDrawingMode = true;
    }
  }, [brushWidth, canvas]);
  
  const setEraserMode = () => {
    if(canvas) {
        const eraserBrush = new fabric.PencilBrush(canvas);
        eraserBrush.color = theme === 'dark' ? '#0f172a' : '#ffffff';
        eraserBrush.width = brushWidth;
        canvas.freeDrawingBrush = eraserBrush;
        canvas.isDrawingMode = true;
    }
  };

  const setPencilMode = () => {
    if(canvas) {
        const pencilBrush = new fabric.PencilBrush(canvas);
        pencilBrush.color = brushColor;
        pencilBrush.width = brushWidth;
        canvas.freeDrawingBrush = pencilBrush;
        canvas.isDrawingMode = true;
    }
  };

  const clearCanvas = () => {
    canvas?.clear();
    const bgColor = theme === 'dark' ? '#0f172a' : '#ffffff';
    canvas?.set('backgroundColor', bgColor);
    canvas?.renderAll();
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex flex-wrap items-center gap-2 rounded-md border border-slate-200 dark:border-slate-800 p-2 bg-white dark:bg-slate-900/60 transition-colors duration-200">
        <Button 
          type="button"
          variant="ghost" 
          size="icon" 
          onClick={setPencilMode} 
          title="Pencil"
          className="text-slate-650 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 h-9 w-9"
        >
          <Pencil className="h-4.5 w-4.5" />
        </Button>
        <Button 
          type="button"
          variant="ghost" 
          size="icon" 
          onClick={setEraserMode} 
          title="Eraser"
          className="text-slate-650 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 h-9 w-9"
        >
          <Eraser className="h-4.5 w-4.5" />
        </Button>
        <Separator orientation="vertical" className="h-8 bg-slate-200 dark:bg-slate-800" />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-9 w-9 p-0 border-2 border-slate-300 dark:border-slate-700" style={{backgroundColor: brushColor}} title="Brush Color" />
          </PopoverTrigger>
          <PopoverContent className="w-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-3 shadow-lg">
            <div className="grid grid-cols-6 gap-2">
              {colors.map(color => (
                <button 
                  key={color} 
                  type="button"
                  style={{backgroundColor: color}} 
                  className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-800 transition-transform hover:scale-110" 
                  onClick={() => setBrushColor(color)} 
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <div className="flex items-center gap-2 flex-1 min-w-[120px] px-2">
          <Slider defaultValue={[brushWidth]} max={50} min={1} step={1} onValueChange={(value) => setBrushWidth(value[0])} />
        </div>
        <Separator orientation="vertical" className="h-8 bg-slate-200 dark:bg-slate-800" />
        <Button 
          type="button"
          variant="ghost" 
          size="icon" 
          onClick={clearCanvas} 
          className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors h-9 w-9" 
          title="Clear Canvas"
        >
          <Trash2 className="h-4.5 w-4.5" />
        </Button>
      </div>
      <div ref={containerRef} className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner bg-white dark:bg-slate-900 transition-colors duration-200">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

export default DrawingCanvas;
