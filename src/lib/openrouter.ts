import { z } from 'zod';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | Array<{
    type: 'text' | 'image_url';
    text?: string;
    image_url?: {
      url: string;
    };
  }>;
}

/**
 * Call the OpenRouter completions API.
 */
export async function callOpenRouter(
  messages: OpenRouterMessage[],
  model?: string,
  responseFormatJson: boolean = false
): Promise<string> {
  // Read model at call-time so .env reloads are always picked up
  const resolvedModel = model || process.env.OPENROUTER_MODEL || 'google/gemma-4-31b-it:free';
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
    throw new Error('OPENROUTER_API_KEY is not configured in your .env file.');
  }

  const payload: any = {
    model: resolvedModel,
    messages,
  };

  if (responseFormatJson) {
    payload.response_format = { type: 'json_object' };
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://drawify.college', // Required by OpenRouter for ranking
      'X-Title': 'Drawify College Project',       // Required by OpenRouter
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter API call failed (${response.status}): ${errText}`);
  }

  const data = await response.json();
  
  if (!data.choices || data.choices.length === 0) {
    throw new Error('OpenRouter returned an empty response.');
  }

  return data.choices[0].message.content || '';
}

/**
 * Call OpenRouter and force a structured JSON output matching a Zod schema.
 */
export async function callOpenRouterStructured<T>(
  messages: OpenRouterMessage[],
  schema: z.ZodType<T>,
  model?: string
): Promise<T> {
  // Append format instructions to the last message if it's text, or add a system instruction
  const systemInstruction = `You must return your output ONLY as a JSON object matching this schema:
${JSON.stringify(schema)}
Do not include any markdown formatting (like \`\`\`json ... \`\`\`), additional text, or explanation. Just return raw JSON.`;

  const updatedMessages: OpenRouterMessage[] = [
    { role: 'system', content: systemInstruction },
    ...messages,
  ];

  const rawResponse = await callOpenRouter(updatedMessages, model /* resolved inside callOpenRouter */, true);
  
  try {
    // Attempt parsing directly
    return JSON.parse(rawResponse.trim()) as T;
  } catch (e) {
    // If the model wrapped the JSON in markdown code blocks, extract it
    try {
      const jsonStart = rawResponse.indexOf('{');
      const jsonEnd = rawResponse.lastIndexOf('}') + 1;
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonStr = rawResponse.substring(jsonStart, jsonEnd);
        return JSON.parse(jsonStr) as T;
      }
    } catch (innerErr) {
      console.error('Failed to parse inner JSON block:', rawResponse);
    }
    throw new Error(`Failed to parse structured response from OpenRouter: ${e instanceof Error ? e.message : String(e)}`);
  }
}
