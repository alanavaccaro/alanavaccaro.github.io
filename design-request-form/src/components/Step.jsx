import { useEffect, useRef } from 'react'
import MultiChoice from './MultiChoice'
import TextInput from './TextInput'

export default function Step({ question, answer, direction, onChange, onAutoAdvance }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.classList.remove('step--enter-forward', 'step--enter-back')
    void el.offsetWidth // force reflow
    el.classList.add(direction === 'forward' ? 'step--enter-forward' : 'step--enter-back')
  }, [direction])

  return (
    <div ref={ref} className="step">
      <div className="step__inner">
        <h2 className="step__label">{question.label}</h2>
        {question.sublabel && <p className="step__sublabel">{question.sublabel}</p>}

        {question.type === 'choice' && (
          <MultiChoice
            options={question.options}
            value={answer}
            onChange={(val) => onAutoAdvance(question.id, val)}
          />
        )}

        {question.type === 'text' && (
          <TextInput
            value={answer}
            onChange={(val) => onChange(question.id, val)}
            multiline={question.multiline}
            placeholder={question.placeholder}
            optional={question.optional}
          />
        )}
      </div>
    </div>
  )
}
