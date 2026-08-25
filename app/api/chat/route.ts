import { openai } from '@ai-sdk/openai';
import { streamText, convertToModelMessages } from 'ai';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    console.log("LOG: Starting stream with OpenAI...");

    if (!process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key is not configured." }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Convert UIMessages to OpenAI chat format
    const openaiMessages = messages.map((m: any) => {
      const textParts = (m.parts || []).filter((p: any) => p.type === 'text');
      const text = textParts.map((p: any) => p.text).join('\n');
      return { role: m.role, content: text };
    });

    const systemMessage = { role: 'system', content: 'You are Callidon, a heavy equipment expert from Callidon Equipment Inc.' };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [systemMessage, ...openaiMessages],
        stream: true,
      }),
    });

    if (!openaiRes.ok) {
      clearTimeout(timeout);
      const errText = await openaiRes.text();
      console.error('OpenAI API error:', errText);
      const isCreditsError = errText.includes('credits') || errText.includes('quota');
      const message = isCreditsError
        ? 'The AI service has no credits remaining. Please add credits to your OpenAI account.'
        : `OpenAI API error: ${openaiRes.status}`;
      return new Response(JSON.stringify({ error: message }), {
        status: openaiRes.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const reader = openaiRes.body?.getReader();
    if (!reader) {
      clearTimeout(timeout);
      return new Response(JSON.stringify({ error: 'No response stream' }), { status: 500 });
    }

    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(streamController) {
        try {
          let buffer = '';
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              streamController.enqueue(encoder.encode('data: [DONE]\n\n'));
              streamController.close();
              break;
            }
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim();
                if (data === '[DONE]') {
                  streamController.enqueue(encoder.encode('data: [DONE]\n\n'));
                  streamController.close();
                  clearTimeout(timeout);
                  return;
                }
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    streamController.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                  }
                } catch {
                  // skip malformed JSON
                }
              }
            }
          }
        } catch (err: any) {
          console.error('Stream error:', err.message);
          streamController.error(err);
          clearTimeout(timeout);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error('--- SERVER ERROR ---');
    console.error('MESSAGE:', error.message);

    const isCreditsError = error?.message?.includes('credits') || error?.message?.includes('quota');
    const message = isCreditsError
      ? 'The AI service has no credits remaining. Please add credits to your OpenAI account.'
      : (error?.message || 'Internal error');

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}