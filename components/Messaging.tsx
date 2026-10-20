'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Send, Phone, Video, Search, ArrowLeft, MoreVertical } from 'lucide-react'
import { useState, useRef, useEffect, useMemo } from 'react'
import { useAppStore, type Conversation, type Message } from '@/lib/store'
import {
  getOrCreateConversation, rememberConversation, sendMessage, markConversationRead, unreadCountFor,
} from '@/lib/dataMessages'
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

  // Opened from a profile, shop or booking: find or create that chat and open it
  useEffect(() => {
    if (!pendingChat || !currentUser) return
    let cancelled = false
    ;(async () => {
      const { conversation, error } = await getOrCreateConversation(
        { id: currentUser.id, name: currentUser.name },
        { id: pendingChat.userId, name: pendingChat.name },
        pendingChat.context,
      )
      if (cancelled) return
      clearPendingChat()
      if (error || !conversation) { showToast('error', error ?? 'Could not open that chat.'); return }
      rememberConversation(conversation)
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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            aria-label="Search conversations"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl focus:outline-none focus:border-primary text-sm text-foreground placeholder:text-muted-foreground/60 bg-secondary/30 transition"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="text-center py-16 px-6 text-muted-foreground text-sm">
            {views.length === 0
              ? 'No conversations yet. Message someone from their profile or shop page.'
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
      </div>
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
        <div className="flex items-center gap-1">
          <button aria-label="Voice call" onClick={() => comingSoon('Voice calls')} className="p-3 hover:bg-secondary rounded-lg transition"><Phone size={18} className="text-primary" /></button>
          <button aria-label="Video call" onClick={() => comingSoon('Video calls')} className="p-3 hover:bg-secondary rounded-lg transition"><Video size={18} className="text-primary" /></button>
          <button aria-label="More options" onClick={() => comingSoon('More options')} className="p-3 hover:bg-secondary rounded-lg transition"><MoreVertical size={18} className="text-muted-foreground" /></button>
        </div>
      </div>

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
            placeholder="Type a message..."
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
    </motion.div>
  )
}