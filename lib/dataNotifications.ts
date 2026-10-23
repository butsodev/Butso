import { supabase } from '@/lib/supabase'
import { useAppStore, type Notification } from '@/lib/store'

type NotificationRow = {
  id: string
  type: string | null
  title: string | null
  body: string | null
  read: boolean | null
  created_at: string | null
}

const TYPES: Notification['type'][] = ['application', 'booking', 'message', 'payment', 'review', 'request']

export function mapNotification(r: NotificationRow): Notification {
  return {
    id: r.id,
    type: TYPES.includes(r.type as Notification['type']) ? (r.type as Notification['type']) : 'booking',
    title: r.title ?? '',
    body: r.body ?? '',
    read: r.read ?? false,
    createdAt: r.created_at ?? new Date().toISOString(),
  }
}

export async function fetchNotifications(userId: string): Promise<{ notifications: Notification[]; error: string | null }> {
  const { data, error } = await supabase
    .from('notifications')
    .select('id, type, title, body, read, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) return { notifications: [], error: error.message }
  return { notifications: (data as NotificationRow[]).map(mapNotification), error: null }
}

export async function refreshNotifications(userId: string) {
  const { notifications, error } = await fetchNotifications(userId)
  if (!error) useAppStore.getState().setNotifications(notifications)
  return error
}

export async function markNotificationRead(id: string): Promise<string | null> {
  useAppStore.getState().markNotificationRead(id) // optimistic
  const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id)
  return error ? error.message : null
}

export async function markAllNotificationsRead(userId: string): Promise<string | null> {
  useAppStore.getState().markAllNotificationsRead() // optimistic
  const { error } = await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false)
  return error ? error.message : null
}

export async function deleteNotification(id: string): Promise<string | null> {
  const st = useAppStore.getState()
  const previous = st.notifications
  st.setNotifications(previous.filter(n => n.id !== id)) // optimistic
  const { error } = await supabase.from('notifications').delete().eq('id', id)
  if (error) {
    useAppStore.getState().setNotifications(previous) // roll back
    return error.message
  }
  return null
}
