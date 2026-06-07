'use client'

import { motion } from 'framer-motion'
import { Star, Briefcase, DollarSign, Clock } from 'lucide-react'
import { useAppStore } from '@/lib/store'

export function WorkerDashboard() {
  const { currentUser, setCurrentPage } = useAppStore()

  const stats = [
    {
      icon: Briefcase,
      label: 'Completed Jobs',
      value: currentUser?.completedJobs || 0,
      color: 'text-primary',
    },
    {
      icon: Star,
      label: 'Rating',
      value: currentUser?.rating || 5.0,
      color: 'text-accent',
    },
    {
      icon: DollarSign,
      label: 'Total Earned',
      value: '₦0',
      color: 'text-primary',
    },
    {
      icon: Clock,
      label: 'Active',
      value: 'Available',
      color: 'text-primary',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background pb-20"
    >
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6 pt-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">Welcome, {currentUser?.name}</h1>
              <p className="text-primary-foreground/80">Here&apos;s what&apos;s happening with your jobs</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">⭐ {currentUser?.rating}</div>
              <p className="text-primary-foreground/80 text-sm">Your rating</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 -mt-6 pb-8">
        {/* Stats Cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-muted-foreground text-xs md:text-sm font-medium">
                      {stat.label}
                    </p>
                    <p className="text-2xl md:text-3xl font-bold text-foreground mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <Icon className={`${stat.color} opacity-70`} size={20} />
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-lg border border-border shadow-sm p-6 mb-8"
        >
          <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentPage('jobs')}
              className="py-4 px-6 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition text-center"
            >
              Browse Available Jobs
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentPage('bookings')}
              className="py-4 px-6 border border-primary text-primary font-semibold rounded-lg hover:bg-primary/10 transition text-center"
            >
              View Bookings
            </motion.button>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-lg border border-border shadow-sm p-6"
        >
          <h2 className="text-xl font-bold text-foreground mb-4">Recent Activity</h2>
          <div className="text-center py-8 text-muted-foreground">
            <p>No recent activity. Browse jobs to get started!</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
