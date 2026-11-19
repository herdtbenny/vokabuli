import { useState } from 'react'
import {
  ArrowLeft,
  Check,
  Headphones,
  Keyboard,
  Layers,
  ListChecks,
  Plus,
  RotateCcw,
  Shuffle,
  Trash2,
  Volume2,
  type LucideIcon,
} from 'lucide-react'
import { useStore } from '../store'
import { cardState, isDueReview, isNew } from '../srs'
import { categories } from '../data/decks'
import { CategoryIcon } from '../icons'
import type { View } from '../nav'
import type { StudyMode } from '../types'
import { speak } from '../tts'

const MODES: { mode: StudyMode; icon: LucideIcon; title: string; desc: string }[] = [
  { mode: 'flip', icon: Layers, title: 'Karteikarten', desc: 'Umdrehen & selbst bewerten' },
  { mode: 'choice', icon: ListChecks, title: 'Multiple Choice', desc: 'Deutsch → passendes Englisch wählen' },
  { mode: 'type', icon: Keyboard, title: 'Schreiben', desc: 'Wort selbst eintippen' },
  { mode: 'listen', icon: Headphones, title: 'Hören', desc: 'Hören & erkennen' },
]
const ALL_MODES = MODES.map((m) => m.mode)

function CheckBadge({ on }: { on: boolean }) {
  return <span className="check" aria-hidden>{on && <Check size={14} strokeWidth={3} />}</span>
}

export default function DeckView({ deckId, navigate }: { deckId: string; navigate: (v: View) => void }) {
  const { allDecks, currentProfile, deleteDeck, addCard, removeCard, removedCount, restoreRemoved } = useStore()
  const deck = allDecks.find((d) => d.id === deckId)
  const [showCards, setShowCards] = useState(false)
  const [newEn, setNewEn] = useState('')
  const [newDe, setNewDe] = useState('')
  const [newExample, setNewExample] = useState('')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<StudyMode[]>(ALL_MODES) // standardmäßig alle Lernarten
  const p = currentProfile!

  if (!deck) {
    return (
      <div className="page">
        <p>Kategorie nicht gefunden.</p>
        <button className="btn ghost" onClick={() => navigate({ name: 'home' })}>
          Zurück
        </button>
      </div>
    )
  }

  const color = categories.find((c) => c.id === deck.categoryId)?.color ?? '#16202f'
  const dueCount = deck.cards.filter((c) => isDueReview(p.progress[c.id])).length
  const newCount = deck.cards.filter((c) => isNew(p.progress[c.id])).length
  const mastered = deck.cards.filter((c) => cardState(p.progress[c.id]) === 'mastered').length
  const allSelected = selected.length === ALL_MODES.length
  const removed = removedCount(deck.id)
  const q = query.trim().toLowerCase()
  const visibleCards = q
    ? deck.cards.filter((c) => c.en.toLowerCase().includes(q) || c.de.toLowerCase().includes(q))
    : deck.cards

  function toggle(mode: StudyMode) {
    setSelected((s) => (s.includes(mode) ? s.filter((m) => m !== mode) : [...s, mode]))
  }

  function start() {
    if (!selected.length || !deck) return
    const modes = ALL_MODES.filter((m) => selected.includes(m)) // Reihenfolge wie in der Liste
    navigate({ name: 'study', deckId: deck.id, modes })
  }

  return (
    <div className="page">
      <div className="topbar" style={{ padding: '0 0 10px' }}>
        <button className="back" aria-label="Zurück" onClick={() => navigate({ name: 'home' })}>
          <ArrowLeft size={20} aria-hidden />
        </button>
        <span className="title-icon" style={{ background: color + '22', color }}>
          <CategoryIcon name={deck.icon} size={20} />
        </span>
        <h1>{deck.title}</h1>
      </div>

      <p className="muted">{deck.description}</p>
      <div className="deck-meta" style={{ marginTop: 10 }}>
        <span className="pill">{deck.cards.length} Karten</span>
        {dueCount > 0 && <span className="pill due">{dueCount} fällig</span>}
        {newCount > 0 && <span className="pill">{newCount} neu</span>}
        {mastered > 0 && <span className="pill master">{mastered} gemeistert</span>}
      </div>

      <div className="section-title">Wie möchtest du lernen?</div>
      <p className="muted" style={{ margin: '-4px 4px 12px' }}>
        Wähle eine oder mehrere Lernarten. Bei mehreren wird pro Karte gemischt.
      </p>

      <button
        className={'mode-all' + (allSelected ? ' selected' : '')}
        aria-pressed={allSelected}
        onClick={() => setSelected(allSelected ? [] : ALL_MODES)}
      >
        <span className="mode-icon">
          <Shuffle size={20} aria-hidden />
        </span>
        <span>
          <strong>Alle Lernarten</strong>
          <small>Bunt gemischt – die volle Abwechslung</small>
        </span>
        <CheckBadge on={allSelected} />
      </button>

      <div className="mode-grid">
        {MODES.map((m) => {
          const on = selected.includes(m.mode)
          const Icon = m.icon
          return (
            <button
              key={m.mode}
              className={'mode-card' + (on ? ' selected' : '')}
              aria-pressed={on}
              onClick={() => toggle(m.mode)}
            >
              <CheckBadge on={on} />
              <span className="mode-icon">
                <Icon size={20} aria-hidden />
              </span>
              <h4>{m.title}</h4>
              <p>{m.desc}</p>
            </button>
          )
        })}
      </div>

      <div className="spacer" />
      <button className="btn block" disabled={!selected.length} onClick={start}>
        {selected.length === 0
          ? 'Lernart wählen'
          : selected.length === 1
            ? 'Lernen starten'
            : `Lernen starten · ${selected.length} Lernarten`}
      </button>

      <div className="spacer" />
      <button className="btn ghost block" aria-expanded={showCards} onClick={() => setShowCards((s) => !s)}>
        {showCards ? 'Karten schließen' : `Karten ansehen & bearbeiten (${deck.cards.length})`}
      </button>

      {showCards && (
        <>
          <form
            className="card-box add-card"
            onSubmit={(e) => {
              e.preventDefault()
              if (!newEn.trim() || !newDe.trim()) return
              addCard(deck.id, { en: newEn.trim(), de: newDe.trim(), example: newExample.trim() || undefined })
              setNewEn('')
              setNewDe('')
              setNewExample('')
            }}
          >
            <strong className="add-card-title">Neue Karte</strong>
            <input aria-label="Englisch" placeholder="Englisch" value={newEn} onChange={(e) => setNewEn(e.target.value)} autoCapitalize="none" />
            <input aria-label="Deutsch" placeholder="Deutsch" value={newDe} onChange={(e) => setNewDe(e.target.value)} />
            <input
              aria-label="Beispielsatz (optional)"
              placeholder="Beispielsatz (optional)"
              value={newExample}
              onChange={(e) => setNewExample(e.target.value)}
            />
            <button className="btn sm" type="submit" disabled={!newEn.trim() || !newDe.trim()}>
              <Plus size={16} aria-hidden /> Karte hinzufügen
            </button>
          </form>

          <div className="card-box">
            <input
              className="card-search"
              type="search"
              aria-label="Karten durchsuchen"
              placeholder={`${deck.cards.length} Karten durchsuchen`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {visibleCards.length === 0 && <p className="muted">Keine Karte gefunden.</p>}
            {visibleCards.map((c) => (
              <div className="card-row" key={c.id}>
                <div className="card-text">
                  <div className="en">{c.en}</div>
                  <div className="de">{c.de}</div>
                </div>
                <div className="card-actions">
                  <button className="speak-btn small" aria-label={`${c.en} anhören`} onClick={() => speak(c.en)}>
                    <Volume2 size={18} aria-hidden />
                  </button>
                  <button className="icon-btn danger" aria-label={`${c.en} löschen`} onClick={() => removeCard(deck.id, c.id)}>
                    <Trash2 size={17} aria-hidden />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {removed > 0 && (
            <button className="btn ghost block" onClick={() => restoreRemoved(deck.id)}>
              <RotateCcw size={16} aria-hidden /> {removed} gelöschte {removed === 1 ? 'Karte' : 'Karten'} wiederherstellen
            </button>
          )}
        </>
      )}

      {deck.custom && (
        <>
          <div className="spacer" />
          <button
            className="btn ghost block danger"
            onClick={() => {
              if (confirm(`Kategorie "${deck.title}" wirklich löschen?`)) {
                deleteDeck(deck.id)
                navigate({ name: 'home' })
              }
            }}
          >
            <Trash2 size={18} aria-hidden /> Kategorie löschen
          </button>
        </>
      )}
    </div>
  )
}
