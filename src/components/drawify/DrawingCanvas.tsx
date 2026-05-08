'use client';

import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { Button } from '@/components/ui/button';
import { Eraser, Pencil, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Slider } from '../ui/slider';
import { Separator } from '../ui/separator';

interface DrawingCanvasProps {
  onCanvasReady: (canvas: fabric.Canvas) => void;
}

const colors = ["#000000", "#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6", "#8b5cf6", "#d946ef", "#f43f5e"];

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ onCanvasReady }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushWidth, setBrushWidth] = useState(5);

  useEffect(() => {
    if (canvasRef.current && containerRef.current) {
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        isDrawingMode: true,
        backgroundColor: '#FCFDFD',
        width: containerRef.current.clientWidth,
        height: 400,
      });

      fabricCanvas.freeDrawingBrush.color = brushColor;
      fabricCanvas.freeDrawingBrush.width = brushWidth;

      setCanvas(fabricCanvas);
      onCanvasReady(fabricCanvas);
      
      const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            fabricCanvas.setDimensions({ width: entry.contentRect.width, height: 400 });
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

  useEffect(() => {
    if (canvas) {
      canvas.freeDrawingBrush.color = brushColor;
      canvas.isDrawingMode = true;
    }
  }, [brushColor, canvas]);

  useEffect(() => {
    if (canvas) {
      canvas.freeDrawingBrush.width = brushWidth;
      canvas.isDrawingMode = true;
    }
  }, [brushWidth, canvas]);
  
  const setEraserMode = () => {
    if(canvas) {
        canvas.freeDrawingBrush = new fabric.EraserBrush(canvas);
        canvas.freeDrawingBrush.width = brushWidth;
        canvas.isDrawingMode = true;
    }
  };

  const setPencilMode = () => {
    if(canvas) {
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.color = brushColor;
        canvas.freeDrawingBrush.width = brushWidth;
        canvas.isDrawingMode = true;
    }
  };


  const clearCanvas = () => {
    canvas?.clear();
    canvas?.set('backgroundColor', '#FCFDFD');
    canvas?.renderAll();
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex flex-wrap items-center gap-2 rounded-md border p-2 bg-card">
        <Button variant="ghost" size="icon" onClick={setPencilMode} title="Pencil"><Pencil/></Button>
        <Button variant="ghost" size="icon" onClick={setEraserMode} title="Eraser"><Eraser/></Button>
        <Separator orientation="vertical" className="h-8" />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-10 w-10 p-0 border-2" style={{backgroundColor: brushColor}} title="Brush Color" />
          </PopoverTrigger>
          <PopoverContent className="w-auto">
            <div className="grid grid-cols-6 gap-2">
              {colors.map(color => (
                <button key={color} style={{backgroundColor: color}} className="h-8 w-8 rounded-full border transition-transform hover:scale-110" onClick={() => setBrushColor(color)} />
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <div className="flex items-center gap-2 flex-1 min-w-[120px]">
          <Slider defaultValue={[brushWidth]} max={50} min={1} step={1} onValueChange={(value) => setBrushWidth(value[0])} />
        </div>
        <Separator orientation="vertical" className="h-8" />
        <Button variant="ghost" size="icon" onClick={clearCanvas} className="text-destructive hover:text-destructive" title="Clear Canvas"><Trash2 /></Button>
      </div>
      <div ref={containerRef} className="rounded-lg overflow-hidden border-2 shadow-inner bg-white">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

export default DrawingCanvas;
