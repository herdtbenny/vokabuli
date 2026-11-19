import { useCallback, useRef, useState } from 'react'
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
          mode={view.mode}
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
        <nav className="bottom-nav">
          <button
            className={'nav-item' + (['home', 'deck', 'create'].includes(view.name) ? ' active' : '')}
            onClick={() => navigate({ name: 'home' })}
          >
            <span className="ico">🏠</span>
            Lernen
          </button>
          <button className={'nav-item' + (view.name === 'stats' ? ' active' : '')} onClick={() => navigate({ name: 'stats' })}>
            <span className="ico">📊</span>
            Statistik
          </button>
          <button
            className={'nav-item' + (view.name === 'achievements' ? ' active' : '')}
            onClick={() => navigate({ name: 'achievements' })}
          >
            <span className="ico">🏅</span>
            Erfolge
          </button>
          <button
            className={'nav-item' + (view.name === 'settings' ? ' active' : '')}
            onClick={() => navigate({ name: 'settings' })}
          >
            <span className="ico">⚙️</span>
            Mehr
          </button>
        </nav>
      )}
    </div>
  )
}
