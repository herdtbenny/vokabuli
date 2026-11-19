import { useCallback, useRef, useState, type ReactNode } from 'react'
import { useStore } from './store'
import type { ToastItem, View } from './nav'
import ProfilePicker from './components/ProfilePicker'
import Home from './components/Home'
import DeckView from './components/DeckView'
import StudySession from './components/StudySession'
import CreateDeck from './components/CreateDeck'
import Stats from './components/Stats'
import Achievements from './components/Achievements'
import Settings from './components/Settings'
import Confetti from './components/Confetti'
import Toasts from './components/Toasts'

const NAV_ITEMS: { label: string; to: View; match: View['name'][]; icon: ReactNode }[] = [
  {
    label: 'Lernen',
    to: { name: 'home' },
    match: ['home', 'deck', 'create'],
    icon: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z" />,
  },
  {
    label: 'Statistik',
    to: { name: 'stats' },
    match: ['stats'],
    icon: (
      <>
        <path d="M6 20v-7" />
        <path d="M12 20V4" />
        <path d="M18 20v-11" />
      </>
    ),
  },
  {
    label: 'Erfolge',
    to: { name: 'achievements' },
    match: ['achievements'],
    icon: (
      <>
        <path d="M8 21h8" />
        <path d="M12 17v4" />
        <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
        <path d="M7 6H4v1a3 3 0 0 0 3 3" />
        <path d="M17 6h3v1a3 3 0 0 1-3 3" />
      </>
    ),
  },
  {
    label: 'Einstellungen',
    to: { name: 'settings' },
    match: ['settings'],
    icon: (
      <>
        <path d="M4 7h10" />
        <path d="M18 7h2" />
        <circle cx="16" cy="7" r="2" />
        <path d="M4 17h2" />
        <path d="M10 17h10" />
        <circle cx="8" cy="17" r="2" />
      </>
    ),
  },
]

export default function App() {
  const { currentProfile } = useStore()
  const [view, setView] = useState<View>({ name: 'home' })
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [confetti, setConfetti] = useState(0)
  const toastId = useRef(0)

  const navigate = useCallback((v: View) => {
    setView(v)
    window.scrollTo(0, 0)
  }, [])

  const pushToast = useCallback((t: Omit<ToastItem, 'id'>) => {
    const id = ++toastId.current
    setToasts((ts) => [...ts, { ...t, id }])
    setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), 3600)
  }, [])

  const fireConfetti = useCallback(() => setConfetti((c) => c + 1), [])

  if (!currentProfile) {
    return (
      <div className="app no-nav">
        <ProfilePicker />
      </div>
    )
  }

  const isStudy = view.name === 'study'

  return (
    <div className={'app' + (isStudy ? ' no-nav' : '')}>
      <Toasts items={toasts} />
      <Confetti fire={confetti} />

      {view.name === 'home' && <Home navigate={navigate} />}
      {view.name === 'deck' && <DeckView deckId={view.deckId} navigate={navigate} />}
      {view.name === 'study' && (
        <StudySession
          deckId={view.deckId}
          modes={view.modes}
          quick={view.quick}
          navigate={navigate}
          pushToast={pushToast}
          fireConfetti={fireConfetti}
        />
      )}
      {view.name === 'create' && <CreateDeck navigate={navigate} />}
      {view.name === 'stats' && <Stats />}
      {view.name === 'achievements' && <Achievements />}
      {view.name === 'settings' && <Settings navigate={navigate} />}

      {!isStudy && (
        <nav className="bottom-nav" aria-label="Hauptnavigation">
          {NAV_ITEMS.map((item) => {
            const active = item.match.includes(view.name)
            return (
              <button
                key={item.label}
                className={'nav-item' + (active ? ' active' : '')}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
                onClick={() => navigate(item.to)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {item.icon}
                </svg>
              </button>
            )
          })}
        </nav>
      )}
    </div>
  )
}
