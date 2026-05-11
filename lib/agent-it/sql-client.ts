import { Pool } from 'pg';

let _pool: Pool | null = null;

function getPool(): Pool {
  if (!_pool) {
    _pool = new Pool({
      host: process.env.PGHOST,
      port: Number(process.env.PGPORT ?? 5432),
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : false,
      max: 10,
    });
  }
  return _pool;
}

export async function initTicketsTable(): Promise<void> {
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tickets (
      id               SERIAL PRIMARY KEY,
      ticket_id        VARCHAR(50)   UNIQUE NOT NULL,
      title            VARCHAR(255)  NOT NULL,
      description      TEXT          NOT NULL,
      category         VARCHAR(50)   NOT NULL,
      resolution       TEXT,
      priority         VARCHAR(20)   NOT NULL,
      status           VARCHAR(20)   DEFAULT 'open',
      vector_id        VARCHAR(100),
      embedded_at      TIMESTAMPTZ,
      source_file      VARCHAR(255),
      blob_version_id  VARCHAR(255),
      document_version VARCHAR(20)   DEFAULT 'v1',
      created_at       TIMESTAMPTZ   DEFAULT NOW()
    )
  `);

  // Add columns if table already exists (safe for existing deployments)
  await pool.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS source_file      VARCHAR(255)`);
  await pool.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS blob_version_id  VARCHAR(255)`);
  await pool.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS document_version VARCHAR(20) DEFAULT 'v1'`);
}

export async function insertTicket(ticket: {
  ticket_id: string;
  title: string;
  description: string;
  category: string;
  resolution: string;
  priority: string;
  source_file?: string;
  blob_version_id?: string;
  document_version?: string;
}): Promise<number> {
  const pool = getPool();
  const result = await pool.query(
    `INSERT INTO tickets (ticket_id, title, description, category, resolution, priority, source_file, blob_version_id, document_version)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (ticket_id) DO UPDATE SET
       title            = EXCLUDED.title,
       description      = EXCLUDED.description,
       category         = EXCLUDED.category,
       resolution       = EXCLUDED.resolution,
       priority         = EXCLUDED.priority,
       source_file      = EXCLUDED.source_file,
       blob_version_id  = EXCLUDED.blob_version_id,
       document_version = EXCLUDED.document_version
     RETURNING id`,
    [
      ticket.ticket_id, ticket.title, ticket.description,
      ticket.category, ticket.resolution, ticket.priority,
      ticket.source_file ?? null, ticket.blob_version_id ?? null,
      ticket.document_version ?? 'v1',
    ]
  );
  return result.rows[0].id;
}

export async function markEmbedded(ticketId: string, vectorId: string): Promise<void> {
  const pool = getPool();
  await pool.query(
    `UPDATE tickets SET vector_id = $1, embedded_at = NOW() WHERE ticket_id = $2`,
    [vectorId, ticketId]
  );
}

export async function getTickets(filters?: {
  category?: string;
  priority?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<{ rows: Record<string, unknown>[]; total: number }> {
  const pool = getPool();
  const conditions: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (filters?.category) { conditions.push(`category = $${idx++}`); values.push(filters.category); }
  if (filters?.priority) { conditions.push(`priority = $${idx++}`); values.push(filters.priority); }
  if (filters?.status)   { conditions.push(`status = $${idx++}`);   values.push(filters.status); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit  = filters?.limit  ?? 50;
  const offset = filters?.offset ?? 0;

  const [rows, count] = await Promise.all([
    pool.query(`SELECT * FROM tickets ${where} ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`,
      [...values, limit, offset]),
    pool.query(`SELECT COUNT(*) FROM tickets ${where}`, values),
  ]);

  return { rows: rows.rows, total: Number(count.rows[0].count) };
}

export async function getTicketById(ticketId: string): Promise<Record<string, unknown> | null> {
  const pool = getPool();
  const result = await pool.query(`SELECT * FROM tickets WHERE ticket_id = $1`, [ticketId]);
  return result.rows[0] ?? null;
}
