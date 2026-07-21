import { getAllMaquinas, searchMaquinasByQuery, getMaquinaById } from '@/lib/database';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get('q');
  const id = url.searchParams.get('id');

  try {
    if (id) {
      const m = await getMaquinaById(Number(id));
      return Response.json(m || { error: 'No encontrada' });
    }
    if (q) {
      const results = await searchMaquinasByQuery(q);
      return Response.json({ count: results.length, results });
    }
    const todas = await getAllMaquinas();
    return Response.json({ count: todas.length, maquinas: todas });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST() {
  const { initializeDatabase } = await import('@/lib/database');
  try {
    const msg = await initializeDatabase();
    return Response.json({ ok: true, message: msg }); 
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
