import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { EMAIL_REGEX } from '../../utils/constants'

function ResetPasswordModal({
  isOpen,
  onClose,
  isPasswordRecovery,
  onPasswordUpdated,
}) {
  const [resetEmail, setResetEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [resetStatus, setResetStatus] = useState({
    error: '',
    message: '',
    loading: false,
  })

  const closeResetModal = () => {
    setResetStatus({ error: '', message: '', loading: false })
    setResetEmail('')
    setNewPassword('')
    setConfirmNewPassword('')
    onClose()
  }

  const handleResetPasswordRequest = async (event) => {
    event.preventDefault()
    if (!EMAIL_REGEX.test(resetEmail)) {
      setResetStatus({
        error: 'Enter a valid email to receive reset instructions.',
        message: '',
        loading: false,
      })
      return
    }

    setResetStatus({ error: '', message: '', loading: true })
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: window.location.origin,
    })

    if (error) {
      setResetStatus({ error: error.message, message: '', loading: false })
      return
    }

    setResetStatus({
      error: '',
      message: 'Reset link sent. Please check your inbox.',
      loading: false,
    })
  }

  const handlePasswordUpdate = async (event) => {
    event.preventDefault()

    if (newPassword.length < 6) {
      setResetStatus({
        error: 'New password must be at least 6 characters.',
        message: '',
        loading: false,
      })
      return
    }

    if (newPassword !== confirmNewPassword) {
      setResetStatus({
        error: 'Passwords do not match.',
        message: '',
        loading: false,
      })
      return
    }

    setResetStatus({ error: '', message: '', loading: true })
    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setResetStatus({ error: error.message, message: '', loading: false })
      return
    }

    setResetStatus({
      error: '',
      message: 'Password updated. You can now sign in.',
      loading: false,
    })
    setNewPassword('')
    setConfirmNewPassword('')
    if (onPasswordUpdated) {
      onPasswordUpdated()
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <button
          type="button"
          className="modal-close"
          aria-label="Close reset password dialog"
          onClick={closeResetModal}
        >
          ×
        </button>
        {isPasswordRecovery ? (
          <>
            <h3>Set a new password</h3>
            <p className="modal-subtitle">
              Enter a new password for your Nepal Driving Licence Online System account.
            </p>
            <form className="form" onSubmit={handlePasswordUpdate}>
              <label>
                New password
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="At least 6 characters"
                  minLength={6}
                  required
                />
              </label>
              <label>
                Confirm new password
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(event) => setConfirmNewPassword(event.target.value)}
                  placeholder="Re-enter new password"
                  minLength={6}
                  required
                />
              </label>
              <button type="submit" className="primary-btn" disabled={resetStatus.loading}>
                {resetStatus.loading ? 'Updating…' : 'Update password'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h3>Forgot password</h3>
            <p className="modal-subtitle">
              Enter the email used for your account and we will send password reset instructions.
            </p>
            <form className="form" onSubmit={handleResetPasswordRequest}>
              <label>
                Email address
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(event) => setResetEmail(event.target.value)}
                  placeholder="citizen@example.com"
                  required
                />
              </label>
              <button type="submit" className="primary-btn" disabled={resetStatus.loading}>
                {resetStatus.loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          </>
        )}
        {(resetStatus.error || resetStatus.message) && (
          <div className={resetStatus.error ? 'status error' : 'status success'}>
            {resetStatus.error || resetStatus.message}
          </div>
        )}
      </div>
    </div>
  )
}

export default ResetPasswordModal

