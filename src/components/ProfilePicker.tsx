import { useEffect, useState } from 'react'
import { ArrowRight, Plus } from 'lucide-react'
import { createProfile, listProfiles, type ProfileSummary } from '../auth'
import { PROFILE_COLORS, initial } from '../nav'
import { Logo } from './Logo'

// Schritt 2: "Wer bist du?" – vorhandenes Profil wählen oder ein neues anlegen.
export default function ProfilePicker({
  onPick,
  onUnauthorized,
}: {
  onPick: (p: ProfileSummary) => void
  onUnauthorized: () => void
}) {
  const [profiles, setProfiles] = useState<ProfileSummary[] | null>(null)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState(PROFILE_COLORS[0])
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    listProfiles()
      .then((list) => {
        setProfiles(list)
        if (list.length === 0) setCreating(true)
      })
      .catch(() => onUnauthorized())
  }, [onUnauthorized])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setPending(true)
    setError(null)
    try {
      onPick(await createProfile(name.trim(), color))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Profil konnte nicht angelegt werden.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="picker">
      <div className="picker-brand">
        <Logo size={40} />
      </div>

      {creating ? (
        <form className="auth-card" onSubmit={submit}>
          <h1 className="picker-title">Neues Profil</h1>
          <label className="field">
            <span className="field-label">Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="z.B. Mama" maxLength={24} autoFocus />
          </label>
          <div className="field">
            <span className="field-label">Farbe</span>
            <div className="color-row">
              {PROFILE_COLORS.map((c) => (
                <button
                  type="button"
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
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <button className="btn block" type="submit" disabled={pending || !name.trim()}>
            Profil anlegen <ArrowRight size={18} aria-hidden />
          </button>
          {profiles && profiles.length > 0 && (
            <button type="button" className="btn ghost block" onClick={() => setCreating(false)}>
              Zurück
            </button>
          )}
        </form>
      ) : (
        <>
          <h1 className="picker-title">Wer bist du?</h1>
          {profiles === null ? (
            <p className="muted" style={{ textAlign: 'center' }}>
              Lade Profile …
            </p>
          ) : (
            <div className="profiles-grid">
              {profiles.map((p) => (
                <button key={p.id} className="profile-tile" onClick={() => onPick(p)}>
                  <div className="profile-avatar" style={{ background: p.color }}>
                    {initial(p.name)}
                  </div>
                  <div className="pname">{p.name}</div>
                </button>
              ))}
              <button className="profile-tile add" onClick={() => setCreating(true)}>
                <div className="profile-avatar">
                  <Plus size={30} aria-hidden />
                </div>
                <div className="pname">Neues Profil</div>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
