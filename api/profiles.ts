// GET /api/profiles – alle Profile für "Wer bist du?"
// POST /api/profiles – neues Profil anlegen ({ name, color })
import { db, isAuthed, json, unauthorized } from './_lib/session'

const COLORS = ['#2456d6', '#e5484d', '#2f9e44', '#d9480f', '#b7791f', '#0b8aa8', '#475569', '#c2255c']

export async function GET(request: Request): Promise<Response> {
  if (!(await isAuthed(request))) return unauthorized()
  const sql = db()
  const rows = await sql`
    select user_id as id, data->'profile'->>'name' as name, data->'profile'->>'color' as color
    from user_state
    order by lower(data->'profile'->>'name')`
  return json({ profiles: rows })
}

export async function POST(request: Request): Promise<Response> {
  if (!(await isAuthed(request))) return unauthorized()

  let name = ''
  let color = COLORS[0]
  try {
    const body = (await request.json()) as { name?: unknown; color?: unknown }
    name = typeof body.name === 'string' ? body.name.trim().slice(0, 24) : ''
    if (typeof body.color === 'string' && COLORS.includes(body.color)) color = body.color
  } catch {
    return json({ error: 'Ungültige Anfrage.' }, 400)
  }
  if (!name) return json({ error: 'Bitte einen Namen eingeben.' }, 400)

  const sql = db()
  const taken = await sql`select 1 from user_state where lower(data->'profile'->>'name') = lower(${name}) limit 1`
  if (taken.length) return json({ error: `„${name}“ gibt es schon – wähle das Profil aus der Liste.` }, 409)

  const id = 'p_' + crypto.randomUUID()
  const profile = {
    id,
    name,
    color,
    createdAt: Date.now(),
    streak: 0,
    longestStreak: 0,
    lastStudyDay: null,
    totalReviews: 0,
    progress: {},
    stats: { correct: 0, wrong: 0 },
  }
  const data = { profile, customDecks: [], settings: { sound: true }, deckEdits: {} }
  await sql`insert into user_state (user_id, data) values (${id}, ${JSON.stringify(data)}::jsonb)`
  return json({ profile: { id, name, color } }, 201)
}
