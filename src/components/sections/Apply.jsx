import AuthCard from '../auth/AuthCard'

function Apply({ user, authView, setAuthView, onProfileHydrate, applySectionRef, onOpenResetModal }) {
  return (
    <section id="apply" ref={applySectionRef} className="section apply-section">
      <div className="section-header">
        <h2>Apply Online</h2>
        <p>
          Create your secure account or log in to continue your licence application,
          manage exam dates, and view results.
        </p>
      </div>

      <div className="apply-grid">
        <div className="apply-info">
          <h3>Citizen-friendly digital portal</h3>
          <p>
            Your personal information is encrypted and processed through secure
            government-approved systems. Only authorized officials can access your
            records.
          </p>
          <ul className="bullet-list">
            <li>Role-based dashboards for citizens and administrators.</li>
            <li>Real-time application status and notifications.</li>
            <li>Integrated exam and licence record management.</li>
          </ul>
        </div>

        <AuthCard
          user={user}
          authView={authView}
          setAuthView={setAuthView}
          onProfileHydrate={onProfileHydrate}
          onOpenResetModal={onOpenResetModal}
        />
      </div>
    </section>
  )
}

export default Apply

