import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = await streamText({
      // Usamos el modelo que sí apareció en tu lista de curl
      model: google('gemini-2.0-flash'), 
      messages,
      system: 'Eres Callidonsito, experto en maquinaria pesada.',
    });

    // --- CAMBIO CRÍTICO AQUÍ ---
    // Si toDataStreamResponse falla, usamos la respuesta nativa de la SDK
    // que es compatible con el hook useChat del frontend.
    return result.toTextStreamResponse(); 

  } catch (error: any) {
    console.error('--- ERROR CAZADO ---');
    console.error(error.message);
    
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}