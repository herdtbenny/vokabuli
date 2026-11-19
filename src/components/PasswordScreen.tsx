import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { login } from '../auth'
import { Logo } from './Logo'

// Schritt 1: Familien-Passwort – das Gerät merkt es sich 30 Tage.
export default function PasswordScreen({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!password) return
    setPending(true)
    setError(null)
    try {
      const err = await login(password)
      if (err) setError(err)
      else onDone()
    } catch {
      setError('Keine Verbindung zum Server.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="picker">
      <div className="picker-brand">
        <Logo size={40} />
      </div>
      <form className="auth-card" onSubmit={submit}>
        <label className="field">
          <span className="field-label">Passwort</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            autoFocus
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <button className="btn block" type="submit" disabled={pending || !password}>
          {pending ? 'Prüfe …' : 'Weiter'} <ArrowRight size={18} aria-hidden />
        </button>
      </form>
    </div>
  )
}
