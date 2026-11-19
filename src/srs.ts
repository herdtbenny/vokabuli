import type { CardProgress, Rating } from './types'

const DAY = 24 * 60 * 60 * 1000

export function newProgress(): CardProgress {
  return {
    ease: 2.5,
    interval: 0,
    reps: 0,
    due: Date.now(),
    lapses: 0,
    seen: 0,
    learned: false,
  }
}

// Vereinfachtes SM-2: berechnet den nächsten Fortschritt aus einer Bewertung
export function review(prev: CardProgress | undefined, rating: Rating): CardProgress {
  const p: CardProgress = prev ? { ...prev } : newProgress()
  p.seen += 1

  if (rating === 'again') {
    p.reps = 0
    p.lapses += 1
    p.interval = 0
    p.ease = Math.max(1.3, p.ease - 0.2)
    p.due = Date.now() + 1 * 60 * 1000 // in 1 Minute nochmal
    return p
  }

  // korrekt beantwortet
  p.learned = true
  if (rating === 'hard') p.ease = Math.max(1.3, p.ease - 0.15)
  if (rating === 'easy') p.ease = p.ease + 0.15

  if (p.reps === 0) {
    p.interval = rating === 'easy' ? 3 : 1
  } else if (p.reps === 1) {
    p.interval = rating === 'hard' ? 3 : rating === 'easy' ? 8 : 6
  } else {
    const factor = rating === 'hard' ? 1.2 : p.ease
    p.interval = Math.round(p.interval * factor)
  }
  if (rating === 'easy') p.interval = Math.round(p.interval * 1.3)

  p.reps += 1
  p.due = Date.now() + p.interval * DAY
  return p
}

export function isDue(p: CardProgress | undefined): boolean {
  if (!p) return true
  return p.due <= Date.now()
}

// Status einer Karte für die Anzeige
export type CardState = 'new' | 'learning' | 'review' | 'mastered'

export function cardState(p: CardProgress | undefined): CardState {
  if (!p || p.seen === 0) return 'new'
  if (!p.learned || p.reps === 0) return 'learning'
  if (p.interval >= 21) return 'mastered'
  return 'review'
}
