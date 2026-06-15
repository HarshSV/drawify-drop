'use server';
/**
 * @fileOverview An AI agent that improves user drawings.
 *
 * - improveUserDrawingWithAI - A function that handles the drawing improvement process.
 * - ImproveUserDrawingWithAIInput - The input type for the improveUserDrawingWithAI function.
 * - ImproveUserDrawingWithAIOutput - The return type for the improveUserDrawingWithAI function.
 */

import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { callOpenRouterStructured } from '@/lib/openrouter';

const ImproveUserDrawingWithAIInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a user drawing, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  stylePreset: z.string().optional().describe('The style preset.'),
});
export type ImproveUserDrawingWithAIInput = z.infer<typeof ImproveUserDrawingWithAIInputSchema>;

const ImproveUserDrawingWithAIOutputSchema = z.object({
  improvedDrawingDataUri: z
    .string()
    .describe('The improved drawing as a data URI.'),
});
export type ImproveUserDrawingWithAIOutput = z.infer<typeof ImproveUserDrawingWithAIOutputSchema>;

const AnalysisResponseSchema = z.object({
  subject: z.string().describe('The core object/subject identified from the drawing, e.g. "cat", "bicycle", "flower"'),
  refinedPrompt: z.string().describe('A detailed prompt describing a beautiful, high-quality, professional version of this exact drawing. Keep style/colors/layout consistent but enhanced.')
});

const ART_PRESET_DESCRIPTIONS: Record<string, string> = {
  none: 'professional digital drawing, clean lines, vibrant colors, vector illustration style, simple white background.',
  watercolor: ' watercolor painting style, soft fluid water-washes, bleed edge details, fine heavy coldpress paper texture, delicate light color palette, white background.',
  oil: ' classical oil painting style, visible rich impasto textured canvas brushstrokes, dramatic lighting, deep rich saturated oil colors, classic fine art easel painting.',
  sketch: ' professional graphite pencil sketch, fine detailed hand-drawn lines, shading cross-hatch details, textured paper background, grey graphite monochrome illustration.',
  anime: ' modern anime manga key visual style, bold clean ink lineart, cell-shaded digital paint, vibrant pop gradients, white background.',
  impressionism: ' classic impressionist style oil painting, quick thin visible paint strokes, study of light and color, vibrant dabs of paint.',
  digital: ' high-end digital art concept design, dramatic moody volumetric lighting, highly detailed matte concept illustration, cinematic art station visual.'
};

export async function improveUserDrawingWithAI(input: ImproveUserDrawingWithAIInput): Promise<ImproveUserDrawingWithAIOutput> {
  try {
    const styleDesc = ART_PRESET_DESCRIPTIONS[input.stylePreset || 'none'] || ART_PRESET_DESCRIPTIONS.none;

    // 1. Analyze the drawing using OpenRouter Gemini 2.0 Flash (with multimodal input)
    const messages = [
      {
        role: 'user' as const,
        content: [
          {
            type: 'text' as const,
            text: `You are an expert AI art analyst. Carefully study the attached sketch/drawing.

RULES (follow strictly):
- Identify ONLY what is ACTUALLY drawn in the image. Do NOT invent subjects.
- If the drawing shows a house, the subject is "house". If a tree, "tree". If a cat, "cat". Etc.
- NEVER output "face", "person", or "portrait" unless a human face/figure is literally drawn.
- The refinedPrompt MUST describe a polished illustration of the EXACT same objects in the same composition and layout.
- Keep placement, structure, and scene intact — only improve quality/style.
- Style to apply: ${styleDesc}

Return a subject (one short noun phrase) and a refinedPrompt (detailed image generation prompt for the same drawing).`
          },
          {
            type: 'image_url' as const,
            image_url: {
              url: input.photoDataUri
            }
          }
        ]
      }
    ];

    // Request the model via OpenRouter
    const analysis = await callOpenRouterStructured(messages, AnalysisResponseSchema);

    console.log('OpenRouter Analysis Output:', analysis);

    // 2. Use OpenRouter with google/gemini-2.5-flash-image for image generation
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY is not configured in your .env file.');
    }
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        'HTTP-Referer': 'https://drawify.college',
        'X-Title': 'Drawify College Project',
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: `Generate an improved drawing matching this description: ${analysis.refinedPrompt}`
          }
        ],
        modalities: ["image"]
      })
    });
    
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenRouter improved drawing generation failed (${response.status}): ${errText}`);
    }
    
    const data = await response.json();
    const generatedImage = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!generatedImage) {
      throw new Error(`OpenRouter did not return a generated image. Response: ${JSON.stringify(data)}`);
    }
    
    const improvedDrawingDataUri = generatedImage;

    // 3. Format display prompt for database history vault
    const styleLabel = input.stylePreset && input.stylePreset !== 'none' 
      ? input.stylePreset.charAt(0).toUpperCase() + input.stylePreset.slice(1) 
      : 'Default';
    const displayPrompt = `Improved sketch of a ${analysis.subject || 'drawing'} (${styleLabel})`;

    // 4. Save to Supabase database
    const { error } = await supabase
      .from('drawings')
      .insert([
        {
          prompt: displayPrompt,
          type: 'improve-drawing',
          original_image_url: input.photoDataUri,
          improved_image_url: improvedDrawingDataUri
        }
      ]);

    if (error) {
      console.error('Failed to save to Supabase:', error);
    }

    return {
      improvedDrawingDataUri,
    };
  } catch (e) {
    console.error('Error improving drawing:', e);
    throw new Error(`Drawing improvement failed: ${e instanceof Error ? e.message : String(e)}`);
  }
}
