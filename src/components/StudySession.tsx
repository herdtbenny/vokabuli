import { useMemo, useState } from 'react'
import { Check, CircleCheck, Volume2, X } from 'lucide-react'
import { useStore } from '../store'
import { isDueReview, isNew, nextReviewLabel } from '../srs'
import { speak } from '../tts'
import { sound } from '../sound'
import type { Card, Rating, StudyMode } from '../types'
import type { View } from '../nav'

interface Props {
  deckId: string
  modes: StudyMode[]
  quick?: boolean
  navigate: (v: View) => void
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

// Grobe Wortart, damit falsche Antworten zur richtigen "passen" (Verb zu Verb, Phrase zu Phrase)
function kind(en: string): 'verb' | 'phrase' | 'word' {
  if (/^to\s/i.test(en)) return 'verb'
  return en.trim().split(/\s+/).length > 1 ? 'phrase' : 'word'
}

// Wählt plausible falsche Antworten: gleiche Kategorie, gleiche Wortart, ähnlich lange Antwort.
// field = 'de' (Englisch -> Deutsch) oder 'en' (umgekehrt: Deutsch -> Englisch)
function pickDistractors(card: Card, pool: Card[], field: 'de' | 'en', n = 3): string[] {
  const candidates = pool.filter((c) => c.id !== card.id && c[field] !== card[field])
  const k = kind(card.en)
  const len = card[field].length
  const similar = candidates
    .filter((c) => kind(c.en) === k)
    .sort((a, b) => Math.abs(a[field].length - len) - Math.abs(b[field].length - len))
  // aus den ähnlichsten zufällig wählen (Abwechslung), dann notfalls mit dem Rest auffüllen
  const ordered = [...shuffle(similar.slice(0, 12)), ...shuffle(candidates)]
  const seen = new Set([card[field]])
  const picked: string[] = []
  for (const c of ordered) {
    if (picked.length >= n) break
    if (seen.has(c[field])) continue
    seen.add(c[field])
    picked.push(c[field])
  }
  return picked
}

const MODE_LABEL: Record<StudyMode, string> = {
  flip: 'Karteikarte',
  choice: 'Multiple Choice',
  reverse: 'Umgekehrt',
  type: 'Schreiben',
  listen: 'Hören',
}

function SpeakButton({ text, large }: { text: string; large?: boolean }) {
  return (
    <button
      className={'speak-btn' + (large ? ' large' : '')}
      aria-label="Aussprache anhören"
      onClick={(e) => {
        e.stopPropagation()
        speak(text)
      }}
    >
      <Volume2 size={large ? 36 : 24} aria-hidden />
    </button>
  )
}

export default function StudySession({ deckId, modes, quick, navigate }: Props) {
  const { allDecks, currentProfile, recordAnswer } = useStore()
  const p = currentProfile!

  // Pool, Distraktoren und Lernart pro Karte einmalig beim Start festlegen
  const { pool, deckCardsOf, allCards, deckTitle, cardModes } = useMemo(() => {
    let source: Card[] = []
    let title = 'Lernen'
    const byDue = (a: Card, b: Card) => (p.progress[a.id]?.due ?? 0) - (p.progress[b.id]?.due ?? 0)
    if (quick || deckId === '__due__') {
      source = shuffle(allDecks.flatMap((d) => d.cards).filter((c) => isDueReview(p.progress[c.id])))
      title = 'Schnell-Review'
    } else {
      const deck = allDecks.find((d) => d.id === deckId)
      const cards = deck ? deck.cards : []
      title = deck?.title ?? 'Lernen'
      // fällige Wiederholungen zuerst, dann neue Karten (gemischt), dann der Rest
      const due = cards.filter((c) => isDueReview(p.progress[c.id])).sort(byDue)
      const fresh = shuffle(cards.filter((c) => isNew(p.progress[c.id])))
      const later = cards.filter((c) => !isNew(p.progress[c.id]) && !isDueReview(p.progress[c.id])).sort(byDue)
      source = [...due, ...fresh, ...later]
    }
    const chosen = source.slice(0, SESSION_MAX)
    const useModes = modes.length ? modes : (['flip'] as StudyMode[])
    // Zu jeder Karte die Karten ihrer eigenen Kategorie (auch im Schnell-Review über mehrere Kategorien)
    const deckCardsOf = new Map<string, Card[]>()
    for (const d of allDecks) for (const c of d.cards) deckCardsOf.set(c.id, d.cards)
    return {
      pool: chosen,
      deckCardsOf,
      allCards: allDecks.flatMap((d) => d.cards),
      deckTitle: title,
      cardModes: chosen.map(() => useModes[(Math.random() * useModes.length) | 0]),
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const mixed = new Set(cardModes).size > 1

  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [picked, setPicked] = useState<string | null>(null)
  const [typed, setTyped] = useState('')
  const [typeResult, setTypeResult] = useState<'ok' | 'no' | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [done, setDone] = useState(pool.length === 0)

  const card = pool[index]
  const mode: StudyMode = cardModes[index] ?? 'flip'

  // Antwortoptionen für Multiple Choice / Hören
  const options = useMemo(() => {
    if (!card) return []
    const own = deckCardsOf.get(card.id) ?? []
    const field = mode === 'reverse' ? 'en' : 'de'
    // Sehr kleine eigene Kategorien (< 4 Karten) bekommen notfalls Antworten aus allen Kategorien
    const wrong = pickDistractors(card, own.length >= 4 ? own : allCards, field)
    return shuffle([card[field], ...wrong])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, card?.id])

  if (done) {
    const total = pool.length
    const pct = total ? Math.round((correctCount / total) * 100) : 0
    return (
      <div className="study-wrap">
        <div className="session-done">
          <div className="big-icon">
            <CircleCheck size={56} strokeWidth={1.75} aria-hidden />
          </div>
          <h2>Session beendet</h2>
          {total === 0 ? (
            <p className="muted">Hier ist gerade nichts fällig. Komm später wieder – oder lern eine andere Kategorie.</p>
          ) : (
            <p className="muted">
              {correctCount} von {total} richtig ({pct} %)
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
    if (rating !== 'again') {
      setCorrectCount((c) => c + 1)
      sound.correct()
    } else {
      sound.wrong()
    }
    recordAnswer(card.id, rating)
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

  function renderChoices(delay: number) {
    const answer = mode === 'reverse' ? card.en : card.de
    return (
      <div className="choices">
        {options.map((opt) => {
          let cls = 'choice'
          if (picked) {
            if (opt === answer) cls += ' correct'
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
                if (mode === 'reverse') speak(card.en)
                setTimeout(() => handleResult(opt === answer ? 'good' : 'again'), delay)
              }}
            >
              {opt}
            </button>
          )
        })}
      </div>
    )
  }

  const progressPct = Math.round((index / pool.length) * 100)

  return (
    <div className="study-wrap">
      <div className="study-head">
        <button className="close" aria-label="Session beenden" onClick={() => navigate({ name: 'home' })}>
          <X size={20} aria-hidden />
        </button>
        <div className="study-progress">
          <span style={{ width: progressPct + '%' }} />
        </div>
        <span className="study-count">
          {index + 1}/{pool.length}
        </span>
      </div>
      <div className="muted" style={{ textAlign: 'center', marginBottom: 4 }}>
        {deckTitle}
        {mixed && <> · {MODE_LABEL[mode]}</>}
      </div>

      {/* ---------- Karteikarte ---------- */}
      {mode === 'flip' && (
        <>
          <div className="flashcard" onClick={() => !flipped && setFlipped(true)}>
            <div key={index} className={'flashcard-inner' + (flipped ? ' flipped' : '')}>
              <div className="face front">
                {card.note && <span className="note">{card.note}</span>}
                <div className="word">{card.en}</div>
                <SpeakButton text={card.en} />
                <div className="hint">Tippen zum Umdrehen</div>
              </div>
              <div className="face back">
                <div className="word" style={{ fontSize: 26 }}>
                  {card.de}
                </div>
                {card.example && <div className="example">„{card.example}“</div>}
                {card.exampleDe && <div className="example-de">{card.exampleDe}</div>}
              </div>
            </div>
          </div>
          {flipped ? (
            <>
              <p className="rate-explain">Wie gut kanntest du die Karte? Danach richtet sich, wann sie wiederkommt.</p>
              <div className="rate-row">
                <button className="rate-btn rate-again" onClick={() => handleResult('again')}>
                  Nochmal<small>in {nextReviewLabel(p.progress[card.id], 'again')}</small>
                </button>
                <button className="rate-btn rate-hard" onClick={() => handleResult('hard')}>
                  Schwer<small>in {nextReviewLabel(p.progress[card.id], 'hard')}</small>
                </button>
                <button className="rate-btn rate-good" onClick={() => handleResult('good')}>
                  Gut<small>in {nextReviewLabel(p.progress[card.id], 'good')}</small>
                </button>
                <button className="rate-btn rate-easy" onClick={() => handleResult('easy')}>
                  Leicht<small>in {nextReviewLabel(p.progress[card.id], 'easy')}</small>
                </button>
              </div>
            </>
          ) : (
            <button className="btn block" onClick={() => setFlipped(true)}>
              Umdrehen
            </button>
          )}
        </>
      )}

      {/* ---------- Multiple Choice ---------- */}
      {mode === 'choice' && (
        <>
          <div className="prompt-card" style={{ margin: '16px 0' }}>
            {card.note && <span className="note">{card.note}</span>}
            <div className="big">{card.en}</div>
            <SpeakButton text={card.en} />
            <div className="muted">Was bedeutet das?</div>
          </div>
          {renderChoices(850)}
        </>
      )}

      {/* ---------- Umgekehrt: Deutsch -> Englisch ---------- */}
      {mode === 'reverse' && (
        <>
          <div className="prompt-card">
            <div className="big" style={{ fontSize: 26 }}>
              {card.de}
            </div>
            <div className="muted">Welcher englische Begriff passt?</div>
          </div>
          {renderChoices(1100)}
        </>
      )}

      {/* ---------- Hören ---------- */}
      {mode === 'listen' && (
        <>
          <div className="prompt-card" style={{ margin: '16px 0' }}>
            <SpeakButton text={card.en} large />
            <div className="muted">{picked ? card.en : 'Tippe auf den Lautsprecher und wähle die Bedeutung'}</div>
          </div>
          {renderChoices(950)}
        </>
      )}

      {/* ---------- Schreiben ---------- */}
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
                setTypeResult(clean(typed) === clean(card.en) ? 'ok' : 'no')
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
                {typeResult === 'ok' ? (
                  <>
                    <Check size={18} aria-hidden /> Richtig!
                  </>
                ) : (
                  <>
                    <X size={18} aria-hidden /> Richtig wäre: {card.en}
                  </>
                )}
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
