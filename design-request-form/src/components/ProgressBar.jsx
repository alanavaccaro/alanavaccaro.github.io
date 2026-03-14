export default function ProgressBar({ current, total }) {
  const pct = ((current + 1) / total) * 100

  return (
    <div className="progress-bar" role="progressbar" aria-valuenow={current + 1} aria-valuemax={total}>
      <div className="progress-bar__fill" style={{ width: `${pct}%` }} />
    </div>
  )
}
