import { useMemo, type CSSProperties } from 'react'
import { ArrowRight, Plus } from 'lucide-react'
import { useStore } from '../store'
import { categories } from '../data/decks'
import { cardState, isDueReview } from '../srs'
import { CategoryIcon } from '../icons'
import AppHeader from './AppHeader'
import type { View } from '../nav'

const CUSTOM_COLOR = '#16202f'

export default function Home({ navigate }: { navigate: (v: View) => void }) {
  const { currentProfile, allDecks } = useStore()
  const p = currentProfile!

  // Kennzahlen pro Kategorie und gesamt in einem Durchlauf
  const { perDeck, totals } = useMemo(() => {
    const perDeck = new Map<string, { due: number; started: number; total: number }>()
    const totals = { cards: 0, started: 0, mastered: 0, due: 0 }
    for (const d of allDecks) {
      let due = 0
      let started = 0
      for (const c of d.cards) {
        const pr = p.progress[c.id]
        const st = cardState(pr)
        if (isDueReview(pr)) due++
        if (st !== 'new') started++
        if (st === 'mastered') totals.mastered++
      }
      perDeck.set(d.id, { due, started, total: d.cards.length })
      totals.cards += d.cards.length
      totals.started += started
      totals.due += due
    }
    return { perDeck, totals }
  }, [allDecks, p.progress])

  const answered = p.stats.correct + p.stats.wrong
  const accuracy = answered ? Math.round((p.stats.correct / answered) * 100) : null
  const startedPct = totals.cards ? (totals.started / totals.cards) * 100 : 0

  return (
    <div className="page">
      <AppHeader />

      <section className="greet" aria-label="Dein Stand">
        <h1 className="greet-title">Hallo, {p.name}</h1>
        <dl className="stat-strip">
          <div>
            <dt>Serie</dt>
            <dd>
              {p.streak} {p.streak === 1 ? 'Tag' : 'Tage'}
            </dd>
          </div>
          <div>
            <dt>Gelernt</dt>
            <dd>{totals.started}</dd>
          </div>
          <div>
            <dt>Gemeistert</dt>
            <dd>{totals.mastered}</dd>
          </div>
          <div>
            <dt>Trefferquote</dt>
            <dd>{accuracy === null ? '–' : `${accuracy} %`}</dd>
          </div>
        </dl>
        <div className="overall">
          <div className="overall-bar" role="progressbar" aria-valuemin={0} aria-valuemax={totals.cards} aria-valuenow={totals.started}>
            <span style={{ width: `${Math.max(startedPct, totals.started ? 1 : 0)}%` }} />
          </div>
          <span className="overall-label">
            {totals.started} von {totals.cards.toLocaleString('de-DE')} Karten begonnen
          </span>
        </div>
      </section>

      {totals.due > 0 && (
        <button
          className="due-cta"
          onClick={() => navigate({ name: 'study', deckId: '__due__', modes: ['flip'], quick: true })}
        >
          <span>
            <strong>Fällige wiederholen</strong>
            <small>
              {totals.due} {totals.due === 1 ? 'Karte' : 'Karten'} aus allen Kategorien
            </small>
          </span>
          <ArrowRight size={20} aria-hidden />
        </button>
      )}

      <h2 className="section-title">Kategorien</h2>
      <div className="cat-grid">
        {allDecks.map((d) => {
          const s = perDeck.get(d.id)!
          const color = categories.find((c) => c.id === d.categoryId)?.color ?? CUSTOM_COLOR
          const pct = s.total ? Math.round((s.started / s.total) * 100) : 0
          return (
            <button
              key={d.id}
              className="cat-card"
              style={{ '--c': color } as CSSProperties}
              onClick={() => navigate({ name: 'deck', deckId: d.id })}
            >
              <span className="cat-icon">
                <CategoryIcon name={d.icon} size={20} />
              </span>
              <span className="cat-title">{d.title}</span>
              <span className="cat-meta">
                {s.total} Karten
                {s.due > 0 && <em> · {s.due} fällig</em>}
              </span>
              <span className="cat-progress" aria-label={`${pct} % begonnen`}>
                <span style={{ width: `${pct}%` }} />
              </span>
            </button>
          )
        })}
        <button className="cat-card add" onClick={() => navigate({ name: 'create' })}>
          <Plus size={22} aria-hidden />
          <span className="cat-title">Eigene Kategorie</span>
        </button>
      </div>
    </div>
  )
}
