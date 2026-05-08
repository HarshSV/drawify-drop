'use client';

import React, { useActionState } from 'react';
import Image from 'next/image';
import { useFormStatus } from 'react-dom';
import { Sparkles, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { generateDrawingAction, type GenerateDrawingState } from '@/lib/actions';
import LoadingSpinner from './LoadingSpinner';

const initialState: GenerateDrawingState = {
  message: '',
  drawingDataUri: null,
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? 'Generating...' : 'Generate Drawing'}
      <Wand2 className="ml-2 h-4 w-4" />
    </Button>
  );
}

function GenerationResult({ drawingDataUri }: { drawingDataUri: string | null | undefined }) {
    const { pending } = useFormStatus();

    return (
        <div className="relative flex min-h-[300px] w-full items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 sm:min-h-[400px]">
            {drawingDataUri ? (
              <Image
                src={drawingDataUri}
                alt="Generated drawing"
                fill
                className="object-contain rounded-lg p-2"
              />
            ) : (
              pending ? <LoadingSpinner /> : <p className="text-muted-foreground">Your drawing will appear here</p>
            )}
        </div>
    );
}

export default function TextToDrawing() {
  const [state, formAction] = useActionState(generateDrawingAction, initialState);

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl font-headline">Text-to-Drawing Generator</CardTitle>
              <CardDescription>
                Type any text prompt and our AI will instantly generate a digital drawing for you.
              </CardDescription>
            </div>
        </div>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          <Textarea
            name="prompt"
            placeholder="e.g., a cute cat riding a skateboard in a city"
            rows={3}
            required
            className="resize-none text-base"
          />
          {state.error?.prompt && <p className="text-sm font-medium text-destructive">{state.error.prompt[0]}</p>}
          {state.error?._errors && <p className="text-sm font-medium text-destructive">{state.error._errors.join(', ')}</p>}

          <GenerationResult drawingDataUri={state.drawingDataUri} />
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
