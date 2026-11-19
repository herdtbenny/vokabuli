import { useState } from 'react'
import { useStore } from '../store'
import { categories } from '../data/decks'
import { generateDeck } from '../ai'
import { DECK_EMOJIS } from '../nav'
import type { View } from '../nav'
import type { Card } from '../types'

type Draft = Omit<Card, 'id'>

export default function CreateDeck({ navigate }: { navigate: (v: View) => void }) {
  const { createDeck, settings } = useStore()
  const [title, setTitle] = useState('')
  const [emoji, setEmoji] = useState(DECK_EMOJIS[0])
  const [categoryId, setCategoryId] = useState(categories[0].id)
  const [cards, setCards] = useState<Draft[]>([])
  const [en, setEn] = useState('')
  const [de, setDe] = useState('')
  const [example, setExample] = useState('')

  // KI
  const [aiTopic, setAiTopic] = useState('')
  const [aiCount, setAiCount] = useState(20)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  function addCard() {
    if (!en.trim() || !de.trim()) return
    setCards((c) => [...c, { en: en.trim(), de: de.trim(), example: example.trim() || undefined }])
    setEn('')
    setDe('')
    setExample('')
  }

  async function runAi() {
    setAiError('')
    if (!settings.aiKey) {
      setAiError('Kein API-Key hinterlegt. Trag ihn in den Einstellungen ein.')
      return
    }
    if (!aiTopic.trim()) return
    setAiLoading(true)
    try {
      const generated = await generateDeck({ topic: aiTopic.trim(), count: aiCount, settings })
      setCards((c) => [...c, ...generated])
      if (!title) setTitle(aiTopic.trim())
    } catch (e: any) {
      setAiError(e?.message ?? 'Unbekannter Fehler')
    } finally {
      setAiLoading(false)
    }
  }

  function save() {
    if (!title.trim() || cards.length === 0) return
    const id = createDeck(title, emoji, `${cards.length} eigene Karten`, categoryId, cards)
    navigate({ name: 'deck', deckId: id })
  }

  return (
    <div className="page">
      <div className="topbar" style={{ padding: '0 0 10px' }}>
        <button className="back" onClick={() => navigate({ name: 'home' })}>←</button>
        <h1>Eigenes Deck</h1>
      </div>

      <div className="field">
        <label>Titel</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="z.B. Medizin-Englisch" />
      </div>
      <div className="row-between" style={{ gap: 12 }}>
        <div className="field" style={{ flex: 1 }}>
          <label>Kategorie</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.title}
              </option>
            ))}
          </select>
        </div>
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

      <div className="section-title">✨ Mit KI befüllen (optional)</div>
      <div className="card-box">
        <div className="field">
          <label>Thema</label>
          <input value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} placeholder="z.B. IT & Programmieren" />
        </div>
        <div className="field">
          <label>Anzahl: {aiCount}</label>
          <input type="range" min={5} max={40} value={aiCount} onChange={(e) => setAiCount(Number(e.target.value))} />
        </div>
        <button className="btn sm block" onClick={runAi} disabled={aiLoading || !aiTopic.trim()}>
          {aiLoading ? <><span className="spin">⏳</span> Generiere…</> : '✨ Vokabeln generieren'}
        </button>
        {aiError && <p className="danger" style={{ fontSize: 13, marginTop: 8 }}>{aiError}</p>}
        {!settings.aiKey && (
          <p className="muted" style={{ marginTop: 8 }}>
            Tipp: API-Key in den Einstellungen hinterlegen, um die KI zu nutzen.
          </p>
        )}
      </div>

      <div className="section-title">Karten manuell hinzufügen</div>
      <div className="card-box">
        <div className="field">
          <label>Englisch</label>
          <input value={en} onChange={(e) => setEn(e.target.value)} placeholder="word" />
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
              <button className="speak-btn danger" style={{ width: 40, height: 40, fontSize: 18, background: '#fef2f2' }} onClick={() => setCards((cs) => cs.filter((_, j) => j !== i))}>
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="spacer" />
      <button className="btn block" onClick={save} disabled={!title.trim() || cards.length === 0}>
        Deck speichern ({cards.length})
      </button>
    </div>
  )
}
