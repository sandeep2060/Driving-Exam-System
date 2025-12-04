import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'

function UserDetailView({ userId, onBack, onVerificationUpdate }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [verificationReason, setVerificationReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    loadUserDetails()
  }, [userId])

  const loadUserDetails = async () => {
    setLoading(true)
    try {
      // Get profile (which includes email)
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error

      // Create a user object from profile data
      const authUser = {
        email: profileData.email,
        id: profileData.id,
      }

      setUser(authUser)
      setProfile(profileData)
      setVerificationReason(profileData.verification_reason || '')
    } catch (error) {
      console.error('Error loading user details:', error)
      setMessage({ type: 'error', text: 'Failed to load user details' })
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    if (!userId) return
    setActionLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          verification_status: 'verified',
          verification_reason: null,
          verified_at: new Date().toISOString(),
        })
        .eq('id', userId)

      if (error) throw error

      setMessage({ type: 'success', text: 'User profile verified successfully!' })
      if (onVerificationUpdate) {
        onVerificationUpdate()
      }
      setTimeout(() => {
        onBack()
      }, 1500)
    } catch (error) {
      console.error('Error verifying user:', error)
      setMessage({ type: 'error', text: 'Failed to verify user profile' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!userId || !verificationReason.trim()) {
      setMessage({ type: 'error', text: 'Please provide a reason for rejection' })
      return
    }

    setActionLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          verification_status: 'rejected',
          verification_reason: verificationReason.trim(),
          verified_at: null,
        })
        .eq('id', userId)

      if (error) throw error

      setMessage({ type: 'success', text: 'User profile rejected. Reason saved.' })
      if (onVerificationUpdate) {
        onVerificationUpdate()
      }
      setTimeout(() => {
        onBack()
      }, 1500)
    } catch (error) {
      console.error('Error rejecting user:', error)
      setMessage({ type: 'error', text: 'Failed to reject user profile' })
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="panel">
        <p>Loading user details...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="panel">
        <p>User not found</p>
        <button type="button" className="secondary-btn" onClick={onBack}>
          Back to List
        </button>
      </div>
    )
  }

  const currentStatus = profile.verification_status || 'not_submitted'

  return (
    <div className="panel">
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>User Profile Details</h3>
        <button type="button" className="secondary-btn" onClick={onBack}>
          ← Back to List
        </button>
      </div>

      {message.text && (
        <div className={message.type === 'error' ? 'status error' : 'status success'} style={{ marginBottom: '1rem' }}>
          {message.text}
        </div>
      )}

      <div style={{ display: 'grid', gap: '2rem', marginBottom: '2rem' }}>
        {/* Personal Information */}
        <section>
          <h4 style={{ marginBottom: '1rem', borderBottom: '2px solid #e0e0e0', paddingBottom: '0.5rem' }}>
            Personal Information
          </h4>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            <div>
              <strong>Full Name (English):</strong>
              <p>{profile.full_name_en || 'Not provided'}</p>
            </div>
            <div>
              <strong>Full Name (Nepali):</strong>
              <p>{profile.full_name_nepali || 'Not provided'}</p>
            </div>
            <div>
              <strong>Date of Birth (AD):</strong>
              <p>{profile.dob_ad || 'Not provided'}</p>
            </div>
            <div>
              <strong>Date of Birth (BS):</strong>
              <p>{profile.dob_bs || 'Not provided'}</p>
            </div>
            <div>
              <strong>Gender:</strong>
              <p>{profile.gender || 'Not provided'}</p>
            </div>
            <div>
              <strong>Phone:</strong>
              <p>{profile.phone || 'Not provided'}</p>
            </div>
            <div>
              <strong>Email:</strong>
              <p>{user?.email || profile.email || 'Not provided'}</p>
            </div>
            <div>
              <strong>Guardian Name:</strong>
              <p>{profile.guardian_name || 'Not provided'}</p>
            </div>
          </div>
        </section>

        {/* Address Information */}
        <section>
          <h4 style={{ marginBottom: '1rem', borderBottom: '2px solid #e0e0e0', paddingBottom: '0.5rem' }}>
            Address Information
          </h4>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            <div>
              <strong>Province:</strong>
              <p>{profile.province || 'Not provided'}</p>
            </div>
            <div>
              <strong>District:</strong>
              <p>{profile.district || 'Not provided'}</p>
            </div>
            <div>
              <strong>Municipality:</strong>
              <p>{profile.municipality || 'Not provided'}</p>
            </div>
            <div>
              <strong>Ward:</strong>
              <p>{profile.ward || 'Not provided'}</p>
            </div>
            <div>
              <strong>Permanent Address:</strong>
              <p>{profile.permanent_address || 'Not provided'}</p>
            </div>
            <div>
              <strong>Temporary Address:</strong>
              <p>{profile.temporary_address || 'Not provided'}</p>
            </div>
            <div>
              <strong>Postal Code:</strong>
              <p>{profile.postal_code || 'Not provided'}</p>
            </div>
          </div>
        </section>

        {/* Government ID Information */}
        <section>
          <h4 style={{ marginBottom: '1rem', borderBottom: '2px solid #e0e0e0', paddingBottom: '0.5rem' }}>
            Government ID Information
          </h4>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            <div>
              <strong>ID Type:</strong>
              <p>{profile.government_id_type === 'citizenship' ? 'Citizenship Card' : profile.government_id_type === 'national_id' ? 'National ID Card' : 'Not provided'}</p>
            </div>
            {profile.government_id_type === 'citizenship' && (
              <>
                <div>
                  <strong>Citizenship Number:</strong>
                  <p>{profile.citizenship_number || 'Not provided'}</p>
                </div>
                <div>
                  <strong>Issue Date:</strong>
                  <p>{profile.citizenship_issue_date || 'Not provided'}</p>
                </div>
                <div>
                  <strong>Issue District:</strong>
                  <p>{profile.citizenship_issue_district || 'Not provided'}</p>
                </div>
              </>
            )}
            {profile.government_id_type === 'national_id' && (
              <div>
                <strong>National ID Number:</strong>
                <p>{profile.national_id_number || 'Not provided'}</p>
              </div>
            )}
          </div>
        </section>

        {/* Verification Status */}
        <section>
          <h4 style={{ marginBottom: '1rem', borderBottom: '2px solid #e0e0e0', paddingBottom: '0.5rem' }}>
            Verification Status
          </h4>
          <div style={{ marginBottom: '1rem' }}>
            <strong>Current Status:</strong>
            <p>
              <span className={`badge ${
                currentStatus === 'verified' ? 'badge-success' :
                currentStatus === 'rejected' ? 'badge-error' :
                currentStatus === 'pending' ? 'badge-warning' :
                'badge-neutral'
              }`}>
                {currentStatus === 'verified' ? 'Verified' :
                 currentStatus === 'rejected' ? 'Rejected' :
                 currentStatus === 'pending' ? 'Pending Review' :
                 'Not Submitted'}
              </span>
            </p>
          </div>
          {profile.verification_reason && (
            <div style={{ marginBottom: '1rem' }}>
              <strong>Previous Rejection Reason:</strong>
              <p style={{ padding: '0.75rem', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
                {profile.verification_reason}
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Action Buttons */}
      <div style={{ borderTop: '2px solid #e0e0e0', paddingTop: '1.5rem', marginTop: '2rem' }}>
        <h4 style={{ marginBottom: '1rem' }}>Verification Actions</h4>
        
        {currentStatus !== 'verified' && (
          <div style={{ marginBottom: '1rem' }}>
            <label>
              <strong>Rejection Reason (if rejecting):</strong>
              <textarea
                value={verificationReason}
                onChange={(e) => setVerificationReason(e.target.value)}
                placeholder="Enter reason for rejection (required if rejecting)"
                rows={4}
                style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', fontFamily: 'inherit' }}
              />
            </label>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {currentStatus !== 'verified' && (
            <button
              type="button"
              className="primary-btn"
              onClick={handleVerify}
              disabled={actionLoading}
            >
              {actionLoading ? 'Processing...' : '✓ Verify Profile'}
            </button>
          )}
          {currentStatus !== 'rejected' && (
            <button
              type="button"
              className="secondary-outline-btn"
              onClick={handleReject}
              disabled={actionLoading || !verificationReason.trim()}
            >
              {actionLoading ? 'Processing...' : '✗ Reject Profile'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserDetailView

