import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'callidonsito.db');
const db = new sqlite3.Database(dbPath);

const dbRun = (sql: string, params: any[] = []): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, (err) => err ? reject(err) : resolve());
  });
};

export interface Maquina {
  id: number;
  nombre: string;
  tipo: string;
  descripcion: string;
  precio: number;
  estado: string;
  foto: string;
  url: string;
}

export async function initializeDatabase() {
  await dbRun(`
    CREATE TABLE IF NOT EXISTS maquinas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT,
      tipo TEXT,
      descripcion TEXT,
      precio REAL,
      estado TEXT,
      foto TEXT,
      url TEXT
    )
  `);

  // Migración: agregar columnas foto y url si la tabla ya existía sin ellas
  try {
    await dbRun("ALTER TABLE maquinas ADD COLUMN foto TEXT", []);
  } catch {}
  try {
    await dbRun("ALTER TABLE maquinas ADD COLUMN url TEXT", []);
  } catch {}

  const rows = await new Promise<any[]>((resolve, reject) => {
    db.all('SELECT count(*) as count FROM maquinas', (err, rows) => err ? reject(err) : resolve(rows));
  });
  if (rows[0].count === 0) {
    await dbRun(`
      INSERT INTO maquinas (nombre, tipo, descripcion, precio, estado, foto, url)
      VALUES 
      ('Excavadora Caterpillar 320', 'Excavadora', 'Excavadora hidráulica de alto rendimiento con 138 HP, ideal para construcción y minería.', 150000, 'Disponible', '/images/excavadora-cat-320.jpg', '/maquinas/excavadora-caterpillar-320'),
      ('Retroexcavadora JCB 3CX', 'Retroexcavadora', 'Retroexcavadora versátil para construcción urbana con sistema de enganche rápido.', 85000, 'Disponible', '/images/retro-jcb-3cx.jpg', '/maquinas/retroexcavadora-jcb-3cx'),
      ('Motoniveladora John Deere 772G', 'Motoniveladora', 'Motoniveladora de 250 HP para nivelación de terrenos y mantenimiento de vías.', 120000, 'En mantenimiento', '/images/motoniveladora-jd-772g.jpg', '/maquinas/motoniveladora-john-deere-772g'),
      ('Bulldozer Komatsu D155', 'Bulldozer', 'Bulldozer de alto torque para movimiento de tierras y demolición.', 280000, 'Disponible', '/images/bulldozer-komatsu-d155.jpg', '/maquinas/bulldozer-komatsu-d155'),
      ('Rodillo Compactador Caterpillar CS76', 'Rodillo', 'Rodillo compactador vibratorio de 30 toneladas para asfalto y suelos.', 95000, 'Disponible', '/images/rodillo-cat-cs76.jpg', '/maquinas/rodillo-compactador-caterpillar-cs76'),
      ('Cargador Frontal Volvo L120', 'Cargador', 'Cargador frontal de 220 HP con capacidad de cucharon de 3.5 m³.', 130000, 'Disponible', '/images/cargador-volvo-l120.jpg', '/maquinas/cargador-frontal-volvo-l120'),
      ('Mini Cargador Bobcat S175', 'Mini Cargador', 'Mini cargador compacto ideal para espacios reducidos y trabajos urbanos.', 45000, 'Disponible', '/images/mini-bobcat-s175.jpg', '/maquinas/mini-cargador-bobcat-s175'),
      ('Camión Articulado Caterpillar 740', 'Camión Articulado', 'Camión articulado de 40 toneladas para acarreo de materiales en mineria.', 320000, 'Disponible', '/images/camion-cat-740.jpg', '/maquinas/camion-articulado-caterpillar-740'),
      ('Excavadora Hyundai R210', 'Excavadora', 'Excavadora de oruga de 150 HP con sistema de control inteligente.', 110000, 'Disponible', '/images/excavadora-hyundai-r210.jpg', '/maquinas/excavadora-hyundai-r210'),
      ('Retroexcavadora Case 580', 'Retroexcavadora', 'Retroexcavadora robusta con estabilizadores hidraulicos y gran alcance.', 78000, 'Disponible', '/images/retro-case-580.jpg', '/maquinas/retroexcavadora-case-580')
    `);
  }

  return "Base de datos inicializada con éxito.";
}

export async function searchMaquinas(tipo: string) {
  const sql = `SELECT * FROM maquinas WHERE LOWER(tipo) LIKE LOWER(?) OR LOWER(nombre) LIKE LOWER(?) OR LOWER(descripcion) LIKE LOWER(?)`;
  const params = [`%${tipo}%`, `%${tipo}%`, `%${tipo}%`];
  return await new Promise<Maquina[]>((resolve, reject) => {
    db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows as Maquina[]));
  });
}

export async function searchMaquinasByQuery(query: string) {
  const sql = `SELECT * FROM maquinas WHERE LOWER(tipo) LIKE LOWER(?) OR LOWER(nombre) LIKE LOWER(?) OR LOWER(descripcion) LIKE LOWER(?)`;
  const params = [`%${query}%`, `%${query}%`, `%${query}%`];
  return await new Promise<Maquina[]>((resolve, reject) => {
    db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows as Maquina[]));
  });
}

export async function getAllMaquinas() {
  return await new Promise<Maquina[]>((resolve, reject) => {
    db.all("SELECT * FROM maquinas", (err, rows) => err ? reject(err) : resolve(rows as Maquina[]));
  });
}

export async function getMaquinasByTipo(tipo: string) {
  const sql = "SELECT * FROM maquinas WHERE LOWER(tipo) LIKE LOWER(?) AND estado = 'Disponible'";
  return await new Promise<Maquina[]>((resolve, reject) => {
    db.all(sql, [`%${tipo}%`], (err, rows) => err ? reject(err) : resolve(rows as Maquina[]));
  });
}

export async function getMaquinaById(id: number) {
  const rows = await new Promise<Maquina[]>((resolve, reject) => {
    db.all("SELECT * FROM maquinas WHERE id = ?", [id], (err, rows) => err ? reject(err) : resolve(rows as Maquina[]));
  });
  return rows.length > 0 ? rows[0] : null;
}
