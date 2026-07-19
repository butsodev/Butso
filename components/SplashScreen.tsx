'use client'

import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'

export function SplashScreen() {
  const { setCurrentPage } = useAppStore()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center p-4"
    >
      <div className="text-center max-w-md">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-8"
        >
          <div className="text-6xl font-bold text-primary-foreground mb-4">Butsó</div>
          <p className="text-primary-foreground/90 text-lg">Connect with jobs and workers in Taraba</p>
        </motion.div>

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCurrentPage('role-select')}
          className="w-full py-4 px-6 bg-card text-primary font-semibold rounded-lg shadow-lg hover:shadow-xl transition"
        >
          Get Started
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-primary-foreground/70 text-sm mt-6"
        >
          Your trusted local marketplace for gigs and services
        </motion.p>
      </div>
    </motion.div>
  )
}