
'use server';

import { generateDrawingFromTextPrompt, GenerateDrawingFromTextPromptInput } from '@/ai/flows/generate-drawing-from-text-prompt';
import { improveUserDrawingWithAI, ImproveUserDrawingWithAIInput } from '@/ai/flows/improve-user-drawing-with-ai';
import { z } from 'zod';

// For generateDrawingAction
export interface GenerateDrawingState {
  message?: string;
  drawingDataUri?: string | null;
  error?: {
    prompt?: string[];
    _errors?: string[];
  } | null;
}

const textToDrawingSchema = z.object({
  prompt: z.string().min(3, { message: 'Prompt must be at least 3 characters long.' }),
  stylePreset: z.string().optional(),
});

export async function generateDrawingAction(prevState: GenerateDrawingState, formData: FormData): Promise<GenerateDrawingState> {
  const validatedFields = textToDrawingSchema.safeParse({
    prompt: formData.get('prompt'),
    stylePreset: formData.get('stylePreset') || 'none',
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid prompt.',
      error: validatedFields.error.flatten().fieldErrors,
      drawingDataUri: null,
    };
  }
  
  try {
    const input: GenerateDrawingFromTextPromptInput = {
      prompt: validatedFields.data.prompt,
      stylePreset: validatedFields.data.stylePreset || 'none',
    };
    const result = await generateDrawingFromTextPrompt(input);
    return {
      message: 'Drawing generated successfully.',
      drawingDataUri: result.drawingDataUri,
      error: null,
    };
  } catch (error) {
    console.error(error);
    return {
      message: 'Failed to generate drawing.',
      drawingDataUri: null,
      error: { _errors: ['An unexpected error occurred. Please try again.'] }
    };
  }
}

// For improveDrawingAction
export interface ImproveDrawingState {
    message?: string;
    improvedDrawingDataUri?: string | null;
    error?: {
        photoDataUri?: string[];
        _errors?: string[];
    } | null;
}


const improveDrawingSchema = z.object({
  photoDataUri: z.string().min(1, { message: 'Drawing data is required.' }),
  stylePreset: z.string().optional(),
});

export async function improveDrawingAction(prevState: ImproveDrawingState, formData: FormData): Promise<ImproveDrawingState> {
    const validatedFields = improveDrawingSchema.safeParse({
      photoDataUri: formData.get('photoDataUri'),
      stylePreset: formData.get('stylePreset') || 'none',
    });

    if (!validatedFields.success) {
        return {
          message: 'Invalid input.',
          error: validatedFields.error.flatten().fieldErrors,
          improvedDrawingDataUri: null,
        };
    }
    
    try {
        const input: ImproveUserDrawingWithAIInput = {
            photoDataUri: validatedFields.data.photoDataUri,
            stylePreset: validatedFields.data.stylePreset || 'none',
        };
        const result = await improveUserDrawingWithAI(input);
        return {
            message: 'Drawing improved successfully.',
            improvedDrawingDataUri: result.improvedDrawingDataUri,
            error: null,
        };
    } catch (error) {
        console.error(error);
        return {
            message: 'Failed to improve drawing.',
            improvedDrawingDataUri: null,
            error: { _errors: [error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'] }
        };
    }
}
