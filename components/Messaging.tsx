'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Send, Phone, Video, Search, ArrowLeft, MoreVertical, Lock, Ban, Flag, Check, X } from 'lucide-react'
import { useState, useRef, useEffect, useMemo } from 'react'
import { useAppStore, type Conversation, type Message } from '@/lib/store'
import {
  getOrCreateConversation, rememberConversation, sendMessage, markConversationRead, unreadCountFor, refreshMessages,
} from '@/lib/dataMessages'
import {
  fetchRequests, fetchPairState, fetchContactDetails, sendMessageRequest, respondMessageRequest,
  sendContactRequest, respondContactRequest, blockUser, unblockUser, reportUser,
  type MessageRequest, type ContactRequest, type PairState,
} from '@/lib/dataRequests'
import { timeAgo } from '@/lib/data'
import { showToast } from '@/lib/toast'

import { EmojiIcon } from '@/components/EmojiIcon'
import { Avatar } from '@/components/Avatar'

type ConversationView = Conversation & {
  lastMessage: string
  lastAt: string
  unread: number
}

const clock = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

export function Messaging() {
  const {
    currentUser, setCurrentPage, viewWorkerProfile,
    conversations, messages, pendingChat, clearPendingChat,
  } = useAppStore()
  // null = show list, string = show chat (mobile stack behaviour)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const myId = currentUser?.id ?? ''

  // ── Requests, contact details, block and report ──────────────────────────
  const [tab, setTab] = useState<'chats' | 'requests'>('chats')
  const [reqs, setReqs] = useState<{ incoming: MessageRequest[]; outgoing: MessageRequest[]; contactIncoming: ContactRequest[] }>(
    { incoming: [], outgoing: [], contactIncoming: [] },
  )
  const [composeFor, setComposeFor] = useState<{ userId: string; name: string; context?: string } | null>(null)
  const [intro, setIntro] = useState('')
  const [sendingReq, setSendingReq] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [pair, setPair] = useState<PairState | null>(null)
  const [details, setDetails] = useState<{ name: string; phone: string | null } | null>(null)
  const [pairTick, setPairTick] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState('Spam or scam')
  const [reportDetails, setReportDetails] = useState('')
  const openedRequestsOnce = useRef(false)

  const reqCount = reqs.incoming.length + reqs.contactIncoming.length

  const refreshRequests = async () => {
    if (!myId) return
    const r = await fetchRequests(myId)
    if (!r.error) setReqs({ incoming: r.incoming, outgoing: r.outgoing, contactIncoming: r.contactIncoming })
  }

  // Load waiting requests now and every 20 seconds while this screen is open
  useEffect(() => {
    if (!myId) return
    let alive = true
    const run = async () => {
      const r = await fetchRequests(myId)
      if (!alive || r.error) return
      setReqs({ incoming: r.incoming, outgoing: r.outgoing, contactIncoming: r.contactIncoming })
      setPairTick(t => t + 1)
      if (!openedRequestsOnce.current) {
        openedRequestsOnce.current = true
        // Land on Requests when somebody is waiting for an answer
        if (r.incoming.length + r.contactIncoming.length > 0 && !useAppStore.getState().pendingChat) setTab('requests')
      }
    }
    run()
    const t = setInterval(run, 20000)
    return () => { alive = false; clearInterval(t) }
  }, [myId])

  // Conversation list with last message and unread count, newest first
  const views: ConversationView[] = useMemo(() => {
    const byConv = new Map<string, Message[]>()
    for (const m of messages) {
      const list = byConv.get(m.conversationId)
      if (list) list.push(m)
      else byConv.set(m.conversationId, [m])
    }
    return conversations
      .map(c => {
        const thread = byConv.get(c.id) ?? []
        const last = thread[thread.length - 1]
        return {
          ...c,
          lastMessage: last?.content ?? 'Say hello',
          lastAt: last?.createdAt ?? c.createdAt,
          unread: unreadCountFor(thread, myId),
        }
      })
      .sort((x, y) => y.lastAt.localeCompare(x.lastAt))
  }, [conversations, messages, myId])

  const selectedConv = views.find(c => c.id === selectedId)
  const convMessages = useMemo(
    () => (selectedId ? messages.filter(m => m.conversationId === selectedId) : []),
    [messages, selectedId],
  )
  const filtered = views.filter(c =>
    c.otherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.context ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  // What I and the person in the open chat have between us (contact details, block, asks)
  const otherId = selectedConv?.otherUserId
  useEffect(() => {
    setMenuOpen(false)
    if (!otherId || !myId) { setPair(null); setDetails(null); return }
    let alive = true
    ;(async () => {
      const p = await fetchPairState(myId, otherId)
      if (!alive) return
      setPair(p)
      if (p.contact) {
        const d = await fetchContactDetails(otherId)
        if (alive) setDetails(d)
      } else setDetails(null)
    })()
    return () => { alive = false }
  }, [otherId, myId, pairTick])

  // Opened from a profile, shop or booking: find or create that chat and open it
  useEffect(() => {
    if (!pendingChat || !currentUser) return
    let cancelled = false
    ;(async () => {
      // Strangers cannot open a chat directly. They send a request first.
      const state = await fetchPairState(currentUser.id, pendingChat.userId)
      const hasChat = state.chat || useAppStore.getState().conversations.some(c => c.otherUserId === pendingChat.userId)
      if (cancelled) return
      if (!hasChat) {
        const target = pendingChat
        clearPendingChat()
        if (state.blockedByMe) { showToast('error', 'You blocked this person. Unblock them to send a request.'); return }
        setIntro('')
        setComposeFor({ userId: target.userId, name: target.name, context: target.context })
        return
      }
      const { conversation, error } = await getOrCreateConversation(
        { id: currentUser.id, name: currentUser.name },
        { id: pendingChat.userId, name: pendingChat.name },
        pendingChat.context,
      )
      if (cancelled) return
      clearPendingChat()
      if (error || !conversation) { showToast('error', error ?? 'Could not open that chat.'); return }
      rememberConversation(conversation)
      setTab('chats')
      setSelectedId(conversation.id)
    })()
    return () => { cancelled = true }
  }, [pendingChat, currentUser, clearPendingChat])

  // Scroll to bottom when messages change or a chat opens
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [convMessages.length, selectedId])

  // Looking at a chat marks the other person's messages as read
  const unreadHere = selectedId ? unreadCountFor(convMessages, myId) : 0
  useEffect(() => {
    if (selectedId && currentUser && unreadHere > 0) markConversationRead(selectedId, currentUser.id)
  }, [selectedId, unreadHere, currentUser])

  const handleSend = async () => {
    const text = messageInput.trim()
    if (!text || !selectedConv || !currentUser || sending) return
    setSending(true)
    setMessageInput('')
    const error = await sendMessage(selectedConv, currentUser, text)
    setSending(false)
    if (error) {
      setMessageInput(text) // give the text back so nothing is lost
      showToast('error', 'Message not sent. Check your connection and try again.')
    }
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const comingSoon = (what: string) => showToast('info', `${what} is coming soon.`)

  const submitRequest = async () => {
    if (!composeFor || sendingReq) return
    const text = intro.trim()
    if (!text) { showToast('error', 'Write a short intro first.'); return }
    setSendingReq(true)
    const err = await sendMessageRequest(composeFor.userId, text)
    setSendingReq(false)
    if (err) { showToast('error', err); return }
    setComposeFor(null)
    setIntro('')
    showToast('success', 'Request sent. We will tell you when they reply.')
    refreshRequests()
  }

  const answerMessage = async (r: MessageRequest, accept: boolean) => {
    setBusyId(r.id)
    const { conversationId, error } = await respondMessageRequest(r.id, accept)
    setBusyId(null)
    if (error) { showToast('error', error); refreshRequests(); return }
    await refreshMessages(myId)
    await refreshRequests()
    if (accept && conversationId) {
      setTab('chats')
      setSelectedId(conversationId)
      showToast('success', `You can now chat with @${r.fromUsername}.`)
    }
  }

  const answerContact = async (r: ContactRequest, accept: boolean) => {
    setBusyId(r.id)
    const error = await respondContactRequest(r.id, accept)
    setBusyId(null)
    if (error) { showToast('error', error); refreshRequests(); return }
    showToast('success', accept ? `You shared your contact details with @${r.fromUsername}.` : 'Request declined.')
    await refreshRequests()
    setPairTick(t => t + 1)
  }

  const askForContact = async () => {
    if (!otherId) return
    setBusyId('ask')
    const error = await sendContactRequest(otherId)
    setBusyId(null)
    if (error) { showToast('error', error); return }
    showToast('success', 'Request sent. They can accept or decline.')
    setPairTick(t => t + 1)
  }

  const toggleBlock = async () => {
    if (!otherId || !selectedConv) return
    setMenuOpen(false)
    if (pair?.blockedByMe) {
      const error = await unblockUser(otherId)
      if (error) { showToast('error', error); return }
      showToast('success', 'Unblocked.')
    } else {
      if (!window.confirm(`Block ${selectedConv.otherName}? They will not be able to message or book you.`)) return
      const error = await blockUser(otherId)
      if (error) { showToast('error', error); return }
      showToast('success', 'Blocked.')
    }
    setPairTick(t => t + 1)
    refreshRequests()
  }

  const submitReport = async () => {
    if (!otherId) return
    const error = await reportUser(otherId, reportReason, reportDetails.trim() || undefined)
    if (error) { showToast('error', error); return }
    setReportOpen(false)
    setReportDetails('')
    showToast('success', 'Thanks. We will look into it.')
  }

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8" style={{ minHeight: 'calc(100vh - 128px)' }}>
        <div className="text-5xl mb-4"><EmojiIcon e="💬" size={44} /></div>
        <p className="font-bold text-foreground mb-1">Log in to see your messages</p>
        <p className="text-muted-foreground text-sm mb-5">Chat with workers, employers and shops.</p>
        <button
          onClick={() => useAppStore.getState().openAuth('login')}
          className="px-6 min-h-[44px] rounded-xl bg-primary text-primary-foreground text-sm font-bold"
        >
          Log in
        </button>
      </div>
    )
  }

  // ── Conversation List ────────────────────────────────────────────────────
  const ConversationList = (
    // PHASE 3 FIX: Not fixed/fullscreen. Just a normal flow div inside the page layout.
    // On mobile: full width, shown when no conv selected.
    // On desktop: left panel in a side-by-side layout.
    <div className="flex flex-col h-full">
      {/* Header — no back-to-dashboard arrow swallowing the nav */}
      <div className="border-b border-border px-4 py-4 bg-background sticky top-0 z-10">
        <h1 className="text-2xl font-black text-foreground mb-3">Messages</h1>
        <div className="flex gap-2 mb-3" role="tablist">
          <button role="tab" aria-selected={tab === 'chats'} onClick={() => setTab('chats')}
            className={`flex-1 min-h-[44px] rounded-xl text-sm font-bold transition ${tab === 'chats' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'}`}>
            Chats
          </button>
          <button role="tab" aria-selected={tab === 'requests'} onClick={() => setTab('requests')}
            className={`flex-1 min-h-[44px] rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 ${tab === 'requests' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'}`}>
            Requests
            {reqCount > 0 && (
              <span className={`min-w-5 h-5 px-1 rounded-full text-xs font-black flex items-center justify-center ${tab === 'requests' ? 'bg-primary-foreground text-primary' : 'bg-primary text-primary-foreground'}`}>{reqCount}</span>
            )}
          </button>
        </div>
        {tab === 'chats' && <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            aria-label="Search conversations"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl focus:outline-none focus:border-primary text-sm text-foreground placeholder:text-muted-foreground/60 bg-secondary/30 transition"
          />
        </div>}
      </div>

      {/* Requests */}
      {tab === 'requests' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {reqs.incoming.length + reqs.contactIncoming.length + reqs.outgoing.length === 0 && (
            <div className="text-center py-16 px-6 text-muted-foreground text-sm">
              No requests right now. When someone you have not chatted with wants to message you, it shows up here.
            </div>
          )}
          {reqs.incoming.map(r => (
            <div key={r.id} className="border border-border rounded-2xl p-4 bg-card">
              <div className="flex items-center gap-3 mb-2">
                <Avatar name={r.fromUsername} size={36} />
                <div className="min-w-0">
                  <p className="font-bold text-sm text-foreground truncate">@{r.fromUsername}</p>
                  <p className="text-xs text-muted-foreground">wants to message you · {timeAgo(r.createdAt)}</p>
                </div>
              </div>
              <p className="text-sm text-foreground bg-secondary/40 rounded-xl px-3 py-2 mb-3 whitespace-pre-wrap break-words">{r.intro}</p>
              <div className="flex gap-2">
                <button disabled={busyId === r.id} onClick={() => answerMessage(r, true)}
                  className="flex-1 min-h-[44px] rounded-xl bg-primary text-primary-foreground text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-1.5">
                  <Check size={16} /> Accept
                </button>
                <button disabled={busyId === r.id} onClick={() => answerMessage(r, false)}
                  className="flex-1 min-h-[44px] rounded-xl border border-border text-foreground text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-1.5">
                  <X size={16} /> Decline
                </button>
              </div>
            </div>
          ))}
          {reqs.contactIncoming.map(r => (
            <div key={r.id} className="border border-border rounded-2xl p-4 bg-card">
              <div className="flex items-center gap-3 mb-3">
                <Avatar name={r.fromUsername} size={36} />
                <div className="min-w-0">
                  <p className="font-bold text-sm text-foreground truncate">@{r.fromUsername}</p>
                  <p className="text-xs text-muted-foreground">asked to see your contact details · {timeAgo(r.createdAt)}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-3">If you share, you both see each other&apos;s real name and phone number.</p>
              <div className="flex gap-2">
                <button disabled={busyId === r.id} onClick={() => answerContact(r, true)}
                  className="flex-1 min-h-[44px] rounded-xl bg-primary text-primary-foreground text-sm font-bold disabled:opacity-50">Share</button>
                <button disabled={busyId === r.id} onClick={() => answerContact(r, false)}
                  className="flex-1 min-h-[44px] rounded-xl border border-border text-foreground text-sm font-bold disabled:opacity-50">Not now</button>
              </div>
            </div>
          ))}
          {reqs.outgoing.map(r => (
            <div key={r.id} className="border border-dashed border-border rounded-2xl p-4">
              <p className="text-sm text-foreground"><span className="font-bold">You asked @{r.toUsername}</span> · waiting for a reply</p>
              <p className="text-xs text-muted-foreground mt-1 truncate">{r.intro}</p>
            </div>
          ))}
        </div>
      )}

      {/* List */}
      {tab === 'chats' && <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="text-center py-16 px-6 text-muted-foreground text-sm">
            {views.length === 0
              ? 'No conversations yet. Send someone a message request from their profile or shop page.'
              : 'No conversations found'}
          </div>
        )}
        {filtered.map((conv, i) => (
          <motion.button
            key={conv.id}
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => setSelectedId(conv.id)}
            className={`w-full px-4 py-4 border-b border-border hover:bg-secondary/40 transition text-left ${selectedId === conv.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''
              }`}
          >
            <div className="flex items-start gap-3">
              <div className="relative shrink-0">
                <Avatar name={conv.otherName} size={44} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-bold text-foreground text-sm truncate">{conv.otherName}</span>
                  <span className="text-xs text-muted-foreground ml-2 shrink-0">{timeAgo(conv.lastAt)}</span>
                </div>
                {conv.context && <p className="text-xs text-muted-foreground truncate mb-0.5">{conv.context}</p>}
                <p className={`text-sm truncate ${conv.unread > 0 ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                  {conv.lastMessage}
                </p>
              </div>
              {conv.unread > 0 && (
                <span className="shrink-0 w-5 h-5 bg-primary text-primary-foreground text-xs font-black rounded-full flex items-center justify-center">
                  {conv.unread}
                </span>
              )}
            </div>
          </motion.button>
        ))}
      </div>}
    </div>
  )

  // ── Chat View ────────────────────────────────────────────────────────────
  const ChatView = selectedConv ? (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="border-b border-border px-4 py-3 bg-background flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          {/* PHASE 3 FIX: Back arrow goes to list, NOT to dashboard */}
          <button aria-label="Go back"
            onClick={() => setSelectedId(null)}
            className="p-1.5 -ml-1.5 rounded-lg hover:bg-secondary transition md:hidden"
          >
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <div className="relative">
            <Avatar name={selectedConv.otherName} size={40} />
          </div>
          <div>
            <button onClick={() => viewWorkerProfile(selectedConv.otherUserId)} className="font-black text-foreground text-sm hover:text-primary transition text-left">{selectedConv.otherName}</button>
            {selectedConv.context && <p className="text-xs text-muted-foreground">{selectedConv.context}</p>}
          </div>
        </div>
        <div className="flex items-center gap-1 relative">
          <button aria-label="Voice call" onClick={() => comingSoon('Voice calls')} className="p-3 hover:bg-secondary rounded-lg transition"><Phone size={18} className="text-primary" /></button>
          <button aria-label="Video call" onClick={() => comingSoon('Video calls')} className="p-3 hover:bg-secondary rounded-lg transition"><Video size={18} className="text-primary" /></button>
          <button aria-label="More options" aria-expanded={menuOpen} onClick={() => setMenuOpen(o => !o)} className="p-3 hover:bg-secondary rounded-lg transition"><MoreVertical size={18} className="text-muted-foreground" /></button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-52 bg-background border border-border rounded-xl shadow-lg z-20 overflow-hidden">
              <button onClick={toggleBlock} className="w-full flex items-center gap-2 px-4 min-h-[44px] text-sm text-foreground hover:bg-secondary text-left">
                <Ban size={16} /> {pair?.blockedByMe ? 'Unblock' : 'Block'}
              </button>
              <button onClick={() => { setMenuOpen(false); setReportOpen(true) }} className="w-full flex items-center gap-2 px-4 min-h-[44px] text-sm text-foreground hover:bg-secondary text-left">
                <Flag size={16} /> Report
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Contact details strip */}
      {pair && (
        <div className="px-4 py-2.5 border-b border-border bg-secondary/30 text-sm">
          {pair.blockedByMe ? (
            <p className="text-muted-foreground">You blocked this person. <button onClick={toggleBlock} className="font-bold text-primary">Unblock</button></p>
          ) : pair.contact ? (
            <p className="text-foreground flex items-center gap-2 flex-wrap">
              <Check size={14} className="text-primary shrink-0" />
              <span className="font-bold">{details?.name || 'Contact details shared'}</span>
              {details?.phone && <a href={`tel:${details.phone}`} className="text-primary font-semibold">{details.phone}</a>}
            </p>
          ) : pair.contactAskedOfMeId ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-foreground">They asked to see your contact details.</p>
              <button disabled={busyId === pair.contactAskedOfMeId} onClick={() => answerContact({ id: pair.contactAskedOfMeId!, fromUser: otherId!, toUser: myId, fromUsername: selectedConv.otherName, toUsername: '', createdAt: '' }, true)}
                className="shrink-0 min-h-[44px] px-4 rounded-xl bg-primary text-primary-foreground font-bold disabled:opacity-50">Share</button>
            </div>
          ) : pair.contactAskedByMe ? (
            <p className="text-muted-foreground flex items-center gap-2"><Lock size={14} /> Contact request sent. Waiting for a reply.</p>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <p className="text-muted-foreground flex items-center gap-2"><Lock size={14} className="shrink-0" /> Real name and phone are private.</p>
              <button disabled={busyId === 'ask'} onClick={askForContact}
                className="shrink-0 min-h-[44px] px-4 rounded-xl border border-primary text-primary font-bold disabled:opacity-50">Ask to see</button>
            </div>
          )}
        </div>
      )}

      {/* Messages — scrollable, pb accounts for input bar */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {convMessages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-10">No messages yet. Say hello.</p>
        )}
        {convMessages.map(msg => {
          const mine = msg.senderId === myId
          return (
          <motion.div
            key={msg.id}
            initial={{ y: 6, opacity: 0 }}
            animate={{ y: 0, opacity: msg.pending ? 0.6 : 1 }}
            className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${mine
              ? 'bg-primary text-primary-foreground rounded-br-sm'
              : 'bg-secondary text-foreground rounded-bl-sm'
              }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
              <p className={`text-xs mt-1 ${mine ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                {msg.pending ? 'Sending...' : clock(msg.createdAt)}{mine && !msg.pending && msg.readAt ? ' · Seen' : ''}
              </p>
            </div>
          </motion.div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* PHASE 3 FIX: Input bar — sticky bottom, above BottomNav (pb-0, BottomNav handles its own spacing) */}
      <div className="border-t border-border px-3 py-3 bg-background">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            aria-label="Type a message"
            type="text"
            placeholder={pair?.blockedByMe ? 'You blocked this person' : 'Type a message...'}
            disabled={!!pair?.blockedByMe}
            value={messageInput}
            onChange={e => setMessageInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 px-4 py-3 border border-border rounded-xl focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground/60 bg-secondary/30 text-sm transition"
          />
          <motion.button
            aria-label="Send message"
            whileTap={{ scale: 0.92 }}
            onClick={handleSend}
            disabled={!messageInput.trim() || sending}
            className="w-11 h-11 bg-primary text-primary-foreground rounded-xl flex items-center justify-center hover:bg-primary/90 transition disabled:opacity-40 shrink-0"
          >
            <Send size={18} />
          </motion.button>
        </div>
      </div>
    </div>
  ) : (
    // Desktop empty state
    <div className="flex-1 flex items-center justify-center text-center p-8">
      <div>
        <div className="text-5xl mb-4"><EmojiIcon e="💬" size={44} /></div>
        <p className="font-bold text-foreground mb-1">Select a conversation</p>
        <p className="text-muted-foreground text-sm">Choose someone from the list to start chatting</p>
      </div>
    </div>
  )

  return (
    // PHASE 3 FIX: Not `fixed inset-0 z-50` anymore — normal page flow so BottomNav stays visible.
    // Height fills available space below Header (64px) and above BottomNav (64px on mobile).
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex bg-background"
      style={{ height: 'calc(100vh - 64px - 64px)' }} // 64px Header + 64px BottomNav
    >
      {/* ── Mobile: stack view — show list OR chat ── */}
      <div className="flex w-full md:hidden">
        <AnimatePresence mode="wait">
          {!selectedId ? (
            <motion.div
              key="list"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="w-full"
            >
              {ConversationList}
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              className="w-full flex flex-col"
            >
              {ChatView}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Desktop: side-by-side ── */}
      <div className="hidden md:flex w-full">
        <div className="w-80 lg:w-96 border-r border-border shrink-0 overflow-hidden">
          {ConversationList}
        </div>
        <div className="flex-1 overflow-hidden flex flex-col">
          {ChatView}
        </div>
      </div>

      {/* Send a message request */}
      {composeFor && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setComposeFor(null)}>
          <div role="dialog" aria-modal="true" aria-label="Send a message request" onClick={e => e.stopPropagation()}
            className="w-full sm:max-w-md bg-background rounded-t-3xl sm:rounded-3xl p-5 pb-8">
            <h2 className="text-lg font-black text-foreground mb-1">Send a message request</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Introduce yourself{composeFor.context ? ` about ${composeFor.context}` : ''}. They can accept or decline. If they accept, you can chat.
            </p>
            <textarea aria-label="Your intro" autoFocus value={intro} onChange={e => setIntro(e.target.value.slice(0, 200))} rows={4}
              placeholder="Hi, I saw your profile and I need help with..."
              className="w-full px-4 py-3 border-2 border-border rounded-xl focus:outline-none focus:border-primary text-foreground text-sm resize-none" />
            <p className="text-xs text-muted-foreground text-right mt-1 mb-4">{intro.length}/200</p>
            <div className="flex gap-2">
              <button onClick={() => setComposeFor(null)} className="flex-1 min-h-[44px] rounded-xl border border-border text-foreground text-sm font-bold">Cancel</button>
              <button onClick={submitRequest} disabled={sendingReq || !intro.trim()}
                className="flex-1 min-h-[44px] rounded-xl bg-primary text-primary-foreground text-sm font-bold disabled:opacity-50">
                {sendingReq ? 'Sending...' : 'Send request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report */}
      {reportOpen && selectedConv && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setReportOpen(false)}>
          <div role="dialog" aria-modal="true" aria-label="Report this person" onClick={e => e.stopPropagation()}
            className="w-full sm:max-w-md bg-background rounded-t-3xl sm:rounded-3xl p-5 pb-8">
            <h2 className="text-lg font-black text-foreground mb-3">Report {selectedConv.otherName}</h2>
            <select aria-label="Reason" value={reportReason} onChange={e => setReportReason(e.target.value)}
              className="w-full px-4 py-3 border-2 border-border rounded-xl bg-background text-foreground text-sm mb-3">
              {['Spam or scam', 'Rude or threatening', 'Fake profile', 'Asked for money upfront', 'Other'].map(r => <option key={r}>{r}</option>)}
            </select>
            <textarea aria-label="Details (optional)" value={reportDetails} onChange={e => setReportDetails(e.target.value.slice(0, 1000))} rows={3}
              placeholder="What happened? (optional)"
              className="w-full px-4 py-3 border-2 border-border rounded-xl focus:outline-none focus:border-primary text-foreground text-sm resize-none mb-4" />
            <div className="flex gap-2">
              <button onClick={() => setReportOpen(false)} className="flex-1 min-h-[44px] rounded-xl border border-border text-foreground text-sm font-bold">Cancel</button>
              <button onClick={submitReport} className="flex-1 min-h-[44px] rounded-xl bg-primary text-primary-foreground text-sm font-bold">Send report</button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}