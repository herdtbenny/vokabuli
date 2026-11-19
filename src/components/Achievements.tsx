import { useStore } from '../store'
import { ACHIEVEMENTS } from '../gamification'

export default function Achievements() {
  const { currentProfile } = useStore()
  const p = currentProfile!
  const unlocked = new Set(p.unlockedAchievements)
  const count = ACHIEVEMENTS.filter((a) => unlocked.has(a.id)).length

  return (
    <div className="page">
      <div className="topbar" style={{ padding: '0 0 10px' }}>
        <h1>🏅 Erfolge</h1>
      </div>
      <p className="muted">
        {count} von {ACHIEVEMENTS.length} freigeschaltet
      </p>
      <div className="mini-bar" style={{ margin: '8px 0 16px' }}>
        <span style={{ width: Math.round((count / ACHIEVEMENTS.length) * 100) + '%' }} />
      </div>

      <div className="ach-grid">
        {ACHIEVEMENTS.map((a) => {
          const got = unlocked.has(a.id)
          return (
            <div className={'ach' + (got ? '' : ' locked')} key={a.id}>
              <div className="emoji">{got ? a.emoji : '🔒'}</div>
              <h4>{a.title}</h4>
              <p>{a.description}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
