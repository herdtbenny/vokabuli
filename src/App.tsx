import { useCallback, useState } from 'react'
import { useAuth, useUser } from '@clerk/react'
import { StoreProvider } from './store'
import type { View } from './nav'
import Home from './components/Home'
import DeckView from './components/DeckView'
import StudySession from './components/StudySession'
import CreateDeck from './components/CreateDeck'
import SignInScreen from './components/SignInScreen'
import Splash from './components/Splash'

// Angezeigter Name: Vorname, sonst Benutzername, sonst Teil der E-Mail vor dem @
function nameOf(user: ReturnType<typeof useUser>['user']): string {
  if (!user) return ''
  const fromMail = user.primaryEmailAddress?.emailAddress.split('@')[0] ?? ''
  const raw = user.firstName || user.username || fromMail
  return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : 'Du'
}

function Screens() {
  const [view, setView] = useState<View>({ name: 'home' })

  const navigate = useCallback((v: View) => {
    setView(v)
    window.scrollTo(0, 0)
  }, [])

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

export default function App() {
  const { isLoaded, isSignedIn, userId, getToken } = useAuth()
  const { user } = useUser()

  if (!isLoaded) return <Splash />
  if (!isSignedIn || !userId) return <SignInScreen />

  return (
    // key: beim Kontowechsel wird der Lernstand komplett neu geladen
    <StoreProvider key={userId} userId={userId} displayName={nameOf(user)} getToken={getToken} loading={<Splash />}>
      <Screens />
    </StoreProvider>
  )
}
