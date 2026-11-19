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
  emoji: string
  description: string
  categoryId: string
  cards: Card[]
  custom?: boolean // selbst erstellt?
}

export interface Category {
  id: string
  title: string
  emoji: string
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

export interface Achievement {
  id: string
  title: string
  description: string
  emoji: string
}

export interface Profile {
  id: string
  name: string
  emoji: string
  color: string
  createdAt: number
  // Fortschritt
  xp: number
  streak: number
  longestStreak: number
  lastStudyDay: string | null // "YYYY-MM-DD"
  dailyGoal: number
  cardsStudiedToday: number
  todayKey: string | null
  totalReviews: number
  progress: Record<string, CardProgress> // cardId -> Fortschritt
  unlockedAchievements: string[]
  stats: { correct: number; wrong: number }
}

export type StudyMode = 'flip' | 'choice' | 'type' | 'listen'

export type Rating = 'again' | 'hard' | 'good' | 'easy'
