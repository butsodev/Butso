import { refreshBookings } from '@/lib/dataBookings'
import { refreshNotifications } from '@/lib/dataNotifications'
import { refreshMessages, startMessagesRealtime } from '@/lib/dataMessages'

/** Everything that belongs to the signed-in user. Shops and jobs are public and load separately. */
export async function loadUserData(userId: string) {
  const results = await Promise.all([
    refreshBookings(userId),
    refreshNotifications(userId),
    refreshMessages(userId),
  ])
  startMessagesRealtime(userId) // live chat updates for the rest of the session
  return results
}
