import type { Card } from './types'
import type { Settings } from './store'

// Generiert mit einem OpenAI-kompatiblen Endpunkt ein Vokabel-Deck zu einem Thema.
// Der API-Key liegt NUR lokal im Browser (localStorage) – nichts davon landet im Repo.

export interface GenerateOptions {
  topic: string
  count: number
  settings: Settings
}

const SYSTEM = `Du bist ein Englischlehrer, der deutschen Lernenden Vokabeln beibringt.
Gib ausschließlich gültiges JSON zurück – ein Array von Objekten mit den Feldern:
"en" (englisches Wort oder Phrase), "de" (deutsche Bedeutung),
"example" (kurzer englischer Beispielsatz), "exampleDe" (deutsche Übersetzung des Satzes),
"note" (optionaler kurzer Hinweis, z.B. "formell" oder "Kollokation", sonst weglassen).
Keine Nummerierung, kein Markdown, kein Text außerhalb des JSON.`

export async function generateDeck({ topic, count, settings }: GenerateOptions): Promise<Omit<Card, 'id'>[]> {
  if (!settings.aiKey) throw new Error('Kein API-Key hinterlegt. Bitte in den Einstellungen eintragen.')

  const url = settings.aiBaseUrl.replace(/\/$/, '') + '/chat/completions'
  const body = {
    model: settings.aiModel,
    temperature: 0.6,
    messages: [
      { role: 'system', content: SYSTEM },
      {
        role: 'user',
        content: `Erstelle ${count} nützliche englische Vokabeln zum Thema "${topic}". Mische Einzelwörter und typische Phrasen.`,
      },
    ],
  }

  let res: Response
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${settings.aiKey}` },
      body: JSON.stringify(body),
    })
  } catch (e) {
    throw new Error(
      'Verbindung fehlgeschlagen. Manche Anbieter blockieren Anfragen direkt aus dem Browser (CORS). ' +
        'Prüfe die Basis-URL oder nutze einen CORS-fähigen Anbieter.',
    )
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`API-Fehler ${res.status}: ${text.slice(0, 200)}`)
  }

  const data = await res.json()
  const content: string = data?.choices?.[0]?.message?.content ?? ''
  const cards = parseCards(content)
  if (!cards.length) throw new Error('Die KI hat keine verwertbaren Vokabeln geliefert. Nochmal versuchen?')
  return cards
}

function parseCards(content: string): Omit<Card, 'id'>[] {
  let txt = content.trim()
  // evtl. Code-Fences entfernen
  txt = txt.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim()
  // erstes JSON-Array herausschneiden
  const start = txt.indexOf('[')
  const end = txt.lastIndexOf(']')
  if (start !== -1 && end !== -1) txt = txt.slice(start, end + 1)
  let arr: any
  try {
    arr = JSON.parse(txt)
  } catch {
    return []
  }
  if (!Array.isArray(arr)) return []
  return arr
    .filter((x) => x && typeof x.en === 'string' && typeof x.de === 'string')
    .map((x) => ({
      en: String(x.en).trim(),
      de: String(x.de).trim(),
      example: x.example ? String(x.example).trim() : undefined,
      exampleDe: x.exampleDe ? String(x.exampleDe).trim() : undefined,
      note: x.note ? String(x.note).trim() : undefined,
    }))
}
