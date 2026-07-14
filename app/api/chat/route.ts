import { openai } from '@ai-sdk/openai'; // Importación correcta para OpenAI
import { streamText } from 'ai';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    console.log("LOG: Iniciando stream con OpenAI (GPT)...");

    const result = await streamText({
      // Puedes usar 'gpt-4o' para potencia o 'gpt-4o-mini' para velocidad/costo
      model: openai('gpt-4o-mini'), 
      messages,
      system: 'Eres Callidonsito, experto en maquinaria pesada de Callidon Equipment Inc.',
    });

    return result.toDataStreamResponse();

  } catch (error: any) {
    console.error('--- ERROR CAZADO EN EL SERVIDOR ---');
    console.error('DETALLE:', error.message);
    
    return new Response(
      JSON.stringify({ error: error.message || "Error interno" }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}