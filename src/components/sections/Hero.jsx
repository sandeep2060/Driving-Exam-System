function Hero({ onSignupClick, onCheckStatusClick }) {
  return (
    <section className="hero">
      <div className="hero-text">
        <p className="pill">
          <span className="pill-dot" />
          Official digital service
        </p>
        <h1>Nepal Driving Licence Online System</h1>
        <p className="hero-subtitle">
          Register, prepare, and apply for your driving licence easily and securely
          through the official Government of Nepal portal.
        </p>

        <div className="hero-actions">
          <button
            type="button"
            className="primary-btn large"
            onClick={onSignupClick}
          >
            Start Application
          </button>
          <button
            type="button"
            className="secondary-outline-btn large"
            onClick={onCheckStatusClick}
          >
            Check Application Status
          </button>
        </div>

        <div className="hero-meta">
          <div>
            <p className="hero-meta-label">Secure & verified</p>
            <p className="hero-meta-value">Supabase-backed authentication</p>
          </div>
          <div>
            <p className="hero-meta-label">Nationwide coverage</p>
            <p className="hero-meta-value">All DoTM offices in Nepal</p>
          </div>
        </div>
      </div>

      <div className="hero-visual">
        <div className="hero-card">
          <div className="hero-card-header">
            <span className="badge badge-success">Safe Driving</span>
            <span className="traffic-light">
              <span className="light red" />
              <span className="light yellow" />
              <span className="light green" />
            </span>
          </div>
          <p className="hero-card-title">Nepal Road Safety Programme</p>
          <p className="hero-card-body">
            Learn lane discipline, traffic signals, and safe driving practices
            before you enter the road.
          </p>
          <div className="hero-mini-grid">
            <div className="mini-card">
              <span className="mini-icon">🚗</span>
              <p className="mini-title">Practical trial</p>
              <p className="mini-text">Simulated routes, hill start, reverse parking.</p>
            </div>
            <div className="mini-card">
              <span className="mini-icon">📚</span>
              <p className="mini-title">Written prep</p>
              <p className="mini-text">Mock questions, traffic sign quizzes, and tips.</p>
            </div>
            <div className="mini-card">
              <span className="mini-icon">🛣️</span>
              <p className="mini-title">Nepal roads</p>
              <p className="mini-text">Guidance for highways, city roads, and rural routes.</p>
            </div>
            <div className="mini-card">
              <span className="mini-icon">👮‍♂️</span>
              <p className="mini-title">Traffic police</p>
              <p className="mini-text">Rules enforced by Nepal Traffic Police.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero

