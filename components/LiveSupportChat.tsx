'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Minimize2, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

type SupportMessage = {
    id: string
    sender: 'user' | 'support' | 'bot'
    text: string
    time: string
}

const INITIAL_MESSAGES: SupportMessage[] = [
    {
        id: '1',
        sender: 'bot',
        text: '👋 Hi there! Welcome to Butsó Support. How can we help you today?',
        time: 'now',
    },
]

const QUICK_REPLIES = [
    'My payment is delayed',
    'I have a dispute',
    'Can\'t find my booking',
    'Account issue',
]

// PHASE 4: This is a completely separate floating widget — has nothing to do with the Messaging inbox.
// It lives as a global overlay and can be imported once in layout or page.tsx alongside BottomNav.
export function LiveSupportChat() {
    const [isOpen, setIsOpen] = useState(false)
    const [isMinimized, setIsMinimized] = useState(false)
    const [messages, setMessages] = useState<SupportMessage[]>(INITIAL_MESSAGES)
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (isOpen && !isMinimized) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
            setUnreadCount(0)
        }
    }, [messages, isOpen, isMinimized])

    const simulateSupportReply = (userText: string) => {
        setIsTyping(true)
        setTimeout(() => {
            const reply = getSupportReply(userText)
            const newMsg: SupportMessage = {
                id: Date.now().toString(),
                sender: 'support',
                text: reply,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
            setMessages(prev => [...prev, newMsg])
            setIsTyping(false)
            if (!isOpen || isMinimized) {
                setUnreadCount(prev => prev + 1)
            }
        }, 1200 + Math.random() * 800)
    }

    const getSupportReply = (text: string): string => {
        const lower = text.toLowerCase()
        if (lower.includes('payment') || lower.includes('money')) {
            return 'I can help with that! Payment issues are usually resolved within 24 hours. Can you share your booking ID so I can look into it?'
        }
        if (lower.includes('dispute')) {
            return 'I\'m sorry to hear that. Our team handles disputes fairly and quickly. Please describe what happened and we\'ll investigate right away.'
        }
        if (lower.includes('booking') || lower.includes('book')) {
            return 'Let me help you find your booking. Can you tell me the job title or the date you made the booking?'
        }
        if (lower.includes('account')) {
            return 'For account issues, can you tell me more? Is it a login problem, verification issue, or something else?'
        }
        return 'Thanks for reaching out! A support agent will be with you shortly. In the meantime, is there anything else you can tell me about your issue?'
    }

    const handleSend = (text?: string) => {
        const msg = (text ?? input).trim()
        if (!msg) return
        const newMsg: SupportMessage = {
            id: Date.now().toString(),
            sender: 'user',
            text: msg,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
        setMessages(prev => [...prev, newMsg])
        setInput('')
        simulateSupportReply(msg)
        inputRef.current?.focus()
    }

    const handleOpen = () => {
        setIsOpen(true)
        setIsMinimized(false)
        setUnreadCount(0)
    }

    return (
        <>
            {/* ── Floating Button ── */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.94 }}
                        onClick={handleOpen}
                        // PHASE 4 FIX: Positioned above BottomNav on mobile (bottom-20), bottom-6 on desktop
                        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg shadow-primary/30 flex items-center justify-center"
                        aria-label="Open live support"
                    >
                        <MessageCircle size={24} />
                        {unreadCount > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-black rounded-full flex items-center justify-center"
                            >
                                {unreadCount}
                            </motion.span>
                        )}
                    </motion.button>
                )}
            </AnimatePresence>

            {/* ── Chat Window ── */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                        // PHASE 4 FIX: Above BottomNav on mobile, bottom-right corner on desktop
                        className="fixed bottom-20 right-3 md:bottom-6 md:right-6 z-50 w-[calc(100vw-24px)] max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-border bg-background flex flex-col"
                        style={{ height: isMinimized ? 'auto' : '480px' }}
                    >
                        {/* Header */}
                        <div className="bg-primary px-4 py-3 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                                    <MessageCircle size={18} className="text-white" />
                                </div>
                                <div>
                                    <p className="font-black text-white text-sm">Butsó Support</p>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                        <span className="text-white/70 text-xs">Live · Usually replies in minutes</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setIsMinimized(!isMinimized)}
                                    className="p-1.5 hover:bg-white/20 rounded-lg transition"
                                >
                                    {isMinimized
                                        ? <MessageCircle size={16} className="text-white" />
                                        : <ChevronDown size={16} className="text-white" />
                                    }
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 hover:bg-white/20 rounded-lg transition"
                                >
                                    <X size={16} className="text-white" />
                                </button>
                            </div>
                        </div>

                        {/* Body — hidden when minimized */}
                        <AnimatePresence>
                            {!isMinimized && (
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: 'auto' }}
                                    exit={{ height: 0 }}
                                    className="flex flex-col flex-1 overflow-hidden"
                                >
                                    {/* Messages */}
                                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-secondary/10">
                                        {messages.map((msg) => (
                                            <div
                                                key={msg.id}
                                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                {msg.sender !== 'user' && (
                                                    <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center text-sm mr-2 shrink-0 mt-auto">
                                                        🎧
                                                    </div>
                                                )}
                                                <div className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${msg.sender === 'user'
                                                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                                                    : 'bg-background text-foreground border border-border rounded-bl-sm'
                                                    }`}>
                                                    {msg.text}
                                                    <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                                                        {msg.time}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Typing indicator */}
                                        {isTyping && (
                                            <div className="flex items-end gap-2">
                                                <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center text-sm shrink-0">🎧</div>
                                                <div className="bg-background border border-border px-4 py-3 rounded-2xl rounded-bl-sm">
                                                    <div className="flex gap-1 items-center">
                                                        {[0, 1, 2].map(i => (
                                                            <motion.div
                                                                key={i}
                                                                className="w-1.5 h-1.5 bg-muted-foreground rounded-full"
                                                                animate={{ y: [0, -4, 0] }}
                                                                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Quick Replies — shown only at start */}
                                    {messages.length <= 2 && (
                                        <div className="px-3 py-2 flex gap-2 flex-wrap border-t border-border bg-background">
                                            {QUICK_REPLIES.map(q => (
                                                <button
                                                    key={q}
                                                    onClick={() => handleSend(q)}
                                                    className="text-xs bg-primary/10 text-primary font-medium px-3 py-1.5 rounded-full hover:bg-primary/20 transition"
                                                >
                                                    {q}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Input */}
                                    <div className="border-t border-border px-3 py-2.5 bg-background flex items-center gap-2 shrink-0">
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            placeholder="Type your message..."
                                            value={input}
                                            onChange={e => setInput(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                                            className="flex-1 px-3 py-2 bg-secondary/30 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition"
                                        />
                                        <button
                                            onClick={() => handleSend()}
                                            disabled={!input.trim()}
                                            className="w-9 h-9 bg-primary text-primary-foreground rounded-xl flex items-center justify-center hover:bg-primary/90 transition disabled:opacity-40 shrink-0"
                                        >
                                            <Send size={15} />
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}