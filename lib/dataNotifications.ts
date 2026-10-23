import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useAppStore, type Notification } from '@/lib/store'
import { showToast } from '@/lib/toast'

type NotificationRow = {
  id: string
  type: string | null
  title: string | null
  body: string | null
  read: boolean | null
  created_at: string | null
  ref_id?: string | null
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
    refId: r.ref_id ?? undefined,
  }
}

export async function fetchNotifications(userId: string): Promise<{ notifications: Notification[]; error: string | null }> {
  const { data, error } = await supabase
    .from('notifications')
    .select('id, type, title, body, read, created_at, ref_id')
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

// ── Live updates ────────────────────────────────────────────────────────────
let channel: RealtimeChannel | null = null
let channelUser: string | null = null
let pollTimer: ReturnType<typeof setInterval> | null = null
let visibilityHandler: (() => void) | null = null

function announce(n: Notification) {
  if (useAppStore.getState().currentPage === 'notifications') return // already looking at the list
  showToast('info', n.title ? `${n.title}: ${n.body}` : n.body)
}

/** Fetch again and pop up anything new. This is the safety net if realtime is not available. */
async function pollNotifications(userId: string) {
  const { notifications, error } = await fetchNotifications(userId)
  if (error) return
  const st = useAppStore.getState()
  const known = new Set(st.notifications.map(n => n.id))
  const fresh = notifications.filter(n => !known.has(n.id) && !n.read)
  st.setNotifications(notifications)
  if (fresh.length > 0) announce(fresh[0])
}

export function startNotificationsRealtime(userId: string) {
  if (channel && channelUser === userId) return
  stopNotificationsRealtime()
  channelUser = userId

  channel = supabase
    .channel(`butso-notifications-${userId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
      payload => {
        const n = mapNotification(payload.new as NotificationRow)
        const st = useAppStore.getState()
        if (st.notifications.some(x => x.id === n.id)) return
        st.setNotifications([n, ...st.notifications])
        announce(n)
      },
    )
    .subscribe()

  pollTimer = setInterval(() => { void pollNotifications(userId) }, 30000)
  visibilityHandler = () => { if (document.visibilityState === 'visible') void pollNotifications(userId) }
  document.addEventListener('visibilitychange', visibilityHandler)
}

export function stopNotificationsRealtime() {
  if (channel) supabase.removeChannel(channel)
  channel = null
  channelUser = null
  if (pollTimer) clearInterval(pollTimer)
  pollTimer = null
  if (visibilityHandler) document.removeEventListener('visibilitychange', visibilityHandler)
  visibilityHandler = null
}
