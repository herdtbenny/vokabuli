// Gemeinsame Bausteine für die API (Dateien mit "_" werden von Vercel nicht als Route veröffentlicht).
// Login wie bei Foodie: ein Familien-Passwort pro Gerät, danach ein signiertes Cookie mit Ablaufdatum.
// Nur Web Crypto – keine zusätzlichen Pakete.
import { neon } from '@neondatabase/serverless'

export const AUTH_COOKIE = 'vokabuli_auth'
export const AUTH_MAX_AGE = 60 * 60 * 24 * 30 // 30 Tage, danach wird wieder nach dem Passwort gefragt
const AUTH_VALUE = 'vokabuli-ok-v1'
const encoder = new TextEncoder()

function getKey() {
  const secret = process.env.SESSION_SECRET
  if (!secret) throw new Error('SESSION_SECRET ist nicht gesetzt')
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ])
}

function toBase64Url(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(atob(value.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0))
}

/** Cookie-Wert: "<Ablauf in ms>.<Signatur>" – das Ablaufdatum ist mitsigniert */
export async function signAuth(): Promise<string> {
  const expires = Date.now() + AUTH_MAX_AGE * 1000
  const signature = await crypto.subtle.sign('HMAC', await getKey(), encoder.encode(`${AUTH_VALUE}:${expires}`))
  return `${expires}.${toBase64Url(signature)}`
}

async function verifyAuth(value: string | undefined): Promise<boolean> {
  if (!value) return false
  const [rawExpires, signature] = value.split('.')
  const expires = Number(rawExpires)
  if (!signature || !Number.isFinite(expires) || expires < Date.now()) return false
  try {
    return await crypto.subtle.verify(
      'HMAC',
      await getKey(),
      fromBase64Url(signature),
      encoder.encode(`${AUTH_VALUE}:${expires}`),
    )
  } catch {
    return false
  }
}

function readCookie(request: Request, name: string): string | undefined {
  const header = request.headers.get('cookie') ?? ''
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=')
    if (k === name) return decodeURIComponent(v.join('='))
  }
  return undefined
}

export function isAuthed(request: Request): Promise<boolean> {
  return verifyAuth(readCookie(request, AUTH_COOKIE))
}

/** Vergleich in konstanter Zeit, damit die Passwortlänge/-ähnlichkeit nicht über die Antwortzeit verraten wird */
export async function passwordMatches(input: string): Promise<boolean> {
  const expected = process.env.APP_PASSWORD
  if (!expected) return false
  const [a, b] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(input)),
    crypto.subtle.digest('SHA-256', encoder.encode(expected)),
  ])
  const x = new Uint8Array(a)
  const y = new Uint8Array(b)
  let diff = 0
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i]
  return diff === 0
}

export function authCookie(value: string, maxAge: number): string {
  const secure = process.env.VERCEL_ENV === 'production' || process.env.VERCEL_ENV === 'preview' ? '; Secure' : ''
  return `${AUTH_COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`
}

export function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...headers },
  })
}

export function unauthorized(): Response {
  return json({ error: 'Bitte zuerst das Familien-Passwort eingeben.' }, 401)
}

export function db() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL ist nicht gesetzt')
  return neon(url)
}
