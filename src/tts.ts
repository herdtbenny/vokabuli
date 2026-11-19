// Aussprache über die Web Speech API (kostenlos, im Browser eingebaut)

let englishVoice: SpeechSynthesisVoice | null = null

function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof speechSynthesis === 'undefined') return null
  const voices = speechSynthesis.getVoices()
  if (!voices.length) return null
  // bevorzuge natürliche englische Stimmen
  const preferred =
    voices.find((v) => /en-GB/i.test(v.lang) && /google|natural|premium/i.test(v.name)) ||
    voices.find((v) => /en-US/i.test(v.lang) && /google|natural|premium/i.test(v.name)) ||
    voices.find((v) => /^en/i.test(v.lang)) ||
    null
  return preferred
}

if (typeof speechSynthesis !== 'undefined') {
  englishVoice = pickVoice()
  speechSynthesis.onvoiceschanged = () => {
    englishVoice = pickVoice()
  }
}

export function speak(text: string): void {
  if (typeof speechSynthesis === 'undefined') return
  speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  const voice = englishVoice || pickVoice()
  if (voice) u.voice = voice
  u.lang = voice?.lang || 'en-GB'
  u.rate = 0.95
  u.pitch = 1
  speechSynthesis.speak(u)
}

export function ttsAvailable(): boolean {
  return typeof speechSynthesis !== 'undefined'
}
