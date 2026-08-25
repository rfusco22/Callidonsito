import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText, convertToModelMessages } from 'ai';
import { config } from '@/lib/config';

export const dynamic = 'force-dynamic';

const DJANGO_API_URL = process.env.DJANGO_API_URL || '';

export const TIPOS_MAQUINAS = [
  'excavadora', 'excavator',
  'retroexcavadora', 'retroexcavator', 'backhoe',
  'bulldozer',
  'motoniveladora', 'motor grader', 'grader',
  'rodillo', 'roller', 'compactor',
  'cargador', 'loader', 'front loader',
  'mini cargador', 'mini loader', 'skid steer',
  'camión', 'camion articulado', 'truck', 'dump truck', 'articulated truck',
  'inventario', 'maquinaria', 'máquina', 'inventory', 'machinery', 'machine'
];

export function normalizarMaquina(item: any) {
  return {
    id: item.id,
    nombre: item.nombre || item.name || 'Sin nombre',
    tipo: item.tipo || item.type || 'General',
    descripcion: item.descripcion || item.description || '',
    precio: item.precio || item.price || 0,
    estado: item.estado || item.status || 'Disponible',
    foto: item.foto || item.image || item.photo || '',
    url: item.url || `/maquinas/${item.id}`,
  };
}

async function buscarEnDjango(consulta: string) {
  if (!DJANGO_API_URL) throw new Error('DJANGO_API_URL no configurado');
  const response = await fetch(`${DJANGO_API_URL.replace(/\/$/, '')}/api/items/search/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: consulta === '*' ? '' : consulta }),
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error(`Django ${response.status}`);
  const data = await response.json();
  return data.results || data || [];
}

async function buscarEnSqlite(consulta: string) {
  const { searchMaquinasByQuery } = await import('@/lib/database');
  return await searchMaquinasByQuery(consulta);
}

export async function buscarMaquinas(consulta: string) {
  let maquinas: any[] = [];
  let djangoRespondio = false;
  try {
    maquinas = await buscarEnDjango(consulta);
    djangoRespondio = true;
  } catch (err) {
    console.warn('[v0] Django no disponible:', (err as Error).message);
  }
  if (!djangoRespondio && maquinas.length === 0) {
    try {
      maquinas = await buscarEnSqlite(consulta);
    } catch {}
  }
  return maquinas.map(normalizarMaquina);
}

const TIPOS_GENERICOS = [
  'inventario', 'maquinaria', 'máquina', 'tienes', 'catalogo', 'catálogo', 'lista',
  'inventory', 'machinery', 'catalog', 'catalogue', 'list', 'have', 'available',
];

function detectarConsulta(messages: any[]): string | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.role !== 'user') continue;
    const texto = (msg.parts || [])
      .filter((p: any) => p.type === 'text')
      .map((p: any) => p.text)
      .join(' ')
      .toLowerCase();
    for (const tipo of TIPOS_MAQUINAS) {
      if (texto.includes(tipo)) return tipo;
    }
    for (const gen of TIPOS_GENERICOS) {
      if (texto.includes(gen)) return '*';
    }
  }
  return null;
}

function construirContextoMaquinas(maquinas: any[], consulta: string): string {
  const lista = maquinas.map((m, i) =>
    `${i + 1}. **${m.nombre}** (${m.tipo}) - ${m.estado} - $${m.precio?.toLocaleString() || 'Consult'}\n   ${m.descripcion}`
  ).join('\n');
  return `\n\nCURRENT INVENTORY - Results for "${consulta}":\n${lista}\n\nPresent these results to the customer in a friendly way. Mention the names, prices and suggest viewing more details.`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body;

    let systemPrompt = config.systemPrompt;

    const hasMachineData = systemPrompt.includes('CURRENT INVENTORY');

    if (!hasMachineData) {
      try {
        const todos = await buscarEnDjango('');
        const tipos = [...new Set(todos.map((m: any) => m.tipo).filter(Boolean))];
        if (tipos.length > 0) {
          systemPrompt += `\n\nAVAILABLE CATEGORIES: ${tipos.join(', ')}.\nWhen a customer introduces themselves, greet them and let them know the available categories.`;
        }
      } catch {}
    }

    let maquinasEncontradas: any[] = [];
    let consulta = '';

    const detected = detectarConsulta(messages);
    if (detected) {
      consulta = detected;
      maquinasEncontradas = await buscarMaquinas(consulta);
      if (maquinasEncontradas.length > 0) {
        systemPrompt += construirContextoMaquinas(maquinasEncontradas, consulta === '*' ? 'all inventory' : consulta);
      } else {
        systemPrompt += `\n\nINVENTORY - No results found for "${consulta}". Inform the customer that there is currently no stock.`;
      }
    }

    const openrouter = createOpenRouter({
      apiKey: (process.env.OPENROUTER_API_KEY || '').trim(),
    });

    const result = streamText({
      model: openrouter(config.ai.model),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('[v0] Error en chat-local API:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get('q');
  if (!q) return Response.json({ maquinas: [] });
  const maquinas = await buscarMaquinas(q);
  return Response.json({ maquinas });
}
