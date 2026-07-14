'use client'

import { motion } from 'framer-motion'
import { useAppStore, type UserRole } from '@/lib/store'

export function RoleSelection() {
  const { setCurrentPage } = useAppStore()

  const selectRole = (role: UserRole) => {
    sessionStorage.setItem('selectedRole', role)
    setCurrentPage('phone-verification')
  }

  const options = [
    {
      role: 'find-work' as UserRole,
      emoji: '🛠️',
      title: "I'm looking for work",
      description: 'Find nearby jobs in plumbing, cleaning, electrical, carpentry and more.',
      gradient: 'from-primary to-primary/75',
      examples: ['Plumber', 'Electrician', 'Cleaner', 'Carpenter', 'Cook'],
    },
    {
      role: 'need-help' as UserRole,
      emoji: '📋',
      title: 'I need to hire someone',
      description: 'Post a job and get reliable people to help you fast.',
      gradient: 'from-emerald-600 to-emerald-500',
      examples: ['Fix my pipe', 'Paint my house', 'Clean my office', 'Build furniture'],
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen bg-background flex flex-col items-center justify-center p-5"
    >
      <div className="max-w-lg w-full">

        {/* Logo */}
        <motion.div
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-10"
        >
          <button
            onClick={() => setCurrentPage('splash')}
            className="inline-flex items-center gap-2 mb-6 hover:opacity-70 transition-opacity"
          >
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-primary-foreground font-black text-base">B</span>
            </div>
            <span className="text-2xl font-black text-foreground">Butsó</span>
          </button>

          <h1 className="text-3xl font-black text-foreground mb-2">
            What are you here for?
          </h1>
          <p className="text-muted-foreground">
            Pick one. You can always do both later
          </p>
        </motion.div>

        {/* Option cards */}
        <div className="flex flex-col gap-4">
          {options.map((opt, i) => (
            <motion.button
              key={opt.role}
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.1, type: 'spring', stiffness: 260, damping: 24 }}
              whileHover={{ scale: 1.02, y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => selectRole(opt.role)}
              className={`bg-gradient-to-br ${opt.gradient} p-6 rounded-2xl shadow-lg text-left group`}
            >
              <div className="flex items-start gap-4">
                <span className="text-4xl leading-none mt-0.5">{opt.emoji}</span>
                <div className="flex-1">
                  <h2 className="text-xl font-black text-white mb-1">{opt.title}</h2>
                  <p className="text-white/80 text-sm leading-relaxed mb-3">{opt.description}</p>
                  {/* Example chips */}
                  <div className="flex flex-wrap gap-2">
                    {opt.examples.map(ex => (
                      <span
                        key={ex}
                        className="text-xs bg-white/20 text-white px-2.5 py-1 rounded-full font-medium"
                      >
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Back */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="mt-8 text-center"
        >
          <button
            onClick={() => setCurrentPage('splash')}
            className="text-muted-foreground hover:text-foreground transition text-sm"
          >
            ← Back to home
          </button>
        </motion.div>
      </div>
    </motion.div>
  )
}