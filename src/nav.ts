import type { StudyMode } from './types'

export type View =
  | { name: 'home' }
  | { name: 'deck'; deckId: string }
  | { name: 'study'; deckId: string; modes: StudyMode[]; quick?: boolean }
  | { name: 'create' }

// Avatar = Anfangsbuchstabe des Namens auf farbigem Grund
export function initial(name: string): string {
  const t = name.trim()
  return (t ? t[0] : '?').toUpperCase()
}

export const PROFILE_COLORS = ['#2456d6', '#e5484d', '#2f9e44', '#d9480f', '#b7791f', '#0b8aa8', '#475569', '#c2255c']
