import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Card, Deck, Profile, Rating } from './types'
import { decks as builtinDecks } from './data/decks'
import { review as srsReview, cardState } from './srs'
import { checkAchievements, levelFromXp } from './gamification'
import { setSoundEnabled } from './sound'

export interface Settings {
  sound: boolean
  aiKey: string
  aiBaseUrl: string
  aiModel: string
}

interface PersistShape {
  profiles: Profile[]
  currentProfileId: string | null
  customDecks: Deck[]
  settings: Settings
}

const KEY = 'wortschatz:v1'

const defaultSettings: Settings = {
  sound: true,
  aiKey: '',
  aiBaseUrl: 'https://api.openai.com/v1',
  aiModel: 'gpt-4o-mini',
}

function load(): PersistShape {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as PersistShape
      return {
        profiles: parsed.profiles ?? [],
        currentProfileId: parsed.currentProfileId ?? null,
        customDecks: parsed.customDecks ?? [],
        settings: { ...defaultSettings, ...(parsed.settings ?? {}) },
      }
    }
  } catch (e) {
    console.warn('Konnte Daten nicht laden:', e)
  }
  return { profiles: [], currentProfileId: null, customDecks: [], settings: defaultSettings }
}

function save(state: PersistShape) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch (e) {
    console.warn('Konnte Daten nicht speichern:', e)
  }
}

function todayStr(d = new Date()): string {
  return d.toISOString().slice(0, 10)
}
function yesterdayStr(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return todayStr(d)
}

const uid = () => Math.random().toString(36).slice(2, 10)

const XP_BY_RATING: Record<Rating, number> = { again: 2, hard: 6, good: 10, easy: 14 }

export interface AnswerResult {
  levelUp: boolean
  fromLevel: number
  toLevel: number
  newAchievements: string[]
  reachedGoal: boolean
}

interface StoreValue {
  profiles: Profile[]
  currentProfile: Profile | null
  customDecks: Deck[]
  allDecks: Deck[]
  settings: Settings
  createProfile: (name: string, emoji: string, color: string) => void
  selectProfile: (id: string) => void
  logout: () => void
  deleteProfile: (id: string) => void
  updateProfile: (patch: Partial<Profile>) => void
  recordAnswer: (cardId: string, rating: Rating, perfectStreak: number) => AnswerResult
  createDeck: (title: string, emoji: string, description: string, categoryId: string, cards: Omit<Card, 'id'>[]) => string
  addCardToDeck: (deckId: string, card: Omit<Card, 'id'>) => void
  deleteDeck: (deckId: string) => void
  updateSettings: (patch: Partial<Settings>) => void
}

const Ctx = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistShape>(() => load())

  useEffect(() => {
    save(state)
  }, [state])

  useEffect(() => {
    setSoundEnabled(state.settings.sound)
  }, [state.settings.sound])

  const currentProfile = useMemo(
    () => state.profiles.find((p) => p.id === state.currentProfileId) ?? null,
    [state.profiles, state.currentProfileId],
  )

  const allDecks = useMemo(() => [...builtinDecks, ...state.customDecks], [state.customDecks])

  function patchCurrent(fn: (p: Profile) => Profile) {
    setState((s) => {
      if (!s.currentProfileId) return s
      return { ...s, profiles: s.profiles.map((p) => (p.id === s.currentProfileId ? fn(p) : p)) }
    })
  }

  const value: StoreValue = {
    profiles: state.profiles,
    currentProfile,
    customDecks: state.customDecks,
    allDecks,
    settings: state.settings,

    createProfile(name, emoji, color) {
      const p: Profile = {
        id: uid(),
        name: name.trim() || 'Neu',
        emoji,
        color,
        createdAt: Date.now(),
        xp: 0,
        streak: 0,
        longestStreak: 0,
        lastStudyDay: null,
        dailyGoal: 15,
        cardsStudiedToday: 0,
        todayKey: null,
        totalReviews: 0,
        progress: {},
        unlockedAchievements: [],
        stats: { correct: 0, wrong: 0 },
      }
      setState((s) => ({ ...s, profiles: [...s.profiles, p], currentProfileId: p.id }))
    },

    selectProfile(id) {
      setState((s) => ({ ...s, currentProfileId: id }))
    },

    logout() {
      setState((s) => ({ ...s, currentProfileId: null }))
    },

    deleteProfile(id) {
      setState((s) => ({
        ...s,
        profiles: s.profiles.filter((p) => p.id !== id),
        currentProfileId: s.currentProfileId === id ? null : s.currentProfileId,
      }))
    },

    updateProfile(patch) {
      patchCurrent((p) => ({ ...p, ...patch }))
    },

    recordAnswer(cardId, rating, perfectStreak) {
      let result: AnswerResult = {
        levelUp: false,
        fromLevel: 1,
        toLevel: 1,
        newAchievements: [],
        reachedGoal: false,
      }
      setState((s) => {
        if (!s.currentProfileId) return s
        const profiles = s.profiles.map((p) => {
          if (p.id !== s.currentProfileId) return p
          const next: Profile = { ...p, progress: { ...p.progress }, stats: { ...p.stats } }
          const today = todayStr()

          // Tag / Streak
          let cardsToday = next.cardsStudiedToday
          if (next.lastStudyDay !== today) {
            if (next.lastStudyDay === yesterdayStr()) next.streak += 1
            else next.streak = 1
            cardsToday = 0
            next.lastStudyDay = today
            next.todayKey = today
          }
          next.longestStreak = Math.max(next.longestStreak, next.streak)

          // SRS-Fortschritt
          next.progress[cardId] = srsReview(next.progress[cardId], rating)

          // Statistik / XP
          const correct = rating !== 'again'
          if (correct) next.stats.correct += 1
          else next.stats.wrong += 1
          next.totalReviews += 1
          next.cardsStudiedToday = cardsToday + 1

          const fromLevel = levelFromXp(next.xp)
          next.xp += XP_BY_RATING[rating]
          const toLevel = levelFromXp(next.xp)

          const reachedGoal =
            next.cardsStudiedToday >= next.dailyGoal &&
            next.cardsStudiedToday - 1 < next.dailyGoal // genau beim Erreichen
          const masteredCount = Object.values(next.progress).filter((pr) => cardState(pr) === 'mastered').length
          const createdDeck = s.customDecks.length > 0
          const newly = checkAchievements(next, {
            masteredCount,
            perfectStreak,
            reachedGoal: next.cardsStudiedToday >= next.dailyGoal,
            createdDeck,
          })
          next.unlockedAchievements = [...next.unlockedAchievements, ...newly]

          result = {
            levelUp: toLevel > fromLevel,
            fromLevel,
            toLevel,
            newAchievements: newly,
            reachedGoal,
          }
          return next
        })
        return { ...s, profiles }
      })
      return result
    },

    createDeck(title, emoji, description, categoryId, cards) {
      const id = 'custom-' + uid()
      const deck: Deck = {
        id,
        title: title.trim() || 'Mein Deck',
        emoji: emoji || '📘',
        description: description.trim(),
        categoryId,
        custom: true,
        cards: cards.map((c, i) => ({ ...c, id: `${id}-${i + 1}` })),
      }
      setState((s) => ({ ...s, customDecks: [...s.customDecks, deck] }))
      return id
    },

    addCardToDeck(deckId, card) {
      setState((s) => ({
        ...s,
        customDecks: s.customDecks.map((d) =>
          d.id === deckId
            ? { ...d, cards: [...d.cards, { ...card, id: `${deckId}-${Date.now()}` }] }
            : d,
        ),
      }))
    },

    deleteDeck(deckId) {
      setState((s) => ({ ...s, customDecks: s.customDecks.filter((d) => d.id !== deckId) }))
    },

    updateSettings(patch) {
      setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }))
    },
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore(): StoreValue {
  const v = useContext(Ctx)
  if (!v) throw new Error('useStore muss innerhalb von StoreProvider verwendet werden')
  return v
}
