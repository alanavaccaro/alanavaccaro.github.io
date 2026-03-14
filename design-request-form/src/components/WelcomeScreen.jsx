export default function WelcomeScreen({ onStart }) {
  return (
    <div className="welcome">
      <div className="welcome__inner">
        <p className="welcome__eyebrow">Design inquiry</p>
        <h1 className="welcome__heading">Let's talk about your project.</h1>
        <p className="welcome__body">
          A few quick questions to help me understand what you're looking for.
          Takes about 2 minutes.
        </p>
        <button className="btn btn--primary welcome__cta" onClick={onStart}>
          Get started
        </button>
      </div>
    </div>
  )
}
