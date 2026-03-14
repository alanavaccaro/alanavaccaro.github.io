import { useState, useCallback } from 'react'
import { QUESTIONS } from './questions'
import ProgressBar from './components/ProgressBar'
import Step from './components/Step'
import ThankYou from './components/ThankYou'

// Returns the index of the next visible question after `from`
function getNextIndex(from, answers) {
  for (let i = from + 1; i < QUESTIONS.length; i++) {
    const q = QUESTIONS[i]
    if (!q.condition || q.condition(answers)) return i
  }
  return from
}

// Returns the index of the previous visible question before `from`
function getPrevIndex(from, answers) {
  for (let i = from - 1; i >= 0; i--) {
    const q = QUESTIONS[i]
    if (!q.condition || q.condition(answers)) return i
  }
  return from
}

// Count of visible questions (for progress bar)
function getVisibleCount(answers) {
  return QUESTIONS.filter((q) => !q.condition || q.condition(answers)).length
}

// 1-based position of index within visible questions
function getVisiblePosition(index, answers) {
  let pos = 0
  for (let i = 0; i <= index; i++) {
    const q = QUESTIONS[i]
    if (!q.condition || q.condition(answers)) pos++
  }
  return pos
}

function canAdvanceQuestion(question, answers) {
  if (question.type === 'welcome') return true
  if (question.type === 'multi') {
    return question.fields
      .filter((f) => !f.optional)
      .every((f) => answers[f.id] && answers[f.id].trim() !== '')
  }
  if (question.optional) return true
  const val = answers[question.id]
  return val !== undefined && val !== null && val !== ''
}

export default function App() {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [direction, setDirection] = useState('forward')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const question = QUESTIONS[current]
  const nextIndex = getNextIndex(current, answers)
  const isLast = nextIndex === current
  const canAdvance = canAdvanceQuestion(question, answers)

  const goForward = useCallback(() => {
    const next = getNextIndex(current, answers)
    if (next !== current) {
      setDirection('forward')
      setCurrent(next)
    }
  }, [current, answers])

  const goBack = useCallback(() => {
    const prev = getPrevIndex(current, answers)
    if (prev !== current) {
      setDirection('back')
      setCurrent(prev)
    }
  }, [current, answers])

  const handleAnswer = useCallback((id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }, [])

  // For multiple-choice: update answer then auto-advance
  const handleAutoAdvance = useCallback(
    (id, value) => {
      const updated = { ...answers, [id]: value }
      setAnswers(updated)
      const next = getNextIndex(current, updated)
      if (next !== current) {
        setTimeout(() => {
          setDirection('forward')
          setCurrent(next)
        }, 280)
      }
    },
    [current, answers],
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
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) return <ThankYou />

  const visibleTotal = getVisibleCount(answers)
  const visiblePos = getVisiblePosition(current, answers)

  return (
    <div className="app">
      {question.type !== 'welcome' && (
        <ProgressBar current={visiblePos - 1} total={visibleTotal - 1} />
      )}

      <div className="form-area">
        <Step
          key={current}
          question={question}
          answers={answers}
          direction={direction}
          onChange={handleAnswer}
          onAutoAdvance={handleAutoAdvance}
          onNext={goForward}
        />

        {question.type !== 'welcome' && (
          <nav className="nav">
            <button
              className="btn btn--ghost"
              onClick={goBack}
              disabled={current === 0}
              aria-label="Previous question"
            >
              Back
            </button>

            {isLast ? (
              <button
                className="btn btn--primary"
                onClick={handleSubmit}
                disabled={submitting || !canAdvance}
              >
                {submitting ? 'Sending…' : 'Submit'}
              </button>
            ) : (
              <button
                className="btn btn--primary"
                onClick={goForward}
                disabled={!canAdvance}
              >
                Next
              </button>
            )}
          </nav>
        )}

        {error && <p className="error-msg">{error}</p>}
      </div>

      {question.type !== 'welcome' && (
        <footer className="form-footer">
          {visiblePos - 1} / {visibleTotal - 1}
        </footer>
      )}
    </div>
  )
}
