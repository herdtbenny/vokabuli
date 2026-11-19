import { Volume2, VolumeX } from 'lucide-react'
import { useStore } from '../store'
import { initial } from '../nav'
import { Logo } from './Logo'

// Schmale Kopfzeile: Logo + Name links, Ton und Profil als kleine Icon-Buttons rechts.
export default function AppHeader() {
  const { currentProfile, settings, updateSettings, logout } = useStore()
  const p = currentProfile!

  return (
    <header className="app-header">
      <Logo />
      <div className="header-actions">
        <button
          className="header-btn"
          aria-label={settings.sound ? 'Ton ausschalten' : 'Ton einschalten'}
          aria-pressed={settings.sound}
          onClick={() => updateSettings({ sound: !settings.sound })}
        >
          {settings.sound ? <Volume2 size={19} aria-hidden /> : <VolumeX size={19} aria-hidden />}
        </button>
        <button
          className="header-avatar"
          style={{ background: p.color }}
          aria-label={`Profil wechseln (angemeldet: ${p.name})`}
          title="Profil wechseln"
          onClick={logout}
        >
          {initial(p.name)}
        </button>
      </div>
    </header>
  )
}
