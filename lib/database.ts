import sqlite3 from 'sqlite3';

let db: sqlite3.Database | null = null;

function getDb(): sqlite3.Database {
  if (!db) {
    db = new sqlite3.Database('./callidonsito.db');
  }
  return db;
}

function dbRun(sql: string, ...params: unknown[]): Promise<void> {
  return new Promise((resolve, reject) => {
    getDb().run(sql, params, (err) => (err ? reject(err) : resolve()));
  });
}

function dbAll(sql: string, ...params: unknown[]): Promise<any[]> {
  return new Promise((resolve, reject) => {
    getDb().all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });
}

export async function initializeDatabase() {
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
