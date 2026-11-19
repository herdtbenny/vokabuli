import { useState } from 'react'
import { useStore } from '../store'
import { cardState, isDueReview, isNew } from '../srs'
import type { View } from '../nav'
import type { StudyMode } from '../types'
import { speak } from '../tts'

const MODES: { mode: StudyMode; emoji: string; title: string; desc: string }[] = [
  { mode: 'flip', emoji: '🔄', title: 'Karteikarten', desc: 'Umdrehen & selbst bewerten' },
  { mode: 'choice', emoji: '🎯', title: 'Multiple Choice', desc: 'Richtige Antwort wählen' },
  { mode: 'type', emoji: '⌨️', title: 'Schreiben', desc: 'Wort selbst eintippen' },
  { mode: 'listen', emoji: '🔊', title: 'Hören', desc: 'Hören & erkennen' },
]
const ALL_MODES = MODES.map((m) => m.mode)

export default function DeckView({ deckId, navigate }: { deckId: string; navigate: (v: View) => void }) {
  const { allDecks, currentProfile, deleteDeck } = useStore()
  const deck = allDecks.find((d) => d.id === deckId)
  const [showCards, setShowCards] = useState(false)
  const [selected, setSelected] = useState<StudyMode[]>([])
  const p = currentProfile!

  if (!deck) {
    return (
      <div className="page">
        <p>Kategorie nicht gefunden.</p>
        <button className="btn ghost" onClick={() => navigate({ name: 'home' })}>Zurück</button>
      </div>
    )
  }

  const dueCount = deck.cards.filter((c) => isDueReview(p.progress[c.id])).length
  const newCount = deck.cards.filter((c) => isNew(p.progress[c.id])).length
  const mastered = deck.cards.filter((c) => cardState(p.progress[c.id]) === 'mastered').length
  const allSelected = selected.length === ALL_MODES.length

  function toggle(mode: StudyMode) {
    setSelected((s) => (s.includes(mode) ? s.filter((m) => m !== mode) : [...s, mode]))
  }

  function start() {
    if (!selected.length || !deck) return
    // Reihenfolge stabil halten (wie in der Liste)
    const modes = ALL_MODES.filter((m) => selected.includes(m))
    navigate({ name: 'study', deckId: deck.id, modes })
  }

  return (
    <div className="page">
      <div className="topbar" style={{ padding: '0 0 10px' }}>
        <button className="back" onClick={() => navigate({ name: 'home' })}>←</button>
        <h1>{deck.emoji} {deck.title}</h1>
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
        <span className="check" aria-hidden>{allSelected ? '✓' : ''}</span>
        <span>
          <strong>Alle Lernarten</strong>
          <small>Bunt gemischt – die volle Abwechslung</small>
        </span>
      </button>

      <div className="mode-grid">
        {MODES.map((m) => {
          const on = selected.includes(m.mode)
          return (
            <button
              key={m.mode}
              className={'mode-card' + (on ? ' selected' : '')}
              aria-pressed={on}
              onClick={() => toggle(m.mode)}
            >
              <span className="check" aria-hidden>{on ? '✓' : ''}</span>
              <div className="emoji">{m.emoji}</div>
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
      <button className="btn ghost block" onClick={() => setShowCards((s) => !s)}>
        {showCards ? 'Karten ausblenden' : `Alle ${deck.cards.length} Karten ansehen`}
      </button>

      {showCards && (
        <div className="card-box" style={{ marginTop: 12 }}>
          {deck.cards.map((c) => (
            <div className="card-row" key={c.id}>
              <div>
                <div className="en">{c.en}</div>
                <div className="de">{c.de}</div>
              </div>
              <button className="speak-btn" style={{ width: 40, height: 40, fontSize: 20 }} onClick={() => speak(c.en)}>
                🔊
              </button>
            </div>
          ))}
        </div>
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
            Kategorie löschen
          </button>
        </>
      )}
    </div>
  )
}
