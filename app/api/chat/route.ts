import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Log para ver qué está pasando en tu terminal de VS Code
    console.log("LOG: Iniciando stream con Gemini...");

    const result = await streamText({
      model: google('gemini-1.5-flash'), // Usa 1.5-flash para máxima estabilidad
      messages,
      system: 'Eres Callidonsito, experto en maquinaria pesada de Callidon Equipment Inc.',
    });

    // --- SOLUCIÓN MANUAL (SIN MÉTODOS QUE FALLAN) ---
    // Esto crea un flujo de datos que cualquier versión de useChat entiende
    return result.toDataStreamResponse();

  } catch (error: any) {
    // ESTE LOG ES EL MÁS IMPORTANTE. MIRA TU TERMINAL CUANDO FALLE.
    console.error('--- ERROR CAZADO EN EL SERVIDOR ---');
    console.error('MENSAJE:', error.message);
    
    // Si el error es por la API KEY, aquí lo verás
    return new Response(
      JSON.stringify({ error: error.message || "Error interno" }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}