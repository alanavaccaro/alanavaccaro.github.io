const LETTERS = ['A', 'B', 'C', 'D']

export default function MultiChoice({ options, value, onChange }) {
  return (
    <ul className="choices" role="list">
      {options.map((opt, i) => (
        <li key={opt}>
          <button
            className={`choice${value === opt ? ' choice--selected' : ''}`}
            onClick={() => onChange(opt)}
            type="button"
          >
            <span className="choice__key">{LETTERS[i]}</span>
            <span className="choice__label">{opt}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}
