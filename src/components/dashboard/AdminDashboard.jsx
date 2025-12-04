import { useState } from 'react'
import DashboardSidebar from './DashboardSidebar'
import Overview from './Overview'
import AccountSettings from './AccountSettings'

function AdminDashboard({ email, role, onSignOut }) {
  const [activeSection, setActiveSection] = useState('overview')

  return (
    <div className="dashboard-layout">
      <DashboardSidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isAdmin={true}
        role={role}
        email={email}
        onSignOut={onSignOut}
      />

      <section className="dashboard-main">
        {activeSection === 'overview' && (
          <Overview
            isAdmin={true}
            profileCompletion={0}
            examState={{ hasTakenExam: false, passed: false, score: 0, failedUntil: null }}
            isExamLocked={false}
            remainingDays={0}
            govStatus={{ status: 'not_submitted', reason: '' }}
            onSubmitForVerification={() => {}}
          />
        )}

        {activeSection === 'account' && <AccountSettings />}
      </section>
    </div>
  )
}

export default AdminDashboard

