'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Send, Phone, Video, Info, Search, ArrowLeft, MoreVertical } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAppStore } from '@/lib/store'

type Message = { id: string; sender: 'me' | 'other'; text: string; time: string }
type Conversation = {
  id: string; name: string; avatar: string; lastMessage: string
  timestamp: string; unread: number; isOnline: boolean; job: string
  workerId?: string
}

const conversations: Conversation[] = [
  { id: 'conv1', name: 'Wunuken Danladi', avatar: '👷', lastMessage: 'Can you start on Monday?', timestamp: '2h ago', unread: 2, isOnline: true, job: 'Bathroom Renovation', workerId: 'worker1' },
  { id: 'conv2', name: 'Zando Ishaku', avatar: '👩‍🔧', lastMessage: 'I can do that!', timestamp: '4h ago', unread: 0, isOnline: true, job: 'Electrical Work', workerId: 'worker5' },
  { id: 'conv3', name: 'Chidonku Agbu', avatar: '👨‍💼', lastMessage: 'What time works best for you?', timestamp: '1d ago', unread: 0, isOnline: false, job: 'Plumbing Repair', workerId: 'worker3' },
  { id: 'conv4', name: 'Fatima Abdullahi', avatar: '👩‍💼', lastMessage: 'Thank you for the opportunity', timestamp: '2d ago', unread: 0, isOnline: false, job: 'House Cleaning', workerId: 'worker2' },
]

const allMessages: Record<string, Message[]> = {
  conv1: [
    { id: '1', sender: 'other', text: 'Hi! I saw your bathroom renovation job posting.', time: '10:30' },
    { id: '2', sender: 'other', text: 'I have 5+ years of experience with similar projects.', time: '10:31' },
    { id: '3', sender: 'me', text: 'Great! When can you start?', time: '10:45' },
    { id: '4', sender: 'other', text: 'Can you start on Monday?', time: '11:00' },
    { id: '5', sender: 'me', text: 'Monday works perfectly. What time?', time: '11:02' },
  ],
  conv2: [
    { id: '1', sender: 'me', text: 'Hello! Interested in the electrical work?', time: '9:00' },
    { id: '2', sender: 'other', text: 'Yes! I have the certifications and experience.', time: '9:15' },
    { id: '3', sender: 'me', text: 'Can you do residential work?', time: '9:20' },
    { id: '4', sender: 'other', text: 'I can do that!', time: '9:30' },
  ],
  conv3: [
    { id: '1', sender: 'other', text: 'Hi, I saw your plumbing job', time: 'Yesterday' },
    { id: '2', sender: 'me', text: 'When are you available?', time: 'Yesterday' },
    { id: '3', sender: 'other', text: 'What time works best for you?', time: 'Today' },
  ],
  conv4: [
    { id: '1', sender: 'me', text: 'Thanks for applying!', time: '2d ago' },
    { id: '2', sender: 'other', text: 'Thank you for the opportunity', time: '2d ago' },
  ],
}

export function Messaging() {
  const { setCurrentPage, viewWorkerProfile } = useAppStore()
  // PHASE 3 FIX: null = show list, string = show chat (mobile stack behaviour)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [localMessages, setLocalMessages] = useState(allMessages)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedConv = conversations.find(c => c.id === selectedId)
  const convMessages = selectedId ? (localMessages[selectedId] ?? []) : []
  const filtered = conversations.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.job.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Scroll to bottom when messages change or conversation opens
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [convMessages.length, selectedId])

  const handleSend = () => {
    const text = messageInput.trim()
    if (!text || !selectedId) return
    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'me',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setLocalMessages(prev => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] ?? []), newMsg],
    }))
    setMessageInput('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
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
          <div className="text-center py-16 text-muted-foreground text-sm">No conversations found</div>
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
                <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                  {conv.avatar}
                </div>
                {conv.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-bold text-foreground text-sm truncate">{conv.name}</span>
                  <span className="text-xs text-muted-foreground ml-2 shrink-0">{conv.timestamp}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate mb-0.5">{conv.job}</p>
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
          <button
            onClick={() => setSelectedId(null)}
            className="p-1.5 -ml-1.5 rounded-lg hover:bg-secondary transition md:hidden"
          >
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
              {selectedConv.avatar}
            </div>
            {selectedConv.isOnline && (
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
            )}
          </div>
          <div>
            <button onClick={() => selectedConv.workerId && viewWorkerProfile(selectedConv.workerId)} className="font-black text-foreground text-sm hover:text-primary transition text-left">{selectedConv.name}</button>
            <p className="text-xs text-muted-foreground">{selectedConv.isOnline ? '🟢 Online' : selectedConv.job}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 hover:bg-secondary rounded-lg transition"><Phone size={18} className="text-primary" /></button>
          <button className="p-2 hover:bg-secondary rounded-lg transition"><Video size={18} className="text-primary" /></button>
          <button className="p-2 hover:bg-secondary rounded-lg transition"><MoreVertical size={18} className="text-muted-foreground" /></button>
        </div>
      </div>

      {/* Messages — scrollable, pb accounts for input bar */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {convMessages.map((msg, i) => (
          <motion.div
            key={msg.id}
            initial={{ y: 6, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.03 }}
            className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${msg.sender === 'me'
              ? 'bg-primary text-primary-foreground rounded-br-sm'
              : 'bg-secondary text-foreground rounded-bl-sm'
              }`}>
              <p className="text-sm leading-relaxed">{msg.text}</p>
              <p className={`text-xs mt-1 ${msg.sender === 'me' ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                {msg.time}
              </p>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* PHASE 3 FIX: Input bar — sticky bottom, above BottomNav (pb-0, BottomNav handles its own spacing) */}
      <div className="border-t border-border px-3 py-3 bg-background">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a message..."
            value={messageInput}
            onChange={e => setMessageInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 px-4 py-3 border border-border rounded-xl focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground/60 bg-secondary/30 text-sm transition"
          />
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleSend}
            disabled={!messageInput.trim()}
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
        <div className="text-5xl mb-4">💬</div>
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