'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, MessageCircle, HelpCircle, Mail, Phone, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useAppStore } from '@/lib/store'

const faqs = [
  {
    id: 1,
    question: 'How do I post a job?',
    answer: 'Go to the Dashboard, click "Post Job", fill in the job details including title, description, category, budget, and deadline. Submit to publish your job.'
  },
  {
    id: 2,
    question: 'How do I apply for a job?',
    answer: 'Browse available jobs on the Jobs page, click on any job to view details, then click "Apply". Fill in your cover letter and portfolio link if applicable.'
  },
  {
    id: 3,
    question: 'What is escrow and how does it work?',
    answer: 'Escrow is a secure payment system. Money is held until the job is completed and both parties confirm. This protects both workers and employers.'
  },
  {
    id: 4,
    question: 'How do I book a service?',
    answer: 'After applying or being selected for a job, you can create a booking. Choose your preferred dates and time slots. The booking goes through payment and confirmation.'
  },
  {
    id: 5,
    question: 'How do I get verified on Butsó?',
    answer: 'Complete your profile with accurate information, get 5+ positive reviews, and pass our identity verification process. Verified badges appear on your profile.'
  },
  {
    id: 6,
    question: 'What if there\'s a dispute between employer and worker?',
    answer: 'Our support team reviews disputes. We encourage communication first. If unresolved, we make a fair decision based on job terms and evidence provided.'
  },
  {
    id: 7,
    question: 'How are payments processed?',
    answer: 'Employers fund jobs upfront into escrow. After job completion, payment is released to the worker. You can withdraw to your bank account anytime.'
  },
  {
    id: 8,
    question: 'Is my personal information safe?',
    answer: 'Yes. We use encryption and follow strict data protection practices. We never share your information without consent.'
  }
]

export function Support() {
  const { setCurrentPage } = useAppStore()
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

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
            onClick={() => setCurrentPage('dashboard')}
            className="p-2 hover:bg-secondary rounded-lg transition"
          >
            <ArrowLeft size={24} className="text-foreground" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Help & Support</h1>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* Quick Contact */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        >
          <div className="bg-card rounded-lg p-4 text-center">
            <Mail size={28} className="text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium text-foreground text-sm">support@butso.ng</p>
          </div>
          <div className="bg-card rounded-lg p-4 text-center">
            <Phone size={28} className="text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Phone</p>
            <p className="font-medium text-foreground text-sm">+234 700 000 000</p>
          </div>
          <div className="bg-card rounded-lg p-4 text-center cursor-pointer hover:bg-opacity-80 transition"
            onClick={() => setCurrentPage('messaging')}>
            <MessageCircle size={28} className="text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Chat</p>
            <p className="font-medium text-foreground text-sm">Live Support</p>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle size={24} className="text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq) => (
              <motion.div
                key={faq.id}
                initial={false}
                animate={{ backgroundColor: expandedFaq === faq.id ? 'rgba(43, 160, 111, 0.1)' : 'transparent' }}
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  className="w-full bg-card rounded-lg p-4 flex items-center justify-between hover:bg-opacity-80 transition text-left"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{faq.question}</p>
                  </div>
                  <motion.div
                    animate={{ rotate: expandedFaq === faq.id ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={20} className="text-primary" />
                  </motion.div>
                </button>

                <motion.div
                  initial={false}
                  animate={{
                    height: expandedFaq === faq.id ? 'auto' : 0,
                    opacity: expandedFaq === faq.id ? 1 : 0,
                    marginTop: expandedFaq === faq.id ? 8 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 text-muted-foreground text-sm leading-relaxed">
                    {faq.answer}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8 bg-card rounded-lg p-6"
        >
          <h3 className="text-xl font-bold text-foreground mb-4">Still need help?</h3>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Subject
              </label>
              <input
                type="text"
                placeholder="What can we help with?"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Message
              </label>
              <textarea
                placeholder="Tell us more about your issue..."
                rows={4}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-2 rounded-lg hover:opacity-90 transition font-medium"
            >
              Send Message
            </button>
          </form>
        </motion.div>
      </div>
    </motion.div>
  )
}
