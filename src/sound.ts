// Kleine Erfolgs-/Fehler-Sounds per WebAudio – keine Audiodateien nötig.

let ctx: AudioContext | null = null
let enabled = true

function ac(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  return ctx
}

function tone(freq: number, start: number, duration: number, type: OscillatorType = 'sine', gain = 0.12) {
  const a = ac()
  if (!a) return
  const osc = a.createOscillator()
  const g = a.createGain()
  osc.type = type
  osc.frequency.value = freq
  g.gain.setValueAtTime(0.0001, a.currentTime + start)
  g.gain.exponentialRampToValueAtTime(gain, a.currentTime + start + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + start + duration)
  osc.connect(g)
  g.connect(a.destination)
  osc.start(a.currentTime + start)
  osc.stop(a.currentTime + start + duration)
}

export function setSoundEnabled(v: boolean) {
  enabled = v
}

export const sound = {
  correct() {
    if (!enabled) return
    tone(523.25, 0, 0.12, 'sine') // C5
    tone(659.25, 0.1, 0.14, 'sine') // E5
  },
  wrong() {
    if (!enabled) return
    tone(196, 0, 0.18, 'sawtooth', 0.08)
  },
}
