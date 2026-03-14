import { useState, useCallback } from 'react'
import { QUESTIONS } from './questions'
import ProgressBar from './components/ProgressBar'
import Step from './components/Step'
import ThankYou from './components/ThankYou'

const TOTAL = QUESTIONS.length

export default function App() {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [direction, setDirection] = useState('forward')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const question = QUESTIONS[current]
  const answer = answers[question?.id] ?? ''
  const isLast = current === TOTAL - 1

  const canAdvance =
    question?.optional || (answer !== '' && answer !== null && answer !== undefined)

  const go = useCallback(
    (dir) => {
      setDirection(dir)
      if (dir === 'forward') setCurrent((c) => Math.min(c + 1, TOTAL - 1))
      else setCurrent((c) => Math.max(c - 1, 0))
    },
    [],
  )

  const handleAnswer = useCallback((id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }, [])

  const handleAutoAdvance = useCallback(
    (id, value) => {
      setAnswers((prev) => ({ ...prev, [id]: value }))
      if (!isLast) {
        setTimeout(() => {
          setDirection('forward')
          setCurrent((c) => c + 1)
        }, 280)
      }
    },
    [isLast],
  )

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      })
      if (!res.ok) throw new Error('Submission failed')
      setSubmitted(true)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) return <ThankYou />

  return (
    <div className="app">
      <ProgressBar current={current} total={TOTAL} />

      <div className="form-area">
        <Step
          key={current}
          question={question}
          answer={answer}
          direction={direction}
          onChange={handleAnswer}
          onAutoAdvance={handleAutoAdvance}
        />

        <nav className="nav">
          <button
            className="btn btn--ghost"
            onClick={() => go('back')}
            disabled={current === 0}
            aria-label="Previous question"
          >
            Back
          </button>

          {isLast ? (
            <button
              className="btn btn--primary"
              onClick={handleSubmit}
              disabled={submitting || (!canAdvance)}
            >
              {submitting ? 'Sending…' : 'Submit'}
            </button>
          ) : (
            <button
              className="btn btn--primary"
              onClick={() => go('forward')}
              disabled={!canAdvance}
            >
              Next
            </button>
          )}
        </nav>

        {error && <p className="error-msg">{error}</p>}
      </div>

      <footer className="form-footer">
        {current + 1} / {TOTAL}
      </footer>
    </div>
  )
}
