import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Header from '../layout/Header'
import Footer from '../layout/Footer'
import Hero from '../sections/Hero'
import About from '../sections/About'
import Safety from '../sections/Safety'
import Exam from '../sections/Exam'
import Process from '../sections/Process'
import Apply from '../sections/Apply'
import Notices from '../sections/Notices'
import Contact from '../sections/Contact'
import ResetPasswordModal from '../auth/ResetPasswordModal'

function Home() {
  const [authView, setAuthView] = useState('login')
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [resetModalOpen, setResetModalOpen] = useState(false)
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false)

  const applySectionRef = useRef(null)

  const scrollToApply = () => {
    if (applySectionRef.current) {
      applySectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

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
      setProfile({ role: fallbackRole })
      return
    }

    setProfile({ role: data?.role || fallbackRole })
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
  }

  const handleOpenResetModal = () => {
    setResetModalOpen(true)
    setIsPasswordRecovery(false)
  }

  return (
    <div className="site">
      <Header
        onLoginClick={() => {
          setAuthView('login')
          scrollToApply()
        }}
        onSignupClick={() => {
          setAuthView('signup')
          scrollToApply()
        }}
      />

      <main id="home">
        <Hero
          onSignupClick={() => {
            setAuthView('signup')
            scrollToApply()
          }}
          onCheckStatusClick={scrollToApply}
        />
        <About />
        <Safety />
        <Exam />
        <Process />
        <Apply
          user={user}
          authView={authView}
          setAuthView={setAuthView}
          onProfileHydrate={hydrateProfile}
          applySectionRef={applySectionRef}
          onOpenResetModal={handleOpenResetModal}
        />
        <Notices />
        <Contact />
      </main>

      <ResetPasswordModal
        isOpen={resetModalOpen}
        onClose={() => {
          setResetModalOpen(false)
          setIsPasswordRecovery(false)
        }}
        isPasswordRecovery={isPasswordRecovery}
      />

      <Footer />
    </div>
  )
}

export default Home

