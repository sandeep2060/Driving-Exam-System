function About() {
  return (
    <section id="about" className="section about-section">
      <div className="section-header">
        <h2>About the Portal</h2>
        <p>
          The Nepal Driving Licence Online System is a unified digital platform for
          licence registration, written exams, trial scheduling, and renewal
          management.
        </p>
      </div>
      <div className="three-column">
        <article className="info-card">
          <h3>Online application</h3>
          <p>
            Submit your driving licence application, upload documents, and select
            your preferred DoTM office from anywhere in Nepal.
          </p>
        </article>
        <article className="info-card">
          <h3>Smart scheduling</h3>
          <p>
            View available written and trial exam dates, choose a convenient slot,
            and receive SMS/email confirmation.
          </p>
        </article>
        <article className="info-card">
          <h3>Transparent updates</h3>
          <p>
            Track your application status, exam results, and licence issuance
            progress in real time.
          </p>
        </article>
      </div>
    </section>
  )
}

export default About

