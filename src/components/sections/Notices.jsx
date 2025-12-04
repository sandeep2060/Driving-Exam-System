function Notices() {
  return (
    <section id="notices" className="section notices-section">
      <div className="section-header">
        <h2>Public Notices & Announcements</h2>
        <p>Official updates from the Department of Transport Management.</p>
      </div>
      <div className="notice-list">
        <article className="notice-card">
          <p className="notice-date">2079-12-15</p>
          <h3>Online application maintenance window</h3>
          <p>
            The portal will be temporarily unavailable from 10:00 PM to 2:00 AM
            for scheduled system upgrades and security improvements.
          </p>
        </article>
        <article className="notice-card">
          <p className="notice-date">2079-11-02</p>
          <h3>New trial routes for Kathmandu Valley</h3>
          <p>
            Updated trial exam routes and safety guidelines have been issued for
            licence categories A, B, and C.
          </p>
        </article>
        <article className="notice-card">
          <p className="notice-date">2079-10-20</p>
          <h3>Road safety awareness week</h3>
          <p>
            Citizens are encouraged to participate in awareness programmes led by
            Nepal Traffic Police across all provinces.
          </p>
        </article>
      </div>
    </section>
  )
}

export default Notices

