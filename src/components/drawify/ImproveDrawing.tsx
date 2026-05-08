'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import React, { useCallback, useState } from 'react';
import type { fabric } from 'fabric';
import { Sparkles, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? 'Improving...' : 'Improve My Drawing'}
      <Wand2 className="ml-2 h-4 w-4" />
    </Button>
  );
}

function ImproveResult({ improvedDrawingDataUri }: { improvedDrawingDataUri: string | null | undefined }) {
    const { pending } = useFormStatus();
    return (
        <div className="relative flex min-h-[300px] w-full items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 sm:min-h-[400px]">
            {improvedDrawingDataUri ? (
              <Image
                src={improvedDrawingDataUri}
                alt="Improved drawing"
                fill
                className="object-contain rounded-lg p-2"
              />
            ) : (
                pending ? <LoadingSpinner /> : <p className="text-muted-foreground">Your improved drawing will appear here</p>
            )}
        </div>
    );
}

export default function ImproveDrawing() {
  const [state, formAction] = useActionState(improveDrawingAction, initialState);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [drawingData, setDrawingData] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('draw');

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
        dataUri = canvas.toDataURL({ format: 'png', quality: 1.0 });
    } else if (activeTab === 'upload') {
        dataUri = drawingData;
    }
    
    if (dataUri) {
        formData.set('photoDataUri', dataUri);
        formAction(formData);
    } else {
        // TODO: Handle error: no drawing provided
        console.error("No drawing data available.");
    }
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl font-headline">Smart Drawing Improver</CardTitle>
              <CardDescription>
                Draw something or upload an image for our AI to improve and polish.
              </CardDescription>
            </div>
        </div>
      </CardHeader>
      <form action={handleFormAction}>
        <CardContent className="space-y-4">
            <Tabs defaultValue="draw" onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="draw">Draw on Canvas</TabsTrigger>
                    <TabsTrigger value="upload">Upload a Drawing</TabsTrigger>
                </TabsList>
                <TabsContent value="draw" className="mt-4">
                    <DrawingCanvas onCanvasReady={handleCanvasReady} />
                </TabsContent>
                <TabsContent value="upload" className="mt-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="drawing-upload">Upload your drawing (PNG, JPG)</Label>
                        <Input id="drawing-upload" type="file" accept="image/png, image/jpeg" onChange={handleFileChange} />
                        {drawingData && activeTab === 'upload' && (
                            <div className="relative mt-2 h-64 w-full rounded-md border p-2">
                                <Image src={drawingData} alt="Uploaded drawing" fill className="object-contain" />
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
            
            <div className="space-y-2">
                <Label htmlFor="description">Describe your drawing</Label>
                <Textarea
                    id="description"
                    name="description"
                    placeholder="e.g., a hand-drawn doodle of a smiling sun"
                    rows={2}
                    required
                    className="resize-none text-base"
                />
            </div>
          
            {state.error?.photoDataUri && <p className="text-sm font-medium text-destructive">{state.error.photoDataUri[0]}</p>}
            {state.error?.description && <p className="text-sm font-medium text-destructive">{state.error.description[0]}</p>}
            {state.error?._errors && <p className="text-sm font-medium text-destructive">{state.error._errors.join(', ')}</p>}

            <ImproveResult improvedDrawingDataUri={state.improvedDrawingDataUri} />
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
