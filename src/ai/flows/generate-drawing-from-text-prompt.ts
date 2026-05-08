'use server';
/**
 * @fileOverview Generates a drawing based on a text prompt.
 *
 * - generateDrawingFromTextPrompt - A function that generates a drawing from a text prompt.
 * - GenerateDrawingFromTextPromptInput - The input type for the generateDrawingFromTextPrompt function.
 * - GenerateDrawingFromTextPromptOutput - The return type for the generateDrawingFromTextPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDrawingFromTextPromptInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate a drawing from.'),
});
export type GenerateDrawingFromTextPromptInput = z.infer<typeof GenerateDrawingFromTextPromptInputSchema>;

const GenerateDrawingFromTextPromptOutputSchema = z.object({
  drawingDataUri: z.string().describe('The generated drawing as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'),
});
export type GenerateDrawingFromTextPromptOutput = z.infer<typeof GenerateDrawingFromTextPromptOutputSchema>;

export async function generateDrawingFromTextPrompt(input: GenerateDrawingFromTextPromptInput): Promise<GenerateDrawingFromTextPromptOutput> {
  return generateDrawingFromTextPromptFlow(input);
}

const generateDrawingFromTextPromptFlow = ai.defineFlow(
  {
    name: 'generateDrawingFromTextPromptFlow',
    inputSchema: GenerateDrawingFromTextPromptInputSchema,
    outputSchema: GenerateDrawingFromTextPromptOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: input.prompt,
    });
    if (!media) {
      throw new Error('Image generation failed');
    }
    return {
      drawingDataUri: media.url,
    };
  }
);
