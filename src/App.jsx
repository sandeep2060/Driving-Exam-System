import { useEffect, useMemo, useRef, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import './App.css'
import { supabase } from './lib/supabaseClient'
import NepaliDate from 'nepali-date-converter'

const NEPALI_PHONE_REGEX = /^(?:98\d{8}|97\d{8}|01\d{7})$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const NEPALI_NAME_REGEX = /^[\u0900-\u097F\s.]+$/
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

const convertAdToBs = (adDate) => {
  if (!ISO_DATE_REGEX.test(adDate)) return ''
  const [year, month, day] = adDate.split('-').map(Number)
  if (!year || !month || !day) return ''
  const nepaliDate = NepaliDate.fromAD(new Date(year, month - 1, day))
  return nepaliDate.format('YYYY-MM-DD')
}

const convertBsToAd = (bsDate) => {
  if (!ISO_DATE_REGEX.test(bsDate)) return ''
  const nepaliDate = new NepaliDate(bsDate)
  const adDate = nepaliDate.toJsDate()
  const pad = (value) => String(value).padStart(2, '0')
  return `${adDate.getFullYear()}-${pad(adDate.getMonth() + 1)}-${pad(adDate.getDate())}`
}

const calculateAgeFromIsoDate = (isoDate) => {
  if (!isoDate) return null
  const [year, month, day] = isoDate.split('-').map(Number)
  if (!year || !month || !day) return null

  const today = new Date()
  const dob = new Date(year, month - 1, day)

  let age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()
  const dayDiff = today.getDate() - dob.getDate()

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1
  }

  return age
}

function Home() {
  const [authView, setAuthView] = useState('login')

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
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  })

  const [status, setStatus] = useState({
    error: '',
    message: '',
    loading: false,
  })
  const [resetModalOpen, setResetModalOpen] = useState(false)
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetStatus, setResetStatus] = useState({
    error: '',
    message: '',
    loading: false,
  })
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState('')
  const [resendStatus, setResendStatus] = useState({
    error: '',
    message: '',
    loading: false,
  })

  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)

  const applySectionRef = useRef(null)
  const navigate = useNavigate()

  const scrollToApply = () => {
    if (applySectionRef.current) {
      applySectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const roleLabel = useMemo(
    () =>
      profile?.role === 'admin'
        ? 'Admin'
        : profile?.role === 'user'
          ? 'User'
          : 'Viewer',
    [profile?.role],
  )

  useEffect(() => {
    const bootstrap = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session?.user) {
        setUser(data.session.user)
        await hydrateProfile(data.session.user)
      }
    }

    bootstrap()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const authUser = session?.user ?? null
      setUser(authUser)
      if (authUser) {
        hydrateProfile(authUser)
      } else {
        setProfile(null)
      }

      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true)
        setResetModalOpen(true)
        setResetStatus({
          error: '',
          message: 'Please create a new password to continue.',
          loading: false,
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const hydrateProfile = async (authUser) => {
    if (!authUser) return
    const fallbackRole = authUser.user_metadata?.role || 'user'
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authUser.id)
      .single()

    if (error) {
      if (error.code === '42P01') {
        // Profiles table not created yet; rely on auth metadata.
        setProfile({ role: fallbackRole })
        return
      }
      setStatus((prev) => ({
        ...prev,
        error: error.message,
        message: '',
        loading: false,
      }))
      setProfile({ role: fallbackRole })
      return
    }

    setProfile({ role: data?.role || fallbackRole })
  }

  const handleSignUp = async (event) => {
    event.preventDefault()

    // Basic required fields
    if (!signupForm.firstName.trim() || !signupForm.lastName.trim()) {
      setStatus({
        error: 'Please enter your first and last name.',
        message: '',
        loading: false,
      })
      return
    }

    if (!signupForm.dobAd && !signupForm.dobBs) {
      setStatus({
        error: 'Please enter your date of birth in AD or BS.',
        message: '',
        loading: false,
      })
      return
    }

    if (!signupForm.fullNameNepali.trim()) {
      setStatus({
        error: 'Please enter your full name in Nepali.',
        message: '',
        loading: false,
      })
      return
    }
    if (!NEPALI_NAME_REGEX.test(signupForm.fullNameNepali.trim())) {
      setStatus({
        error: 'Full name in Nepali must use Devanagari characters only.',
        message: '',
        loading: false,
      })
      return
    }

    // Determine AD date for age validation
    const effectiveDobAd =
      signupForm.dobType === 'AD'
        ? signupForm.dobAd
        : convertBsToAd(signupForm.dobBs)

    const age = calculateAgeFromIsoDate(effectiveDobAd)
    if (age == null) {
      setStatus({
        error: 'Please enter a valid date of birth.',
        message: '',
        loading: false,
      })
      return
    }

    if (age < 18) {
      setStatus({
        error: 'You must be at least 18 years old to create an account.',
        message: '',
        loading: false,
      })
      return
    }

    if (!EMAIL_REGEX.test(signupForm.email)) {
      setStatus({
        error: 'Please enter a valid email address.',
        message: '',
        loading: false,
      })
      return
    }

    if (!NEPALI_PHONE_REGEX.test(signupForm.phone.trim())) {
      setStatus({
        error:
          'Please enter a valid Nepali phone number (e.g. 98XXXXXXXX or 01XXXXXXX).',
        message: '',
        loading: false,
      })
      return
    }

    if (!signupForm.password || signupForm.password.length < 6) {
      setStatus({
        error: 'Password must be at least 6 characters long.',
        message: '',
        loading: false,
      })
      return
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      setStatus({
        error: 'Password and confirm password do not match.',
        message: '',
        loading: false,
      })
      return
    }

    if (!signupForm.acceptedTerms) {
      setStatus({
        error:
          'You must agree to the terms and conditions related to the online written exam and driving rules.',
        message: '',
        loading: false,
      })
      return
    }

    setStatus({ error: '', message: '', loading: true })

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
    setPendingConfirmationEmail(signupForm.email)
    setResendStatus({ error: '', message: '', loading: false })
    setAuthView('login')
  }

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
        setPendingConfirmationEmail(loginForm.email)
        setResendStatus({ error: '', message: '', loading: false })
      } else {
        setStatus({ error: error.message, message: '', loading: false })
        setPendingConfirmationEmail('')
        setResendStatus({ error: '', message: '', loading: false })
      }
      return
    }

    await hydrateProfile(data.user)
    setLoginForm({ email: '', password: '' })
    setStatus({
      error: '',
      message: 'Signed in successfully.',
      loading: false,
    })
    setPendingConfirmationEmail('')
    setResendStatus({ error: '', message: '', loading: false })
    navigate('/dashboard')
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
    setStatus({ error: '', message: 'Signed out.', loading: false })
  }

  const activeRole = profile?.role || 'user'
  const isAdmin = activeRole === 'admin'

  const closeResetModal = () => {
    setResetModalOpen(false)
    setIsPasswordRecovery(false)
    setResetStatus({ error: '', message: '', loading: false })
    setResetEmail('')
    setNewPassword('')
    setConfirmNewPassword('')
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
    setIsPasswordRecovery(false)
    setNewPassword('')
    setConfirmNewPassword('')
  }

  const handleResendConfirmation = async () => {
    if (!pendingConfirmationEmail) return
    if (!EMAIL_REGEX.test(pendingConfirmationEmail)) {
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
      email: pendingConfirmationEmail,
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

  return (
    <div className="site">
      <header className="site-header">
        <div className="header-left">
          <div className="gov-mark">
            <span className="gov-emblem">🇳🇵</span>
      <div>
              <p className="gov-eyebrow">Government of Nepal</p>
              <p className="gov-title">Ministry of Physical Infrastructure & Transport</p>
      </div>
          </div>
          <p className="portal-name">Department of Transport Management</p>
        </div>

        <nav className="site-nav">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#apply">Apply</a>
          <a href="#exam">Exam Preparation</a>
          <a href="#safety">Safety Rules</a>
          <a href="#notices">Notices</a>
          <a href="#contact">Contact</a>
        </nav>

        <div className="header-cta">
          <button
            type="button"
            className="ghost-btn"
            onClick={() => {
              setAuthView('login')
              scrollToApply()
            }}
          >
            Login
        </button>
          <button
            type="button"
            className="primary-btn small"
            onClick={() => {
              setAuthView('signup')
              scrollToApply()
            }}
          >
            Sign up
          </button>
        </div>
      </header>

      <main id="home">
        <section className="hero">
          <div className="hero-text">
            <p className="pill">
              <span className="pill-dot" />
              Official digital service
            </p>
            <h1>Nepal Driving Licence Online System</h1>
            <p className="hero-subtitle">
              Register, prepare, and apply for your driving licence easily and securely
              through the official Government of Nepal portal.
            </p>

            <div className="hero-actions">
              <button
                type="button"
                className="primary-btn large"
                onClick={() => {
                  setAuthView('signup')
                  scrollToApply()
                }}
              >
                Start Application
              </button>
              <button
                type="button"
                className="secondary-outline-btn large"
                onClick={scrollToApply}
              >
                Check Application Status
              </button>
            </div>

            <div className="hero-meta">
              <div>
                <p className="hero-meta-label">Secure & verified</p>
                <p className="hero-meta-value">Supabase-backed authentication</p>
              </div>
              <div>
                <p className="hero-meta-label">Nationwide coverage</p>
                <p className="hero-meta-value">All DoTM offices in Nepal</p>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-card">
              <div className="hero-card-header">
                <span className="badge badge-success">Safe Driving</span>
                <span className="traffic-light">
                  <span className="light red" />
                  <span className="light yellow" />
                  <span className="light green" />
                </span>
              </div>
              <p className="hero-card-title">Nepal Road Safety Programme</p>
              <p className="hero-card-body">
                Learn lane discipline, traffic signals, and safe driving practices
                before you enter the road.
              </p>
              <div className="hero-mini-grid">
                <div className="mini-card">
                  <span className="mini-icon">🚗</span>
                  <p className="mini-title">Practical trial</p>
                  <p className="mini-text">Simulated routes, hill start, reverse parking.</p>
                </div>
                <div className="mini-card">
                  <span className="mini-icon">📚</span>
                  <p className="mini-title">Written prep</p>
                  <p className="mini-text">Mock questions, traffic sign quizzes, and tips.</p>
                </div>
                <div className="mini-card">
                  <span className="mini-icon">🛣️</span>
                  <p className="mini-title">Nepal roads</p>
                  <p className="mini-text">Guidance for highways, city roads, and rural routes.</p>
                </div>
                <div className="mini-card">
                  <span className="mini-icon">👮‍♂️</span>
                  <p className="mini-title">Traffic police</p>
                  <p className="mini-text">Rules enforced by Nepal Traffic Police.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="section about-section">
          <div className="section-header">
            <h2>About the Portal</h2>
            <p>
              The Nepal Driving Licence Online System is a unified digital platform for
              licence registration, written exams, trial scheduling, and renewal
              management.
        </p>
      </div>
          <div className="three-column">
            <article className="info-card">
              <h3>Online application</h3>
              <p>
                Submit your driving licence application, upload documents, and select
                your preferred DoTM office from anywhere in Nepal.
              </p>
            </article>
            <article className="info-card">
              <h3>Smart scheduling</h3>
              <p>
                View available written and trial exam dates, choose a convenient slot,
                and receive SMS/email confirmation.
              </p>
            </article>
            <article className="info-card">
              <h3>Transparent updates</h3>
              <p>
                Track your application status, exam results, and licence issuance
                progress in real time.
              </p>
            </article>
          </div>
        </section>

        <section id="safety" className="section safety-section">
          <div className="section-header">
            <h2>Driving Safety Rules</h2>
            <p>
              Every citizen shares responsibility for road safety. Learn and follow
              these essential rules before you drive.
            </p>
          </div>
          <div className="icon-grid">
            <article className="icon-card">
              <div className="icon-circle">🚦</div>
              <h3>Traffic signals</h3>
              <p>Obey traffic lights, stop lines, and traffic police hand signals.</p>
            </article>
            <article className="icon-card">
              <div className="icon-circle">🪖</div>
              <h3>Helmet & seatbelt</h3>
              <p>Always wear a BIS-standard helmet and fasten your seatbelt.</p>
            </article>
            <article className="icon-card">
              <div className="icon-circle">📏</div>
              <h3>Speed limits</h3>
              <p>Follow posted speed limits and slow down near schools and hospitals.</p>
            </article>
            <article className="icon-card">
              <div className="icon-circle">🛣️</div>
              <h3>Lane discipline</h3>
              <p>Keep to your lane, use indicators, and avoid sudden lane changes.</p>
            </article>
            <article className="icon-card">
              <div className="icon-circle">🚸</div>
              <h3>Zebra crossings</h3>
              <p>Stop for pedestrians at crossings and give priority to school children.</p>
            </article>
            <article className="icon-card">
              <div className="icon-circle">🚫</div>
              <h3>No drunk driving</h3>
              <p>Never drive under the influence of alcohol or narcotic substances.</p>
            </article>
          </div>
        </section>

        <section id="exam" className="section exam-section">
          <div className="section-header">
            <h2>Driving Exam Information</h2>
            <p>Understand the written and practical trial exams before you apply.</p>
          </div>
          <div className="two-column">
            <article className="info-card">
              <h3>Written exam</h3>
              <ul className="bullet-list">
                <li>Multiple-choice questions on traffic signs and rules.</li>
                <li>Basic vehicle mechanics and road safety scenarios.</li>
                <li>Available in Nepali; sample sets will be provided online.</li>
              </ul>
            </article>
            <article className="info-card">
              <h3>Trial categories</h3>
              <ul className="bullet-list">
                <li>Two-wheeler (Motorcycle, Scooter).</li>
                <li>Light vehicle (Car, Jeep, Van).</li>
                <li>Heavy vehicle (Bus, Truck, Tractor, etc.).</li>
              </ul>
            </article>
          </div>
        </section>

        <section id="process" className="section process-section">
          <div className="section-header">
            <h2>Step-by-step process</h2>
            <p>Follow these steps to obtain your driving licence through the portal.</p>
          </div>
          <ol className="stepper">
            <li>
              <span className="step-number">1</span>
              <div>
                <h3>Create account</h3>
                <p>Register with your email address and choose your role.</p>
              </div>
            </li>
            <li>
              <span className="step-number">2</span>
              <div>
                <h3>Fill application form</h3>
                <p>Provide personal details, address, and licence category.</p>
              </div>
            </li>
            <li>
              <span className="step-number">3</span>
              <div>
                <h3>Book exam date</h3>
                <p>Select available written and trial exam dates for your location.</p>
              </div>
            </li>
            <li>
              <span className="step-number">4</span>
              <div>
                <h3>Pay fees</h3>
                <p>Complete secure online payment using approved channels.</p>
              </div>
            </li>
            <li>
              <span className="step-number">5</span>
              <div>
                <h3>Attend written exam</h3>
                <p>Appear at the designated DoTM office with required documents.</p>
              </div>
            </li>
            <li>
              <span className="step-number">6</span>
              <div>
                <h3>Attend trial</h3>
                <p>Complete the driving trial; successful candidates receive licence issuance notification.</p>
              </div>
            </li>
          </ol>
        </section>

        <section id="apply" ref={applySectionRef} className="section apply-section">
          <div className="section-header">
            <h2>Apply Online</h2>
            <p>
              Create your secure account or log in to continue your licence application,
              manage exam dates, and view results.
            </p>
          </div>

          <div className="apply-grid">
            <div className="apply-info">
              <h3>Citizen-friendly digital portal</h3>
              <p>
                Your personal information is encrypted and processed through secure
                government-approved systems. Only authorized officials can access your
                records.
              </p>
              <ul className="bullet-list">
                <li>Role-based dashboards for citizens and administrators.</li>
                <li>Real-time application status and notifications.</li>
                <li>Integrated exam and licence record management.</li>
              </ul>
            </div>

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
                          setResetModalOpen(true)
                          setIsPasswordRecovery(false)
                        }}
                      >
                        Forgot password?
                      </button>
                    </form>
                  ) : (
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

              <StatusBanner status={status} />
              {pendingConfirmationEmail && !user && authView === 'login' && (
                <div className="resend-box">
                  <p className="resend-text">
                    Didn’t receive the confirmation email for{' '}
                    <strong>{pendingConfirmationEmail}</strong>?
                  </p>
                  <button
                    type="button"
                    className="secondary-outline-btn small"
                    onClick={handleResendConfirmation}
                    disabled={resendStatus.loading}
                  >
                    {resendStatus.loading ? 'Sending…' : 'Send confirmation link again'}
                  </button>
                  {(resendStatus.error || resendStatus.message) && (
                    <div className={resendStatus.error ? 'status error' : 'status success'}>
                      {resendStatus.error || resendStatus.message}
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        </section>

        <section id="notices" className="section notices-section">
          <div className="section-header">
            <h2>Public Notices & Announcements</h2>
            <p>Official updates from the Department of Transport Management.</p>
          </div>
          <div className="notice-list">
            <article className="notice-card">
              <p className="notice-date">2079-12-15</p>
              <h3>Online application maintenance window</h3>
              <p>
                The portal will be temporarily unavailable from 10:00 PM to 2:00 AM
                for scheduled system upgrades and security improvements.
              </p>
            </article>
            <article className="notice-card">
              <p className="notice-date">2079-11-02</p>
              <h3>New trial routes for Kathmandu Valley</h3>
              <p>
                Updated trial exam routes and safety guidelines have been issued for
                licence categories A, B, and C.
              </p>
            </article>
            <article className="notice-card">
              <p className="notice-date">2079-10-20</p>
              <h3>Road safety awareness week</h3>
              <p>
                Citizens are encouraged to participate in awareness programmes led by
                Nepal Traffic Police across all provinces.
              </p>
            </article>
          </div>
        </section>

        <section id="contact" className="section contact-section">
          <div className="section-header">
            <h2>Contact & Support</h2>
            <p>
              For technical assistance or queries regarding driving licence applications,
              please reach out to your nearest DoTM office.
            </p>
          </div>
          <div className="contact-grid">
            <div>
              <h3>Department of Transport Management</h3>
              <p>Ministry of Physical Infrastructure & Transport, Government of Nepal</p>
              <p>Kathmandu, Nepal</p>
              <p>Phone: +977-1-XXXXXXX</p>
              <p>Email: info@dotm.gov.np</p>
            </div>
            <div>
              <h3>Online Support</h3>
              <ul className="bullet-list">
                <li>Portal usage and account support.</li>
                <li>Application status and exam schedule queries.</li>
                <li>Feedback and suggestions for system improvement.</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      {resetModalOpen && (
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
      )}

      <Footer />
    </div>
  )
}

function Dashboard({ email, isAdmin, role, onSignOut }) {
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
    status: 'not_submitted', // not_submitted | pending | approved | rejected
    reason: '',
  })

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

  const handleDocChange = (key, fileList) => {
    const file = fileList?.[0] || null
    if (!file) {
      setDocuments((prev) => ({ ...prev, [key]: null }))
      return
    }
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      alert('Only JPG and PNG images are allowed.')
      return
    }
    if (file.size > 3 * 1024 * 1024) {
      alert('File must be smaller than 3MB.')
      return
    }
    setDocuments((prev) => ({ ...prev, [key]: file }))
  }

  const handleSubmitForVerification = () => {
    if (profileCompletion < 100) {
      alert('Please complete all required sections before submitting for verification.')
      return
    }
    setGovStatus({ status: 'pending', reason: '' })
  }

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

  const examEligibilityBadge = useMemo(() => {
    if (!examState.hasTakenExam) return 'Awaiting theory exam'
    if (examState.passed) return 'Eligible for Trial Exam'
    return 'Not eligible – failed theory exam'
  }, [examState])

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="dashboard-headings">
          <p className="eyebrow">Citizen dashboard</p>
          <h2>{role} account</h2>
          <p className="lede">Signed in as {email}</p>
        </div>
        <nav className="dashboard-nav">
          <button
            type="button"
            className={activeSection === 'overview' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveSection('overview')}
          >
            Overview
          </button>
          <button
            type="button"
            className={activeSection === 'personal' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveSection('personal')}
          >
            Personal details
          </button>
          <button
            type="button"
            className={activeSection === 'address' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveSection('address')}
          >
            Address details
          </button>
          <button
            type="button"
            className={activeSection === 'documents' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveSection('documents')}
          >
            Documents
          </button>
          <button
            type="button"
            className={activeSection === 'exam' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveSection('exam')}
          >
            Online exam
          </button>
        </nav>
        <button type="button" className="secondary-btn" onClick={onSignOut}>
          Sign out
        </button>
      </aside>

      <section className="dashboard-main">
        {activeSection === 'overview' && (
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
            </article>

            <article className="panel">
              <h3>Exam status</h3>
              <p>{examEligibilityBadge}</p>
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
                  onClick={handleSubmitForVerification}
                >
                  Submit for verification
                </button>
              )}
            </article>
          </div>
        )}

        {activeSection === 'personal' && (
          <div className="panel">
            <h3>Personal details</h3>
            <p className="lede small-text">
              Enter your personal information exactly as it appears on your official documents.
            </p>
            <form className="form">
              <label>
                Full name
                <input
                  type="text"
                  value={personalDetails.fullName}
                  onChange={(event) =>
                    setPersonalDetails((prev) => ({
                      ...prev,
                      fullName: event.target.value,
                    }))
                  }
                  placeholder="Full name"
                />
              </label>
              <label>
                Date of birth
                <input
                  type="date"
                  value={personalDetails.dob}
                  onChange={(event) =>
                    setPersonalDetails((prev) => ({
                      ...prev,
                      dob: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Gender
                <select
                  value={personalDetails.gender}
                  onChange={(event) =>
                    setPersonalDetails((prev) => ({
                      ...prev,
                      gender: event.target.value,
                    }))
                  }
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label>
                Phone number
                <input
                  type="tel"
                  value={personalDetails.phone}
                  onChange={(event) =>
                    setPersonalDetails((prev) => ({
                      ...prev,
                      phone: event.target.value,
                    }))
                  }
                  placeholder="98XXXXXXXX"
                />
              </label>
              <label>
                Email (read-only)
                <input type="email" value={email} readOnly />
              </label>
              <label>
                Father / Mother name
                <input
                  type="text"
                  value={personalDetails.guardianName}
                  onChange={(event) =>
                    setPersonalDetails((prev) => ({
                      ...prev,
                      guardianName: event.target.value,
                    }))
                  }
                  placeholder="Father or Mother full name"
                />
              </label>
            </form>
          </div>
        )}

        {activeSection === 'address' && (
          <div className="panel">
            <h3>Address details</h3>
            <p className="lede small-text">
              Provide your permanent and current address as per government records.
            </p>
            <form className="form">
              <label>
                Province / State
                <select
                  value={addressDetails.province}
                  onChange={(event) =>
                    setAddressDetails((prev) => ({
                      ...prev,
                      province: event.target.value,
                    }))
                  }
                >
                  <option value="">Select province</option>
                  <option value="1">Koshi Province</option>
                  <option value="2">Madhesh Province</option>
                  <option value="3">Bagmati Province</option>
                  <option value="4">Gandaki Province</option>
                  <option value="5">Lumbini Province</option>
                  <option value="6">Karnali Province</option>
                  <option value="7">Sudurpashchim Province</option>
                </select>
              </label>
              <label>
                District
                <input
                  type="text"
                  value={addressDetails.district}
                  onChange={(event) =>
                    setAddressDetails((prev) => ({
                      ...prev,
                      district: event.target.value,
                    }))
                  }
                  placeholder="District"
                />
              </label>
              <label>
                Municipality / City
                <input
                  type="text"
                  value={addressDetails.municipality}
                  onChange={(event) =>
                    setAddressDetails((prev) => ({
                      ...prev,
                      municipality: event.target.value,
                    }))
                  }
                  placeholder="Municipality or city"
                />
              </label>
              <label>
                Ward number
                <input
                  type="number"
                  value={addressDetails.ward}
                  onChange={(event) =>
                    setAddressDetails((prev) => ({
                      ...prev,
                      ward: event.target.value,
                    }))
                  }
                  min={1}
                />
              </label>
              <label>
                Permanent address
                <input
                  type="text"
                  value={addressDetails.permanentAddress}
                  onChange={(event) =>
                    setAddressDetails((prev) => ({
                      ...prev,
                      permanentAddress: event.target.value,
                    }))
                  }
                  placeholder="Village / Tole"
                />
              </label>
              <label>
                Temporary address
                <input
                  type="text"
                  value={addressDetails.temporaryAddress}
                  onChange={(event) =>
                    setAddressDetails((prev) => ({
                      ...prev,
                      temporaryAddress: event.target.value,
                    }))
                  }
                  placeholder="If different from permanent"
                />
              </label>
              <label>
                Postal code
                <input
                  type="text"
                  value={addressDetails.postalCode}
                  onChange={(event) =>
                    setAddressDetails((prev) => ({
                      ...prev,
                      postalCode: event.target.value,
                    }))
                  }
                  placeholder="Postal / ZIP code"
                />
              </label>
            </form>
          </div>
        )}

        {activeSection === 'documents' && (
          <div className="panel">
            <h3>Government documents</h3>
            <p className="lede small-text">
              Upload clear, recent scans or photos of your official documents.
            </p>
            <form className="form">
              <label>
                National ID / Citizenship (front)
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleDocChange('citizenshipFront', event.target.files)}
                />
              </label>
              <label>
                National ID / Citizenship (back)
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleDocChange('citizenshipBack', event.target.files)}
                />
              </label>
              <label>
                Passport-size photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleDocChange('passportPhoto', event.target.files)}
                />
              </label>
              <label>
                Birth certificate (optional)
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleDocChange('birthCertificate', event.target.files)}
                />
              </label>
              <label>
                Scanned signature
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleDocChange('signature', event.target.files)}
                />
              </label>
            </form>
          </div>
        )}

        {activeSection === 'exam' && (
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
        )}
      </section>
    </div>
  )
}

function StatusBanner({ status }) {
  if (!status.error && !status.message) return null

  return (
    <div className={status.error ? 'status error' : 'status success'}>
      {status.error || status.message}
    </div>
  )
}

function DashboardPage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession()
      const authUser = data.session?.user
      if (!authUser) {
        navigate('/')
        return
      }
      setUser(authUser)

      const fallbackRole = authUser.user_metadata?.role || 'user'
      const { data: profileRow } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authUser.id)
        .single()
      setProfile({ role: profileRow?.role || fallbackRole })
    }

    init()
  }, [navigate])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (!user || !profile) {
    return (
      <div className="site">
        <main className="app">
          <p>Loading dashboard…</p>
        </main>
      </div>
    )
  }

  const activeRole = profile.role || 'user'
  const isAdmin = activeRole === 'admin'
  const roleLabel = isAdmin ? 'Admin' : 'User'

  return (
    <div className="site">
      <main className="app">
        <Dashboard
          email={user.email}
          isAdmin={isAdmin}
          role={roleLabel}
          onSignOut={handleSignOut}
        />
      </main>
      <Footer />
    </div>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div>
          <p className="footer-title">Nepal Driving Licence Online System</p>
          <p className="footer-text">
            An official initiative of the Government of Nepal to make driving licence
            services simple, transparent, and citizen-friendly.
          </p>
        </div>
        <div className="footer-links">
          <div>
            <p className="footer-heading">Government links</p>
            <a href="#">Ministry of Physical Infrastructure & Transport</a>
            <a href="#">Department of Transport Management</a>
            <a href="#">Nepal Traffic Police</a>
          </div>
          <div>
            <p className="footer-heading">Support</p>
            <a href="#">FAQs</a>
            <a href="#">Help & documentation</a>
            <a href="#">Feedback</a>
          </div>
          <div>
            <p className="footer-heading">Connect</p>
            <a href="#">Facebook</a>
            <a href="#">Twitter</a>
            <a href="#">YouTube</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Government of Nepal. All rights reserved.</p>
      </div>
    </footer>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<DashboardPage />} />
    </Routes>
  )
}

export default App