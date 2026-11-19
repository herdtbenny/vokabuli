// GET /api/state?profile=ID – Lernstand eines Profils lesen
// PUT /api/state?profile=ID – Lernstand speichern
// Zugang nur mit gültigem Geräte-Cookie (Familien-Passwort), wie bei Foodie.
import { db, isAuthed, json, unauthorized } from './_lib/session'

const MAX_BYTES = 2_000_000 // ein Lernstand mit allen ~2.500 Karten liegt weit darunter

function profileId(request: Request): string | null {
  const id = new URL(request.url).searchParams.get('profile') ?? ''
  return /^[A-Za-z0-9_-]{3,80}$/.test(id) ? id : null
}

export async function GET(request: Request): Promise<Response> {
  if (!(await isAuthed(request))) return unauthorized()
  const id = profileId(request)
  if (!id) return json({ error: 'Profil fehlt.' }, 400)

  const sql = db()
  const rows = await sql`select data, updated_at from user_state where user_id = ${id}`
  if (rows.length === 0) return json({ error: 'Profil nicht gefunden.' }, 404)
  return json({ data: rows[0].data, updatedAt: rows[0].updated_at })
}

export async function PUT(request: Request): Promise<Response> {
  if (!(await isAuthed(request))) return unauthorized()
  const id = profileId(request)
  if (!id) return json({ error: 'Profil fehlt.' }, 400)

  const text = await request.text()
  if (text.length > MAX_BYTES) return json({ error: 'Lernstand zu groß.' }, 413)

  let body: { data?: unknown }
  try {
    body = JSON.parse(text)
  } catch {
    return json({ error: 'Ungültiges JSON.' }, 400)
  }
  const data = body.data as { profile?: unknown } | undefined
  if (!data || typeof data !== 'object' || typeof data.profile !== 'object') {
    return json({ error: 'Lernstand fehlt oder ist unvollständig.' }, 400)
  }

  const sql = db()
  // Nur bestehende Profile aktualisieren – neue entstehen ausschließlich über /api/profiles
  const rows = await sql`
    update user_state set data = ${JSON.stringify(data)}::jsonb, updated_at = now()
    where user_id = ${id}
    returning updated_at`
  if (rows.length === 0) return json({ error: 'Profil nicht gefunden.' }, 404)
  return json({ ok: true, updatedAt: rows[0].updated_at })
}
