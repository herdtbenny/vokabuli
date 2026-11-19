// Kern-Datentypen der App

export interface Card {
  id: string
  en: string // englisches Wort / Phrase
  de: string // deutsche Bedeutung
  example?: string // Beispielsatz (englisch)
  exampleDe?: string // Übersetzung des Beispielsatzes
  note?: string // kurzer Hinweis (z.B. "formell", "Kollokation")
}

export interface Deck {
  id: string
  title: string
  icon: string // Schlüssel aus CATEGORY_ICONS (src/icons.tsx)
  description: string
  categoryId: string
  cards: Card[]
  custom?: boolean // selbst erstellt?
}

export interface Category {
  id: string
  title: string
  icon: string
  color: string
}

// Lernfortschritt pro Karte (Spaced Repetition, SM-2 vereinfacht)
export interface CardProgress {
  ease: number // Leichtigkeitsfaktor
  interval: number // Tage bis zur nächsten Wiederholung
  reps: number // erfolgreiche Wiederholungen in Folge
  due: number // Zeitstempel (ms), wann wieder fällig
  lapses: number // wie oft vergessen
  seen: number // wie oft insgesamt gesehen
  learned: boolean // schon einmal "gekonnt"?
}

export interface Profile {
  id: string
  name: string
  color: string
  createdAt: number
  streak: number
  longestStreak: number
  lastStudyDay: string | null // "YYYY-MM-DD"
  totalReviews: number
  progress: Record<string, CardProgress> // cardId -> Fortschritt
  stats: { correct: number; wrong: number }
}

export type StudyMode = 'flip' | 'choice' | 'type' | 'listen'

export type Rating = 'again' | 'hard' | 'good' | 'easy'
