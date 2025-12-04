function Overview({ isAdmin, profileCompletion, examState, isExamLocked, remainingDays, govStatus, onSubmitForVerification }) {
  const examEligibilityBadge = () => {
    if (!examState.hasTakenExam) return 'Awaiting theory exam'
    if (examState.passed) return 'Eligible for Trial Exam'
    return 'Not eligible – failed theory exam'
  }

  if (isAdmin) {
    return (
      <div className="dashboard-panels">
        <article className="panel">
          <h3>Manage instructors</h3>
          <p>
            Assign instructors to trial routes, monitor their performance, and view
            evaluation reports for each driving centre.
          </p>
        </article>
        <article className="panel">
          <h3>Regulatory notices</h3>
          <p>
            Publish compliance and safety circulars for all portal users and keep
            licence rules up to date across Nepal.
          </p>
        </article>
        <article className="panel">
          <h3>Exam &amp; trial overview</h3>
          <p className="small-text">
            View statistics of online theory exams and trial outcomes (to be wired to
            backend analytics).
          </p>
        </article>
      </div>
    )
  }

  return (
    <div className="dashboard-panels">
      <article className="panel">
        <h3>Profile completion</h3>
        <p>Your driving licence application profile should be fully completed.</p>
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${profileCompletion}%` }}
          />
        </div>
        <p className="progress-label">{profileCompletion}% completed</p>
        <p className="small-text">
          Complete your personal details, address, and documents to reach 100% and
          submit for verification.
        </p>
      </article>

      <article className="panel">
        <h3>Exam status</h3>
        <p>{examEligibilityBadge()}</p>
        {examState.hasTakenExam && (
          <p className="small-text">Last theory exam score: {examState.score}%</p>
        )}
        {isExamLocked && (
          <p className="small-text warning">
            You can retake your online exam in {remainingDays} day
            {remainingDays === 1 ? '' : 's'}.
          </p>
        )}
      </article>

      <article className="panel">
        <h3>Government verification</h3>
        <p>
          Status:{' '}
          <strong>
            {govStatus.status === 'not_submitted'
              ? 'Not submitted'
              : govStatus.status.charAt(0).toUpperCase() +
                govStatus.status.slice(1)}
          </strong>
        </p>
        {govStatus.status === 'rejected' && govStatus.reason && (
          <p className="small-text warning">Reason: {govStatus.reason}</p>
        )}
        {govStatus.status !== 'approved' && (
          <button
            type="button"
            className="secondary-outline-btn small"
            onClick={onSubmitForVerification}
            disabled={profileCompletion < 100}
          >
            {profileCompletion < 100
              ? 'Complete profile to submit'
              : 'Submit for verification'}
          </button>
        )}
      </article>
    </div>
  )
}

export default Overview

