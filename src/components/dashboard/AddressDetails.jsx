import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

function AddressDetails({ profile, profileId }) {
  const [addressDetails, setAddressDetails] = useState({
    province: '',
    district: '',
    municipality: '',
    ward: '',
    permanentAddress: '',
    temporaryAddress: '',
    postalCode: '',
  })

  const [sectionStatus, setSectionStatus] = useState('')

  useEffect(() => {
    if (!profile) return
    setAddressDetails((prev) => ({
      ...prev,
      province: profile.province || prev.province,
      district: profile.district || prev.district,
      municipality: profile.municipality || prev.municipality,
      ward: profile.ward || prev.ward,
      permanentAddress: profile.permanent_address || prev.permanentAddress,
      temporaryAddress: profile.temporary_address || prev.temporaryAddress,
      postalCode: profile.postal_code || prev.postalCode,
    }))
  }, [profile])

  const handleSaveAddress = async () => {
    if (!profileId) return
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          province: addressDetails.province || null,
          district: addressDetails.district || null,
          municipality: addressDetails.municipality || null,
          ward: addressDetails.ward || null,
          permanent_address: addressDetails.permanentAddress || null,
          temporary_address: addressDetails.temporaryAddress || null,
          postal_code: addressDetails.postalCode || null,
        })
        .eq('id', profileId)

      if (error) {
        setSectionStatus('Error saving address details. Please try again.')
        return
      }

      setSectionStatus('Address details saved successfully.')
    } catch {
      setSectionStatus('Unexpected error saving address details.')
    }
  }

  return (
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
        <button type="button" className="primary-btn" onClick={handleSaveAddress}>
          Save address
        </button>
        {sectionStatus && (
          <p className="small-text success">{sectionStatus}</p>
        )}
      </form>
    </div>
  )
}

export default AddressDetails

