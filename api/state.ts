// Vercel Function: Lernstand des angemeldeten Clerk-Benutzers lesen (GET) und speichern (PUT).
// Zugangsdaten kommen aus den per Marketplace gesetzten Umgebungsvariablen
// (DATABASE_URL von Neon, CLERK_SECRET_KEY von Clerk) – nichts davon steht im Code.
import { neon } from '@neondatabase/serverless'
import { verifyToken } from '@clerk/backend'

const MAX_BYTES = 2_000_000 // ein Lernstand mit allen ~2.500 Karten liegt weit darunter

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  })
}

// Prüft das Clerk-Session-Token aus dem Authorization-Header und liefert die User-ID.
async function userIdFrom(request: Request): Promise<string | null> {
  const header = request.headers.get('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) return null
  try {
    const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY })
    return typeof payload.sub === 'string' ? payload.sub : null
  } catch {
    return null
  }
}

function db() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL ist nicht gesetzt')
  return neon(url)
}

export async function GET(request: Request): Promise<Response> {
  const userId = await userIdFrom(request)
  if (!userId) return json({ error: 'Nicht angemeldet' }, 401)

  const sql = db()
  const rows = await sql`select data, updated_at from user_state where user_id = ${userId}`
  if (rows.length === 0) return json({ data: null })
  return json({ data: rows[0].data, updatedAt: rows[0].updated_at })
}

export async function PUT(request: Request): Promise<Response> {
  const userId = await userIdFrom(request)
  if (!userId) return json({ error: 'Nicht angemeldet' }, 401)

  const text = await request.text()
  if (text.length > MAX_BYTES) return json({ error: 'Lernstand zu groß' }, 413)

  let body: { data?: unknown }
  try {
    body = JSON.parse(text)
  } catch {
    return json({ error: 'Ungültiges JSON' }, 400)
  }
  const data = body.data as { profile?: unknown } | undefined
  if (!data || typeof data !== 'object' || typeof data.profile !== 'object') {
    return json({ error: 'Lernstand fehlt oder ist unvollständig' }, 400)
  }

  const sql = db()
  const rows = await sql`
    insert into user_state (user_id, data, updated_at)
    values (${userId}, ${JSON.stringify(data)}::jsonb, now())
    on conflict (user_id) do update set data = excluded.data, updated_at = now()
    returning updated_at`
  return json({ ok: true, updatedAt: rows[0].updated_at })
}
