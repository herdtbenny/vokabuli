import { useState } from 'react'
import { useStore } from '../store'
import { cardState, isDue } from '../srs'
import type { View } from '../nav'
import type { StudyMode } from '../types'
import { speak } from '../tts'

const MODES: { mode: StudyMode; emoji: string; title: string; desc: string }[] = [
  { mode: 'flip', emoji: '🔄', title: 'Karteikarten', desc: 'Umdrehen & selbst bewerten' },
  { mode: 'choice', emoji: '🎯', title: 'Multiple Choice', desc: 'Richtige Antwort wählen' },
  { mode: 'type', emoji: '⌨️', title: 'Schreiben', desc: 'Wort selbst eintippen' },
  { mode: 'listen', emoji: '🔊', title: 'Hören', desc: 'Hören & erkennen' },
]

export default function DeckView({ deckId, navigate }: { deckId: string; navigate: (v: View) => void }) {
  const { allDecks, currentProfile, deleteDeck } = useStore()
  const deck = allDecks.find((d) => d.id === deckId)
  const [showCards, setShowCards] = useState(false)
  const p = currentProfile!

  if (!deck) {
    return (
      <div className="page">
        <p>Deck nicht gefunden.</p>
        <button className="btn ghost" onClick={() => navigate({ name: 'home' })}>Zurück</button>
      </div>
    )
  }

  const dueCount = deck.cards.filter((c) => isDue(p.progress[c.id])).length
  const mastered = deck.cards.filter((c) => cardState(p.progress[c.id]) === 'mastered').length

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
        {mastered > 0 && <span className="pill master">{mastered} gemeistert</span>}
      </div>

      <div className="section-title">Wie möchtest du lernen?</div>
      <div className="mode-grid">
        {MODES.map((m) => (
          <button
            key={m.mode}
            className="mode-card"
            onClick={() => navigate({ name: 'study', deckId: deck.id, mode: m.mode })}
          >
            <div className="emoji">{m.emoji}</div>
            <h4>{m.title}</h4>
            <p>{m.desc}</p>
          </button>
        ))}
      </div>

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
              if (confirm(`Deck "${deck.title}" wirklich löschen?`)) {
                deleteDeck(deck.id)
                navigate({ name: 'home' })
              }
            }}
          >
            🗑️ Deck löschen
          </button>
        </>
      )}
    </div>
  )
}
