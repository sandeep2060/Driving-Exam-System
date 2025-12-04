import NepaliDate from 'nepali-date-converter'
import { ISO_DATE_REGEX } from './constants'

export const convertAdToBs = (adDate) => {
  if (!ISO_DATE_REGEX.test(adDate)) return ''
  const [year, month, day] = adDate.split('-').map(Number)
  if (!year || !month || !day) return ''
  const nepaliDate = NepaliDate.fromAD(new Date(year, month - 1, day))
  return nepaliDate.format('YYYY-MM-DD')
}

export const convertBsToAd = (bsDate) => {
  if (!ISO_DATE_REGEX.test(bsDate)) return ''
  const nepaliDate = new NepaliDate(bsDate)
  const adDate = nepaliDate.toJsDate()
  const pad = (value) => String(value).padStart(2, '0')
  return `${adDate.getFullYear()}-${pad(adDate.getMonth() + 1)}-${pad(adDate.getDate())}`
}

export const calculateAgeFromIsoDate = (isoDate) => {
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

