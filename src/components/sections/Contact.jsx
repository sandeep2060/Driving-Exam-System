function Contact() {
  return (
    <section id="contact" className="section contact-section">
      <div className="section-header">
        <h2>Contact & Support</h2>
        <p>
          For technical assistance or queries regarding driving licence applications,
          please reach out to your nearest DoTM office.
        </p>
      </div>
      <div className="contact-grid">
        <div>
          <h3>Department of Transport Management</h3>
          <p>Ministry of Physical Infrastructure & Transport, Government of Nepal</p>
          <p>Kathmandu, Nepal</p>
          <p>Phone: +977-1-XXXXXXX</p>
          <p>Email: info@dotm.gov.np</p>
        </div>
        <div>
          <h3>Online Support</h3>
          <ul className="bullet-list">
            <li>Portal usage and account support.</li>
            <li>Application status and exam schedule queries.</li>
            <li>Feedback and suggestions for system improvement.</li>
          </ul>
        </div>
      </div>
    </section>
  )
}

export default Contact

