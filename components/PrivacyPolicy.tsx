'use client'

import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useAppStore } from '@/lib/store'

export function PrivacyPolicy() {
  const { setCurrentPage } = useAppStore()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background"
    >
      <header className="bg-background border-b border-border py-4 px-4 sm:px-6 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => setCurrentPage('splash')}
            className="p-2 hover:bg-secondary rounded-lg transition"
          >
            <ArrowLeft size={24} className="text-foreground" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Privacy Policy</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="prose prose-sm dark:prose-invert max-w-none"
        >
          <h2 className="text-2xl font-bold text-foreground mb-4">Privacy Policy for Butsó</h2>
          <p className="text-muted-foreground mb-6">Effective Date: 2024</p>

          <section className="mb-8">
            <h3 className="text-xl font-bold text-foreground mb-3">1. Introduction</h3>
            <p className="text-muted-foreground">
              Butsó ("we" or "us" or "our") operates the Butsó app. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our service.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold text-foreground mb-3">2. Information Collection and Use</h3>
            <p className="text-muted-foreground mb-3">We collect several different types of information for various purposes:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Personal Information (name, email, phone number, location)</li>
              <li>Profile Information (skills, experience, work history)</li>
              <li>Transaction Data (bookings, payments, ratings)</li>
              <li>Usage Data (pages visited, time spent, interactions)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold text-foreground mb-3">3. Use of Data</h3>
            <p className="text-muted-foreground mb-3">Butsó uses the collected data for various purposes:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>To provide and maintain our service</li>
              <li>To notify you about changes to our service</li>
              <li>To allow you to participate in interactive features</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information so we can improve our service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold text-foreground mb-3">4. Security of Data</h3>
            <p className="text-muted-foreground">
              The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal data, we cannot guarantee its absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold text-foreground mb-3">5. Changes to This Privacy Policy</h3>
            <p className="text-muted-foreground">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold text-foreground mb-3">6. Contact Us</h3>
            <p className="text-muted-foreground">
              If you have any questions about this Privacy Policy, please contact us at privacy@butso.local
            </p>
          </section>
        </motion.div>
      </div>
    </motion.div>
  )
}
