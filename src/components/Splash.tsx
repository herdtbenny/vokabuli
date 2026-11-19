import { LogoMark } from './Logo'

// Kurzer Ladezustand, solange Anmeldung bzw. Lernstand geprüft werden.
export default function Splash() {
  return (
    <div className="splash" role="status" aria-label="Wird geladen">
      <LogoMark size={48} />
    </div>
  )
}
