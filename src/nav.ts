import type { StudyMode } from './types'

export type View =
  | { name: 'home' }
  | { name: 'deck'; deckId: string }
  | { name: 'study'; deckId: string; modes: StudyMode[]; quick?: boolean }
  | { name: 'create' }
  | { name: 'stats' }

// Avatar = Anfangsbuchstabe des Namens auf farbigem Grund
export function initial(name: string): string {
  const t = name.trim()
  return (t ? t[0] : '?').toUpperCase()
}

export const PROFILE_COLORS = ['#6d5efc', '#ef4444', '#22c55e', '#f97316', '#eab308', '#06b6d4', '#ec4899', '#8b5cf6']
