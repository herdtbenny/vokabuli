import { APP_NAME } from '../brand'

// Bildmarke: eine kleine Karteikarte (rote Kopflinie, blaue Linien) auf Tinten-Navy.
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <rect width="32" height="32" rx="9" fill="#16202f" />
      <rect x="6.5" y="8.5" width="19" height="15" rx="2.5" fill="#fff" />
      <rect x="6.5" y="11.5" width="19" height="1.6" fill="#e5484d" />
      <rect x="9" y="16" width="14" height="1.2" rx="0.6" fill="#c9d8f0" />
      <rect x="9" y="19.2" width="10" height="1.2" rx="0.6" fill="#c9d8f0" />
    </svg>
  )
}

export function Logo({ size = 32 }: { size?: number }) {
  return (
    <span className="logo">
      <LogoMark size={size} />
      <span className="logo-word">{APP_NAME}</span>
    </span>
  )
}
