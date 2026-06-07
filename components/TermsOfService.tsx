'use client'

import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useAppStore } from '@/lib/store'

export function TermsOfService() {
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
          <h1 className="text-2xl font-bold text-foreground">Terms of Service</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="prose prose-sm dark:prose-invert max-w-none"
        >
          <h2 className="text-2xl font-bold text-foreground mb-4">Terms of Service for Butsó</h2>
          <p className="text-muted-foreground mb-6">Effective Date: 2024</p>

          <section className="mb-8">
            <h3 className="text-xl font-bold text-foreground mb-3">1. Acceptance of Terms</h3>
            <p className="text-muted-foreground">
              By accessing and using Butsó, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold text-foreground mb-3">2. Use License</h3>
            <p className="text-muted-foreground mb-3">Permission is granted to temporarily download one copy of the materials on Butsó for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to decompile or reverse engineer any software contained on Butsó</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold text-foreground mb-3">3. Disclaimer</h3>
            <p className="text-muted-foreground">
              The materials on Butsó are provided on an as-is basis. Butsó makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold text-foreground mb-3">4. Limitations</h3>
            <p className="text-muted-foreground">
              In no event shall Butsó or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Butsó.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold text-foreground mb-3">5. Accuracy of Materials</h3>
            <p className="text-muted-foreground">
              The materials appearing on Butsó could include technical, typographical, or photographic errors. Butsó does not warrant that any of the materials on its website are accurate, complete, or current.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold text-foreground mb-3">6. Links</h3>
            <p className="text-muted-foreground">
              Butsó has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Butsó of the site. Use of any such linked website is at the user's own risk.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold text-foreground mb-3">7. Modifications</h3>
            <p className="text-muted-foreground">
              Butsó may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-xl font-bold text-foreground mb-3">8. Governing Law</h3>
            <p className="text-muted-foreground">
              These terms and conditions are governed by and construed in accordance with the laws of Nigeria, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </section>
        </motion.div>
      </div>
    </motion.div>
  )
}
