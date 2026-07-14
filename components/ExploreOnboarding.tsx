'use client'

/**
 * ExploreOnboarding
 * ─────────────────
 * Shown when a user picks "Just looking around" on the landing page.
 * They tap 1–4 interest categories. These seed their personalised feed.
 * Low commitment — skip is always available.
 *
 * After this → navigates to 'jobs-browsing' (or whatever the main feed page is)
 * with preferences already set in the store.
 */

import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, X } from 'lucide-react'
import { useState } from 'react'
import { useAppStore } from '@/lib/store'

const ALL_CATEGORIES = [
    { emoji: '🔧', name: 'Plumbing' },
    { emoji: '⚡', name: 'Electrical' },
    { emoji: '🏗️', name: 'Building' },
    { emoji: '🧹', name: 'Cleaning' },
    { emoji: '🎨', name: 'Painting' },
    { emoji: '🌿', name: 'Gardening' },
    { emoji: '🚗', name: 'Driving' },
    { emoji: '🍳', name: 'Cooking' },
    { emoji: '🪚', name: 'Carpentry' },
    { emoji: '🧱', name: 'Masonry' },
    { emoji: '👔', name: 'Tailoring' },
    { emoji: '📦', name: 'Moving' },
    { emoji: '🛠️', name: 'Welding' },
    { emoji: '🧑‍🏫', name: 'Teaching' },
    { emoji: '💆', name: 'Beauty' },
    { emoji: '📸', name: 'Photography' },
]

export function ExploreOnboarding() {
    const { setCurrentPage, setChosenCategories, currentUser, setCurrentUser } = useAppStore()
    const [selected, setSelected] = useState<string[]>([])

    const toggle = (name: string) => {
        setSelected(prev =>
            prev.includes(name)
                ? prev.filter(n => n !== name)
                : prev.length < 5 ? [...prev, name] : prev
        )
    }

    const proceed = () => {
        setChosenCategories(selected)
        // Mark user as exploring if not already signed in
        if (!currentUser) {
            setCurrentUser({
                id: 'guest-' + Date.now(),
                phone: '',
                name: 'Guest',
                username: 'guest',
                role: 'exploring',
            })
        }
        setCurrentPage('jobs-browsing')
    }

    const skip = () => {
        setCurrentPage('jobs-browsing')
    }

    return (
        <div style={{ minHeight: '100dvh', background: '#1C1C19', color: '#F0EFEB', display: 'flex', flexDirection: 'column' }}>
            <style>{`
        .ob-cat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.45rem;
          padding: 0.9rem 0.5rem;
          border-radius: 0.875rem;
          border: 1.5px solid rgba(255,255,255,0.08);
          background: #242420;
          cursor: pointer;
          transition: all 0.15s ease;
          user-select: none;
        }
        .ob-cat:hover { border-color: rgba(27,158,110,0.4); background: #2A2A26; }
        .ob-cat.selected {
          border-color: #1B9E6E;
          background: rgba(27,158,110,0.15);
        }
        .ob-cat.selected .ob-cat-name { color: #1B9E6E; }
      `}</style>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, background: '#1B9E6E', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: '#fff', fontWeight: 900, fontSize: 13, fontFamily: 'var(--font-heading), serif' }}>B</span>
                    </div>
                    <span style={{ fontWeight: 900, fontFamily: 'var(--font-heading), serif', fontSize: '1.1rem' }}>Butsó</span>
                </div>
                <button
                    onClick={skip}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: '#8A8980', background: 'none', border: 'none', cursor: 'pointer', padding: '0.4rem 0.75rem', borderRadius: 99, transition: 'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#F0EFEB')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#8A8980')}
                >
                    Skip <X size={13} />
                </button>
            </div>

            {/* Content */}
            <div style={{ flex: 1, padding: '1.5rem 1.25rem 2rem', maxWidth: 520, margin: '0 auto', width: '100%' }}>

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                >
                    <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1B9E6E', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                        Quick setup
                    </p>
                    <h1 style={{ fontFamily: 'var(--font-heading), serif', fontSize: 'clamp(1.6rem, 5vw, 2.1rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.025em', marginBottom: '0.65rem' }}>
                        What are you<br />
                        <em style={{ color: '#1B9E6E', fontStyle: 'italic' }}>interested in?</em>
                    </h1>
                    <p style={{ fontSize: '0.85rem', color: '#8A8980', lineHeight: 1.6, marginBottom: '1.75rem' }}>
                        Choose up to 5 skills. We'll show you the jobs and workers that match you best. You can change this anytime.
                    </p>
                </motion.div>

                {/* Category grid */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '0.6rem', marginBottom: '2rem' }}
                >
                    {ALL_CATEGORIES.map((cat, i) => (
                        <motion.button
                            key={cat.name}
                            className={`ob-cat${selected.includes(cat.name) ? ' selected' : ''}`}
                            onClick={() => toggle(cat.name)}
                            initial={{ opacity: 0, scale: 0.88 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.08 + i * 0.03, duration: 0.3, ease: 'easeOut' }}
                            whileTap={{ scale: 0.94 }}
                        >
                            <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>{cat.emoji}</span>
                            <span className="ob-cat-name" style={{ fontSize: '0.68rem', fontWeight: 600, color: '#8A8980', textAlign: 'center', lineHeight: 1.3, transition: 'color 0.15s' }}>
                                {cat.name}
                            </span>
                            {selected.includes(cat.name) && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    style={{ position: 'absolute', top: 6, right: 6, width: 14, height: 14, background: '#1B9E6E', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <span style={{ color: '#fff', fontSize: 9, fontWeight: 900 }}>✓</span>
                                </motion.div>
                            )}
                        </motion.button>
                    ))}
                </motion.div>

                {/* Selection counter + CTA */}
                <AnimatePresence>
                    <motion.div
                        key={selected.length > 0 ? 'has-selection' : 'no-selection'}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                    >
                        {selected.length > 0 ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <button
                                    onClick={proceed}
                                    style={{
                                        flex: 1,
                                        background: '#1B9E6E',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '0.875rem',
                                        padding: '0.95rem',
                                        fontWeight: 800,
                                        fontSize: '0.92rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 8,
                                        boxShadow: '0 4px 20px rgba(27,158,110,0.3)',
                                    }}
                                >
                                    Show me {selected.length === 1 ? selected[0] : `${selected.length} categories`}
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={skip}
                                style={{
                                    width: '100%',
                                    background: 'transparent',
                                    color: '#8A8980',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '0.875rem',
                                    padding: '0.95rem',
                                    fontWeight: 600,
                                    fontSize: '0.88rem',
                                    cursor: 'pointer',
                                }}
                            >
                                Show me everything →
                            </button>
                        )}
                    </motion.div>
                </AnimatePresence>

                <p style={{ fontSize: '0.72rem', color: '#5A5A54', textAlign: 'center', marginTop: '1rem', lineHeight: 1.5 }}>
                    No account needed to browse · Sign up only when you're ready to act
                </p>
            </div>
        </div>
    )
}