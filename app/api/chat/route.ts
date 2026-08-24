import { openai } from '@ai-sdk/openai';
import { streamText, convertToModelMessages } from 'ai';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;
    console.log("LOG: Starting stream with OpenAI...");
    console.log("LOG: API key present:", !!apiKey);
    console.log("LOG: API key starts with:", apiKey?.substring(0, 7));

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key is not configured." }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await streamText({
      model: openai('gpt-4o-mini'),
      messages: await convertToModelMessages(messages),
      system: 'You are Callidon, a heavy equipment expert from Callidon Equipment Inc.',
      onError: ({ error }) => {
        console.error('--- OPENAI STREAM ERROR ---');
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
      ? "The AI service has no credits remaining. Please add credits to your OpenAI account at https://platform.openai.com/settings/organization/billing/"
      : (error?.message || "Internal error");

    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}