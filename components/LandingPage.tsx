'use client'

import { motion } from 'framer-motion'
import { Briefcase, Users, Shield, Globe } from 'lucide-react'
import { useAppStore } from '@/lib/store'

export function LandingPage() {
  const { setCurrentPage } = useAppStore()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background"
    >
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-4 px-4 sm:px-6 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-3xl font-bold">Butsó</h1>
          <button
            onClick={() => setCurrentPage('role-select')}
            className="bg-primary-foreground text-primary px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <motion.section
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-b from-primary/10 to-background px-4 sm:px-6 py-16 sm:py-24"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Butsó: Empowering Work in Wukari
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8">
            Butsó means "work" in Jukun. We're connecting skilled workers and employers in Wukari, Taraba State, celebrating our cultural identity while building economic opportunity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage('role-select')}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition"
            >
              Start as Worker
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage('role-select')}
              className="bg-accent text-accent-foreground px-8 py-3 rounded-lg font-semibold hover:bg-accent/90 transition"
            >
              Post a Job
            </motion.button>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="px-4 sm:px-6 py-16 sm:py-24"
      >
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-foreground text-center mb-12">How Butsó Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                icon: Users,
                title: 'Connect',
                description: 'Find skilled workers or employers in your area'
              },
              {
                icon: Briefcase,
                title: 'Work',
                description: 'Post jobs or apply for opportunities'
              },
              {
                icon: Shield,
                title: 'Secure',
                description: 'Protected payments and verified profiles'
              },
              {
                icon: Globe,
                title: 'Grow',
                description: 'Build your reputation and earn more'
              }
            ].map((feature, i) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={i}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="bg-card rounded-lg p-6 text-center hover:shadow-lg transition"
                >
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Icon size={32} className="text-primary" />
                    </div>
                  </div>
                  <h4 className="text-xl font-bold text-foreground mb-2">{feature.title}</h4>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.section>

      {/* About Section */}
      <motion.section
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-secondary px-4 sm:px-6 py-16 sm:py-24"
      >
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-foreground mb-6">About Butsó</h3>
          <p className="text-lg text-muted-foreground mb-4">
            Butsó is more than just a platform, it's a movement to empower the people of Wukari and Taraba State. The word "Butsó" comes from the Jukun language, meaning "work" or "labor," reflecting our deep roots in the local community.
          </p>
          <p className="text-lg text-muted-foreground">
            We believe in creating opportunities for skilled workers to find meaningful work, enabling employers to access reliable talent, and celebrating the cultural identity of our region. Every connection made on Butsó strengthens the economic fabric of our community.
          </p>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-background border-t border-border px-4 sm:px-6 py-12"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-foreground mb-4">Butsó</h4>
              <p className="text-muted-foreground text-sm">Empowering work in Wukari</p>
            </div>
            <div>
              <h5 className="font-semibold text-foreground mb-4">Quick Links</h5>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => setCurrentPage('privacy')}
                    className="text-primary hover:underline"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentPage('terms')}
                    className="text-primary hover:underline"
                  >
                    Terms of Service
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-foreground mb-4">Support</h5>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => setCurrentPage('support')}
                    className="text-primary hover:underline"
                  >
                    Help Center
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentPage('suggestions')}
                    className="text-primary hover:underline"
                  >
                    Send Feedback
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Butsó. All rights reserved. Promoting work and cultural identity in Wukari, Taraba State.</p>
          </div>
        </div>
      </motion.footer>
    </motion.div>
  )
}
