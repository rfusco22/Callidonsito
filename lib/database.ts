let db: any = null;

function getDb() {
  if (db) return db;
  if (process.env.NODE_ENV === 'production') {
    return null;
  }
  try {
    const sqlite3 = require('sqlite3');
    db = new sqlite3.Database('./callidonsito.db');
    return db;
  } catch {
    return null;
  }
}

function dbRun(sql: string, ...params: unknown[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const connection = getDb();
    if (!connection) return resolve();
    connection.run(sql, params, (err: any) => (err ? reject(err) : resolve()));
  });
}

function dbAll(sql: string, ...params: unknown[]): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const connection = getDb();
    if (!connection) return resolve([]);
    connection.all(sql, params, (err: any, rows: any) => (err ? reject(err) : resolve(rows)));
  });
}

export async function initializeDatabase() {
  if (process.env.NODE_ENV === 'production') return "Saltado en producción";
  await dbRun(`
    CREATE TABLE IF NOT EXISTS maquinas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT,
      tipo TEXT,
      descripcion TEXT,
      precio REAL,
      estado TEXT
    )
  `);
  const rows = await dbAll('SELECT count(*) as count FROM maquinas');
  // @ts-ignore
  if (rows[0].count === 0) {
    await dbRun(`
      INSERT INTO maquinas (nombre, tipo, descripcion, precio, estado)
      VALUES 
      ('Excavadora Caterpillar 320', 'Excavadora', 'Excavadora hidráulica de alto rendimiento', 150000, 'Disponible'),
      ('Retroexcavadora JCB 3CX', 'Retroexcavadora', 'Versátil para construcción urbana', 85000, 'Disponible'),
      ('Motoniveladora John Deere', 'Motoniveladora', 'Ideal para nivelación de terrenos', 120000, 'En mantenimiento')
    `);
  }
  return "Base de datos inicializada con éxito.";
}

export async function searchMaquinas(query: string) {
  return await dbAll(
    "SELECT * FROM maquinas WHERE nombre LIKE ? OR descripcion LIKE ?",
    `%${query}%`, `%${query}%`
  );
}

export async function getAllMaquinas() {
  return await dbAll("SELECT * FROM maquinas");
}
