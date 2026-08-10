import { streamText, tool, convertToModelMessages } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { config } from '@/lib/config';

// Tool to search machines from Django DB
const searchMaquinasFromDjango = tool({
  description:
    'Search for heavy equipment machines in the Django database based on customer preferences',
  inputSchema: z.object({
    tipoMaquina: z.string().describe('Type of machine sought (e.g. backhoe, excavator, etc)'),
    caracteristicas: z.string().describe('Desired features or specifications'),
  }),
  execute: async ({ tipoMaquina, caracteristicas }) => {
    try {
      const query = `${tipoMaquina} ${caracteristicas}`;
      const response = await fetch(`${process.env.DJANGO_API_URL}/api/items/search/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ q: query }),
      });

      if (!response.ok) {
        throw new Error(`Django API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('[v0] Error searching Django API:', error);
      return [];
    }
  },
});

// Tool to get all available machines
const getAllMaquinasFromDjango = tool({
  description: 'Get all available machines from the Django database',
  inputSchema: z.object({}),
  execute: async () => {
    try {
      const response = await fetch(`${process.env.DJANGO_API_URL}/api/items/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Django API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.results || data || [];
    } catch (error) {
      console.error('[v0] Error fetching Django API:', error);
      return [];
    }
  },
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const systemPrompt = config.systemPrompt;

    const result = streamText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
      tools: {
        searchMaquinasFromDjango,
        getAllMaquinasFromDjango,
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('[v0] Error in Django chat API:', error);
    throw error;
  }
}
