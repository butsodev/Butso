'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, Wallet, ShieldCheck, ArrowDownToLine, TrendingUp, Sparkles } from 'lucide-react'
import { useAppStore, goBackTo } from '@/lib/store'

const upcoming = [
  { icon: ShieldCheck, title: 'Secure escrow', body: 'Money is held safely until the job is done and both sides are happy.' },
  { icon: TrendingUp, title: 'Earnings history', body: 'See every payment in one place, with totals by week and month.' },
  { icon: ArrowDownToLine, title: 'Bank withdrawals', body: 'Cash out your earnings straight to your Nigerian bank account.' },
]

export function PaymentsEarnings() {
  const { currentUser, setCurrentPage } = useAppStore()
  const reduce = useReducedMotion()
  const isWorker = currentUser?.role === 'worker'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background text-foreground pb-20"
    >
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background border-b border-border">
        <div className="flex items-center gap-3 px-4 py-4 sm:px-6">
          <button
            aria-label="Go back"
            onClick={() => goBackTo('dashboard')}
            className="p-2 hover:bg-secondary rounded-lg transition"
          >
            <ArrowLeft size={24} className="text-foreground" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">{isWorker ? 'Earnings' : 'Payments'}</h1>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 sm:px-6 pt-10">
        {/* Animated hero */}
        <div className="relative flex items-center justify-center h-52" aria-hidden="true">
          {/* Pulsing rings */}
          {[0, 1, 2].map(i => (
            <motion.span
              key={i}
              className="absolute rounded-full border border-primary/30"
              style={{ width: 96, height: 96 }}
              initial={{ scale: 1, opacity: 0.5 }}
              animate={reduce ? { scale: 1.6, opacity: 0.15 } : { scale: [1, 2.4], opacity: [0.5, 0] }}
              transition={reduce ? { duration: 0 } : { duration: 3, repeat: Infinity, delay: i * 1, ease: 'easeOut' }}
            />
          ))}

          {/* Wallet */}
          <motion.div
            className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center shadow-lg"
            animate={reduce ? undefined : { y: [0, -10, 0], rotate: [0, -3, 3, 0] }}
            transition={reduce ? undefined : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Wallet size={44} />
          </motion.div>

          {/* Falling coins */}
          {[
            { x: -70, delay: 0 },
            { x: 66, delay: 0.9 },
            { x: -20, delay: 1.7 },
          ].map((c, i) => (
            <motion.span
              key={i}
              className="absolute top-2 w-7 h-7 rounded-full bg-amber-400 text-amber-900 text-sm font-black flex items-center justify-center shadow"
              style={{ marginLeft: c.x }}
              initial={{ y: -10, opacity: 0 }}
              animate={reduce ? { y: 40, opacity: 0.9 } : { y: [-10, 70, 90], opacity: [0, 1, 0], rotate: [0, 180, 360] }}
              transition={reduce ? { duration: 0 } : { duration: 2.6, repeat: Infinity, delay: c.delay, ease: 'easeIn' }}
            >
              ₦
            </motion.span>
          ))}
        </div>

        {/* Message */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-center"
        >
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide bg-accent/15 text-accent px-3 py-1 rounded-full">
            <Sparkles size={12} /> Coming soon
          </span>
          <h2 className="text-3xl font-black text-foreground mt-4 mb-2">
            {isWorker ? 'Earnings are on the way' : 'Payments are on the way'}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            We are building safe in-app payments for Butsó. For now, agree the price in the chat or on the booking and
            pay each other directly.
          </p>
        </motion.div>

        {/* What is coming */}
        <div className="mt-8 space-y-3">
          {upcoming.map((f, i) => {
            const Icon = f.icon
            return (
              <motion.div
                key={f.title}
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-start gap-4 p-4 bg-card border border-border rounded-2xl"
              >
                <div className="w-10 h-10 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Icon size={20} />
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">{f.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{f.body}</p>
                </div>
              </motion.div>
            )
          })}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setCurrentPage('bookings')}
            className="flex-1 min-h-[48px] rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition"
          >
            View my bookings
          </button>
          <button
            onClick={() => setCurrentPage('dashboard')}
            className="flex-1 min-h-[48px] rounded-xl border border-border text-foreground font-bold text-sm hover:bg-secondary transition"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    </motion.div>
  )
}
