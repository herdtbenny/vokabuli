import { useMemo, useRef, useState } from 'react'
import { useStore } from '../store'
import { isDue } from '../srs'
import { speak } from '../tts'
import { sound } from '../sound'
import { levelTitle, getAchievement } from '../gamification'
import type { Card, Rating, StudyMode } from '../types'
import type { ToastItem, View } from '../nav'

interface Props {
  deckId: string
  mode: StudyMode
  quick?: boolean
  navigate: (v: View) => void
  pushToast: (t: Omit<ToastItem, 'id'>) => void
  fireConfetti: () => void
}

const SESSION_MAX = 20

function clean(s: string): string {
  return s
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/^to\s+/, '')
    .replace(/[.,!?;:'"]/g, '')
    .trim()
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function StudySession({ deckId, mode, quick, navigate, pushToast, fireConfetti }: Props) {
  const { allDecks, currentProfile, recordAnswer } = useStore()
  const p = currentProfile!

  // Pool & Distraktoren einmalig beim Start bauen
  const { pool, distractors, deckTitle } = useMemo(() => {
    let source: Card[] = []
    let title = 'Lernen'
    if (quick || deckId === '__due__') {
      source = allDecks.flatMap((d) => d.cards).filter((c) => isDue(p.progress[c.id]))
      source = shuffle(source)
      title = 'Schnell-Review'
    } else {
      const deck = allDecks.find((d) => d.id === deckId)
      const cards = deck ? deck.cards : []
      title = deck?.title ?? 'Lernen'
      // fällige zuerst, dann neue, dann Rest
      source = [...cards].sort((a, b) => {
        const pa = p.progress[a.id]
        const pb = p.progress[b.id]
        const da = pa ? pa.due : 0
        const db = pb ? pb.due : 0
        return da - db
      })
    }
    const dist = allDecks.flatMap((d) => d.cards)
    return { pool: source.slice(0, SESSION_MAX), distractors: dist, deckTitle: title }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [picked, setPicked] = useState<string | null>(null)
  const [typed, setTyped] = useState('')
  const [typeResult, setTypeResult] = useState<'ok' | 'no' | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const perfectRef = useRef(0)
  const [done, setDone] = useState(pool.length === 0)

  const card = pool[index]

  // Optionen für Choice / Listen
  const options = useMemo(() => {
    if (!card) return []
    const wrong = shuffle(distractors.filter((c) => c.id !== card.id && c.de !== card.de))
      .slice(0, 3)
      .map((c) => c.de)
    return shuffle([card.de, ...wrong])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, card?.id])

  if (done) {
    const total = pool.length
    const pct = total ? Math.round((correctCount / total) * 100) : 0
    return (
      <div className="study-wrap">
        <div className="session-done">
          <div className="big-emoji">{pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}</div>
          <h2>Session geschafft!</h2>
          {total === 0 ? (
            <p className="muted">Hier ist gerade nichts fällig. Komm später wieder – oder lern ein anderes Deck.</p>
          ) : (
            <p className="muted">
              {correctCount} von {total} richtig ({pct}%)
            </p>
          )}
          <button className="btn block" onClick={() => navigate(quick ? { name: 'home' } : { name: 'deck', deckId })}>
            Weiter
          </button>
          <button className="btn ghost block" onClick={() => navigate({ name: 'home' })}>
            Zur Startseite
          </button>
        </div>
      </div>
    )
  }

  function handleResult(rating: Rating) {
    const correct = rating !== 'again'
    if (correct) {
      setCorrectCount((c) => c + 1)
      perfectRef.current += 1
      sound.correct()
    } else {
      perfectRef.current = 0
      sound.wrong()
    }
    const res = recordAnswer(card.id, rating, perfectRef.current)

    // Feedback: Level-up & Achievements
    let celebrate = false
    if (res.levelUp) {
      celebrate = true
      sound.levelUp()
      pushToast({ emoji: '⭐', title: `Level ${res.toLevel}!`, subtitle: levelTitle(res.toLevel) })
    }
    for (const id of res.newAchievements) {
      const a = getAchievement(id)
      if (a) {
        celebrate = true
        sound.achievement()
        pushToast({ emoji: a.emoji, title: a.title, subtitle: a.description })
      }
    }
    if (res.reachedGoal) {
      celebrate = true
      pushToast({ emoji: '🎯', title: 'Tagesziel erreicht!', subtitle: 'Stark – komm morgen wieder für deine Serie.' })
    }
    if (celebrate) fireConfetti()

    next()
  }

  function next() {
    setFlipped(false)
    setPicked(null)
    setTyped('')
    setTypeResult(null)
    if (index + 1 >= pool.length) setDone(true)
    else setIndex((i) => i + 1)
  }

  const progressPct = Math.round((index / pool.length) * 100)

  return (
    <div className="study-wrap">
      <div className="study-head">
        <button className="close" onClick={() => navigate({ name: 'home' })}>
          ✕
        </button>
        <div className="study-progress">
          <span style={{ width: progressPct + '%' }} />
        </div>
        <span className="study-count">
          {index + 1}/{pool.length}
        </span>
      </div>
      <div className="muted" style={{ textAlign: 'center', marginBottom: 4 }}>{deckTitle}</div>

      {/* ---------- FLIP ---------- */}
      {mode === 'flip' && (
        <>
          <div className="flashcard" onClick={() => !flipped && setFlipped(true)}>
            <div key={index} className={'flashcard-inner' + (flipped ? ' flipped' : '')}>
              <div className="face front">
                {card.note && <span className="note">{card.note}</span>}
                <div className="word">{card.en}</div>
                <button
                  className="speak-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    speak(card.en)
                  }}
                >
                  🔊
                </button>
                <div className="hint">Tippen zum Umdrehen</div>
              </div>
              <div className="face back">
                <div className="word" style={{ fontSize: 26 }}>
                  {card.de}
                </div>
                {card.example && <div className="example">„{card.example}"</div>}
                {card.exampleDe && <div className="example-de">{card.exampleDe}</div>}
              </div>
            </div>
          </div>
          {flipped ? (
            <div className="rate-row">
              <button className="rate-btn rate-again" onClick={() => handleResult('again')}>
                Nochmal<small>&lt; 1 Min</small>
              </button>
              <button className="rate-btn rate-hard" onClick={() => handleResult('hard')}>
                Schwer<small>bald</small>
              </button>
              <button className="rate-btn rate-good" onClick={() => handleResult('good')}>
                Gut<small>Tage</small>
              </button>
              <button className="rate-btn rate-easy" onClick={() => handleResult('easy')}>
                Leicht<small>länger</small>
              </button>
            </div>
          ) : (
            <button className="btn block" onClick={() => setFlipped(true)}>
              Umdrehen
            </button>
          )}
        </>
      )}

      {/* ---------- CHOICE ---------- */}
      {mode === 'choice' && (
        <>
          <div className="prompt-card" style={{ margin: '16px 0' }}>
            {card.note && <span className="note">{card.note}</span>}
            <div className="big">{card.en}</div>
            <button className="speak-btn" onClick={() => speak(card.en)}>
              🔊
            </button>
            <div className="muted">Was bedeutet das?</div>
          </div>
          <div className="choices">
            {options.map((opt) => {
              let cls = 'choice'
              if (picked) {
                if (opt === card.de) cls += ' correct'
                else if (opt === picked) cls += ' wrong'
                else cls += ' dim'
              }
              return (
                <button
                  key={opt}
                  className={cls}
                  disabled={!!picked}
                  onClick={() => {
                    setPicked(opt)
                    setTimeout(() => handleResult(opt === card.de ? 'good' : 'again'), 850)
                  }}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        </>
      )}

      {/* ---------- LISTEN ---------- */}
      {mode === 'listen' && (
        <>
          <div className="prompt-card" style={{ margin: '16px 0' }}>
            <button className="speak-btn" style={{ width: 80, height: 80, fontSize: 40 }} onClick={() => speak(card.en)}>
              🔊
            </button>
            <div className="muted">{picked ? card.en : 'Tippe auf den Lautsprecher & wähle die Bedeutung'}</div>
          </div>
          <div className="choices">
            {options.map((opt) => {
              let cls = 'choice'
              if (picked) {
                if (opt === card.de) cls += ' correct'
                else if (opt === picked) cls += ' wrong'
                else cls += ' dim'
              }
              return (
                <button
                  key={opt}
                  className={cls}
                  disabled={!!picked}
                  onClick={() => {
                    setPicked(opt)
                    setTimeout(() => handleResult(opt === card.de ? 'good' : 'again'), 950)
                  }}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        </>
      )}

      {/* ---------- TYPE ---------- */}
      {mode === 'type' && (
        <>
          <div className="prompt-card" style={{ margin: '16px 0' }}>
            <div className="muted">Wie heißt das auf Englisch?</div>
            <div className="big" style={{ fontSize: 26 }}>
              {card.de}
            </div>
          </div>
          {typeResult === null ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!typed.trim()) return
                const ok = clean(typed) === clean(card.en)
                setTypeResult(ok ? 'ok' : 'no')
                speak(card.en)
              }}
            >
              <input
                className="type-input"
                autoFocus
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder="Antwort eintippen…"
                autoCapitalize="none"
                autoCorrect="off"
              />
              <div className="spacer" />
              <button className="btn block" type="submit" disabled={!typed.trim()}>
                Prüfen
              </button>
            </form>
          ) : (
            <>
              <div className={'type-feedback ' + (typeResult === 'ok' ? 'ok' : 'no')}>
                {typeResult === 'ok' ? '✓ Richtig!' : `✗ Richtig wäre: ${card.en}`}
              </div>
              <div className="spacer" />
              <button className="btn block" onClick={() => handleResult(typeResult === 'ok' ? 'good' : 'again')}>
                Weiter
              </button>
            </>
          )}
        </>
      )}
    </div>
  )
}
