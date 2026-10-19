import { refreshBookings } from '@/lib/dataBookings'
import { refreshNotifications } from '@/lib/dataNotifications'

/** Everything that belongs to the signed-in user. Shops and jobs are public and load separately. */
export function loadUserData(userId: string) {
  return Promise.all([refreshBookings(userId), refreshNotifications(userId)])
}
