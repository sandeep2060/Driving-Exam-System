import { useState } from 'react'

function ExamSection({ examState, setExamState, isExamLocked, remainingDays }) {
  const handleExamSubmit = (event) => {
    event.preventDefault()
    // Simple demo: mark as passed; real implementation should calculate score
    const score = 100
    const passed = score >= 80

    if (passed) {
      setExamState({
        hasTakenExam: true,
        passed: true,
        score,
        failedUntil: null,
      })
    } else {
      const failedUntil = new Date()
      failedUntil.setDate(failedUntil.getDate() + 90)
      setExamState({
        hasTakenExam: true,
        passed: false,
        score,
        failedUntil: failedUntil.toISOString(),
      })
    }
  }

  return (
    <div className="panel">
      <h3>Online theory exam</h3>
      {!examState.passed && isExamLocked && (
        <p className="small-text warning">
          You are not eligible to retake the exam yet. You can retake your online exam in{' '}
          {remainingDays} day{remainingDays === 1 ? '' : 's'}.
        </p>
      )}
      {examState.passed && (
        <p className="small-text success">
          You have passed the theory exam and are eligible for the trial exam.
        </p>
      )}
      {!examState.passed && !isExamLocked && (
        <form className="form" onSubmit={handleExamSubmit}>
          <p className="small-text">
            Demo exam: answer the questions and submit. In a real system, questions would be
            loaded from the server.
          </p>
          {/* Replace with real questions; here we only simulate submission */}
          <button type="submit" className="primary-btn">
            Start and submit demo exam
          </button>
        </form>
      )}
    </div>
  )
}

export default ExamSection

