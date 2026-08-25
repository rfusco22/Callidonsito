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

let sqlite3: any = null;
let db: any = null;
let dbAvailable = false;

async function getDb(): Promise<any | null> {
  if (dbAvailable) return db;
  try {
    // @ts-ignore - sqlite3 may not be installed in production
    sqlite3 = (await import('sqlite3')).default;
    const path = await import('path');
    const dbPath = path.join(process.cwd(), 'callidonsito.db');
    db = new sqlite3.Database(dbPath);
    dbAvailable = true;
    return db;
  } catch {
    return null;
  }
}

function dbRun(connection: any, sql: string, params: any[] = []): Promise<void> {
  return new Promise((resolve, reject) => {
    connection.run(sql, params, (err: any) => err ? reject(err) : resolve());
  });
}

function dbAll(connection: any, sql: string, params: any[] = []): Promise<any[]> {
  return new Promise((resolve, reject) => {
    connection.all(sql, params, (err: any, rows: any) => err ? reject(err) : resolve(rows));
  });
}

export async function initializeDatabase() {
  const connection = await getDb();
  if (!connection) return 'SQLite not available';

  await dbRun(connection, `
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

  const rows = await dbAll(connection, 'SELECT count(*) as count FROM maquinas');
  if (rows[0].count === 0) {
    await dbRun(connection, `
      INSERT INTO maquinas (nombre, tipo, descripcion, precio, estado, foto, url)
      VALUES
      ('Excavadora Caterpillar 320', 'Excavadora', 'High-performance hydraulic excavator.', 150000, 'Disponible', '/images/excavadora-cat-320.jpg', '/maquinas/excavadora-caterpillar-320'),
      ('Backhoe JCB 3CX', 'Backhoe', 'Versatile backhoe for urban construction.', 85000, 'Disponible', '/images/retro-jcb-3cx.jpg', '/maquinas/backhoe-jcb-3cx'),
      ('Motor Grader John Deere 772G', 'Motor Grader', '250 HP motor grader for leveling.', 120000, 'En mantenimiento', '/images/motoniveladora-jd-772g.jpg', '/maquinas/motor-grader-john-deere-772g'),
      ('Bulldozer Komatsu D155', 'Bulldozer', 'High-torque bulldozer for earthmoving.', 280000, 'Disponible', '/images/bulldozer-komatsu-d155.jpg', '/maquinas/bulldozer-komatsu-d155'),
      ('Roller Caterpillar CS76', 'Roller', '30-ton vibratory roller.', 95000, 'Disponible', '/images/rodillo-cat-cs76.jpg', '/maquinas/roller-caterpillar-cs76'),
      ('Front Loader Volvo L120', 'Loader', '220 HP front loader.', 130000, 'Disponible', '/images/cargador-volvo-l120.jpg', '/maquinas/front-loader-volvo-l120'),
      ('Skid Steer Bobcat S175', 'Skid Steer', 'Compact skid steer for tight spaces.', 45000, 'Disponible', '/images/mini-bobcat-s175.jpg', '/maquinas/skid-steer-bobcat-s175'),
      ('Articulated Truck Caterpillar 740', 'Articulated Truck', '40-ton articulated truck.', 320000, 'Disponible', '/images/camion-cat-740.jpg', '/maquinas/articulated-truck-caterpillar-740'),
      ('Excavator Hyundai R210', 'Excavator', '150 HP crawler excavator.', 110000, 'Disponible', '/images/excavadora-hyundai-r210.jpg', '/maquinas/excavator-hyundai-r210'),
      ('Backhoe Case 580', 'Backhoe', 'Robust backhoe with hydraulic stabilizers.', 78000, 'Disponible', '/images/retro-case-580.jpg', '/maquinas/backhoe-case-580')
    `);
  }

  return 'Database initialized successfully';
}

export async function searchMaquinasByQuery(query: string): Promise<Maquina[]> {
  const connection = await getDb();
  if (!connection) return [];
  const sql = `SELECT * FROM maquinas WHERE LOWER(tipo) LIKE LOWER(?) OR LOWER(nombre) LIKE LOWER(?) OR LOWER(descripcion) LIKE LOWER(?)`;
  const params = [`%${query}%`, `%${query}%`, `%${query}%`];
  return await dbAll(connection, sql, params);
}

export async function searchMaquinas(tipo: string): Promise<Maquina[]> {
  const connection = await getDb();
  if (!connection) return [];
  const sql = `SELECT * FROM maquinas WHERE LOWER(tipo) LIKE LOWER(?) OR LOWER(nombre) LIKE LOWER(?) OR LOWER(descripcion) LIKE LOWER(?)`;
  const params = [`%${tipo}%`, `%${tipo}%`, `%${tipo}%`];
  return await dbAll(connection, sql, params);
}

export async function getAllMaquinas(): Promise<Maquina[]> {
  const connection = await getDb();
  if (!connection) return [];
  return await dbAll(connection, 'SELECT * FROM maquinas');
}

export async function getMaquinasByTipo(tipo: string): Promise<Maquina[]> {
  const connection = await getDb();
  if (!connection) return [];
  const sql = "SELECT * FROM maquinas WHERE LOWER(tipo) LIKE LOWER(?) AND estado = 'Disponible'";
  return await dbAll(connection, sql, [`%${tipo}%`]);
}

export async function getMaquinaById(id: number): Promise<Maquina | null> {
  const connection = await getDb();
  if (!connection) return null;
  const rows = await dbAll(connection, 'SELECT * FROM maquinas WHERE id = ?', [id]);
  return rows.length > 0 ? rows[0] : null;
}