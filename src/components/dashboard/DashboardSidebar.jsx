function DashboardSidebar({
  activeSection,
  setActiveSection,
  isAdmin,
  role,
  email,
  onSignOut,
}) {
  return (
    <aside className="dashboard-sidebar">
      <div className="dashboard-headings">
        <p className="eyebrow">{isAdmin ? 'Admin dashboard' : 'Citizen dashboard'}</p>
        <h2>{role} account</h2>
        <p className="lede">Signed in as {email}</p>
      </div>
      <nav className="dashboard-nav">
        {isAdmin ? (
          <>
            <button
              type="button"
              className={activeSection === 'overview' ? 'nav-item active' : 'nav-item'}
              onClick={() => setActiveSection('overview')}
            >
              Overview
            </button>
            <button
              type="button"
              className={activeSection === 'users' ? 'nav-item active' : 'nav-item'}
              onClick={() => setActiveSection('users')}
            >
              User Management
            </button>
            <button
              type="button"
              className={activeSection === 'questions' ? 'nav-item active' : 'nav-item'}
              onClick={() => setActiveSection('questions')}
            >
              Question Management
            </button>
            <button
              type="button"
              className={activeSection === 'account' ? 'nav-item active' : 'nav-item'}
              onClick={() => setActiveSection('account')}
            >
              Account settings
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className={activeSection === 'overview' ? 'nav-item active' : 'nav-item'}
              onClick={() => setActiveSection('overview')}
            >
              Overview
            </button>
            <button
              type="button"
              className={activeSection === 'personal' ? 'nav-item active' : 'nav-item'}
              onClick={() => setActiveSection('personal')}
            >
              Personal details
            </button>
            <button
              type="button"
              className={activeSection === 'address' ? 'nav-item active' : 'nav-item'}
              onClick={() => setActiveSection('address')}
            >
              Address details
            </button>
            <button
              type="button"
              className={activeSection === 'documents' ? 'nav-item active' : 'nav-item'}
              onClick={() => setActiveSection('documents')}
            >
              Documents
            </button>
            <button
              type="button"
              className={activeSection === 'exam' ? 'nav-item active' : 'nav-item'}
              onClick={() => setActiveSection('exam')}
            >
              Online exam
            </button>
            <button
              type="button"
              className={activeSection === 'account' ? 'nav-item active' : 'nav-item'}
              onClick={() => setActiveSection('account')}
            >
              Account settings
            </button>
          </>
        )}
      </nav>
      <button type="button" className="secondary-btn" onClick={onSignOut}>
        Sign out
      </button>
    </aside>
  )
}

export default DashboardSidebar

