import { SignIn } from '@clerk/react'
import { Logo } from './Logo'

// Anmelden und Registrieren in einem Ablauf: Clerk erkennt selbst, ob das Konto neu ist.
export default function SignInScreen() {
  return (
    <div className="auth-screen">
      <div className="picker-brand">
        <Logo size={40} />
      </div>
      <SignIn routing="hash" withSignUp />
    </div>
  )
}
