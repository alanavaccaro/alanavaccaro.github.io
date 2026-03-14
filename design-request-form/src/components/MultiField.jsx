export default function MultiField({ fields, answers, onChange }) {
  return (
    <div className="multi-field">
      {fields.map((field) => (
        <div key={field.id} className="multi-field__item">
          <label className="multi-field__label" htmlFor={field.id}>
            {field.label}
            {field.optional && <span className="optional-tag"> — Optional</span>}
          </label>

          {field.multiline ? (
            <textarea
              id={field.id}
              className="text-input"
              value={answers[field.id] ?? ''}
              onChange={(e) => onChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              rows={4}
            />
          ) : (
            <input
              id={field.id}
              type={field.inputType ?? 'text'}
              className="text-input"
              value={answers[field.id] ?? ''}
              onChange={(e) => onChange(field.id, e.target.value)}
              placeholder={field.placeholder}
            />
          )}
        </div>
      ))}
    </div>
  )
}
