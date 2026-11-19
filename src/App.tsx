import { useCallback, useState } from 'react'
import { useStore } from './store'
import type { View } from './nav'
import ProfilePicker from './components/ProfilePicker'
import Home from './components/Home'
import DeckView from './components/DeckView'
import StudySession from './components/StudySession'
import CreateDeck from './components/CreateDeck'

export default function App() {
  const { currentProfile } = useStore()
  const [view, setView] = useState<View>({ name: 'home' })

  const navigate = useCallback((v: View) => {
    setView(v)
    window.scrollTo(0, 0)
  }, [])

  if (!currentProfile) {
    return (
      <div className="app">
        <ProfilePicker />
      </div>
    )
  }

  return (
    <div className="app">
      {view.name === 'home' && <Home navigate={navigate} />}
      {view.name === 'deck' && <DeckView deckId={view.deckId} navigate={navigate} />}
      {view.name === 'study' && (
        <StudySession deckId={view.deckId} modes={view.modes} quick={view.quick} navigate={navigate} />
      )}
      {view.name === 'create' && <CreateDeck navigate={navigate} />}
    </div>
  )
}
