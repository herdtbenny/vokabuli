import type { Card } from '../types'

// Kompaktes Format: [englisch, deutsch, Beispielsatz, Übersetzung des Beispiels, Hinweis?]
export type RawCard = [string, string, string, string, string?]

function slug(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Wandelt Rohdaten in Karten mit stabilen IDs um (abgeleitet vom englischen Begriff,
// nicht von der Position – so bleibt der Lernfortschritt erhalten, wenn Karten dazukommen).
export function toCards(deckId: string, raw: RawCard[]): Card[] {
  const seen = new Set<string>()
  const cards: Card[] = []
  for (const [en, de, example, exampleDe, note] of raw) {
    const id = `${deckId}-${slug(en)}`
    if (seen.has(id)) continue
    seen.add(id)
    cards.push({ id, en, de, example, exampleDe, ...(note ? { note } : {}) })
  }
  return cards
}
