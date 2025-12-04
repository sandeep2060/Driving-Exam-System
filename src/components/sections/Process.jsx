function Process() {
  return (
    <section id="process" className="section process-section">
      <div className="section-header">
        <h2>Step-by-step process</h2>
        <p>Follow these steps to obtain your driving licence through the portal.</p>
      </div>
      <ol className="stepper">
        <li>
          <span className="step-number">1</span>
          <div>
            <h3>Create account</h3>
            <p>Register with your email address and choose your role.</p>
          </div>
        </li>
        <li>
          <span className="step-number">2</span>
          <div>
            <h3>Fill application form</h3>
            <p>Provide personal details, address, and licence category.</p>
          </div>
        </li>
        <li>
          <span className="step-number">3</span>
          <div>
            <h3>Book exam date</h3>
            <p>Select available written and trial exam dates for your location.</p>
          </div>
        </li>
        <li>
          <span className="step-number">4</span>
          <div>
            <h3>Pay fees</h3>
            <p>Complete secure online payment using approved channels.</p>
          </div>
        </li>
        <li>
          <span className="step-number">5</span>
          <div>
            <h3>Attend written exam</h3>
            <p>Appear at the designated DoTM office with required documents.</p>
          </div>
        </li>
        <li>
          <span className="step-number">6</span>
          <div>
            <h3>Attend trial</h3>
            <p>Complete the driving trial; successful candidates receive licence issuance notification.</p>
          </div>
        </li>
      </ol>
    </section>
  )
}

export default Process

