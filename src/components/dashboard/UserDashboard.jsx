import { useState, useMemo, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import DashboardSidebar from './DashboardSidebar'
import Overview from './Overview'
import PersonalDetails from './PersonalDetails'
import AddressDetails from './AddressDetails'
import Documents from './Documents'
import ExamSection from './ExamSection'
import AccountSettings from './AccountSettings'

function UserDashboard({ email, role, onSignOut, profile, profileId }) {
  const [activeSection, setActiveSection] = useState('overview')

  const [personalDetails, setPersonalDetails] = useState({
    fullName: '',
    dob: '',
    gender: '',
    phone: '',
    email,
    guardianName: '',
  })

  const [addressDetails, setAddressDetails] = useState({
    province: '',
    district: '',
    municipality: '',
    ward: '',
    permanentAddress: '',
    temporaryAddress: '',
    postalCode: '',
  })

  const [documents, setDocuments] = useState({
    citizenshipFront: null,
    citizenshipBack: null,
    passportPhoto: null,
    birthCertificate: null,
    signature: null,
  })

  const [govStatus, setGovStatus] = useState({
    status: 'not_submitted', // not_submitted | pending | verified | rejected
    reason: '',
  })

  // Load verification status from profile
  useEffect(() => {
    if (profile) {
      setGovStatus({
        status: profile.verification_status || 'not_submitted',
        reason: profile.verification_reason || '',
      })
    }
  }, [profile])

  const [examState, setExamState] = useState({
    hasTakenExam: false,
    passed: false,
    score: 0,
    failedUntil: null,
  })

  const profileCompletion = useMemo(() => {
    let completed = 0
    let total = 3

    const personalComplete =
      personalDetails.fullName &&
      personalDetails.dob &&
      personalDetails.gender &&
      personalDetails.phone &&
      personalDetails.guardianName

    const addressComplete =
      addressDetails.province &&
      addressDetails.district &&
      addressDetails.municipality &&
      addressDetails.ward &&
      addressDetails.permanentAddress

    const docsComplete =
      documents.citizenshipFront &&
      documents.citizenshipBack &&
      documents.passportPhoto &&
      documents.signature

    if (personalComplete) completed += 1
    if (addressComplete) completed += 1
    if (docsComplete) completed += 1

    return Math.round((completed / total) * 100)
  }, [personalDetails, addressDetails, documents])

  const isExamLocked = useMemo(() => {
    if (!examState.failedUntil) return false
    const now = new Date()
    const until = new Date(examState.failedUntil)
    return now < until
  }, [examState.failedUntil])

  const remainingDays = useMemo(() => {
    if (!examState.failedUntil) return 0
    const now = new Date()
    const until = new Date(examState.failedUntil)
    const diffMs = until.getTime() - now.getTime()
    return diffMs > 0 ? Math.ceil(diffMs / (1000 * 60 * 60 * 24)) : 0
  }, [examState.failedUntil])

  const handleSubmitForVerification = async () => {
    if (profileCompletion < 100) {
      alert('Please complete all required sections before submitting for verification.')
      return
    }
    
    if (!profileId) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          verification_status: 'pending',
          verification_reason: null,
        })
        .eq('id', profileId)

      if (error) throw error

      setGovStatus({ status: 'pending', reason: '' })
      alert('Profile submitted for verification. An admin will review it soon.')
    } catch (error) {
      console.error('Error submitting for verification:', error)
      alert('Failed to submit for verification. Please try again.')
    }
  }

  const isVerified = govStatus.status === 'verified'

  return (
    <div className="dashboard-layout">
      <DashboardSidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isAdmin={false}
        role={role}
        email={email}
        onSignOut={onSignOut}
      />

      <section className="dashboard-main">
        {activeSection === 'overview' && (
          <Overview
            isAdmin={false}
            profileCompletion={profileCompletion}
            examState={examState}
            isExamLocked={isExamLocked}
            remainingDays={remainingDays}
            govStatus={govStatus}
            onSubmitForVerification={handleSubmitForVerification}
          />
        )}

        {activeSection === 'personal' && (
          <PersonalDetails
            email={email}
            profile={profile}
            profileId={profileId}
          />
        )}

        {activeSection === 'address' && (
          <AddressDetails
            profile={profile}
            profileId={profileId}
          />
        )}

        {activeSection === 'documents' && (
          <Documents
            profile={profile}
            profileId={profileId}
          />
        )}

        {activeSection === 'exam' && (
          <ExamSection
            examState={examState}
            setExamState={setExamState}
            isExamLocked={isExamLocked}
            remainingDays={remainingDays}
            isVerified={isVerified}
          />
        )}

        {activeSection === 'account' && <AccountSettings />}
      </section>
    </div>
  )
}

export default UserDashboard

