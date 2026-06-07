'use client'

import { motion } from 'framer-motion'
import { Briefcase, Wrench } from 'lucide-react'
import { useAppStore, type UserRole } from '@/lib/store'

export function RoleSelection() {
  const { setCurrentPage } = useAppStore()

  const selectRole = (role: UserRole) => {
    // Store selected role temporarily
    sessionStorage.setItem('selectedRole', role)
    setCurrentPage('phone-verification')
  }

  const roleOptions = [
    {
      role: 'worker' as UserRole,
      icon: Wrench,
      title: "I'm a Worker",
      description: 'Find jobs in your area and earn money',
      color: 'from-primary to-primary/80',
    },
    {
      role: 'employer' as UserRole,
      icon: Briefcase,
      title: "I'm an Employer",
      description: 'Hire skilled workers for your projects',
      color: 'from-accent to-accent/80',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background flex flex-col items-center justify-center p-4"
    >
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">What brings you here?</h1>
          <p className="text-muted-foreground text-lg">Choose your role to get started</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roleOptions.map((option, index) => {
            const Icon = option.icon
            return (
              <motion.button
                key={option.role}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => selectRole(option.role)}
                className={`bg-gradient-to-br ${option.color} p-8 rounded-2xl shadow-lg hover:shadow-xl transition text-primary-foreground group cursor-pointer`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="p-4 bg-card/20 rounded-full mb-4 group-hover:bg-card/30 transition">
                    <Icon size={48} className="text-primary-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{option.title}</h2>
                  <p className="text-primary-foreground/90">{option.description}</p>
                </div>
              </motion.button>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center"
        >
          <button
            onClick={() => setCurrentPage('splash')}
            className="text-muted-foreground hover:text-foreground transition"
          >
            ← Back
          </button>
        </motion.div>
      </div>
    </motion.div>
  )
}
