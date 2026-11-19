import { useEffect, useRef } from 'react'

// Leichtes Canvas-Konfetti ohne externe Library.
export default function Confetti({ fire }: { fire: number }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (fire === 0) return
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const W = (canvas.width = window.innerWidth)
    const H = (canvas.height = window.innerHeight)
    const colors = ['#6d5efc', '#22c55e', '#f97316', '#ef4444', '#eab308', '#06b6d4']
    const pieces = Array.from({ length: 120 }, () => ({
      x: W / 2 + (Math.random() - 0.5) * 120,
      y: H / 3,
      vx: (Math.random() - 0.5) * 12,
      vy: Math.random() * -12 - 4,
      size: Math.random() * 8 + 4,
      color: colors[(Math.random() * colors.length) | 0],
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
    }))
    let raf = 0
    let frames = 0
    const tick = () => {
      frames++
      ctx.clearRect(0, 0, W, H)
      for (const p of pieces) {
        p.vy += 0.35
        p.x += p.vx
        p.y += p.vy
        p.rot += p.vr
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
        ctx.restore()
      }
      if (frames < 140) raf = requestAnimationFrame(tick)
      else ctx.clearRect(0, 0, W, H)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [fire])

  return <canvas ref={ref} className="confetti-canvas" />
}
