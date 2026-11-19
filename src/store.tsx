import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Card, Deck, Profile, Rating } from './types'
import { decks as builtinDecks } from './data/decks'
import { review as srsReview } from './srs'
import { setSoundEnabled } from './sound'
import { CATEGORY_ICONS, DEFAULT_ICON } from './icons'
import { PROFILE_COLORS } from './nav'

export interface Settings {
  sound: boolean
}

// Alles, was zu einem Konto gehört – genau dieses Dokument liegt in der Datenbank.
export interface UserDoc {
  profile: Profile
  customDecks: Deck[]
  settings: Settings
  // Persönliche Änderungen an eingebauten Kategorien (die Grunddaten bleiben für alle gleich)
  deckEdits?: Record<string, DeckEdit>
}

export interface DeckEdit {
  added: Card[] // selbst hinzugefügte Karten
  removed: string[] // IDs ausgeblendeter eingebauter Karten
}

export type SyncStatus = 'loading' | 'synced' | 'saving' | 'offline'

const defaultSettings: Settings = { sound: true }
const LEGACY_KEY = 'wortschatz:v1' // lokale Profile aus der Zeit vor den Konten
const LEGACY_MIGRATED_KEY = 'wortschatz:v1:migrated'
const SAVE_DELAY_MS = 1500

const cacheKey = (userId: string) => `vokabuli:user:${userId}`

// ---------- Hilfsfunktionen ----------

function todayStr(d = new Date()): string {
  return d.toISOString().slice(0, 10)
}
function yesterdayStr(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return todayStr(d)
}
const uid = () => Math.random().toString(36).slice(2, 10)

function colorFor(userId: string): string {
  let h = 0
  for (const ch of userId) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return PROFILE_COLORS[h % PROFILE_COLORS.length]
}

function freshProfile(userId: string, name: string): Profile {
  return {
    id: userId,
    name,
    color: colorFor(userId),
    createdAt: Date.now(),
    streak: 0,
    longestStreak: 0,
    lastStudyDay: null,
    totalReviews: 0,
    progress: {},
    stats: { correct: 0, wrong: 0 },
  }
}

function migrateDeck(d: Deck): Deck {
  return { ...d, icon: d.icon && CATEGORY_ICONS[d.icon] ? d.icon : DEFAULT_ICON }
}

// Bringt ein (evtl. älteres) Dokument in die aktuelle Form.
function normalize(doc: UserDoc, userId: string, name: string): UserDoc {
  const p = doc.profile
  return {
    profile: {
      ...freshProfile(userId, name),
      ...p,
      id: userId,
      name: name || p.name,
      color: PROFILE_COLORS.includes(p.color) ? p.color : colorFor(userId),
      progress: p.progress ?? {},
      stats: p.stats ?? { correct: 0, wrong: 0 },
    },
    customDecks: (doc.customDecks ?? []).map(migrateDeck),
    settings: { ...defaultSettings, ...(doc.settings ?? {}) },
    deckEdits: doc.deckEdits ?? {},
  }
}

// Eingebaute Kategorie + persönliche Änderungen = was dieses Konto sieht
function applyEdit(deck: Deck, edit: DeckEdit | undefined): Deck {
  if (!edit || (!edit.added.length && !edit.removed.length)) return deck
  const removed = new Set(edit.removed)
  return { ...deck, cards: [...deck.cards.filter((c) => !removed.has(c.id)), ...edit.added] }
}

interface Cache {
  doc: UserDoc
  dirty: boolean // lokale Änderungen, die noch nicht in der Datenbank sind
}

function readCache(userId: string): Cache | null {
  try {
    const raw = localStorage.getItem(cacheKey(userId))
    return raw ? (JSON.parse(raw) as Cache) : null
  } catch {
    return null
  }
}

function writeCache(userId: string, cache: Cache) {
  try {
    localStorage.setItem(cacheKey(userId), JSON.stringify(cache))
  } catch {
    /* Speicher voll oder gesperrt – Datenbank bleibt die Quelle */
  }
}

// Übernimmt beim ersten Login den Fortschritt eines alten lokalen Profils (gleicher Name bevorzugt).
function takeLegacyProfile(name: string): UserDoc | null {
  try {
    const raw = localStorage.getItem(LEGACY_KEY)
    if (!raw) return null
    const legacy = JSON.parse(raw) as {
      profiles?: Profile[]
      currentProfileId?: string | null
      customDecks?: Deck[]
      settings?: Settings
    }
    const migrated: string[] = JSON.parse(localStorage.getItem(LEGACY_MIGRATED_KEY) ?? '[]')
    const open = (legacy.profiles ?? []).filter((p) => !migrated.includes(p.id))
    if (!open.length) return null
    const byName = open.find((p) => p.name.trim().toLowerCase() === name.trim().toLowerCase())
    const chosen = byName ?? open.find((p) => p.id === legacy.currentProfileId) ?? open[0]
    localStorage.setItem(LEGACY_MIGRATED_KEY, JSON.stringify([...migrated, chosen.id]))
    return {
      profile: chosen,
      customDecks: legacy.customDecks ?? [],
      settings: { ...defaultSettings, ...(legacy.settings ?? {}) },
    }
  } catch {
    return null
  }
}

// ---------- Kontext ----------

interface StoreValue {
  currentProfile: Profile
  customDecks: Deck[]
  allDecks: Deck[]
  settings: Settings
  syncStatus: SyncStatus
  updateProfile: (patch: Partial<Profile>) => void
  recordAnswer: (cardId: string, rating: Rating) => void
  createDeck: (title: string, icon: string, description: string, categoryId: string, cards: Omit<Card, 'id'>[]) => string
  addCard: (deckId: string, card: Omit<Card, 'id'>) => void
  removeCard: (deckId: string, cardId: string) => void
  removedCount: (deckId: string) => number
  restoreRemoved: (deckId: string) => void
  deleteDeck: (deckId: string) => void
  updateSettings: (patch: Partial<Settings>) => void
}

const Ctx = createContext<StoreValue | null>(null)

interface ProviderProps {
  userId: string // Profil-ID
  displayName: string
  /** Server sagt: Gerät nicht (mehr) angemeldet oder Profil existiert nicht mehr */
  onAccessLost: (reason: 'unauthorized' | 'missing') => void
  loading: ReactNode
  children: ReactNode
}

class HttpError extends Error {
  constructor(public status: number) {
    super(`HTTP ${status}`)
  }
}

const isEmpty = (d: UserDoc) => d.profile.totalReviews === 0 && Object.keys(d.profile.progress).length === 0

export function StoreProvider({ userId, displayName, onAccessLost, loading, children }: ProviderProps) {
  const [doc, setDoc] = useState<UserDoc | null>(() => {
    const cache = readCache(userId)
    return cache ? normalize(cache.doc, userId, displayName) : null
  })
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('loading')

  const loaded = useRef(false) // erst nach dem Abgleich mit der Datenbank speichern
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latest = useRef<UserDoc | null>(doc)
  latest.current = doc
  const url = `/api/state?profile=${encodeURIComponent(userId)}`

  // Das Geräte-Cookie (Familien-Passwort) wird vom Browser automatisch mitgeschickt.
  async function push(d: UserDoc, keepalive = false) {
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ data: d }),
      keepalive,
    })
    if (!res.ok) throw new HttpError(res.status)
    writeCache(userId, { doc: d, dirty: false })
  }

  function handleHttpError(e: unknown): boolean {
    if (e instanceof HttpError && (e.status === 401 || e.status === 404)) {
      onAccessLost(e.status === 401 ? 'unauthorized' : 'missing')
      return true
    }
    return false
  }

  // 1) Beim Start: Datenbank-Stand holen und mit dem Geräte-Cache abgleichen
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const cache = readCache(userId)
      try {
        const res = await fetch(url)
        if (!res.ok) throw new HttpError(res.status)
        const { data } = (await res.json()) as { data: UserDoc }
        if (cancelled) return

        let next = normalize(data, userId, displayName)
        let needsPush = false
        if (cache?.dirty) {
          next = normalize(cache.doc, userId, displayName) // ungespeicherte Änderungen dieses Geräts gewinnen
          needsPush = true
        } else if (isEmpty(next)) {
          // Neues Profil: Fortschritt aus der Zeit vor dem Login übernehmen (gleicher Name)
          const legacy = takeLegacyProfile(displayName)
          if (legacy) {
            next = normalize({ ...legacy, profile: { ...legacy.profile, color: next.profile.color } }, userId, displayName)
            needsPush = true
          }
        }
        setDoc(next)
        writeCache(userId, { doc: next, dirty: needsPush })
        loaded.current = true
        if (needsPush) {
          setSyncStatus('saving')
          await push(next)
        }
        if (!cancelled) setSyncStatus('synced')
      } catch (e) {
        if (cancelled || handleHttpError(e)) return
        // Offline / Server nicht erreichbar: mit dem Cache weiterlernen
        const next = cache?.doc
          ? normalize(cache.doc, userId, displayName)
          : normalize({ profile: freshProfile(userId, displayName), customDecks: [], settings: defaultSettings }, userId, displayName)
        setDoc(next)
        loaded.current = true
        setSyncStatus('offline')
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  // 2) Jede Änderung: sofort in den Cache, gebündelt in die Datenbank
  useEffect(() => {
    if (!doc || !loaded.current) return
    writeCache(userId, { doc, dirty: true })
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      setSyncStatus('saving')
      try {
        await push(doc)
        setSyncStatus('synced')
      } catch (e) {
        if (!handleHttpError(e)) setSyncStatus('offline')
      }
    }, SAVE_DELAY_MS)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc])

  // 3) App wird geschlossen/verlassen: ausstehende Änderungen sofort senden
  useEffect(() => {
    function flush() {
      if (document.visibilityState !== 'hidden' || !timer.current || !latest.current) return
      clearTimeout(timer.current)
      timer.current = null
      push(latest.current, true).catch(() => {})
    }
    document.addEventListener('visibilitychange', flush)
    return () => document.removeEventListener('visibilitychange', flush)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (doc) setSoundEnabled(doc.settings.sound)
  }, [doc?.settings.sound])

  const customDecks = doc?.customDecks
  const deckEdits = doc?.deckEdits
  const allDecks = useMemo(
    () => [...builtinDecks.map((d) => applyEdit(d, deckEdits?.[d.id])), ...(customDecks ?? [])],
    [customDecks, deckEdits],
  )

  if (!doc) return <>{loading}</>

  function update(fn: (d: UserDoc) => UserDoc) {
    setDoc((d) => (d ? fn(d) : d))
  }

  const value: StoreValue = {
    currentProfile: doc.profile,
    customDecks: doc.customDecks,
    allDecks,
    settings: doc.settings,
    syncStatus,

    updateProfile(patch) {
      update((d) => ({ ...d, profile: { ...d.profile, ...patch } }))
    },

    recordAnswer(cardId, rating) {
      update((d) => {
        const next: Profile = { ...d.profile, progress: { ...d.profile.progress }, stats: { ...d.profile.stats } }
        const today = todayStr()
        if (next.lastStudyDay !== today) {
          next.streak = next.lastStudyDay === yesterdayStr() ? next.streak + 1 : 1
          next.lastStudyDay = today
        }
        next.longestStreak = Math.max(next.longestStreak, next.streak)
        next.progress[cardId] = srsReview(next.progress[cardId], rating)
        if (rating === 'again') next.stats.wrong += 1
        else next.stats.correct += 1
        next.totalReviews += 1
        return { ...d, profile: next }
      })
    },

    createDeck(title, icon, description, categoryId, cards) {
      const id = 'custom-' + uid()
      const deck: Deck = {
        id,
        title: title.trim() || 'Meine Kategorie',
        icon: CATEGORY_ICONS[icon] ? icon : DEFAULT_ICON,
        description: description.trim(),
        categoryId,
        custom: true,
        cards: cards.map((c, i) => ({ ...c, id: `${id}-${i + 1}` })),
      }
      update((d) => ({ ...d, customDecks: [...d.customDecks, deck] }))
      return id
    },

    addCard(deckId, card) {
      const newCard: Card = { ...card, id: `${deckId}-u-${uid()}` }
      update((d) => {
        if (d.customDecks.some((x) => x.id === deckId)) {
          return {
            ...d,
            customDecks: d.customDecks.map((x) => (x.id === deckId ? { ...x, cards: [...x.cards, newCard] } : x)),
          }
        }
        const edit = d.deckEdits?.[deckId] ?? { added: [], removed: [] }
        return { ...d, deckEdits: { ...d.deckEdits, [deckId]: { ...edit, added: [...edit.added, newCard] } } }
      })
    },

    removeCard(deckId, cardId) {
      update((d) => {
        if (d.customDecks.some((x) => x.id === deckId)) {
          return {
            ...d,
            customDecks: d.customDecks.map((x) =>
              x.id === deckId ? { ...x, cards: x.cards.filter((c) => c.id !== cardId) } : x,
            ),
          }
        }
        const edit = d.deckEdits?.[deckId] ?? { added: [], removed: [] }
        const isOwn = edit.added.some((c) => c.id === cardId)
        const nextEdit: DeckEdit = isOwn
          ? { ...edit, added: edit.added.filter((c) => c.id !== cardId) } // eigene Karte: wirklich löschen
          : { ...edit, removed: [...edit.removed, cardId] } // eingebaute Karte: nur ausblenden
        return { ...d, deckEdits: { ...d.deckEdits, [deckId]: nextEdit } }
      })
    },

    removedCount(deckId) {
      return doc.deckEdits?.[deckId]?.removed.length ?? 0
    },

    restoreRemoved(deckId) {
      update((d) => {
        const edit = d.deckEdits?.[deckId]
        if (!edit) return d
        return { ...d, deckEdits: { ...d.deckEdits, [deckId]: { ...edit, removed: [] } } }
      })
    },

    deleteDeck(deckId) {
      update((d) => ({ ...d, customDecks: d.customDecks.filter((x) => x.id !== deckId) }))
    },

    updateSettings(patch) {
      update((d) => ({ ...d, settings: { ...d.settings, ...patch } }))
    },
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore(): StoreValue {
  const v = useContext(Ctx)
  if (!v) throw new Error('useStore muss innerhalb von StoreProvider verwendet werden')
  return v
}
