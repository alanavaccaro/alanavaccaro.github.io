export default function TextInput({ value, onChange, multiline, placeholder, optional }) {
  const shared = {
    className: 'text-input',
    value,
    onChange: (e) => onChange(e.target.value),
    placeholder,
    'aria-label': placeholder,
  }

  return (
    <div className="text-input-wrap">
      {multiline ? (
        <textarea {...shared} rows={5} />
      ) : (
        <input {...shared} type="text" />
      )}
      {optional && <span className="optional-tag">Optional</span>}
    </div>
  )
}
