import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/react'
import { deDE } from '@clerk/localizations'
import './index.css'
import App from './App'

const publishableKey = import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
if (!publishableKey) {
  throw new Error('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY fehlt – `vercel env pull` ausführen.')
}

// Texte duzen (wie der Rest der App) und den Namen "Vokabuli" statt des internen Clerk-Namens zeigen
const localization = {
  ...deDE,
  signIn: {
    ...deDE.signIn,
    start: {
      ...deDE.signIn?.start,
      title: 'Bei Vokabuli anmelden',
      subtitle: 'Schön, dass du da bist',
      titleCombined: 'Willkommen bei Vokabuli',
      subtitleCombined: 'Melde dich an oder erstelle ein Konto – mit E-Mail oder Google.',
    },
  },
}

// Clerk-Oberflächen im Vokabuli-Look (Tinten-Navy, Füller-Blau, keine lila Standardfarbe)
const appearance = {
  variables: {
    colorPrimary: '#16202f',
    colorText: '#16202f',
    colorTextSecondary: '#5e6b7c',
    colorBackground: '#ffffff',
    colorInputBackground: '#ffffff',
    borderRadius: '12px',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={publishableKey} localization={localization} appearance={appearance}>
      <App />
    </ClerkProvider>
  </StrictMode>,
)
