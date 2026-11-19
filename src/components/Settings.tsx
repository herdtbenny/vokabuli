import { useStore } from '../store'
import { APP_NAME } from '../brand'
import { initial } from '../nav'
import type { View } from '../nav'

export default function Settings({ navigate }: { navigate: (v: View) => void }) {
  const { currentProfile, updateProfile, settings, updateSettings, logout } = useStore()
  const p = currentProfile!

  return (
    <div className="page">
      <div className="topbar" style={{ padding: '0 0 10px' }}>
        <h1>Einstellungen</h1>
      </div>

      <div className="section-title">Profil</div>
      <div className="card-box">
        <div className="row-between">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="profile-avatar" style={{ width: 48, height: 48, fontSize: 22, background: p.color }}>
              {initial(p.name)}
            </div>
            <strong>{p.name}</strong>
          </div>
          <button className="btn sm ghost" onClick={logout}>
            Profil wechseln
          </button>
        </div>
      </div>

      <div className="section-title">Lernen</div>
      <div className="card-box">
        <div className="field">
          <label>Tagesziel: {p.dailyGoal} Karten</label>
          <input
            type="range"
            min={5}
            max={60}
            step={5}
            value={p.dailyGoal}
            onChange={(e) => updateProfile({ dailyGoal: Number(e.target.value) })}
          />
        </div>
        <div className="row-between">
          <label style={{ margin: 0 }}>Sounds</label>
          <button
            className={'btn sm ' + (settings.sound ? '' : 'ghost')}
            onClick={() => updateSettings({ sound: !settings.sound })}
          >
            {settings.sound ? 'An' : 'Aus'}
          </button>
        </div>
      </div>

      <div className="spacer" />
      <button className="btn outline block" onClick={() => navigate({ name: 'home' })}>
        Fertig
      </button>
      <p className="muted" style={{ textAlign: 'center', marginTop: 20 }}>
        {APP_NAME}
      </p>
    </div>
  )
}
