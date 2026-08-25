export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const SYSTEM_PROMPT = `You are Callidon, a virtual assistant expert in heavy equipment from Callidon Equipment Inc. Help users find equipment like excavators, backhoes, loaders, bulldozers, motor graders, rollers, and trucks. Be helpful, professional, and concise. Respond in the same language the user writes in.`;

// GET handler: search machines from Django API
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get('q');

  if (!q) {
    return Response.json({ maquinas: [] });
  }

  const djangoUrl = process.env.DJANGO_API_URL || process.env.NEXT_PUBLIC_DJANGO_API_URL;
  if (!djangoUrl) {
    return Response.json({ maquinas: [] });
  }

  try {
    const response = await fetch(`${djangoUrl}/api/items/search/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q }),
    });

    if (!response.ok) {
      return Response.json({ maquinas: [] });
    }

    const data = await response.json();
    const maquinas = (data.results || data || []).map((m: any) => ({
      id: m.id,
      nombre: m.nombre || m.name,
      tipo: m.tipo || m.type,
      descripcion: m.descripcion || m.description,
      precio: m.precio || m.price,
      estado: m.estado || m.status,
      foto: m.foto || m.image || m.photo,
      url: m.url || `${djangoUrl}/items/${m.id}`,
    }));

    return Response.json({ maquinas });
  } catch (err: any) {
    console.error('Error searching machines:', err.message);
    return Response.json({ maquinas: [] });
  }
}

// POST handler: chat with OpenAI
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

    const openaiMessages = messages.map((m: any) => {
      const textParts = (m.parts || []).filter((p: any) => p.type === 'text');
      const text = textParts.map((p: any) => p.text).join('\n');
      return { role: m.role, content: text };
    });

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
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...openaiMessages,
        ],
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
        let closed = false;
        const messageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

        const safeClose = () => {
          if (!closed) {
            closed = true;
            clearTimeout(timeout);
            try { streamController.close(); } catch {}
          }
        };
        const safeEnqueue = (chunk: Uint8Array) => {
          if (!closed) {
            try { streamController.enqueue(chunk); } catch {}
          }
        };
        const safeError = (err: any) => {
          if (!closed) {
            closed = true;
            clearTimeout(timeout);
            try { streamController.error(err); } catch {}
          }
        };

        try {
          safeEnqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'text-start', id: messageId })}\n\n`)
          );

          let buf = '';
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buf += decoder.decode(value, { stream: true });
            const lines = buf.split('\n');
            buf = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith('data:')) continue;
              const data = trimmed.slice(5).trim();
              if (data === '[DONE]') continue;
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  safeEnqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({ type: 'text-delta', id: messageId, delta: content })}\n\n`
                    )
                  );
                }
              } catch {}
            }
          }

          safeEnqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'text-end', id: messageId })}\n\n`)
          );
          safeEnqueue(encoder.encode('data: [DONE]\n\n'));
          safeClose();
        } catch (err: any) {
          console.error('Stream error:', err.message);
          safeError(err);
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