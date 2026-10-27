import { supabase } from '@/lib/supabase'
import { useAppStore, type Conversation, type Message } from '@/lib/store'
import type { RealtimeChannel } from '@supabase/supabase-js'

type ConversationRow = {
  id: string
  user_a: string
  user_b: string
  user_a_name: string | null
  user_b_name: string | null
  context: string | null
  created_at: string | null
}

type MessageRow = {
  id: string
  conversation_id: string
  sender_id: string
  receiver_id: string | null
  content: string
  created_at: string | null
  read_at: string | null
}

export function mapConversation(r: ConversationRow, myId: string): Conversation {
  const iAmA = r.user_a === myId
  return {
    id: r.id,
    otherUserId: iAmA ? r.user_b : r.user_a,
    otherName: (iAmA ? r.user_b_name : r.user_a_name) ?? 'Butsó user',
    context: r.context ?? undefined,
    createdAt: r.created_at ?? new Date().toISOString(),
  }
}

export function mapMessage(r: MessageRow, myId: string, otherId?: string): Message {
  return {
    id: r.id,
    conversationId: r.conversation_id,
    senderId: r.sender_id,
    receiverId: r.receiver_id ?? (r.sender_id === myId ? otherId ?? '' : myId),
    content: r.content,
    createdAt: r.created_at ?? new Date().toISOString(),
    readAt: r.read_at,
  }
}

export async function fetchConversations(myId: string): Promise<{ conversations: Conversation[]; messages: Message[]; error: string | null }> {
  const { data: convs, error } = await supabase
    .from('conversations')
    .select('*')
    .or(`user_a.eq.${myId},user_b.eq.${myId}`)
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) return { conversations: [], messages: [], error: error.message }

  const conversations = (convs as ConversationRow[]).map(c => mapConversation(c, myId))
  if (conversations.length === 0) return { conversations, messages: [], error: null }

  const ids = conversations.map(c => c.id)
  const { data: msgs, error: mErr } = await supabase
    .from('messages')
    .select('id, conversation_id, sender_id, receiver_id, content, created_at, read_at')
    .in('conversation_id', ids)
    .order('created_at', { ascending: false })
    .limit(1000)
  if (mErr) return { conversations, messages: [], error: mErr.message }

  const otherByConv = new Map(conversations.map(c => [c.id, c.otherUserId]))
  const messages = (msgs as MessageRow[])
    .map(m => mapMessage(m, myId, otherByConv.get(m.conversation_id)))
    .reverse() // oldest first
  return { conversations, messages, error: null }
}

export async function refreshMessages(myId: string) {
  const { conversations, messages, error } = await fetchConversations(myId)
  if (!error) {
    const st = useAppStore.getState()
    st.setConversations(conversations)
    st.setMessages(messages)
  }
  return error
}

/** Find the chat between me and another person, or create it. */
export async function getOrCreateConversation(
  me: { id: string; name: string },
  other: { id: string; name: string },
  context?: string,
): Promise<{ conversation: Conversation | null; error: string | null }> {
  if (me.id === other.id) return { conversation: null, error: 'You cannot message yourself.' }

  // The pair is always stored in the same order so there is only ever one chat per pair.
  const iAmA = me.id < other.id
  const [a, b] = iAmA ? [me, other] : [other, me]

  const existing = await supabase.from('conversations').select('*').eq('user_a', a.id).eq('user_b', b.id).maybeSingle()
  if (existing.error) return { conversation: null, error: existing.error.message }
  if (existing.data) return { conversation: mapConversation(existing.data as ConversationRow, me.id), error: null }

  // Chats store usernames, not real names. Real names stay private until contact details are shared.
  const handles = await supabase.from('public_profiles').select('id, username').in('id', [a.id, b.id])
  const handleOf = (p: { id: string; name: string }) =>
    (handles.data as { id: string; username: string | null }[] | null)?.find(h => h.id === p.id)?.username || p.name

  const { data, error } = await supabase
    .from('conversations')
    .insert({ user_a: a.id, user_b: b.id, user_a_name: handleOf(a), user_b_name: handleOf(b), context: context ?? null })
    .select('*')
    .single()
  if (error) {
    // Someone else may have created it a moment ago
    const retry = await supabase.from('conversations').select('*').eq('user_a', a.id).eq('user_b', b.id).maybeSingle()
    if (retry.data) return { conversation: mapConversation(retry.data as ConversationRow, me.id), error: null }
    return { conversation: null, error: error.message }
  }
  return { conversation: mapConversation(data as ConversationRow, me.id), error: null }
}

/** Adds the conversation to the store if it is not there yet. */
export function rememberConversation(c: Conversation) {
  const st = useAppStore.getState()
  if (!st.conversations.some(x => x.id === c.id)) st.setConversations([c, ...st.conversations])
}

export async function sendMessage(conversation: Conversation, me: { id: string }, text: string): Promise<string | null> {
  const content = text.trim()
  if (!content) return null

  const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  const st = useAppStore.getState()
  st.addMessage({
    id: tempId,
    conversationId: conversation.id,
    senderId: me.id,
    receiverId: conversation.otherUserId,
    content,
    createdAt: new Date().toISOString(),
    readAt: null,
    pending: true,
  })

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversation.id,
      sender_id: me.id,
      receiver_id: conversation.otherUserId,
      content,
    })
    .select('id, conversation_id, sender_id, receiver_id, content, created_at, read_at')
    .single()

  const now = useAppStore.getState()
  if (error || !data) {
    now.setMessages(now.messages.filter(m => m.id !== tempId))
    return error?.message ?? 'Message not sent'
  }
  const real = mapMessage(data as MessageRow, me.id, conversation.otherUserId)
  // The realtime echo may already have added the saved message
  const alreadyThere = now.messages.some(m => m.id === real.id)
  now.setMessages(
    alreadyThere
      ? now.messages.filter(m => m.id !== tempId)
      : now.messages.map(m => (m.id === tempId ? real : m)),
  )
  return null
}

/** Marks everything the other person sent in this chat as read. */
export async function markConversationRead(conversationId: string, myId: string) {
  const st = useAppStore.getState()
  const hasUnread = st.messages.some(m => m.conversationId === conversationId && m.receiverId === myId && !m.readAt)
  if (!hasUnread) return
  const stamp = new Date().toISOString()
  st.setMessages(st.messages.map(m =>
    m.conversationId === conversationId && m.receiverId === myId && !m.readAt ? { ...m, readAt: stamp } : m))
  await supabase.rpc('mark_conversation_read', { conv_id: conversationId })
}

export function unreadCountFor(messages: Message[], myId: string, conversationId?: string) {
  return messages.filter(m =>
    m.receiverId === myId && !m.readAt && !m.pending && (!conversationId || m.conversationId === conversationId)).length
}

// ── Realtime ────────────────────────────────────────────────────────────────
let channel: RealtimeChannel | null = null
let channelUser: string | null = null

export function startMessagesRealtime(myId: string) {
  if (channel && channelUser === myId) return
  stopMessagesRealtime()
  channelUser = myId

  channel = supabase
    .channel(`butso-messages-${myId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
      const st = useAppStore.getState()
      const row = payload.new as MessageRow
      if (st.messages.some(m => m.id === row.id)) return
      const conv = st.conversations.find(c => c.id === row.conversation_id)
      if (!conv) {
        // A chat we have not seen yet (someone just started one with us)
        refreshMessages(myId)
        return
      }
      st.addMessage(mapMessage(row, myId, conv.otherUserId))
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, payload => {
      const row = payload.new as MessageRow
      const st = useAppStore.getState()
      st.setMessages(st.messages.map(m => (m.id === row.id ? { ...m, readAt: row.read_at } : m)))
    })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'conversations' }, () => {
      refreshMessages(myId)
    })
    .subscribe()
}

export function stopMessagesRealtime() {
  if (channel) supabase.removeChannel(channel)
  channel = null
  channelUser = null
}
