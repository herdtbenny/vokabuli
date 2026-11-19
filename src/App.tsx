import { useCallback, useState, type ReactNode } from 'react'
import { useStore } from './store'
import type { View } from './nav'
import ProfilePicker from './components/ProfilePicker'
import Home from './components/Home'
import DeckView from './components/DeckView'
import StudySession from './components/StudySession'
import CreateDeck from './components/CreateDeck'
import Stats from './components/Stats'

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
]

export default function App() {
  const { currentProfile } = useStore()
  const [view, setView] = useState<View>({ name: 'home' })

  const navigate = useCallback((v: View) => {
    setView(v)
    window.scrollTo(0, 0)
  }, [])

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
      {view.name === 'home' && <Home navigate={navigate} />}
      {view.name === 'deck' && <DeckView deckId={view.deckId} navigate={navigate} />}
      {view.name === 'study' && (
        <StudySession deckId={view.deckId} modes={view.modes} quick={view.quick} navigate={navigate} />
      )}
      {view.name === 'create' && <CreateDeck navigate={navigate} />}
      {view.name === 'stats' && <Stats />}

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
