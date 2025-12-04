function Header({ onLoginClick, onSignupClick }) {
  return (
    <header className="site-header">
      <div className="header-left">
        <div className="gov-mark">
          <span className="gov-emblem">🇳🇵</span>
          <div>
            <p className="gov-eyebrow">Government of Nepal</p>
            <p className="gov-title">Ministry of Physical Infrastructure & Transport</p>
          </div>
        </div>
        <p className="portal-name">Department of Transport Management</p>
      </div>

      <nav className="site-nav">
        <a href="#home">Home</a>
        <a href="#about">About</a>
        <a href="#apply">Apply</a>
        <a href="#exam">Exam Preparation</a>
        <a href="#safety">Safety Rules</a>
        
        <a href="#contact">Contact</a>
      </nav>

      <div className="header-cta">
        
        <button
          type="button"
          className="primary-btn small"
          onClick={onLoginClick}
        >
         Login
        </button>
      </div>
    </header>
  )
}

export default Header

