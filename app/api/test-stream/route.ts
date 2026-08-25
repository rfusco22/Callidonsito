import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'No API key' });
  }

  const log: string[] = [];
  log.push('Starting direct OpenAI streaming test...');
  log.push(`Key prefix: ${apiKey.substring(0, 7)}`);
  log.push(`Node: ${process.version}`);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      log.push('ABORT: 20s timeout reached');
      controller.abort();
    }, 20000);

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Say hi in 5 words' }],
        stream: true,
        max_tokens: 50,
      }),
    });

    log.push(`Response status: ${res.status}`);
    log.push(`Response ok: ${res.ok}`);

    if (!res.ok) {
      const errText = await res.text();
      log.push(`Error body: ${errText.substring(0, 500)}`);
      clearTimeout(timeout);
      return NextResponse.json({ log });
    }

    log.push('Starting to read stream...');
    const reader = res.body?.getReader();
    if (!reader) {
      log.push('No reader available');
      clearTimeout(timeout);
      return NextResponse.json({ log });
    }

    const decoder = new TextDecoder();
    let chunks = 0;
    let content = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        log.push('Stream done');
        break;
      }
      chunks++;
      const text = decoder.decode(value);
      content += text;
      if (chunks <= 3) {
        log.push(`Chunk ${chunks}: ${text.substring(0, 200)}`);
      }
      if (chunks >= 10) break;
    }

    clearTimeout(timeout);
    log.push(`Total chunks received: ${chunks}`);
    log.push(`Content received: ${content.substring(0, 500)}`);

    return NextResponse.json({ log, content: content.substring(0, 500) });
  } catch (err: any) {
    log.push(`ERROR: ${err.message || err.name}`);
    log.push(`Stack: ${err.stack?.substring(0, 300)}`);
    return NextResponse.json({ log });
  }
}