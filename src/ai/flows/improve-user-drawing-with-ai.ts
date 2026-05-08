'use server';
/**
 * @fileOverview An AI agent that improves user drawings.
 *
 * - improveUserDrawingWithAI - A function that handles the drawing improvement process.
 * - ImproveUserDrawingWithAIInput - The input type for the improveUserDrawingWithAI function.
 * - ImproveUserDrawingWithAIOutput - The return type for the improveUserDrawingWithAI function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImproveUserDrawingWithAIInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a user drawing, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  description: z.string().describe('The description of the drawing.'),
});
export type ImproveUserDrawingWithAIInput = z.infer<typeof ImproveUserDrawingWithAIInputSchema>;

const ImproveUserDrawingWithAIOutputSchema = z.object({
  improvedDrawingDataUri: z
    .string()
    .describe('The improved drawing as a data URI.'),
});
export type ImproveUserDrawingWithAIOutput = z.infer<typeof ImproveUserDrawingWithAIOutputSchema>;

export async function improveUserDrawingWithAI(input: ImproveUserDrawingWithAIInput): Promise<ImproveUserDrawingWithAIOutput> {
  return improveUserDrawingWithAIFlow(input);
}

const improveUserDrawingWithAIFlow = ai.defineFlow(
  {
    name: 'improveUserDrawingWithAIFlow',
    inputSchema: ImproveUserDrawingWithAIInputSchema,
    outputSchema: ImproveUserDrawingWithAIOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image-preview',
      prompt: [
        {media: {url: input.photoDataUri}},
        {text: `You are an AI artist specializing in improving user-submitted drawings. You will analyze the user's drawing and generate an improved, more polished version of the same concept, keeping the same style/theme. Description: ${input.description}`},
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });
    if (!media) {
      throw new Error('Image generation failed');
    }
    return {
      improvedDrawingDataUri: media.url,
    };
  }
);
