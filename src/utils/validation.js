import {
  NEPALI_PHONE_REGEX,
  EMAIL_REGEX,
  NEPALI_NAME_REGEX,
} from './constants'
import { calculateAgeFromIsoDate, convertBsToAd } from './dateUtils'

export const validateSignupForm = (signupForm) => {
  // Basic required fields
  if (!signupForm.firstName.trim() || !signupForm.lastName.trim()) {
    return 'Please enter your first and last name.'
  }

  if (!signupForm.dobAd && !signupForm.dobBs) {
    return 'Please enter your date of birth in AD or BS.'
  }

  if (!signupForm.fullNameNepali.trim()) {
    return 'Please enter your full name in Nepali.'
  }

  if (!NEPALI_NAME_REGEX.test(signupForm.fullNameNepali.trim())) {
    return 'Full name in Nepali must use Devanagari characters only.'
  }

  // Determine AD date for age validation
  const effectiveDobAd =
    signupForm.dobType === 'AD'
      ? signupForm.dobAd
      : convertBsToAd(signupForm.dobBs)

  const age = calculateAgeFromIsoDate(effectiveDobAd)
  if (age == null) {
    return 'Please enter a valid date of birth.'
  }

  if (age < 18) {
    return 'You must be at least 18 years old to create an account.'
  }

  if (!EMAIL_REGEX.test(signupForm.email)) {
    return 'Please enter a valid email address.'
  }

  if (!NEPALI_PHONE_REGEX.test(signupForm.phone.trim())) {
    return 'Please enter a valid Nepali phone number (e.g. 98XXXXXXXX or 01XXXXXXX).'
  }

  if (!signupForm.password || signupForm.password.length < 6) {
    return 'Password must be at least 6 characters long.'
  }

  if (signupForm.password !== signupForm.confirmPassword) {
    return 'Password and confirm password do not match.'
  }

  if (!signupForm.acceptedTerms) {
    return 'You must agree to the terms and conditions related to the online written exam and driving rules.'
  }

  return null
}

