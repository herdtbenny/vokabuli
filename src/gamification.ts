import type { Achievement, Profile } from './types'

// ---- Level / XP ----
// Benötigte Gesamt-XP bis Level n (quadratisch wachsend)
export function xpForLevel(level: number): number {
  return Math.round(50 * level * level + 50 * level)
}

export function levelFromXp(xp: number): number {
  let level = 1
  while (xp >= xpForLevel(level)) level++
  return level
}

export function levelProgress(xp: number): { level: number; current: number; needed: number; pct: number } {
  const level = levelFromXp(xp)
  const base = level === 1 ? 0 : xpForLevel(level - 1)
  const next = xpForLevel(level)
  const current = xp - base
  const needed = next - base
  return { level, current, needed, pct: Math.min(100, Math.round((current / needed) * 100)) }
}

export const LEVEL_TITLES = [
  'Anfänger', 'Lernende*r', 'Wortsammler*in', 'Vokabel-Profi', 'Sprachtalent',
  'Wortakrobat*in', 'Vokabel-Meister*in', 'Sprach-Guru', 'Legende',
]

export function levelTitle(level: number): string {
  return LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)]
}

// ---- Achievements ----
export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-card', emoji: '🌱', title: 'Erster Schritt', description: 'Lerne deine erste Karte.' },
  { id: 'cards-50', emoji: '📚', title: 'Fleißig', description: '50 Wiederholungen gesammelt.' },
  { id: 'cards-250', emoji: '🧠', title: 'Vokabel-Hirn', description: '250 Wiederholungen gesammelt.' },
  { id: 'cards-1000', emoji: '🏆', title: 'Dauerläufer', description: '1000 Wiederholungen gesammelt.' },
  { id: 'streak-3', emoji: '🔥', title: 'Warmgelaufen', description: '3 Tage Serie.' },
  { id: 'streak-7', emoji: '⚡', title: 'Woche durch', description: '7 Tage Serie.' },
  { id: 'streak-30', emoji: '💎', title: 'Eiserne Disziplin', description: '30 Tage Serie.' },
  { id: 'goal', emoji: '🎯', title: 'Ziel erreicht', description: 'Erreiche dein Tagesziel.' },
  { id: 'level-5', emoji: '⭐', title: 'Aufsteiger', description: 'Erreiche Level 5.' },
  { id: 'master-25', emoji: '👑', title: 'Gemeistert', description: '25 Karten komplett gemeistert.' },
  { id: 'perfect-10', emoji: '✨', title: 'Makellos', description: '10 richtige Antworten in Folge.' },
  { id: 'own-deck', emoji: '🛠️', title: 'Selbstgemacht', description: 'Erstelle eine eigene Kategorie.' },
]

export function getAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id)
}

// Prüft, welche Achievements neu freigeschaltet wurden
export function checkAchievements(
  p: Profile,
  extra: { masteredCount: number; perfectStreak: number; reachedGoal: boolean; createdDeck: boolean },
): string[] {
  const unlocked = new Set(p.unlockedAchievements)
  const newly: string[] = []
  const tryUnlock = (id: string, cond: boolean) => {
    if (cond && !unlocked.has(id)) {
      unlocked.add(id)
      newly.push(id)
    }
  }
  tryUnlock('first-card', p.totalReviews >= 1)
  tryUnlock('cards-50', p.totalReviews >= 50)
  tryUnlock('cards-250', p.totalReviews >= 250)
  tryUnlock('cards-1000', p.totalReviews >= 1000)
  tryUnlock('streak-3', p.streak >= 3)
  tryUnlock('streak-7', p.streak >= 7)
  tryUnlock('streak-30', p.streak >= 30)
  tryUnlock('goal', extra.reachedGoal)
  tryUnlock('level-5', levelFromXp(p.xp) >= 5)
  tryUnlock('master-25', extra.masteredCount >= 25)
  tryUnlock('perfect-10', extra.perfectStreak >= 10)
  tryUnlock('own-deck', extra.createdDeck)
  return newly
}
