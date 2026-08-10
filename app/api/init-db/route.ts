import { initializeDatabase } from '@/lib/database';

export async function GET() {
  try {
    await initializeDatabase();
    return Response.json({ success: true, message: 'Base de datos inicializada correctamente' });
  } catch (error) {
    console.error('[v0] Error inicializando base de datos:', error);
    return Response.json(
      { success: false, error: 'Error al inicializar la base de datos' },
      { status: 500 }
    );
  }
}
