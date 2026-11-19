import { useState } from 'react'
import { useStore } from '../store'
import { levelFromXp, levelTitle } from '../gamification'
import { PROFILE_COLORS, initial } from '../nav'
import { APP_NAME, APP_MARK } from '../brand'

export default function ProfilePicker() {
  const { profiles, selectProfile, createProfile, deleteProfile } = useStore()
  const [creating, setCreating] = useState(profiles.length === 0)
  const [name, setName] = useState('')
  const [color, setColor] = useState(PROFILE_COLORS[0])
  const [manage, setManage] = useState(false)

  if (creating) {
    return (
      <div className="picker">
        <div className="brand-logo">
          <div className="mark">{APP_MARK}</div>
          <h1>Wer lernt?</h1>
          <p>Leg ein Profil an – ganz ohne Anmeldung.</p>
        </div>

        <div>
          <div className="field">
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="z.B. Mama" maxLength={16} />
          </div>
          <div className="field">
            <label>Farbe</label>
            <div className="color-row">
              {PROFILE_COLORS.map((c) => (
                <button
                  key={c}
                  className={'color-dot' + (c === color ? ' active' : '')}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>
        </div>

        <button
          className="btn block"
          disabled={!name.trim()}
          onClick={() => {
            createProfile(name, initial(name), color)
          }}
        >
          Los geht's 🚀
        </button>
        {profiles.length > 0 && (
          <button className="btn ghost block" onClick={() => setCreating(false)}>
            Zurück
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="picker">
      <div className="brand-logo">
        <div className="mark">{APP_MARK}</div>
        <h1>{APP_NAME}</h1>
        <p>Wer lernt heute Englisch?</p>
      </div>

      <div className="profiles-grid">
        {profiles.map((p) => (
          <button
            key={p.id}
            className="profile-tile"
            onClick={() => (manage ? deleteProfile(p.id) : selectProfile(p.id))}
          >
            <div className="profile-avatar" style={{ background: p.color }}>
              {initial(p.name)}
            </div>
            <div className="pname">{p.name}</div>
            <div className="plevel">
              {manage ? '🗑️ Löschen' : `Level ${levelFromXp(p.xp)} · ${levelTitle(levelFromXp(p.xp))}`}
            </div>
          </button>
        ))}
        <button className="profile-tile add" onClick={() => setCreating(true)}>
          <div className="profile-avatar">＋</div>
          <div className="pname">Neues Profil</div>
          <div className="plevel">hinzufügen</div>
        </button>
      </div>

      <button className="btn ghost block" onClick={() => setManage((m) => !m)}>
        {manage ? 'Fertig' : 'Profile verwalten'}
      </button>
    </div>
  )
}
