import { useMemo } from 'react'
import { Flame, Plus, Users, Volume2, VolumeX, Zap } from 'lucide-react'
import { useStore } from '../store'
import { categories } from '../data/decks'
import { cardState, isDueReview } from '../srs'
import { initial } from '../nav'
import { CategoryIcon } from '../icons'
import type { View } from '../nav'
import type { Deck } from '../types'

export default function Home({ navigate }: { navigate: (v: View) => void }) {
  const { currentProfile, allDecks, settings, updateSettings, logout } = useStore()
  const p = currentProfile!

  function deckStats(deck: Deck) {
    let due = 0
    let mastered = 0
    let learned = 0
    for (const c of deck.cards) {
      const pr = p.progress[c.id]
      if (isDueReview(pr)) due++
      const st = cardState(pr)
      if (st === 'mastered') mastered++
      if (st !== 'new') learned++
    }
    return { due, mastered, learned, total: deck.cards.length }
  }

  const totalDue = useMemo(
    () => allDecks.reduce((n, d) => n + d.cards.filter((c) => isDueReview(p.progress[c.id])).length, 0),
    [allDecks, p.progress],
  )
  const totalLearned = useMemo(
    () => allDecks.reduce((n, d) => n + d.cards.filter((c) => (p.progress[c.id]?.seen ?? 0) > 0).length, 0),
    [allDecks, p.progress],
  )

  return (
    <div className="page">
      <div className="hero">
        <div className="hero-top">
          <div className="hero-avatar">{initial(p.name)}</div>
          <div>
            <div className="hero-name">Hi, {p.name}!</div>
            <div className="hero-title">{totalLearned} Karten gelernt</div>
          </div>
          <div className="hero-streak" title="Tage-Serie">
            <span className="inline-icon">
              <Flame size={18} aria-hidden /> {p.streak}
            </span>
            <small>Tage-Serie</small>
          </div>
        </div>

        <div className="hero-actions">
          <button
            className="hero-action"
            aria-pressed={settings.sound}
            onClick={() => updateSettings({ sound: !settings.sound })}
          >
            {settings.sound ? <Volume2 size={18} aria-hidden /> : <VolumeX size={18} aria-hidden />}
            {settings.sound ? 'Ton an' : 'Ton aus'}
          </button>
          <button className="hero-action" onClick={logout}>
            <Users size={18} aria-hidden /> Profil wechseln
          </button>
        </div>
      </div>

      {totalDue > 0 && (
        <>
          <div className="spacer" />
          <button
            className="btn block"
            onClick={() => navigate({ name: 'study', deckId: '__due__', modes: ['flip'], quick: true })}
          >
            <Zap size={18} aria-hidden /> Schnell-Review · {totalDue} fällige Karten
          </button>
        </>
      )}

      <div className="section-title">Kategorien</div>
      <div className="deck-list">
        {allDecks.map((d) => {
          const s = deckStats(d)
          const color = categories.find((c) => c.id === d.categoryId)?.color ?? '#6d5efc'
          return (
            <button key={d.id} className="deck-card" onClick={() => navigate({ name: 'deck', deckId: d.id })}>
              <div className="deck-icon" style={{ background: color + '22', color }}>
                <CategoryIcon name={d.icon} size={26} />
              </div>
              <div className="deck-info">
                <h3>{d.title}</h3>
                <p>
                  {d.cards.length} Karten · {s.mastered} gemeistert
                </p>
                <div className="deck-meta">
                  {s.due > 0 && <span className="pill due">{s.due} fällig</span>}
                  {s.mastered > 0 && <span className="pill master">{s.mastered} gemeistert</span>}
                  {s.learned === 0 && <span className="pill">neu</span>}
                  {d.custom && <span className="pill">eigene</span>}
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
        <Plus size={18} aria-hidden /> Eigene Kategorie erstellen
      </button>
    </div>
  )
}
