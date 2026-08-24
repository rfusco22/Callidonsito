import { streamText, convertToModelMessages } from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    console.log("LOG: Starting stream with OpenRouter...");

    const apiKey = process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "No AI API key configured." }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const isOpenRouter = !!process.env.OPENROUTER_API_KEY;

    const openai = createOpenAICompatible({
      name: isOpenRouter ? 'openrouter' : 'openai',
      apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY,
      baseURL: isOpenRouter ? 'https://openrouter.ai/api/v1' : 'https://api.openai.com/v1',
    });

    const modelName = isOpenRouter ? 'openai/gpt-4o-mini' : 'gpt-4o-mini';

    const result = await streamText({
      model: openai(modelName),
      messages: await convertToModelMessages(messages),
      system: 'You are Callidon, a heavy equipment expert from Callidon Equipment Inc.',
      abortSignal: AbortSignal.timeout(25000),
      onError: ({ error }) => {
        console.error('--- AI STREAM ERROR ---');
        console.error(JSON.stringify(error, null, 2));
      },
    });

    return result.toTextStreamResponse();

  } catch (error: any) {
    console.error('--- SERVER ERROR ---');
    console.error('MESSAGE:', error.message);
    console.error('STACK:', error.stack);

    const isCreditsError = error?.message?.includes('credits') ||
                           error?.message?.includes('quota') ||
                           error?.statusCode === 429;

    const message = isCreditsError
      ? "The AI service has no credits remaining. Please add credits to your AI provider account."
      : (error?.message || "Internal error");

    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}