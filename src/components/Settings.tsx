import { useState } from 'react'
import { useStore } from '../store'
import { APP_NAME } from '../brand'
import type { View } from '../nav'

export default function Settings({ navigate }: { navigate: (v: View) => void }) {
  const { currentProfile, updateProfile, settings, updateSettings, logout } = useStore()
  const p = currentProfile!
  const [showKey, setShowKey] = useState(false)

  return (
    <div className="page">
      <div className="topbar" style={{ padding: '0 0 10px' }}>
        <h1>⚙️ Einstellungen</h1>
      </div>

      <div className="section-title">Profil</div>
      <div className="card-box">
        <div className="row-between">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="profile-avatar" style={{ width: 48, height: 48, fontSize: 26, background: p.color }}>
              {p.emoji}
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
          <label style={{ margin: 0 }}>🔊 Sounds</label>
          <button
            className={'btn sm ' + (settings.sound ? '' : 'ghost')}
            onClick={() => updateSettings({ sound: !settings.sound })}
          >
            {settings.sound ? 'An' : 'Aus'}
          </button>
        </div>
      </div>

      <div className="section-title">✨ KI-Deck-Generator (optional)</div>
      <div className="card-box">
        <p className="muted" style={{ marginTop: 0 }}>
          Dein Key wird nur lokal auf diesem Gerät gespeichert und nie an uns gesendet. OpenAI-kompatibler Endpunkt.
        </p>
        <div className="field">
          <label>API-Key</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type={showKey ? 'text' : 'password'}
              value={settings.aiKey}
              onChange={(e) => updateSettings({ aiKey: e.target.value })}
              placeholder="sk-…"
              autoCapitalize="none"
              autoCorrect="off"
            />
            <button className="btn sm ghost" onClick={() => setShowKey((s) => !s)}>
              {showKey ? '🙈' : '👁️'}
            </button>
          </div>
        </div>
        <div className="field">
          <label>Basis-URL</label>
          <input
            value={settings.aiBaseUrl}
            onChange={(e) => updateSettings({ aiBaseUrl: e.target.value })}
            placeholder="https://api.openai.com/v1"
            autoCapitalize="none"
            autoCorrect="off"
          />
        </div>
        <div className="field">
          <label>Modell</label>
          <input
            value={settings.aiModel}
            onChange={(e) => updateSettings({ aiModel: e.target.value })}
            placeholder="gpt-4o-mini"
            autoCapitalize="none"
            autoCorrect="off"
          />
        </div>
      </div>

      <div className="spacer" />
      <button className="btn outline block" onClick={() => navigate({ name: 'home' })}>
        Fertig
      </button>
      <p className="muted" style={{ textAlign: 'center', marginTop: 20 }}>
        {APP_NAME} · lokal gespeichert, keine Cloud
      </p>
    </div>
  )
}
