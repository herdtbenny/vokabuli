import { useCallback, useEffect, useState } from 'react'
import { StoreProvider } from './store'
import { checkSession, rememberProfile, rememberedProfile, type ProfileSummary } from './auth'
import type { View } from './nav'
import Home from './components/Home'
import DeckView from './components/DeckView'
import StudySession from './components/StudySession'
import CreateDeck from './components/CreateDeck'
import PasswordScreen from './components/PasswordScreen'
import ProfilePicker from './components/ProfilePicker'
import Splash from './components/Splash'

function Screens({ onSwitchProfile }: { onSwitchProfile: () => void }) {
  const [view, setView] = useState<View>({ name: 'home' })

  const navigate = useCallback((v: View) => {
    setView(v)
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="app">
      {view.name === 'home' && <Home navigate={navigate} onSwitchProfile={onSwitchProfile} />}
      {view.name === 'deck' && <DeckView deckId={view.deckId} navigate={navigate} />}
      {view.name === 'study' && (
        <StudySession deckId={view.deckId} modes={view.modes} quick={view.quick} navigate={navigate} />
      )}
      {view.name === 'create' && <CreateDeck navigate={navigate} />}
    </div>
  )
}

// Ablauf wie bei Foodie: Passwort (einmal pro Gerät) -> "Wer bist du?" -> App
export default function App() {
  // null = noch unbekannt; offline wird mit dem gemerkten Profil weitergelernt
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [profile, setProfile] = useState<ProfileSummary | null>(() => rememberedProfile())

  useEffect(() => {
    checkSession().then((ok) => setAuthed(ok === null ? rememberedProfile() !== null : ok))
  }, [])

  const pick = useCallback((p: ProfileSummary | null) => {
    rememberProfile(p)
    setProfile(p)
  }, [])

  const lostAccess = useCallback(
    (reason: 'unauthorized' | 'missing') => {
      if (reason === 'unauthorized') setAuthed(false)
      pick(null)
    },
    [pick],
  )
  const toPassword = useCallback(() => setAuthed(false), [])

  if (authed === null) return <Splash />
  if (!authed) return <PasswordScreen onDone={() => setAuthed(true)} />
  if (!profile) return <ProfilePicker onPick={pick} onUnauthorized={toPassword} />

  return (
    // key: beim Profilwechsel wird der Lernstand komplett neu geladen
    <StoreProvider key={profile.id} userId={profile.id} displayName={profile.name} onAccessLost={lostAccess} loading={<Splash />}>
      <Screens onSwitchProfile={() => pick(null)} />
    </StoreProvider>
  )
}
