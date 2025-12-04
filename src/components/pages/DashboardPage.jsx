import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import Footer from '../layout/Footer'
import UserDashboard from '../dashboard/UserDashboard'
import AdminDashboard from '../dashboard/AdminDashboard'

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
        .select(
          'role, full_name_en, dob_ad, gender, phone, guardian_name, province, district, municipality, ward, permanent_address, temporary_address, postal_code, government_id_type, citizenship_number, citizenship_issue_date, citizenship_issue_district, national_id_number, verification_status, verification_reason',
        )
        .eq('id', authUser.id)
        .single()
      setProfile({
        ...profileRow,
        role: profileRow?.role || fallbackRole,
      })
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
        {isAdmin ? (
          <AdminDashboard
            email={user.email}
            role={roleLabel}
            onSignOut={handleSignOut}
          />
        ) : (
          <UserDashboard
            email={user.email}
            role={roleLabel}
            onSignOut={handleSignOut}
            profile={profile}
            profileId={user.id}
          />
        )}
      </main>
      <Footer />
    </div>
  )
}

export default DashboardPage

