import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import StatusBanner from './StatusBanner'

function Login({ onProfileHydrate, onResendConfirmation, pendingConfirmationEmail, resendStatus, onOpenResetModal }) {
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  })
  const [status, setStatus] = useState({
    error: '',
    message: '',
    loading: false,
  })
  const navigate = useNavigate()

  const handleLogin = async (event) => {
    event.preventDefault()
    setStatus({ error: '', message: '', loading: true })

    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginForm.email,
      password: loginForm.password,
    })

    if (error) {
      const needsConfirmation =
        typeof error.message === 'string' &&
        error.message.toLowerCase().includes('confirm')

      if (needsConfirmation) {
        setStatus({
          error: 'Please confirm your email before signing in.',
          message: '',
          loading: false,
        })
        if (onResendConfirmation) {
          onResendConfirmation(loginForm.email)
        }
      } else {
        setStatus({ error: error.message, message: '', loading: false })
      }
      return
    }

    if (onProfileHydrate) {
      await onProfileHydrate(data.user)
    }
    setLoginForm({ email: '', password: '' })
    setStatus({
      error: '',
      message: 'Signed in successfully.',
      loading: false,
    })
    navigate('/dashboard')
  }

  return (
    <>
      <form className="form" onSubmit={handleLogin}>
        <label>
          Email address
          <input
            type="email"
            value={loginForm.email}
            onChange={(event) =>
              setLoginForm((prev) => ({
                ...prev,
                email: event.target.value,
              }))
            }
            placeholder="you@example.com"
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={loginForm.password}
            onChange={(event) =>
              setLoginForm((prev) => ({
                ...prev,
                password: event.target.value,
              }))
            }
            placeholder="••••••••"
            minLength={6}
            required
          />
        </label>

        <button
          type="submit"
          className="primary-btn"
          disabled={status.loading}
        >
          {status.loading ? 'Signing in…' : 'Sign in'}
        </button>
        <button
          type="button"
          className="text-btn"
          onClick={() => {
            if (onOpenResetModal) {
              onOpenResetModal()
            }
          }}
        >
          Forgot password?
        </button>
      </form>
      <StatusBanner status={status} />
    </>
  )
}

export default Login

