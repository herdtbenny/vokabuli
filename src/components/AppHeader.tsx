import { UserButton } from '@clerk/react'
import { CloudOff, Volume2, VolumeX } from 'lucide-react'
import { useStore } from '../store'
import { Logo } from './Logo'

// Schmale Kopfzeile: Logo + Name links; Ton und Konto (Abmelden, Konto verwalten) als kleine Buttons rechts.
export default function AppHeader() {
  const { settings, updateSettings, syncStatus } = useStore()

  return (
    <header className="app-header">
      <Logo />
      <div className="header-actions">
        {syncStatus === 'offline' && (
          <span className="sync-hint" title="Offline – deine Fortschritte werden gespeichert, sobald du wieder online bist">
            <CloudOff size={16} aria-hidden /> Offline
          </span>
        )}
        <button
          className="header-btn"
          aria-label={settings.sound ? 'Ton ausschalten' : 'Ton einschalten'}
          aria-pressed={settings.sound}
          onClick={() => updateSettings({ sound: !settings.sound })}
        >
          {settings.sound ? <Volume2 size={19} aria-hidden /> : <VolumeX size={19} aria-hidden />}
        </button>
        <UserButton
          appearance={{ elements: { avatarBox: { width: '38px', height: '38px', borderRadius: '12px' } } }}
        />
      </div>
    </header>
  )
}
