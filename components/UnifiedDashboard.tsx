'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Star, Briefcase, DollarSign, Clock, ArrowRight, Bell, Plus, Users, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAppStore, type DashboardMode } from '@/lib/store'
import { SkeletonDashboard } from '@/components/Skeleton'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 280, damping: 24 } },
}

export function UnifiedDashboard() {
  const { currentUser, dashboardMode, setDashboardMode, setCurrentPage, jobs } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [prevMode, setPrevMode] = useState<DashboardMode>(dashboardMode)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(t)
  }, [])

  if (loading) return <SkeletonDashboard />

  const isLooking = dashboardMode === 'find-work'
  const myPostedJobs = jobs.filter(j => j.employerId === currentUser?.id)

  const switchMode = (mode: DashboardMode) => {
    setPrevMode(dashboardMode)
    setDashboardMode(mode)
  }


  // ── Contextual suggestions ────────────────────────────────────────────────
  const hour = new Date().getHours()
  const isWeekend = [0, 6].includes(new Date().getDay())

  const suggestions = [
    { emoji: '✂️', text: 'Barbing shops', page: 'shops', show: true },
    { emoji: '💇', text: 'Hair salons near you', page: 'shops', show: true },
    { emoji: '🧹', text: 'Cleaners available', page: 'shops', show: hour >= 7 && hour <= 20 },
    { emoji: '🔧', text: 'Plumbers ready now', page: 'people', show: true },
    { emoji: '⚡', text: 'Electricians nearby', page: 'people', show: true },
    { emoji: '🍳', text: 'Caterers & cooks', page: 'people', show: isWeekend },
    { emoji: '🚗', text: 'Auto repair workshops', page: 'shops', show: true },
    { emoji: '👗', text: 'Tailors taking orders', page: 'shops', show: true },
    { emoji: '📸', text: 'Event photographers', page: 'people', show: isWeekend },
    { emoji: '🏗️', text: 'Construction workers', page: 'people', show: !isWeekend },
  ].filter(s => s.show).slice(0, 6)

  const SuggestionStrip = (
    <motion.div variants={item} className="mb-2">
      <div className="flex items-center gap-1.5 mb-2.5">
        <Sparkles size={13} className="text-primary" />
        <p className="text-xs font-black text-muted-foreground uppercase tracking-wide">
          {hour < 12 ? 'Good morning. Try these' : hour < 17 ? 'Available near you' : 'Evening picks'}
        </p>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
        {suggestions.map((s, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage(s.page)}
            className="flex items-center gap-2 shrink-0 px-3 py-2 bg-card border border-border rounded-2xl hover:border-primary/40 hover:bg-primary/5 transition-all"
          >
            <span className="text-base leading-none">{s.emoji}</span>
            <span className="text-xs font-semibold text-foreground whitespace-nowrap">{s.text}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )

  // ─────────────────────────────────────────────────────────────────────────
  // BIG MODE SWITCHER — two full cards, very obvious, impossible to miss
  // ─────────────────────────────────────────────────────────────────────────
  const ModeSwitcher = (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {/* Find Work tab */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => switchMode('find-work')}
        className={`relative overflow-hidden rounded-2xl p-4 text-left transition-all duration-300 ${isLooking
          ? 'bg-primary shadow-lg shadow-primary/25 scale-[1.02]'
          : 'bg-card border-2 border-border hover:border-primary/40'
          }`}
      >
        <div className="text-2xl mb-2">🛠️</div>
        <p className={`font-black text-sm leading-tight ${isLooking ? 'text-white' : 'text-foreground'}`}>
          Find Work
        </p>
        <p className={`text-xs mt-0.5 ${isLooking ? 'text-white/70' : 'text-muted-foreground'}`}>
          Browse jobs near you
        </p>
        {isLooking && (
          <motion.div
            layoutId="activeTab"
            className="absolute bottom-2 right-2 w-2 h-2 bg-white rounded-full"
          />
        )}
      </motion.button>

      {/* Hire tab */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => switchMode('need-help')}
        className={`relative overflow-hidden rounded-2xl p-4 text-left transition-all duration-300 ${!isLooking
          ? 'bg-emerald-600 shadow-lg shadow-emerald-500/25 scale-[1.02]'
          : 'bg-card border-2 border-border hover:border-emerald-500/40'
          }`}
      >
        <div className="text-2xl mb-2">📋</div>
        <p className={`font-black text-sm leading-tight ${!isLooking ? 'text-white' : 'text-foreground'}`}>
          Hire Someone
        </p>
        <p className={`text-xs mt-0.5 ${!isLooking ? 'text-white/70' : 'text-muted-foreground'}`}>
          Post a job, get help
        </p>
        {!isLooking && (
          <motion.div
            layoutId="activeTab"
            className="absolute bottom-2 right-2 w-2 h-2 bg-white rounded-full"
          />
        )}
      </motion.button>
    </div>
  )

  // ─────────────────────────────────────────────────────────────────────────
  // FIND WORK CONTENT
  // ─────────────────────────────────────────────────────────────────────────
  const FindWorkView = (
    <motion.div key="find-work" variants={container} initial="hidden" animate="show" className="space-y-4">
      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3">
        {[
          { icon: Briefcase, label: 'Jobs Done', value: currentUser?.completedJobs || 0, color: 'text-primary', bg: 'bg-primary/10' },
          { icon: Star, label: 'Rating', value: `${currentUser?.rating ?? 5.0}★`, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { icon: DollarSign, label: 'Earned', value: '₦0', color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
          { icon: Clock, label: 'Status', value: 'Active', color: 'text-primary', bg: 'bg-primary/10' },
        ].map(stat => {
          const Icon = stat.icon
          return (
            <motion.div key={stat.label} variants={item} whileHover={{ y: -3 }}
              className="bg-card border border-border rounded-2xl p-4 shadow-sm">
              <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
                <Icon size={16} className={stat.color} />
              </div>
              <p className="text-xl font-black text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">{stat.label}</p>
            </motion.div>
          )
        })}
      </motion.div>

      {SuggestionStrip}

      {/* Primary CTA */}
      <motion.button variants={item} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
        onClick={() => setCurrentPage('jobs')}
        className="w-full flex items-center gap-4 p-5 bg-primary text-primary-foreground rounded-2xl shadow-md shadow-primary/20">
        <span className="text-3xl">🔍</span>
        <div className="flex-1 text-left">
          <p className="font-black text-base">Browse Available Jobs</p>
          <p className="text-primary-foreground/70 text-sm">Find work near you in Taraba</p>
        </div>
        <ArrowRight size={20} className="text-primary-foreground/70" />
      </motion.button>

      {/* Secondary actions */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3">
        {[
          { label: 'My Bookings', sub: 'Scheduled work', icon: '📅', page: 'bookings' },
          { label: 'Messages', sub: 'Chat with hirers', icon: '💬', page: 'messaging' },
          { label: 'My Earnings', sub: 'Track payments', icon: '💰', page: 'payments' },
          { label: 'My Shop', sub: 'Manage your services', icon: '🏪', page: 'shop-setup' },
        ].map(action => (
          <motion.button key={action.label} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
            onClick={() => setCurrentPage(action.page)}
            className="flex items-center gap-3 p-4 bg-card border border-border rounded-2xl text-left hover:border-primary/40 transition">
            <span className="text-xl">{action.icon}</span>
            <div className="min-w-0">
              <p className="font-bold text-sm text-foreground truncate">{action.label}</p>
              <p className="text-xs text-muted-foreground truncate">{action.sub}</p>
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Activity */}
      <motion.div variants={item} className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black text-foreground">Recent Activity</h2>
          <button onClick={() => setCurrentPage('bookings')} className="text-xs text-primary font-semibold hover:underline">See all</button>
        </div>
        <div className="text-center py-6">
          <div className="text-4xl mb-2">🎯</div>
          <p className="font-semibold text-foreground mb-1">No activity yet</p>
          <p className="text-sm text-muted-foreground mb-4">Apply for your first job to get started</p>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setCurrentPage('jobs')}
            className="bg-primary text-primary-foreground px-5 py-2 rounded-xl font-bold text-sm hover:bg-primary/90 transition">
            Browse Jobs
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )

  // ─────────────────────────────────────────────────────────────────────────
  // HIRE SOMEONE CONTENT
  // ─────────────────────────────────────────────────────────────────────────
  const HireView = (
    <motion.div key="need-help" variants={container} initial="hidden" animate="show" className="space-y-4">
      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-3 gap-3">
        {[
          { icon: Briefcase, label: 'My Jobs', value: myPostedJobs.filter(j => j.status === 'open').length, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
          { icon: Users, label: 'Applicants', value: myPostedJobs.reduce((s, j) => s + j.applicants.length, 0), color: 'text-primary', bg: 'bg-primary/10' },
          { icon: Clock, label: 'In Progress', value: myPostedJobs.filter(j => j.status === 'in-progress').length, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ].map(stat => {
          const Icon = stat.icon
          return (
            <motion.div key={stat.label} variants={item} whileHover={{ y: -3 }}
              className="bg-card border border-border rounded-2xl p-4 shadow-sm">
              <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
                <Icon size={16} className={stat.color} />
              </div>
              <p className="text-xl font-black text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">{stat.label}</p>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Primary CTA */}
      <motion.button variants={item} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
        onClick={() => setCurrentPage('post-job')}
        className="w-full flex items-center gap-4 p-5 bg-emerald-600 text-white rounded-2xl shadow-md shadow-emerald-600/20">
        <span className="text-3xl">📋</span>
        <div className="flex-1 text-left">
          <p className="font-black text-base">Post a New Job</p>
          <p className="text-white/70 text-sm">Get applications within minutes</p>
        </div>
        <Plus size={22} className="text-white/80" />
      </motion.button>

      {/* Secondary actions */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3">
        {[
          { label: 'My Jobs', sub: 'View posted jobs', icon: '📌', page: 'bookings' },
          { label: 'Messages', sub: 'Chat with workers', icon: '💬', page: 'messaging' },
          { label: 'Browse Shops', sub: 'Book a service', icon: '🏪', page: 'shops' },
          { label: 'My Profile', sub: 'Edit your info', icon: '👤', page: 'profile' },
        ].map(action => (
          <motion.button key={action.label} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
            onClick={() => setCurrentPage(action.page)}
            className="flex items-center gap-3 p-4 bg-card border border-border rounded-2xl text-left hover:border-emerald-500/40 transition">
            <span className="text-xl">{action.icon}</span>
            <div className="min-w-0">
              <p className="font-bold text-sm text-foreground truncate">{action.label}</p>
              <p className="text-xs text-muted-foreground truncate">{action.sub}</p>
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Active jobs */}
      <motion.div variants={item} className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black text-foreground">Your Active Jobs</h2>
          <button onClick={() => setCurrentPage('bookings')} className="text-xs text-primary font-semibold hover:underline">See all</button>
        </div>
        {myPostedJobs.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-2">📭</div>
            <p className="font-semibold text-foreground mb-1">No jobs posted yet</p>
            <p className="text-sm text-muted-foreground mb-4">Post your first job and get help fast</p>
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setCurrentPage('post-job')}
              className="bg-emerald-600 text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-emerald-700 transition">
              Post a Job
            </motion.button>
          </div>
        ) : (
          <div className="space-y-3">
            {myPostedJobs.slice(0, 3).map(job => (
              <motion.div key={job.id} whileHover={{ x: 4 }} onClick={() => setCurrentPage('job-details')}
                className="p-4 border border-border rounded-xl hover:bg-secondary/40 transition cursor-pointer">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-foreground text-sm truncate">{job.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {job.applicants.length} applicant{job.applicants.length !== 1 ? 's' : ''} · ₦{job.budget.toLocaleString()}
                    </p>
                  </div>
                  <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-bold ${job.status === 'open' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-secondary text-muted-foreground'
                    }`}>
                    {job.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  )

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      className="min-h-screen bg-background pb-24"
    >
      {/* Header — colour shifts with mode */}
      <div className={`text-white px-4 sm:px-6 pt-8 pb-16 transition-colors duration-500 ${isLooking
        ? 'bg-gradient-to-br from-primary to-primary/70'
        : 'bg-gradient-to-br from-emerald-700 to-emerald-500'
        }`}>
        <div className="max-w-4xl mx-auto flex items-start justify-between gap-3">
          <motion.div initial={{ x: -12, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
            <p className="text-white/65 text-sm font-medium mb-0.5">Good day 👋</p>
            <h1 className="text-2xl sm:text-3xl font-black">{currentUser?.name}</h1>
          </motion.div>
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            onClick={() => setCurrentPage('notifications')}
            className="p-2.5 bg-white/15 rounded-xl hover:bg-white/25 transition shrink-0">
            <Bell size={20} className="text-white" />
          </motion.button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-10">
        {/* THE BIG SWITCHER — pulled up to overlap the header */}
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.18, type: 'spring', stiffness: 260 }}
        >
          {ModeSwitcher}
        </motion.div>

        {/* Content animates in on mode switch */}
        <AnimatePresence mode="wait">
          {isLooking ? FindWorkView : HireView}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}