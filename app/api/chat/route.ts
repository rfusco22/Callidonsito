import { streamText, tool, convertToModelMessages } from 'ai';
import { z } from 'zod';
import { searchMaquinas, getAllMaquinas } from '@/lib/database';
import { config } from '@/lib/config';

const model = config.ai.model;

const searchMaquinasAI = tool({
  description:
    'Busca máquinas de equipos pesados en la base de datos según las preferencias del cliente',
  inputSchema: z.object({
    tipoMaquina: z.string().describe('Tipo de máquina buscada (ej: retroescavadora, excavadora, etc)'),
    caracteristicas: z.string().describe('Características o especificaciones deseadas'),
  }),
  execute: async ({ tipoMaquina, caracteristicas }) => {
    const query = `${tipoMaquina} ${caracteristicas}`;
    const resultados = await searchMaquinas(query);
    return resultados;
  },
});

const getMaquinasDisponibles = tool({
  description: 'Obtiene todas las máquinas disponibles en la base de datos',
  inputSchema: z.object({}),
  execute: async () => {
    return await getAllMaquinas();
  },
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = streamText({
      model,
      system: config.systemPrompt,
      messages: await convertToModelMessages(messages),
      tools: {
        searchMaquinasAI,
        getMaquinasDisponibles,
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('[v0] Error en chat API:', error);
    throw error;
  }
}
