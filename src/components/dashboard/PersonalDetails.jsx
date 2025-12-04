import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

function PersonalDetails({ email, profile, profileId }) {
  const [personalDetails, setPersonalDetails] = useState({
    fullName: '',
    dob: '',
    gender: '',
    phone: '',
    email,
    guardianName: '',
  })

  const [sectionStatus, setSectionStatus] = useState('')

  useEffect(() => {
    if (!profile) return
    setPersonalDetails((prev) => ({
      ...prev,
      fullName: profile.full_name_en || prev.fullName,
      dob: profile.dob_ad || prev.dob,
      gender: profile.gender || prev.gender,
      phone: profile.phone || prev.phone,
      guardianName: profile.guardian_name || prev.guardianName,
    }))
  }, [profile, email])

  const handleSavePersonal = async () => {
    if (!profileId) return
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name_en: personalDetails.fullName || null,
          dob_ad: personalDetails.dob || null,
          gender: personalDetails.gender || null,
          phone: personalDetails.phone || null,
          guardian_name: personalDetails.guardianName || null,
        })
        .eq('id', profileId)

      if (error) {
        setSectionStatus('Error saving personal details. Please try again.')
        return
      }

      setSectionStatus('Personal details saved successfully.')
    } catch {
      setSectionStatus('Unexpected error saving personal details.')
    }
  }

  return (
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
        <button type="button" className="primary-btn" onClick={handleSavePersonal}>
          Save personal details
        </button>
        {sectionStatus && (
          <p className="small-text success">{sectionStatus}</p>
        )}
      </form>
    </div>
  )
}

export default PersonalDetails

