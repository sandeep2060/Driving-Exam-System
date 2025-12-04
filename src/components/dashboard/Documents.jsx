import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

function Documents({ profile, profileId }) {
  const [documents, setDocuments] = useState({
    citizenshipFront: null,
    citizenshipBack: null,
    passportPhoto: null,
    birthCertificate: null,
    signature: null,
  })

  const [govId, setGovId] = useState({
    type: 'citizenship', // 'citizenship' | 'national_id'
    citizenshipNumber: '',
    citizenshipIssueDate: '',
    citizenshipIssueDistrict: '',
    nationalIdNumber: '',
  })

  const [sectionStatus, setSectionStatus] = useState('')

  useEffect(() => {
    if (!profile) return
    setGovId((prev) => ({
      ...prev,
      type: profile.government_id_type || prev.type,
      citizenshipNumber: profile.citizenship_number ?? '',
      citizenshipIssueDate: profile.citizenship_issue_date
        ? profile.citizenship_issue_date.substring(0, 10)
        : '',
      citizenshipIssueDistrict: profile.citizenship_issue_district ?? '',
      nationalIdNumber: profile.national_id_number ?? '',
    }))
  }, [profile])

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

  const handleSaveGovernmentId = async () => {
    if (!profileId) return

    if (govId.type === 'citizenship') {
      if (
        !govId.citizenshipNumber.trim() ||
        !govId.citizenshipIssueDate ||
        !govId.citizenshipIssueDistrict.trim()
      ) {
        setSectionStatus('Please fill citizenship number, issue date, and issue district.')
        return
      }
    }

    if (govId.type === 'national_id') {
      if (!govId.nationalIdNumber.trim()) {
        setSectionStatus('Please enter your National ID card number.')
        return
      }
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          government_id_type: govId.type,
          citizenship_number:
            govId.type === 'citizenship' ? govId.citizenshipNumber.trim() : null,
          citizenship_issue_date:
            govId.type === 'citizenship' && govId.citizenshipIssueDate
              ? govId.citizenshipIssueDate
              : null,
          citizenship_issue_district:
            govId.type === 'citizenship' && govId.citizenshipIssueDistrict
              ? govId.citizenshipIssueDistrict.trim()
              : null,
          national_id_number:
            govId.type === 'national_id' ? govId.nationalIdNumber.trim() : null,
        })
        .eq('id', profileId)

      if (error) {
        setSectionStatus('Error saving government ID details. Please try again.')
        return
      }

      setSectionStatus('Government ID details saved successfully.')
    } catch {
      setSectionStatus('Unexpected error saving government ID details.')
    }
  }

  return (
    <div className="panel">
      <h3>Government documents</h3>
      <p className="lede small-text">
        Upload clear, recent scans or photos of your official documents.
      </p>
      <form className="form">
        <fieldset className="role-group">
          <legend>Government ID type</legend>
          <div className="role-options">
            <label className="role-option">
              <input
                type="radio"
                name="gov-id-type"
                value="citizenship"
                checked={govId.type === 'citizenship'}
                onChange={() =>
                  setGovId((prev) => ({
                    ...prev,
                    type: 'citizenship',
                  }))
                }
              />
              Citizenship card
            </label>
            <label className="role-option">
              <input
                type="radio"
                name="gov-id-type"
                value="national_id"
                checked={govId.type === 'national_id'}
                onChange={() =>
                  setGovId((prev) => ({
                    ...prev,
                    type: 'national_id',
                  }))
                }
              />
              National ID card
            </label>
          </div>
        </fieldset>

        {govId.type === 'citizenship' && (
          <>
            <label>
              Citizenship number
              <input
                type="text"
                value={govId.citizenshipNumber}
                onChange={(event) =>
                  setGovId((prev) => ({
                    ...prev,
                    citizenshipNumber: event.target.value,
                  }))
                }
                placeholder="Citizenship number"
              />
            </label>
            <label>
              Issue date
              <input
                type="date"
                value={govId.citizenshipIssueDate}
                onChange={(event) =>
                  setGovId((prev) => ({
                    ...prev,
                    citizenshipIssueDate: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              Issue district
              <input
                type="text"
                value={govId.citizenshipIssueDistrict}
                onChange={(event) =>
                  setGovId((prev) => ({
                    ...prev,
                    citizenshipIssueDistrict: event.target.value,
                  }))
                }
                placeholder="District name"
              />
            </label>
          </>
        )}

        {govId.type === 'national_id' && (
          <label>
            National ID card number
            <input
              type="text"
              value={govId.nationalIdNumber}
              onChange={(event) =>
                setGovId((prev) => ({
                  ...prev,
                  nationalIdNumber: event.target.value,
                }))
              }
              placeholder="National ID number"
            />
          </label>
        )}

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
        <button
          type="button"
          className="primary-btn"
          onClick={handleSaveGovernmentId}
        >
          Save government ID details
        </button>
        {sectionStatus && (
          <p className="small-text success">{sectionStatus}</p>
        )}
      </form>
    </div>
  )
}

export default Documents

