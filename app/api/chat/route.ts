import { openai } from '@ai-sdk/openai';
import { streamText, convertToModelMessages } from 'ai';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    console.log("LOG: Iniciando stream con OpenAI...");

    const result = await streamText({
      model: openai('gpt-4o-mini'),
      messages: await convertToModelMessages(messages),
      system: 'Eres Callidonsito, experto en maquinaria pesada de Callidon Equipment Inc.',
    });

    return result.toTextStreamResponse();

  } catch (error: any) {
    console.error('--- ERROR CAZADO EN EL SERVIDOR ---');
    console.error('MENSAJE:', error.message);
    
    return new Response(
      JSON.stringify({ error: error.message || "Error interno" }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
