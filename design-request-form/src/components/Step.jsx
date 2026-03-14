import { useEffect, useRef } from 'react'
import MultiChoice from './MultiChoice'
import TextInput from './TextInput'
import MultiField from './MultiField'
import WelcomeScreen from './WelcomeScreen'

export default function Step({ question, answers, direction, onChange, onAutoAdvance, onNext }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.classList.remove('step--enter-forward', 'step--enter-back')
    void el.offsetWidth
    el.classList.add(direction === 'forward' ? 'step--enter-forward' : 'step--enter-back')
  }, [direction])

  if (question.type === 'welcome') {
    return (
      <div ref={ref} className="step step--welcome">
        <WelcomeScreen onStart={onNext} />
      </div>
    )
  }

  return (
    <div ref={ref} className="step">
      <div className="step__inner">
        {question.type !== 'multi' && (
          <>
            <h2 className="step__label">{question.label}</h2>
            {question.sublabel && <p className="step__sublabel">{question.sublabel}</p>}
          </>
        )}

        {question.type === 'choice' && (
          <MultiChoice
            options={question.options}
            value={answers[question.id] ?? ''}
            onChange={(val) => onAutoAdvance(question.id, val)}
          />
        )}

        {question.type === 'text' && (
          <TextInput
            value={answers[question.id] ?? ''}
            onChange={(val) => onChange(question.id, val)}
            multiline={question.multiline}
            placeholder={question.placeholder}
            optional={question.optional}
          />
        )}

        {question.type === 'multi' && (
          <MultiField
            fields={question.fields}
            answers={answers}
            onChange={onChange}
          />
        )}
      </div>
    </div>
  )
}
