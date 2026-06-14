'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Check, ChevronRight, ArrowLeft, Loader2 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAppStore } from '@/lib/store'

type FeedbackType = 'love' | 'broken' | 'suggestion' | 'confused'

// ── Content per type ──────────────────────────────────────────────────────────

const LOVE_TOPICS = [
    { emoji: '🔍', label: 'Browsing jobs is easy' },
    { emoji: '💬', label: 'Messaging feels smooth' },
    { emoji: '🛠️', label: 'Finding workers is fast' },
    { emoji: '🏪', label: 'Shops are well organised' },
    { emoji: '🌙', label: 'Dark mode looks great' },
    { emoji: '⚡', label: 'The app is fast' },
    { emoji: '🎯', label: 'Quick Apply saves time' },
    { emoji: '🔔', label: 'Notifications are helpful' },
]

const BROKEN_TOPICS = [
    { emoji: '📱', label: 'App crashes or freezes' },
    { emoji: '🔐', label: 'Login / verification issue' },
    { emoji: '💬', label: "Messages won't send" },
    { emoji: '🏪', label: 'Shop not loading properly' },
    { emoji: '💳', label: 'Payment or booking issue' },
    { emoji: '🔔', label: 'Not getting notifications' },
    { emoji: '🖼️', label: 'Images not showing' },
    { emoji: '🔄', label: 'Page stuck or not updating' },
]

const SUGGESTION_TOPICS = [
    { emoji: '✨', label: 'New feature idea' },
    { emoji: '🎨', label: 'Design or layout' },
    { emoji: '⚡', label: 'Make something faster' },
    { emoji: '🛠️', label: 'Improve an existing feature' },
    { emoji: '🌍', label: 'Language or accessibility' },
    { emoji: '🔒', label: 'Safety or trust' },
    { emoji: '💰', label: 'Pricing or fees' },
    { emoji: '📦', label: 'Something completely new' },
]

const FAQS = [
    {
        emoji: '📋',
        question: 'How do I apply for a job?',
        answer: 'Find a job you like, tap it, then tap "Quick Apply" to apply instantly with your profile — no writing needed. Or tap "Add a Message" to send a short note with your application.',
    },
    {
        emoji: '💰',
        question: 'How does payment work?',
        answer: 'When you and an employer agree on a job, payment is held safely by Butsó. After the job is done and marked complete by the employer, the money is released to you. Butsó takes a small 5% fee.',
    },
    {
        emoji: '🏪',
        question: 'How do I set up a shop?',
        answer: 'Go to Explore → tap your profile icon → "Set Up My Shop". Add your shop name, category, services and prices. Your shop goes live immediately.',
    },
    {
        emoji: '📅',
        question: "Why can't I see my booking?",
        answer: 'Bookings appear after an employer accepts your application. Check the Bookings tab. If you applied but haven\'t heard back, the employer may not have responded yet.',
    },
    {
        emoji: '📱',
        question: 'How do I change my phone number?',
        answer: 'Go to Profile → Settings → Account → Change Phone Number. You\'ll need to verify the new number with an OTP code.',
    },
    {
        emoji: '🌟',
        question: 'What is Butsó Insiders?',
        answer: 'Butsó Insiders is our early member programme. Join early and you get 0% fees for your first 30 days. Refer friends and earn more fee-free jobs. Coming very soon.',
    },
    {
        emoji: '🚨',
        question: 'How do I report someone?',
        answer: 'On any profile or job, scroll to the bottom and tap "Report". Describe what happened and our team reviews it within 24 hours. Serious issues are prioritised.',
    },
    {
        emoji: '⭐',
        question: 'How do ratings work?',
        answer: 'After every completed job, both the worker and employer rate each other out of 5 stars. Your average rating shows on your profile and helps others trust you.',
    },
]

// ── Types ─────────────────────────────────────────────────────────────────────

type Stage =
    | 'type-select'       // pick love / broken / suggestion / confused
    | 'topic-select'      // pick a topic chip
    | 'text-input'        // free text after topic picked
    | 'faq-list'          // confused: show FAQ topics
    | 'faq-answer'        // confused: show answer to selected FAQ
    | 'ai-input'          // confused: ask AI
    | 'ai-thinking'       // confused: AI loading
    | 'ai-answer'         // confused: AI responded
    | 'sent'              // success

const TYPE_META: Record<FeedbackType, { emoji: string; label: string; color: string }> = {
    love: { emoji: '👍', label: 'Something I love', color: 'text-green-600' },
    broken: { emoji: '👎', label: "Something that's broken", color: 'text-red-500' },
    suggestion: { emoji: '💡', label: 'I have a suggestion', color: 'text-amber-500' },
    confused: { emoji: '❓', label: "I'm confused about something", color: 'text-primary' },
}

// ── Simulated AI response ─────────────────────────────────────────────────────

async function getAIAnswer(question: string): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: 'claude-sonnet-4-6',
            max_tokens: 1000,
            system: `You are Butsó's helpful support assistant. Butsó is a Nigerian local services platform based in Wukari, Taraba State. It connects workers (plumbers, barbers, cleaners, tailors, electricians, carpenters, cooks, etc.) with people who need help. Users can also browse shops, post jobs, apply for work, message each other, and book services.

Answer questions about how the platform works in a warm, clear, simple tone. Keep answers short (2-4 sentences max). If you genuinely don't know something specific about Butsó, say so honestly and suggest they contact support via the live chat button. Never make up features that don't exist. Respond in the same language the user writes in — if they write in pidgin, respond in pidgin.`,
            messages: [{ role: 'user', content: question }],
        }),
    })
    const data = await response.json()
    return data.content?.[0]?.text ?? "I'm not sure about that one. Try the live support chat and a real person will help you quickly."
}

// ── Main component ────────────────────────────────────────────────────────────

export function FeedbackWidget() {
    const { currentUser } = useAppStore()
    const [open, setOpen] = useState(false)
    const [type, setType] = useState<FeedbackType | null>(null)
    const [topic, setTopic] = useState<string | null>(null)
    const [stage, setStage] = useState<Stage>('type-select')
    const [text, setText] = useState('')
    const [selectedFaq, setSelectedFaq] = useState<typeof FAQS[0] | null>(null)
    const [aiAnswer, setAiAnswer] = useState('')
    const [aiError, setAiError] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        if (stage === 'text-input' || stage === 'ai-input') {
            setTimeout(() => textareaRef.current?.focus(), 100)
        }
    }, [stage])

    if (!currentUser) return null

    const reset = () => {
        setOpen(false)
        setType(null)
        setTopic(null)
        setStage('type-select')
        setText('')
        setSelectedFaq(null)
        setAiAnswer('')
        setAiError(false)
    }

    const handleSelectType = (t: FeedbackType) => {
        setType(t)
        setStage(t === 'confused' ? 'faq-list' : 'topic-select')
    }

    const handleSelectTopic = (t: string) => {
        setTopic(t)
        setStage('text-input')
    }

    const handleSend = () => {
        if (!text.trim()) return
        const existing = JSON.parse(localStorage.getItem('butso_feedback') || '[]')
        existing.push({
            type,
            topic,
            text: text.trim(),
            userId: currentUser.id,
            name: currentUser.name,
            createdAt: new Date().toISOString(),
        })
        localStorage.setItem('butso_feedback', JSON.stringify(existing))
        setStage('sent')
        setTimeout(reset, 2500)
    }

    const handleAskAI = async () => {
        if (!text.trim()) return
        setStage('ai-thinking')
        setAiError(false)
        try {
            const answer = await getAIAnswer(text.trim())
            setAiAnswer(answer)
            setStage('ai-answer')
        } catch {
            setAiError(true)
            setStage('ai-answer')
        }
    }

    const topics =
        type === 'love' ? LOVE_TOPICS :
            type === 'broken' ? BROKEN_TOPICS :
                type === 'suggestion' ? SUGGESTION_TOPICS : []

    const meta = type ? TYPE_META[type] : null

    // ── Render stages ──────────────────────────────────────────────────────────

    const renderContent = () => {
        switch (stage) {

            // 1. Pick type
            case 'type-select':
                return (
                    <motion.div key="type" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-2">
                        {(Object.entries(TYPE_META) as [FeedbackType, typeof TYPE_META[FeedbackType]][]).map(([id, m]) => (
                            <motion.button key={id} whileTap={{ scale: 0.98 }}
                                onClick={() => handleSelectType(id)}
                                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-border hover:border-primary/40 hover:bg-primary/5 transition text-left">
                                <span className="text-2xl">{m.emoji}</span>
                                <span className="font-bold text-foreground">{m.label}</span>
                                <ChevronRight size={16} className="ml-auto text-muted-foreground" />
                            </motion.button>
                        ))}
                    </motion.div>
                )

            // 2. Pick topic (love / broken / suggestion)
            case 'topic-select':
                return (
                    <motion.div key="topic" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                        <p className="text-sm text-muted-foreground">Pick a topic — or skip straight to writing</p>
                        <div className="flex flex-wrap gap-2">
                            {topics.map(t => (
                                <motion.button key={t.label} whileTap={{ scale: 0.95 }}
                                    onClick={() => handleSelectTopic(t.label)}
                                    className="flex items-center gap-2 px-3.5 py-2 rounded-2xl border-2 border-border hover:border-primary hover:bg-primary/5 transition text-sm font-semibold text-foreground">
                                    <span>{t.emoji}</span> {t.label}
                                </motion.button>
                            ))}
                        </div>
                        <button onClick={() => setStage('text-input')}
                            className="w-full py-3 rounded-2xl border-2 border-dashed border-border text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground transition font-semibold">
                            ✏️ Skip — just let me write
                        </button>
                    </motion.div>
                )

            // 3. Free text
            case 'text-input':
                return (
                    <motion.div key="text" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                        {topic && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-primary/8 rounded-xl">
                                <span className="text-xs font-bold text-primary">Topic:</span>
                                <span className="text-xs text-foreground font-semibold">{topic}</span>
                            </div>
                        )}
                        <textarea
                            ref={textareaRef}
                            rows={4}
                            value={text}
                            onChange={e => setText(e.target.value.slice(0, 500))}
                            placeholder={
                                type === 'love' ? "Tell us what you love about it..." :
                                    type === 'broken' ? "Describe what went wrong. Where did it happen?" :
                                        "What's your suggestion? Be as specific as you want."
                            }
                            className="w-full px-4 py-3 border-2 border-border rounded-2xl focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground/50 resize-none text-sm bg-background transition"
                        />
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-xs text-muted-foreground">{text.length}/500</span>
                            <motion.button whileTap={{ scale: 0.96 }} onClick={handleSend}
                                disabled={!text.trim()}
                                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition disabled:opacity-40 text-sm">
                                <Send size={15} /> Send
                            </motion.button>
                        </div>
                    </motion.div>
                )

            // 4. Confused — FAQ list
            case 'faq-list':
                return (
                    <motion.div key="faq" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-2">
                        <p className="text-sm text-muted-foreground mb-3">Pick a topic — your answer might already be here</p>
                        {FAQS.map(faq => (
                            <motion.button key={faq.question} whileTap={{ scale: 0.98 }}
                                onClick={() => { setSelectedFaq(faq); setStage('faq-answer') }}
                                className="w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 border-border hover:border-primary/40 hover:bg-primary/5 transition text-left">
                                <span className="text-xl shrink-0">{faq.emoji}</span>
                                <span className="text-sm font-semibold text-foreground leading-snug">{faq.question}</span>
                                <ChevronRight size={15} className="ml-auto text-muted-foreground shrink-0" />
                            </motion.button>
                        ))}
                        <button onClick={() => setStage('ai-input')}
                            className="w-full py-3 rounded-2xl border-2 border-dashed border-border text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground transition font-semibold mt-1">
                            🤖 My question isn't here — ask AI
                        </button>
                    </motion.div>
                )

            // 5. Confused — FAQ answer
            case 'faq-answer':
                return (
                    <motion.div key="faq-answer" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                        <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl">
                            <p className="text-sm font-black text-foreground mb-2">{selectedFaq?.question}</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">{selectedFaq?.answer}</p>
                        </div>
                        <p className="text-xs text-muted-foreground text-center">Did this answer your question?</p>
                        <div className="grid grid-cols-2 gap-2">
                            <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setStage('sent'); setTimeout(reset, 2500) }}
                                className="py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition">
                                👍 Yes, thanks!
                            </motion.button>
                            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStage('ai-input')}
                                className="py-2.5 rounded-xl border-2 border-border font-bold text-sm text-foreground hover:border-primary/40 transition">
                                🤖 Ask AI instead
                            </motion.button>
                        </div>
                    </motion.div>
                )

            // 6. Confused — ask AI
            case 'ai-input':
                return (
                    <motion.div key="ai-input" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                        <div className="flex items-center gap-2 px-3 py-2 bg-primary/8 rounded-xl">
                            <span className="text-lg">🤖</span>
                            <span className="text-xs text-muted-foreground">Ask anything about Butsó — AI will answer instantly</span>
                        </div>
                        <textarea
                            ref={textareaRef}
                            rows={3}
                            value={text}
                            onChange={e => setText(e.target.value.slice(0, 300))}
                            placeholder="e.g. How do I know if my application was accepted?"
                            className="w-full px-4 py-3 border-2 border-border rounded-2xl focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground/50 resize-none text-sm bg-background transition"
                        />
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-xs text-muted-foreground">{text.length}/300</span>
                            <motion.button whileTap={{ scale: 0.96 }} onClick={handleAskAI}
                                disabled={!text.trim()}
                                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition disabled:opacity-40 text-sm">
                                Ask AI <ChevronRight size={15} />
                            </motion.button>
                        </div>
                    </motion.div>
                )

            // 7. AI thinking
            case 'ai-thinking':
                return (
                    <motion.div key="thinking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-8 gap-3">
                        <Loader2 size={32} className="text-primary animate-spin" />
                        <p className="text-sm text-muted-foreground">Thinking...</p>
                    </motion.div>
                )

            // 8. AI answer
            case 'ai-answer':
                return (
                    <motion.div key="ai-answer" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                        <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-2xl">
                            <span className="text-xl shrink-0">🤖</span>
                            <p className="text-sm text-foreground leading-relaxed">
                                {aiError
                                    ? "Sorry, I couldn't get an answer right now. Try the live support chat — a real person will help you fast."
                                    : aiAnswer}
                            </p>
                        </div>
                        <p className="text-xs text-muted-foreground text-center">Was this helpful?</p>
                        <div className="grid grid-cols-2 gap-2">
                            <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setStage('sent'); setTimeout(reset, 2500) }}
                                className="py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition">
                                👍 Yes, sorted!
                            </motion.button>
                            <motion.button whileTap={{ scale: 0.97 }} onClick={() => {
                                // Escalate to live support
                                reset()
                                // The LiveSupportChat floating button is always on screen
                                // Just close this and let them tap it
                            }}
                                className="py-2.5 rounded-xl border-2 border-border font-bold text-sm text-foreground hover:border-primary/40 transition">
                                💬 Live support
                            </motion.button>
                        </div>
                    </motion.div>
                )

            // 9. Sent
            case 'sent':
                return (
                    <motion.div key="sent" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center py-6 gap-3">
                        <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                            <Check size={28} className="text-primary" />
                        </div>
                        <p className="font-black text-foreground">
                            {type === 'confused' ? 'Glad we could help!' : 'Got it — thank you! 🙏'}
                        </p>
                        <p className="text-sm text-muted-foreground text-center">
                            {type === 'confused'
                                ? 'Come back anytime you have questions.'
                                : 'We read every single one. This one is already in our inbox.'}
                        </p>
                    </motion.div>
                )
        }
    }

    // ── Header title per stage ─────────────────────────────────────────────────

    const headerTitle = () => {
        if (stage === 'type-select') return "What's on your mind?"
        if (stage === 'sent') return type === 'confused' ? '✅ All sorted' : '✅ Feedback sent'
        if (stage === 'faq-list') return '❓ What are you confused about?'
        if (stage === 'faq-answer') return '📖 Answer'
        if (stage === 'ai-input') return '🤖 Ask AI'
        if (stage === 'ai-thinking') return '🤖 Thinking...'
        if (stage === 'ai-answer') return '🤖 AI Answer'
        if (stage === 'topic-select') return `${meta?.emoji} ${meta?.label}`
        if (stage === 'text-input') return `${meta?.emoji} ${meta?.label}`
        return "What's on your mind?"
    }

    const canGoBack = stage !== 'type-select' && stage !== 'sent' && stage !== 'ai-thinking'
    const handleBack = () => {
        if (stage === 'topic-select') setStage('type-select')
        else if (stage === 'text-input') setStage(type === 'confused' ? 'faq-list' : 'topic-select')
        else if (stage === 'faq-list') setStage('type-select')
        else if (stage === 'faq-answer') setStage('faq-list')
        else if (stage === 'ai-input') setStage('faq-list')
        else if (stage === 'ai-answer') setStage('ai-input')
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
                        className="fixed bottom-20 left-4 md:bottom-6 md:left-6 z-40 w-12 h-12 bg-card border-2 border-border shadow-lg rounded-full flex items-center justify-center text-xl hover:border-primary/50 hover:shadow-xl transition-all"
                        aria-label="Share feedback"
                    >
                        💡
                    </motion.button>
                )}
            </AnimatePresence>

            {/* ── Bottom sheet ── */}
            <AnimatePresence>
                {open && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={reset} className="fixed inset-0 bg-black/40 z-50" />

                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl shadow-2xl max-w-lg mx-auto max-h-[85vh] flex flex-col"
                        >
                            {/* Handle */}
                            <div className="flex justify-center pt-3 pb-1 shrink-0">
                                <div className="w-10 h-1 bg-border rounded-full" />
                            </div>

                            {/* Header */}
                            <div className="flex items-center justify-between px-5 py-2 shrink-0">
                                <div className="flex items-center gap-2">
                                    {canGoBack && (
                                        <button onClick={handleBack} className="p-1.5 rounded-xl hover:bg-secondary transition mr-1">
                                            <ArrowLeft size={16} className="text-muted-foreground" />
                                        </button>
                                    )}
                                    <h2 className="text-base font-black text-foreground">{headerTitle()}</h2>
                                </div>
                                <button onClick={reset} className="p-2 rounded-xl hover:bg-secondary transition">
                                    <X size={18} className="text-muted-foreground" />
                                </button>
                            </div>

                            {/* Scrollable content */}
                            <div className="flex-1 overflow-y-auto px-5 pb-8 pt-2">
                                <AnimatePresence mode="wait">
                                    {renderContent()}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}