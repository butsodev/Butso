// Remembers that this visit came from a password-reset email link.
// Imported FIRST in the app shell, before the Supabase client reads and clears the URL hash.
const KEY = 'butso-recovery'

if (typeof window !== 'undefined') {
  try {
    if (window.location.hash.includes('type=recovery')) sessionStorage.setItem(KEY, '1')
  } catch { /* storage blocked: the PASSWORD_RECOVERY event still covers it */ }
}

export function markRecovery() {
  try { sessionStorage.setItem(KEY, '1') } catch { /* ignore */ }
}
export function isRecovery(): boolean {
  try { return sessionStorage.getItem(KEY) === '1' } catch { return false }
}
export function clearRecovery() {
  try { sessionStorage.removeItem(KEY) } catch { /* ignore */ }
}
