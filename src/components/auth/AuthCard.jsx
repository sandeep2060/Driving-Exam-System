import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Login from './Login'
import Signup from './Signup'
import StatusBanner from './StatusBanner'
import { supabase } from '../../lib/supabaseClient'
import { EMAIL_REGEX } from '../../utils/constants'

function AuthCard({ user, authView, setAuthView, onProfileHydrate, onOpenResetModal }) {
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState('')
  const [resendStatus, setResendStatus] = useState({
    error: '',
    message: '',
    loading: false,
  })
  const navigate = useNavigate()

  const handleResendConfirmation = async (email) => {
    if (!email) return
    if (!EMAIL_REGEX.test(email)) {
      setResendStatus({
        error: 'Stored email is invalid. Please re-enter your email in the login form.',
        message: '',
        loading: false,
      })
      return
    }

    setResendStatus({ error: '', message: '', loading: true })
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    })

    if (error) {
      setResendStatus({ error: error.message, message: '', loading: false })
      return
    }

    setResendStatus({
      error: '',
      message: 'Verification email sent again. Please check your inbox.',
      loading: false,
    })
  }

  const handleSignupSuccess = (email) => {
    setPendingConfirmationEmail(email)
    setResendStatus({ error: '', message: '', loading: false })
    setAuthView('login')
  }

  return (
    <section className="auth-card" aria-label="Login and sign-up form">
      <header className="panel-heading">
        <p className="eyebrow">Secure login</p>
        <h2>Access your dashboard</h2>
        <p className="lede">
          Sign in to continue your application or create a new account to begin.
        </p>
      </header>

      {!user ? (
        <>
          <div className="tab-group" role="tablist">
            <button
              type="button"
              className={authView === 'login' ? 'tab active' : 'tab'}
              onClick={() => setAuthView('login')}
            >
              Login
            </button>
            <button
              type="button"
              className={authView === 'signup' ? 'tab active' : 'tab'}
              onClick={() => setAuthView('signup')}
            >
              Create account
            </button>
          </div>

          {authView === 'login' ? (
            <Login
              onProfileHydrate={onProfileHydrate}
              onResendConfirmation={(email) => {
                setPendingConfirmationEmail(email)
                handleResendConfirmation(email)
              }}
              pendingConfirmationEmail={pendingConfirmationEmail}
              resendStatus={resendStatus}
              onOpenResetModal={onOpenResetModal}
            />
          ) : (
            <Signup
              onSignupSuccess={handleSignupSuccess}
              onResendConfirmation={handleResendConfirmation}
            />
          )}

          {pendingConfirmationEmail && !user && authView === 'login' && (
            <div className="resend-box">
              <p className="resend-text">
                Didn't receive the confirmation email for{' '}
                <strong>{pendingConfirmationEmail}</strong>?
              </p>
              <button
                type="button"
                className="secondary-outline-btn small"
                onClick={() => handleResendConfirmation(pendingConfirmationEmail)}
                disabled={resendStatus.loading}
              >
                {resendStatus.loading ? 'Sending…' : 'Send confirmation link again'}
              </button>
              {(resendStatus.error || resendStatus.message) && (
                <StatusBanner status={resendStatus} />
              )}
            </div>
          )}
        </>
      ) : (
        <div className="resend-box">
          <p className="resend-text">
            You are already logged in as <strong>{user.email}</strong>.
          </p>
          <button
            type="button"
            className="primary-btn small"
            onClick={() => navigate('/dashboard')}
          >
            Open dashboard
          </button>
        </div>
      )}
    </section>
  )
}

export default AuthCard

