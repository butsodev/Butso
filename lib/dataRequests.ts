// Message requests, contact-detail requests, block and report.
// Every rule (caps, cooldowns, blocks, shop settings) is enforced in the database;
// the messages below come straight from it, so they are already written for people.

import { supabase } from '@/lib/supabase'

export type MessageRequest = {
  id: string
  fromUser: string
  toUser: string
  fromUsername: string
  toUsername: string
  intro: string
  createdAt: string
}

export type ContactRequest = {
  id: string
  fromUser: string
  toUser: string
  fromUsername: string
  toUsername: string
  createdAt: string
}

export type PairState = {
  chat: boolean            // can chat
  contact: boolean         // can see real name and phone
  blockedByMe: boolean
  contactAskedByMe: boolean        // I asked, waiting
  contactAskedOfMeId: string | null // they asked me, waiting (the request id)
}

type MsgRow = {
  id: string; from_user: string; to_user: string
  from_username: string | null; to_username: string | null
  intro: string; created_at: string
}
type ContactRow = Omit<MsgRow, 'intro'>

const mapMsg = (r: MsgRow): MessageRequest => ({
  id: r.id, fromUser: r.from_user, toUser: r.to_user,
  fromUsername: r.from_username ?? 'someone', toUsername: r.to_username ?? 'someone',
  intro: r.intro, createdAt: r.created_at,
})
const mapContact = (r: ContactRow): ContactRequest => ({
  id: r.id, fromUser: r.from_user, toUser: r.to_user,
  fromUsername: r.from_username ?? 'someone', toUsername: r.to_username ?? 'someone',
  createdAt: r.created_at,
})

/** My waiting requests: ones sent to me, ones I sent, and contact-detail asks sent to me. */
export async function fetchRequests(myId: string): Promise<{
  incoming: MessageRequest[]; outgoing: MessageRequest[]; contactIncoming: ContactRequest[]; error: string | null
}> {
  const [m, c] = await Promise.all([
    supabase.from('message_requests').select('*').eq('status', 'pending').order('created_at', { ascending: false }),
    supabase.from('contact_requests').select('*').eq('status', 'pending').eq('to_user', myId).order('created_at', { ascending: false }),
  ])
  if (m.error || c.error) {
    return { incoming: [], outgoing: [], contactIncoming: [], error: (m.error ?? c.error)!.message }
  }
  const msgs = (m.data as MsgRow[]).map(mapMsg)
  return {
    incoming: msgs.filter(r => r.toUser === myId),
    outgoing: msgs.filter(r => r.fromUser === myId),
    contactIncoming: (c.data as ContactRow[]).map(mapContact),
    error: null,
  }
}

/** What do I and this person have between us right now? */
export async function fetchPairState(myId: string, otherId: string): Promise<PairState> {
  const lo = myId < otherId ? myId : otherId
  const hi = myId < otherId ? otherId : myId
  const [conn, block, asks] = await Promise.all([
    supabase.from('connections').select('chat_ok, contact_ok').eq('user_a', lo).eq('user_b', hi).maybeSingle(),
    supabase.from('blocks').select('blocked').eq('blocker', myId).eq('blocked', otherId).maybeSingle(),
    supabase.from('contact_requests').select('id, from_user').eq('status', 'pending')
      .or(`and(from_user.eq.${myId},to_user.eq.${otherId}),and(from_user.eq.${otherId},to_user.eq.${myId})`),
  ])
  const rows = (asks.data ?? []) as { id: string; from_user: string }[]
  const theirs = rows.find(r => r.from_user === otherId)
  return {
    chat: !!(conn.data?.chat_ok || conn.data?.contact_ok),
    contact: !!conn.data?.contact_ok,
    blockedByMe: !!block.data,
    contactAskedByMe: rows.some(r => r.from_user === myId),
    contactAskedOfMeId: theirs?.id ?? null,
  }
}

/** Real name and phone. Only call this once pair.contact is true. */
export async function fetchContactDetails(otherId: string): Promise<{ name: string; phone: string | null } | null> {
  const { data, error } = await supabase.from('profiles').select('name, phone').eq('id', otherId).maybeSingle()
  if (error || !data) return null
  return { name: (data.name as string) ?? '', phone: (data.phone as string | null) ?? null }
}

/** Returns an error message, or null when it worked. */
export async function sendMessageRequest(toId: string, intro: string): Promise<string | null> {
  const { error } = await supabase.rpc('send_message_request', { p_to: toId, p_intro: intro })
  return error ? error.message : null
}

/** Accepting opens the chat. conversationId is null when declined. */
export async function respondMessageRequest(id: string, accept: boolean): Promise<{ conversationId: string | null; error: string | null }> {
  const { data, error } = await supabase.rpc('respond_message_request', { p_id: id, p_accept: accept })
  if (error) return { conversationId: null, error: error.message }
  return { conversationId: (data as string | null) ?? null, error: null }
}

export async function sendContactRequest(toId: string): Promise<string | null> {
  const { error } = await supabase.rpc('send_contact_request', { p_to: toId })
  return error ? error.message : null
}

export async function respondContactRequest(id: string, accept: boolean): Promise<string | null> {
  const { error } = await supabase.rpc('respond_contact_request', { p_id: id, p_accept: accept })
  return error ? error.message : null
}

export async function blockUser(id: string): Promise<string | null> {
  const { error } = await supabase.rpc('block_user', { p_target: id })
  return error ? error.message : null
}

export async function unblockUser(id: string): Promise<string | null> {
  const { error } = await supabase.rpc('unblock_user', { p_target: id })
  return error ? error.message : null
}

export async function reportUser(id: string, reason: string, details?: string): Promise<string | null> {
  const { error } = await supabase.rpc('report_user', { p_target: id, p_reason: reason, p_details: details ?? null })
  return error ? error.message : null
}
