import { redirect } from 'next/navigation'

// The old phone-code screen was a placeholder that accepted any code, so it has been removed.
// Real phone verification will come back once an SMS provider is set up.
export default function VerifyPhoneRoute() {
  redirect('/signup')
}
