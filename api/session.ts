// GET /api/session – kennt dieses Gerät das Passwort schon?
// DELETE /api/session – Gerät abmelden (Passwort wird beim nächsten Mal wieder abgefragt).
import { authCookie, isAuthed, json } from './_lib/session'

export async function GET(request: Request): Promise<Response> {
  return json({ authed: await isAuthed(request) })
}

export async function DELETE(): Promise<Response> {
  return json({ ok: true }, 200, { 'set-cookie': authCookie('', 0) })
}
