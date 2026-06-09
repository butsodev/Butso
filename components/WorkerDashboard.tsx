'use client'

import { motion } from 'framer-motion'
import { Star, Briefcase, DollarSign, Clock, ArrowRight, Bell } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { SkeletonDashboard } from '@/components/Skeleton'

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 280, damping: 24 },
  },
}

export function WorkerDashboard() {
  const { currentUser, setCurrentPage } = useAppStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900)
    return () => clearTimeout(t)
  }, [])

  if (loading) return <SkeletonDashboard />

  const stats = [
    { icon: Briefcase, label: 'Jobs Done', value: currentUser?.completedJobs || 0, color: 'text-primary', bg: 'bg-primary/10' },
    { icon: Star, label: 'Rating', value: `${currentUser?.rating || '5.0'}★`, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { icon: DollarSign, label: 'Earned', value: '₦0', color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
    { icon: Clock, label: 'Status', value: 'Active', color: 'text-primary', bg: 'bg-primary/10' },
  ]

  const quickActions = [
    { label: 'Browse Jobs', sub: 'Find work near you', icon: '🔍', page: 'jobs', primary: true },
    { label: 'My Bookings', sub: 'View scheduled work', icon: '📅', page: 'bookings', primary: false },
    { label: 'Messages', sub: 'Chat with employers', icon: '💬', page: 'messaging', primary: false },
    { label: 'Payments', sub: 'Track your earnings', icon: '💰', page: 'payments', primary: false },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      className="min-h-screen bg-background pb-20"
    >
      <div className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground px-4 sm:px-6 pt-8 pb-12">
        <div className="max-w-4xl mx-auto flex items-start justify-between gap-4">
          <motion.div initial={{ x: -16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1, type: 'spring', stiffness: 260 }}>
            <p className="text-primary-foreground/70 text-sm font-medium mb-1">Good day 👋</p>
            <h1 className="text-2xl sm:text-3xl font-black mb-1">{currentUser?.name}</h1>
            <p className="text-primary-foreground/75 text-sm">Ready to find work today?</p>
          </motion.div>
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            onClick={() => setCurrentPage('notifications')}
            className="p-2.5 bg-white/15 rounded-xl hover:bg-white/25 transition shrink-0">
            <Bell size={20} className="text-white" />
          </motion.button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-8 pb-8">
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <motion.div key={stat.label} variants={itemVariants} whileHover={{ y: -4, transition: { type: 'spring', stiffness: 400 } }}
                className="bg-card border border-border rounded-2xl p-4 shadow-sm">
                <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
                  <Icon size={16} className={stat.color} />
                </div>
                <p className="text-xl sm:text-2xl font-black text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5 font-medium">{stat.label}</p>
              </motion.div>
            )
          })}
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-2 gap-3 mb-6">
          {quickActions.map((action) => (
            <motion.button key={action.label} variants={itemVariants} whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.97 }}
              onClick={() => setCurrentPage(action.page)}
              className={`flex items-center gap-3 p-4 rounded-2xl text-left transition ${
                action.primary
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 col-span-2'
                  : 'bg-card border border-border hover:border-primary/40'
              }`}>
              <span className="text-2xl">{action.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm ${action.primary ? 'text-primary-foreground' : 'text-foreground'}`}>{action.label}</p>
                <p className={`text-xs truncate ${action.primary ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{action.sub}</p>
              </div>
              <ArrowRight size={16} className={action.primary ? 'text-primary-foreground/70' : 'text-muted-foreground'} />
            </motion.button>
          ))}
        </motion.div>

        <motion.div variants={itemVariants} initial="hidden" animate="show" className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-foreground text-lg">Recent Activity</h2>
            <button onClick={() => setCurrentPage('bookings')} className="text-xs text-primary font-semibold hover:underline">See all</button>
          </div>
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🎯</div>
            <p className="font-semibold text-foreground mb-1">No activity yet</p>
            <p className="text-sm text-muted-foreground mb-4">Browse jobs and send your first application</p>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setCurrentPage('jobs')}
              className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition">
              Browse Jobs
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
