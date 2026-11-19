// POST /api/login – Familien-Passwort prüfen und das Gerät 30 Tage lang merken.
import { AUTH_MAX_AGE, authCookie, json, passwordMatches, signAuth } from './_lib/session'

export async function POST(request: Request): Promise<Response> {
  let password = ''
  try {
    const body = (await request.json()) as { password?: unknown }
    password = typeof body.password === 'string' ? body.password : ''
  } catch {
    return json({ error: 'Ungültige Anfrage.' }, 400)
  }

  if (!process.env.APP_PASSWORD) return json({ error: 'Auf dem Server ist noch kein Passwort eingerichtet.' }, 500)
  if (!(await passwordMatches(password))) return json({ error: 'Das Passwort stimmt nicht.' }, 401)

  return json({ ok: true }, 200, { 'set-cookie': authCookie(await signAuth(), AUTH_MAX_AGE) })
}
