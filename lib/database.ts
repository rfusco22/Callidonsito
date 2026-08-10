import sqlite3 from 'sqlite3';
import { promisify } from 'util';

// Conexión a la base de datos local
const db = new sqlite3.Database('./callidonsito.db');

const dbRun = promisify(db.run.bind(db));
const dbAll = promisify(db.all.bind(db));

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
    [`%${query}%`, `%${query}%`]
  );
}

export async function getAllMaquinas() {
  return await dbAll("SELECT * FROM maquinas");
}