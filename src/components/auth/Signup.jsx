import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { convertAdToBs, convertBsToAd } from '../../utils/dateUtils'
import { validateSignupForm } from '../../utils/validation'
import StatusBanner from './StatusBanner'

function Signup({ onSignupSuccess, onResendConfirmation }) {
  const [signupForm, setSignupForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    fullNameNepali: '',
    dobAd: '',
    dobBs: '',
    dobType: 'AD',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    acceptedTerms: false,
  })

  const [status, setStatus] = useState({
    error: '',
    message: '',
    loading: false,
  })

  const handleSignUp = async (event) => {
    event.preventDefault()

    const validationError = validateSignupForm(signupForm)
    if (validationError) {
      setStatus({
        error: validationError,
        message: '',
        loading: false,
      })
      return
    }

    setStatus({ error: '', message: '', loading: true })

    // Determine AD date for age validation
    const effectiveDobAd =
      signupForm.dobType === 'AD'
        ? signupForm.dobAd
        : convertBsToAd(signupForm.dobBs)

    const { data, error } = await supabase.auth.signUp({
      email: signupForm.email,
      password: signupForm.password,
      options: {
        data: {
          first_name: signupForm.firstName.trim(),
          middle_name: signupForm.middleName.trim(),
          last_name: signupForm.lastName.trim(),
          full_name_nepali: signupForm.fullNameNepali.trim(),
          dob_ad: effectiveDobAd,
          dob_bs:
            signupForm.dobType === 'BS'
              ? signupForm.dobBs
              : convertAdToBs(signupForm.dobAd),
          phone: signupForm.phone.trim(),
        },
      },
    })

    if (error) {
      setStatus({ error: error.message, message: '', loading: false })
      return
    }

    const createdUser = data.user

    if (createdUser) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: createdUser.id,
        email: signupForm.email,
        // Rely on database default role = 'user'
      })

      if (profileError && profileError.code !== '42P01') {
        setStatus({
          error: profileError.message,
          message: '',
          loading: false,
        })
        return
      }
    }

    setSignupForm({
      firstName: '',
      middleName: '',
      lastName: '',
      fullNameNepali: '',
      dobAd: '',
      dobBs: '',
      dobType: 'AD',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      acceptedTerms: false,
    })
    setStatus({
      error: '',
      message:
        'Account created. Please check your inbox and confirm your email before signing in.',
      loading: false,
    })
    if (onSignupSuccess) {
      onSignupSuccess(signupForm.email)
    }
  }

  return (
    <>
      <form className="form" onSubmit={handleSignUp}>
        <div className="name-grid">
          <label>
            First name
            <input
              type="text"
              value={signupForm.firstName}
              onChange={(event) =>
                setSignupForm((prev) => ({
                  ...prev,
                  firstName: event.target.value,
                }))
              }
              placeholder="Hari"
              required
            />
          </label>
          <label>
            Middle name
            <input
              type="text"
              value={signupForm.middleName}
              onChange={(event) =>
                setSignupForm((prev) => ({
                  ...prev,
                  middleName: event.target.value,
                }))
              }
              placeholder="Prasad (optional)"
            />
          </label>
          <label>
            Last name
            <input
              type="text"
              value={signupForm.lastName}
              onChange={(event) =>
                setSignupForm((prev) => ({
                  ...prev,
                  lastName: event.target.value,
                }))
              }
              placeholder="Sharma"
              required
            />
          </label>
        </div>

        <label>
          Full name (in Nepali)
          <input
            type="text"
            value={signupForm.fullNameNepali}
            onChange={(event) =>
              setSignupForm((prev) => ({
                ...prev,
                fullNameNepali: event.target.value,
              }))
            }
            placeholder="पूरा नाम देवनागरीमा"
            required
          />
        </label>

        <div className="dob-grid">
          <fieldset className="dob-fieldset">
            <legend>Date of birth (AD)</legend>
            <input
              type="date"
              value={signupForm.dobAd}
              onChange={(event) => {
                const value = event.target.value
                const converted = value ? convertAdToBs(value) : ''
                setSignupForm((prev) => ({
                  ...prev,
                  dobAd: value,
                  dobBs: value ? converted || prev.dobBs : '',
                  dobType: 'AD',
                }))
              }}
            />
          </fieldset>
          <fieldset className="dob-fieldset">
            <legend>Date of birth (BS)</legend>
            <input
              type="text"
              value={signupForm.dobBs}
              onChange={(event) => {
                const value = event.target.value
                const converted = value ? convertBsToAd(value) : ''
                setSignupForm((prev) => ({
                  ...prev,
                  dobBs: value,
                  dobAd: value ? converted || prev.dobAd : '',
                  dobType: 'BS',
                }))
              }}
              placeholder="YYYY-MM-DD"
            />
          </fieldset>
        </div>

        <label>
          Email address
          <input
            type="email"
            value={signupForm.email}
            onChange={(event) =>
              setSignupForm((prev) => ({
                ...prev,
                email: event.target.value,
              }))
            }
            placeholder="citizen@example.com"
            required
          />
        </label>
        <label>
          Mobile number (Nepal)
          <input
            type="tel"
            value={signupForm.phone}
            onChange={(event) =>
              setSignupForm((prev) => ({
                ...prev,
                phone: event.target.value,
              }))
            }
            placeholder="98XXXXXXXX"
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={signupForm.password}
            onChange={(event) =>
              setSignupForm((prev) => ({
                ...prev,
                password: event.target.value,
              }))
            }
            placeholder="At least 6 characters"
            minLength={6}
            required
          />
        </label>
        <label>
          Confirm password
          <input
            type="password"
            value={signupForm.confirmPassword}
            onChange={(event) =>
              setSignupForm((prev) => ({
                ...prev,
                confirmPassword: event.target.value,
              }))
            }
            placeholder="Re-enter your password"
            minLength={6}
            required
          />
        </label>

        <label className="terms-row">
          <input
            type="checkbox"
            checked={signupForm.acceptedTerms}
            onChange={(event) =>
              setSignupForm((prev) => ({
                ...prev,
                acceptedTerms: event.target.checked,
              }))
            }
            required
          />
          <span>
            I have read and agree to the{' '}
            <a href="#safety">driving safety rules</a> and the terms related
            to the online written exam.
          </span>
        </label>

        <button
          type="submit"
          className="primary-btn"
          disabled={status.loading}
        >
          {status.loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <StatusBanner status={status} />
    </>
  )
}

export default Signup

