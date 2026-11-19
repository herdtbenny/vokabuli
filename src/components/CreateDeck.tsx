import { useState } from 'react'
import { useStore } from '../store'
import { DECK_EMOJIS } from '../nav'
import type { View } from '../nav'
import type { Card } from '../types'

type Draft = Omit<Card, 'id'>

// Erstellt eine neue, eigene Kategorie mit Karten.
export default function CreateDeck({ navigate }: { navigate: (v: View) => void }) {
  const { createDeck } = useStore()
  const [title, setTitle] = useState('')
  const [emoji, setEmoji] = useState(DECK_EMOJIS[0])
  const [cards, setCards] = useState<Draft[]>([])
  const [en, setEn] = useState('')
  const [de, setDe] = useState('')
  const [example, setExample] = useState('')

  function addCard() {
    if (!en.trim() || !de.trim()) return
    setCards((c) => [...c, { en: en.trim(), de: de.trim(), example: example.trim() || undefined }])
    setEn('')
    setDe('')
    setExample('')
  }

  function save() {
    if (!title.trim() || cards.length === 0) return
    const id = createDeck(title, emoji, `${cards.length} eigene Karten`, 'custom', cards)
    navigate({ name: 'deck', deckId: id })
  }

  return (
    <div className="page">
      <div className="topbar" style={{ padding: '0 0 10px' }}>
        <button className="back" onClick={() => navigate({ name: 'home' })}>←</button>
        <h1>Eigene Kategorie</h1>
      </div>

      <div className="field">
        <label>Name der Kategorie</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="z.B. Medizin-Englisch" />
      </div>
      <div className="field">
        <label>Symbol</label>
        <div className="emoji-row">
          {DECK_EMOJIS.map((e) => (
            <button key={e} className={'emoji-pick' + (e === emoji ? ' active' : '')} onClick={() => setEmoji(e)}>
              {e}
            </button>
          ))}
        </div>
      </div>

      <div className="section-title">Karten hinzufügen</div>
      <div className="card-box">
        <div className="field">
          <label>Englisch</label>
          <input value={en} onChange={(e) => setEn(e.target.value)} placeholder="word" autoCapitalize="none" />
        </div>
        <div className="field">
          <label>Deutsch</label>
          <input value={de} onChange={(e) => setDe(e.target.value)} placeholder="Wort" />
        </div>
        <div className="field">
          <label>Beispielsatz (optional)</label>
          <input value={example} onChange={(e) => setExample(e.target.value)} placeholder="This is an example." />
        </div>
        <button className="btn sm block ghost" onClick={addCard} disabled={!en.trim() || !de.trim()}>
          ＋ Karte hinzufügen
        </button>
      </div>

      {cards.length > 0 && (
        <div className="card-box">
          <div className="row-between">
            <strong>{cards.length} Karten</strong>
          </div>
          {cards.map((c, i) => (
            <div className="card-row" key={i}>
              <div>
                <div className="en">{c.en}</div>
                <div className="de">{c.de}</div>
              </div>
              <button
                className="speak-btn danger"
                style={{ width: 40, height: 40, fontSize: 18, background: '#fef2f2' }}
                onClick={() => setCards((cs) => cs.filter((_, j) => j !== i))}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="spacer" />
      <button className="btn block" onClick={save} disabled={!title.trim() || cards.length === 0}>
        Kategorie speichern ({cards.length})
      </button>
    </div>
  )
}
