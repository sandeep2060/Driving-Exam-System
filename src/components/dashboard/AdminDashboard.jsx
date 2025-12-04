import { useState } from 'react'
import DashboardSidebar from './DashboardSidebar'
import Overview from './Overview'
import AccountSettings from './AccountSettings'
import UserList from './admin/UserList'
import UserDetailView from './admin/UserDetailView'
import QuestionManagement from './admin/QuestionManagement'

function AdminDashboard({ email, role, onSignOut }) {
  const [activeSection, setActiveSection] = useState('overview')
  const [selectedUserId, setSelectedUserId] = useState(null)

  const handleSelectUser = (userId) => {
    setSelectedUserId(userId)
    setActiveSection('user-detail')
  }

  const handleBackToList = () => {
    setSelectedUserId(null)
    setActiveSection('users')
  }

  const handleVerificationUpdate = () => {
    // This will trigger a refresh in UserList if needed
  }

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

        {activeSection === 'users' && (
          <UserList onSelectUser={handleSelectUser} />
        )}

        {activeSection === 'user-detail' && selectedUserId && (
          <UserDetailView
            userId={selectedUserId}
            onBack={handleBackToList}
            onVerificationUpdate={handleVerificationUpdate}
          />
        )}

        {activeSection === 'questions' && (
          <QuestionManagement />
        )}

        {activeSection === 'account' && <AccountSettings />}
      </section>
    </div>
  )
}

export default AdminDashboard

