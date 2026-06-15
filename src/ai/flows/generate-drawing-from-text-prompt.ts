'use server';
/**
 * @fileOverview Generates a drawing based on a text prompt.
 *
 * - generateDrawingFromTextPrompt - A function that generates a drawing from a text prompt.
 * - GenerateDrawingFromTextPromptInput - The input type for the generateDrawingFromTextPrompt function.
 * - GenerateDrawingFromTextPromptOutput - The return type for the generateDrawingFromTextPrompt function.
 */

import { z } from 'zod';
import { supabase } from '@/lib/supabase';

const GenerateDrawingFromTextPromptInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate a drawing from.'),
  stylePreset: z.string().optional().describe('The style preset.'),
});
export type GenerateDrawingFromTextPromptInput = z.infer<typeof GenerateDrawingFromTextPromptInputSchema>;

const GenerateDrawingFromTextPromptOutputSchema = z.object({
  drawingDataUri: z.string().describe('The generated drawing as a data URI.'),
});
export type GenerateDrawingFromTextPromptOutput = z.infer<typeof GenerateDrawingFromTextPromptOutputSchema>;

const ART_PRESET_PROMPTS: Record<string, string> = {
  none: 'clean vector drawing, digital illustration, vibrant colors, cartoon style, white background',
  watercolor: ' watercolor painting style, soft fluid water-washes, bleed edge details, fine heavy coldpress paper texture, delicate light color palette, white background',
  oil: ' classical oil painting style, visible rich impasto textured canvas brushstrokes, dramatic lighting, deep rich saturated oil colors, classic fine art easel painting',
  sketch: ' professional graphite pencil sketch, fine detailed hand-drawn lines, shading cross-hatch details, textured paper background, grey graphite monochrome illustration',
  anime: ' modern anime manga key visual style, bold clean ink lineart, cell-shaded digital paint, vibrant pop gradients, white background',
  impressionism: ' classic impressionist style oil painting, quick thin visible paint strokes, study of light and color, vibrant dabs of paint',
  digital: ' high-end digital art concept design, dramatic moody volumetric lighting, highly detailed matte concept illustration, cinematic art station visual'
};

export async function generateDrawingFromTextPrompt(input: GenerateDrawingFromTextPromptInput): Promise<GenerateDrawingFromTextPromptOutput> {
  try {
    // 1. Refine prompt based on style preset
    const stylePrompt = ART_PRESET_PROMPTS[input.stylePreset || 'none'] || ART_PRESET_PROMPTS.none;
    const refinedPrompt = `${input.prompt}, ${stylePrompt}`;
    
    // 2. Construct the Pollinations AI URL for high-fidelity keyless image generation
    // Because edge server IPs are rate-limited, returning this URL directly allows the client's browser
    // to load the image directly from the user's home IP (which is not rate-limited).
    const seed = Math.floor(Math.random() * 1000000);
    const drawingDataUri = `https://image.pollinations.ai/prompt/${encodeURIComponent(refinedPrompt)}?width=1024&height=1024&nologo=true&seed=${seed}`;

    // 3. Save record to Supabase backend
    const { error } = await supabase
      .from('drawings')
      .insert([
        {
          prompt: input.prompt,
          type: 'text-to-drawing',
          original_image_url: null,
          improved_image_url: drawingDataUri
        }
      ]);
    
    if (error) {
      console.error('Failed to save to Supabase:', error);
    }

    return {
      drawingDataUri,
    };
  } catch (e) {
    console.error('Error generating drawing:', e);
    throw new Error(`Image generation failed: ${e instanceof Error ? e.message : String(e)}`);
  }
}
