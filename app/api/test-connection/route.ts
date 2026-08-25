import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const tests = [];

  // Test 1: DNS + TCP connection to api.openai.com
  try {
    const start = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch('https://api.openai.com/v1/models', {
      signal: controller.signal,
      headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
    });
    clearTimeout(timeout);
    tests.push({
      target: 'api.openai.com',
      status: res.status,
      ok: res.ok,
      duration: Date.now() - start,
      note: res.ok ? 'Reachable' : `HTTP ${res.status}`,
    });
  } catch (err: any) {
    tests.push({
      target: 'api.openai.com',
      ok: false,
      error: err.message || err.name,
      note: err.name === 'AbortError' ? 'TIMEOUT after 10s' : 'Connection failed',
    });
  }

  // Test 2: openrouter.ai
  try {
    const start = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch('https://openrouter.ai/api/v1/models', {
      signal: controller.signal,
      headers: { 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}` },
    });
    clearTimeout(timeout);
    tests.push({
      target: 'openrouter.ai',
      status: res.status,
      ok: res.ok,
      duration: Date.now() - start,
      note: res.ok ? 'Reachable' : `HTTP ${res.status}`,
    });
  } catch (err: any) {
    tests.push({
      target: 'openrouter.ai',
      ok: false,
      error: err.message || err.name,
      note: err.name === 'AbortError' ? 'TIMEOUT after 10s' : 'Connection failed',
    });
  }

  return NextResponse.json({
    openaiKeyPrefix: process.env.OPENAI_API_KEY?.substring(0, 7),
    openrouterKeyPrefix: process.env.OPENROUTER_API_KEY?.substring(0, 7),
    tests,
  });
}