import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText } from 'ai';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const openrouter = createOpenRouter({
      apiKey: (process.env.OPENROUTER_API_KEY || '').trim(),
    });

    // Mapeo seguro y estrictamente validado para la versión 7
    const formattedMessages = (messages || []).map((m: any) => {
      // Forzamos un rol válido (user o assistant) por seguridad
      let role = m.role === 'assistant' ? 'assistant' : 'user';
      
      // Extraemos el texto de manera segura sin importar si viene anidado
      let content = '';
      if (typeof m.content === 'string') {
        content = m.content;
      } else if (Array.isArray(m.parts)) {
        content = m.parts.map((p: any) => p.text || '').join('');
      } else if (m.content) {
        content = JSON.stringify(m.content);
      }

      return { role, content };
    }).filter((m: any) => m.content.trim() !== ''); // Eliminamos mensajes vacíos que causan el error Zod

    const result = await streamText({
      model: openrouter('openai/gpt-4o-mini'),
      messages: formattedMessages,
      system: 'Eres Callidonsito, experto en maquinaria pesada de Callidon Equipment Inc. Si el cliente se presenta con su nombre, salúdalo directamente por su nombre.',
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of result.textStream) {
            controller.enqueue(encoder.encode(chunk));
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error('Error crítico en POST /api/chat:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}