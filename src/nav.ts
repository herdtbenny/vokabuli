import type { StudyMode } from './types'

export type View =
  | { name: 'home' }
  | { name: 'deck'; deckId: string }
  | { name: 'study'; deckId: string; mode: StudyMode; quick?: boolean }
  | { name: 'create' }
  | { name: 'stats' }
  | { name: 'achievements' }
  | { name: 'settings' }

export interface ToastItem {
  id: number
  emoji: string
  title: string
  subtitle?: string
}

export const AVATAR_EMOJIS = ['😎', '🦊', '🐼', '🦁', '🐸', '🦄', '🐙', '🦉', '🐵', '🦖', '👩', '👨', '🧑', '👧', '🧔', '👱‍♀️']
export const PROFILE_COLORS = ['#6d5efc', '#ef4444', '#22c55e', '#f97316', '#eab308', '#06b6d4', '#ec4899', '#8b5cf6']
export const DECK_EMOJIS = ['📘', '⚖️', '💼', '🛒', '⚽', '💰', '🍽️', '✈️', '🎬', '🎵', '🧪', '💻']
