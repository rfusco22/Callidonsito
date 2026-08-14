import { openai } from '@ai-sdk/openai';
import { streamText, convertToModelMessages } from 'ai';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    console.log("LOG: Starting stream with OpenAI...");

    const result = await streamText({
      model: openai('gpt-4o-mini'),
      messages: await convertToModelMessages(messages),
      system: 'You are Callidon, a heavy equipment expert from Callidon Equipment Inc.',
    });

    return result.toTextStreamResponse();

  } catch (error: any) {
    console.error('--- SERVER ERROR ---');
    console.error('MESSAGE:', error.message);
    
    return new Response(
      JSON.stringify({ error: error.message || "Internal error" }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
