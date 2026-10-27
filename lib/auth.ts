import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/lib/store'
import { showToast } from '@/lib/toast'

/**
 * Real logout. Ends the Supabase session first (otherwise a refresh signs the
 * user straight back in), then clears local state and returns to the landing page.
 */
export async function signOutUser() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    showToast('error', 'Could not log out. Check your connection and try again.')
    return
  }
  useAppStore.setState({ currentUser: null })
  useAppStore.getState().setCurrentPage('splash')
}
