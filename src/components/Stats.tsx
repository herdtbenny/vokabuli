import { useStore } from '../store'
import { cardState } from '../srs'
import { levelProgress, levelTitle } from '../gamification'

export default function Stats() {
  const { currentProfile, allDecks } = useStore()
  const p = currentProfile!
  const lp = levelProgress(p.xp)

  const totalCards = allDecks.reduce((n, d) => n + d.cards.length, 0)
  let mastered = 0
  let learning = 0
  for (const d of allDecks) {
    for (const c of d.cards) {
      const st = cardState(p.progress[c.id])
      if (st === 'mastered') mastered++
      else if (st === 'learning' || st === 'review') learning++
    }
  }
  const total = p.stats.correct + p.stats.wrong
  const accuracy = total ? Math.round((p.stats.correct / total) * 100) : 0
  const circ = 2 * Math.PI * 34

  return (
    <div className="page">
      <div className="topbar" style={{ padding: '0 0 10px' }}>
        <h1>📊 Deine Statistik</h1>
      </div>

      <div className="donut-wrap">
        <svg width="84" height="84" viewBox="0 0 84 84">
          <circle cx="42" cy="42" r="34" fill="none" stroke="#ececf3" strokeWidth="12" />
          <circle
            cx="42"
            cy="42"
            r="34"
            fill="none"
            stroke="#22c55e"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ - (circ * accuracy) / 100}
            transform="rotate(-90 42 42)"
          />
          <text x="42" y="48" textAnchor="middle" fontSize="20" fontWeight="800" fill="#1b1b2b">
            {accuracy}%
          </text>
        </svg>
        <div>
          <strong>Trefferquote</strong>
          <div className="muted">
            {p.stats.correct} richtig · {p.stats.wrong} falsch
          </div>
        </div>
      </div>

      <div className="spacer" />
      <div className="stat-grid">
        <div className="stat-card">
          <div className="num">{lp.level}</div>
          <div className="lbl">Level · {levelTitle(lp.level)}</div>
        </div>
        <div className="stat-card">
          <div className="num">{p.xp}</div>
          <div className="lbl">XP gesamt</div>
        </div>
        <div className="stat-card">
          <div className="num">🔥 {p.streak}</div>
          <div className="lbl">Tage-Serie (max {p.longestStreak})</div>
        </div>
        <div className="stat-card">
          <div className="num">{p.totalReviews}</div>
          <div className="lbl">Wiederholungen</div>
        </div>
        <div className="stat-card">
          <div className="num">{mastered}</div>
          <div className="lbl">gemeistert</div>
        </div>
        <div className="stat-card">
          <div className="num">{learning}</div>
          <div className="lbl">im Lernen</div>
        </div>
      </div>

      <div className="section-title">Gesamtfortschritt</div>
      <div className="card-box">
        <div className="row-between">
          <span className="muted">{mastered + learning} von {totalCards} Karten begonnen</span>
          <strong>{Math.round(((mastered + learning) / totalCards) * 100)}%</strong>
        </div>
        <div className="mini-bar" style={{ marginTop: 10 }}>
          <span style={{ width: Math.round(((mastered + learning) / totalCards) * 100) + '%' }} />
        </div>
      </div>
    </div>
  )
}
