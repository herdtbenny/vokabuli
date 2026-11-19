import { useMemo, useState } from 'react'
import { useStore } from '../store'
import { categories } from '../data/decks'
import { cardState, isDue } from '../srs'
import { levelProgress, levelTitle } from '../gamification'
import type { View } from '../nav'
import type { Deck } from '../types'

export default function Home({ navigate }: { navigate: (v: View) => void }) {
  const { currentProfile, allDecks } = useStore()
  const [activeCat, setActiveCat] = useState<string | null>(null)
  const p = currentProfile!

  const lp = levelProgress(p.xp)

  function deckStats(deck: Deck) {
    let due = 0
    let mastered = 0
    let learned = 0
    for (const c of deck.cards) {
      const pr = p.progress[c.id]
      if (isDue(pr)) due++
      const st = cardState(pr)
      if (st === 'mastered') mastered++
      if (st !== 'new') learned++
    }
    return { due, mastered, learned, total: deck.cards.length }
  }

  const totalDue = useMemo(
    () => allDecks.reduce((n, d) => n + d.cards.filter((c) => isDue(p.progress[c.id])).length, 0),
    [allDecks, p.progress],
  )

  const shown = activeCat ? allDecks.filter((d) => d.categoryId === activeCat) : allDecks
  const goalPct = Math.min(100, Math.round((p.cardsStudiedToday / p.dailyGoal) * 100))

  return (
    <div className="page">
      <div className="hero">
        <div className="hero-top">
          <div className="hero-avatar" style={{ background: 'rgba(255,255,255,0.22)' }}>
            {p.emoji}
          </div>
          <div>
            <div className="hero-name">Hi, {p.name}!</div>
            <div className="hero-title">
              Level {lp.level} · {levelTitle(lp.level)}
            </div>
          </div>
          <div className="hero-streak">
            🔥 {p.streak}
            <small>Tage-Serie</small>
          </div>
        </div>

        <div className="levelbar">
          <div className="levelbar-row">
            <span>{lp.current} XP</span>
            <span>noch {lp.needed - lp.current} bis Level {lp.level + 1}</span>
          </div>
          <div className="bar">
            <span style={{ width: lp.pct + '%' }} />
          </div>
        </div>

        <div className="goal-row">
          🎯
          <div className="bar">
            <span style={{ width: goalPct + '%', background: goalPct >= 100 ? '#a7f3d0' : '#fff' }} />
          </div>
          <span>
            {p.cardsStudiedToday}/{p.dailyGoal}
          </span>
        </div>
      </div>

      {totalDue > 0 && (
        <>
          <div className="spacer" />
          <button
            className="btn block"
            onClick={() => navigate({ name: 'study', deckId: '__due__', mode: 'flip', quick: true })}
          >
            ⚡ Schnell-Review · {totalDue} fällige Karten
          </button>
        </>
      )}

      <div className="section-title">Kategorien</div>
      <div className="cats">
        <button className={'cat-chip' + (activeCat === null ? ' active' : '')} onClick={() => setActiveCat(null)}>
          <span className="emoji">✨</span>
          <span className="label">Alle</span>
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            className={'cat-chip' + (activeCat === c.id ? ' active' : '')}
            onClick={() => setActiveCat(activeCat === c.id ? null : c.id)}
          >
            <span className="emoji">{c.emoji}</span>
            <span className="label">{c.title.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      <div className="section-title">Decks</div>
      <div className="deck-list">
        {shown.map((d) => {
          const s = deckStats(d)
          const cat = categories.find((c) => c.id === d.categoryId)
          return (
            <button key={d.id} className="deck-card" onClick={() => navigate({ name: 'deck', deckId: d.id })}>
              <div className="deck-icon" style={{ background: (cat?.color ?? '#6d5efc') + '22', color: cat?.color }}>
                {d.emoji}
              </div>
              <div className="deck-info">
                <h3>
                  {d.title} {d.custom && '•'}
                </h3>
                <p>{d.cards.length} Karten · {s.mastered} gemeistert</p>
                <div className="deck-meta">
                  {s.due > 0 && <span className="pill due">{s.due} fällig</span>}
                  {s.mastered > 0 && <span className="pill master">{s.mastered} ✓</span>}
                  {s.learned === 0 && <span className="pill">neu</span>}
                </div>
                <div className="mini-bar">
                  <span style={{ width: Math.round((s.learned / s.total) * 100) + '%' }} />
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="spacer" />
      <button className="btn outline block" onClick={() => navigate({ name: 'create' })}>
        ＋ Eigenes Deck erstellen
      </button>
    </div>
  )
}
