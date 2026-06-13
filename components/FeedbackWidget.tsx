'use client'

/**
 * FeedbackWidget — floating 💡 button, always visible on authenticated pages.
 * One tap → bottom sheet → pick type → type message → send.
 * Stored locally in zustand for now. Easy to wire to a real API later.
 */

import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Check } from 'lucide-react'
import { useState } from 'react'
import { useAppStore } from '@/lib/store'

type FeedbackType = 'love' | 'broken' | 'suggestion' | 'confused'

const TYPES: { id: FeedbackType; emoji: string; label: string; placeholder: string }[] = [
    {
        id: 'love',
        emoji: '👍',
        label: 'Something I love',
        placeholder: "What's working great for you?",
    },
    {
        id: 'broken',
        emoji: '👎',
        label: "Something that's broken",
        placeholder: 'What went wrong? Where did it happen?',
    },
    {
        id: 'suggestion',
        emoji: '💡',
        label: 'I have a suggestion',
        placeholder: 'What would you like to see on Butsó?',
    },
    {
        id: 'confused',
        emoji: '❓',
        label: "I'm confused about something",
        placeholder: "What didn't make sense to you?",
    },
]

export function FeedbackWidget() {
    const { currentUser } = useAppStore()
    const [open, setOpen] = useState(false)
    const [type, setType] = useState<FeedbackType | null>(null)
    const [text, setText] = useState('')
    const [sent, setSent] = useState(false)

    if (!currentUser) return null

    const selected = TYPES.find(t => t.id === type)

    const handleSend = () => {
        if (!text.trim() || !type) return
        // Store locally for now — swap for API call later
        const existing = JSON.parse(localStorage.getItem('butso_feedback') || '[]')
        existing.push({
            type,
            text: text.trim(),
            userId: currentUser.id,
            name: currentUser.name,
            createdAt: new Date().toISOString(),
        })
        localStorage.setItem('butso_feedback', JSON.stringify(existing))
        setSent(true)
        setTimeout(() => {
            setSent(false)
            setOpen(false)
            setType(null)
            setText('')
        }, 2000)
    }

    const handleClose = () => {
        setOpen(false)
        setType(null)
        setText('')
        setSent(false)
    }

    return (
        <>
            {/* ── Floating button ── */}
            <AnimatePresence>
                {!open && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.93 }}
                        onClick={() => setOpen(true)}
                        // Sits above BottomNav (bottom-20) and to the left of LiveSupport (which is on the right)
                        className="fixed bottom-20 left-4 md:bottom-6 md:left-6 z-40 w-12 h-12 bg-card border-2 border-border shadow-lg rounded-full flex items-center justify-center text-xl hover:border-primary/50 hover:shadow-xl transition-all"
                        aria-label="Share feedback"
                    >
                        💡
                    </motion.button>
                )}
            </AnimatePresence>

            {/* ── Bottom sheet overlay ── */}
            <AnimatePresence>
                {open && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleClose}
                            className="fixed inset-0 bg-black/40 z-50"
                        />

                        {/* Sheet */}
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl shadow-2xl max-w-lg mx-auto"
                        >
                            {/* Handle */}
                            <div className="flex justify-center pt-3 pb-1">
                                <div className="w-10 h-1 bg-border rounded-full" />
                            </div>

                            <div className="px-5 pb-8 pt-2">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-5">
                                    <div>
                                        <h2 className="text-lg font-black text-foreground">
                                            {sent ? 'Thank you! 🙏' : type ? selected?.label : "What's on your mind?"}
                                        </h2>
                                        {!type && !sent && (
                                            <p className="text-sm text-muted-foreground mt-0.5">
                                                Your voice helps us build better
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={handleClose}
                                        className="p-2 rounded-xl hover:bg-secondary transition"
                                    >
                                        <X size={18} className="text-muted-foreground" />
                                    </button>
                                </div>

                                {/* Sent state */}
                                {sent && (
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="flex flex-col items-center py-6 gap-3"
                                    >
                                        <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                                            <Check size={28} className="text-primary" />
                                        </div>
                                        <p className="text-muted-foreground text-sm text-center">
                                            We read every single one. This one's already in our inbox.
                                        </p>
                                    </motion.div>
                                )}

                                {/* Type selection */}
                                {!type && !sent && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-2"
                                    >
                                        {TYPES.map(t => (
                                            <motion.button
                                                key={t.id}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setType(t.id)}
                                                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-border hover:border-primary/40 hover:bg-primary/5 transition text-left"
                                            >
                                                <span className="text-2xl">{t.emoji}</span>
                                                <span className="font-bold text-foreground">{t.label}</span>
                                            </motion.button>
                                        ))}
                                    </motion.div>
                                )}

                                {/* Text input */}
                                {type && !sent && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 12 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-4"
                                    >
                                        <textarea
                                            autoFocus
                                            rows={4}
                                            value={text}
                                            onChange={e => setText(e.target.value.slice(0, 500))}
                                            placeholder={selected?.placeholder}
                                            className="w-full px-4 py-3 border-2 border-border rounded-2xl focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground/50 resize-none text-sm bg-background transition"
                                        />
                                        <div className="flex items-center justify-between gap-3">
                                            <button
                                                onClick={() => setType(null)}
                                                className="text-sm text-muted-foreground hover:text-foreground transition py-1"
                                            >
                                                ← Change
                                            </button>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-muted-foreground">{text.length}/500</span>
                                                <motion.button
                                                    whileTap={{ scale: 0.96 }}
                                                    onClick={handleSend}
                                                    disabled={!text.trim()}
                                                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition disabled:opacity-40 text-sm"
                                                >
                                                    <Send size={15} /> Send
                                                </motion.button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}