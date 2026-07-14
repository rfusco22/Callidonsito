import { streamText, tool, convertToModelMessages } from 'ai';
import { z } from 'zod';
import { config } from '@/lib/config';

const model = config.ai.model;

// Herramienta para buscar máquinas desde la BD de Django
const searchMaquinasFromDjango = tool({
  description:
    'Busca máquinas de equipos pesados en la base de datos Django según las preferencias del cliente',
  inputSchema: z.object({
    tipoMaquina: z.string().describe('Tipo de máquina buscada (ej: retroescavadora, excavadora, etc)'),
    caracteristicas: z.string().describe('Características o especificaciones deseadas'),
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

// Herramienta para obtener todas las máquinas disponibles
const getAllMaquinasFromDjango = tool({
  description: 'Obtiene todas las máquinas disponibles en la base de datos Django',
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

    // Verificar que DJANGO_API_URL está configurado
    if (!process.env.DJANGO_API_URL) {
      console.warn('[v0] DJANGO_API_URL no configurado, usando BD local');
    }

    const systemPrompt = config.systemPrompt;

    const result = streamText({
      model,
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
      tools: {
        searchMaquinasFromDjango,
        getAllMaquinasFromDjango,
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('[v0] Error en chat API Django:', error);
    throw error;
  }
}
