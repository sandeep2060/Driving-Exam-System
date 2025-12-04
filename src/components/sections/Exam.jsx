function Exam() {
  return (
    <section id="exam" className="section exam-section">
      <div className="section-header">
        <h2>Driving Exam Information</h2>
        <p>Understand the written and practical trial exams before you apply.</p>
      </div>
      <div className="two-column">
        <article className="info-card">
          <h3>Written exam</h3>
          <ul className="bullet-list">
            <li>Multiple-choice questions on traffic signs and rules.</li>
            <li>Basic vehicle mechanics and road safety scenarios.</li>
            <li>Available in Nepali; sample sets will be provided online.</li>
          </ul>
        </article>
        <article className="info-card">
          <h3>Trial categories</h3>
          <ul className="bullet-list">
            <li>Two-wheeler (Motorcycle, Scooter).</li>
            <li>Light vehicle (Car, Jeep, Van).</li>
            <li>Heavy vehicle (Bus, Truck, Tractor, etc.).</li>
          </ul>
        </article>
      </div>
    </section>
  )
}

export default Exam

