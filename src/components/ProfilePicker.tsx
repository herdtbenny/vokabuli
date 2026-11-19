import { useState } from 'react'
import { ArrowRight, Plus, Trash2 } from 'lucide-react'
import { useStore } from '../store'
import { PROFILE_COLORS, initial } from '../nav'
import { Logo } from './Logo'
import type { Deck, Profile } from '../types'

// Nur Karten zählen, die es noch gibt (z.B. nicht die einer gelöschten Kategorie)
function learnedCount(p: Profile, decks: Deck[]): number {
  return decks.reduce((n, d) => n + d.cards.filter((c) => (p.progress[c.id]?.seen ?? 0) > 0).length, 0)
}

export default function ProfilePicker() {
  const { profiles, allDecks, selectProfile, createProfile, deleteProfile } = useStore()
  const [creating, setCreating] = useState(profiles.length === 0)
  const [name, setName] = useState('')
  const [color, setColor] = useState(PROFILE_COLORS[0])
  const [manage, setManage] = useState(false)

  if (creating) {
    return (
      <div className="picker">
        <div className="picker-brand">
          <Logo size={40} />
        </div>
        <h1 className="picker-title">Neues Profil</h1>

        <div>
          <div className="field">
            <label htmlFor="profile-name">Name</label>
            <input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Mama"
              maxLength={16}
            />
          </div>
          <div className="field">
            <label>Farbe</label>
            <div className="color-row">
              {PROFILE_COLORS.map((c) => (
                <button
                  key={c}
                  className={'color-dot' + (c === color ? ' active' : '')}
                  style={{ background: c }}
                  aria-label={'Farbe ' + c}
                  aria-pressed={c === color}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>
        </div>

        <button className="btn block" disabled={!name.trim()} onClick={() => createProfile(name, color)}>
          Profil anlegen <ArrowRight size={18} aria-hidden />
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
      <div className="picker-brand">
        <Logo size={40} />
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
            <div className="psub">
              {manage ? (
                <span className="inline-icon danger">
                  <Trash2 size={14} aria-hidden /> Löschen
                </span>
              ) : (
                `${learnedCount(p, allDecks)} Karten gelernt`
              )}
            </div>
          </button>
        ))}
        <button className="profile-tile add" onClick={() => setCreating(true)}>
          <div className="profile-avatar">
            <Plus size={30} aria-hidden />
          </div>
          <div className="pname">Neues Profil</div>
        </button>
      </div>

      <button className="btn ghost block" onClick={() => setManage((m) => !m)}>
        {manage ? 'Fertig' : 'Profile verwalten'}
      </button>
    </div>
  )
}
