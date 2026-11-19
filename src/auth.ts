// Kleine Client-Helfer für das Login nach Foodie-Vorbild:
// 1) Familien-Passwort einmal pro Gerät  2) "Wer bist du?" (Profil wird auf dem Gerät gemerkt)

export interface ProfileSummary {
  id: string
  name: string
  color: string
}

const PROFILE_KEY = 'vokabuli:profile'

export function rememberedProfile(): ProfileSummary | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    return raw ? (JSON.parse(raw) as ProfileSummary) : null
  } catch {
    return null
  }
}

export function rememberProfile(p: ProfileSummary | null) {
  try {
    if (p) localStorage.setItem(PROFILE_KEY, JSON.stringify(p))
    else localStorage.removeItem(PROFILE_KEY)
  } catch {
    /* ohne Speicher wird beim nächsten Öffnen einfach wieder gefragt */
  }
}

async function readError(res: Response, fallback: string): Promise<string> {
  try {
    const body = (await res.json()) as { error?: string }
    return body.error ?? fallback
  } catch {
    return fallback
  }
}

/** null = Server nicht erreichbar */
export async function checkSession(): Promise<boolean | null> {
  try {
    const res = await fetch('/api/session')
    if (!res.ok) return null
    return ((await res.json()) as { authed: boolean }).authed
  } catch {
    return null
  }
}

export async function login(password: string): Promise<string | null> {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ password }),
  })
  return res.ok ? null : readError(res, 'Anmelden hat nicht geklappt.')
}

export async function logoutDevice(): Promise<void> {
  await fetch('/api/session', { method: 'DELETE' }).catch(() => {})
}

export async function listProfiles(): Promise<ProfileSummary[]> {
  const res = await fetch('/api/profiles')
  if (!res.ok) throw new Error(await readError(res, 'Profile konnten nicht geladen werden.'))
  return ((await res.json()) as { profiles: ProfileSummary[] }).profiles
}

export async function createProfile(name: string, color: string): Promise<ProfileSummary> {
  const res = await fetch('/api/profiles', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name, color }),
  })
  if (!res.ok) throw new Error(await readError(res, 'Profil konnte nicht angelegt werden.'))
  return ((await res.json()) as { profile: ProfileSummary }).profile
}
