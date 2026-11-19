import type { ToastItem } from '../nav'

export default function Toasts({ items }: { items: ToastItem[] }) {
  if (!items.length) return null
  return (
    <div className="toast-stack">
      {items.map((t) => (
        <div className="toast" key={t.id}>
          <span className="emoji">{t.emoji}</span>
          <div>
            <strong>{t.title}</strong>
            {t.subtitle && <span>{t.subtitle}</span>}
          </div>
        </div>
      ))}
    </div>
  )
}
