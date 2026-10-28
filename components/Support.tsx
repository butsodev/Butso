'use client'

import { HowToGuide } from '@/components/HowToGuide'
import { motion } from 'framer-motion'
import { ArrowLeft, MessageCircle, HelpCircle, Mail, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { showToast } from '@/lib/toast'
import { useAppStore, goBackTo } from '@/lib/store'

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
    question: 'Are in-app payments available?',
    answer: 'Not yet. Secure in-app payments are coming soon. For now, agree the price with the other person and pay them directly. Only pay once you are happy with the work.'
  },
  {
    id: 4,
    question: 'How do I book a service?',
    answer: 'Open a shop, pick a service, then choose a date and time. The shop owner accepts or declines your booking, and you both see the update in Bookings. You agree the price and pay each other directly for now.'
  },
  {
    id: 5,
    question: 'How do I get verified on Butsó?',
    answer: 'Verification badges are not available yet. For now, a complete profile and good reviews after finished jobs are the best way to build trust. We will announce verification before it starts.'
  },
  {
    id: 6,
    question: 'What if there\'s a dispute between employer and worker?',
    answer: 'Talk to the other person first in Messages. If that does not work, use Contact support on this page and describe what happened. A formal dispute process is not available yet.'
  },
  {
    id: 9,
    question: 'Does Butsó charge fees?',
    answer: 'Butsó is free to join, free to post and free to apply while we grow. When secure in-app payments launch, we may take a small cut from the person who earns, never from the person hiring, and only on payments made through the app. We will give you at least 30 days\' notice before any fee starts.'
  },
  {
    id: 7,
    question: 'How are payments processed?',
    answer: 'Right now you agree the price in chat or on the booking and pay each other directly. In-app payments are on the way, and we will tell you before anything changes.'
  },
  {
    id: 8,
    question: 'Is my personal information safe?',
    answer: 'Your phone number and real name stay hidden from other people until you accept a request or a booking. You can block or report anyone from Messages. We do not share your details without a reason you can see in the app.'
  }
]

export function Support() {
  const { setCurrentPage } = useAppStore()
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const currentUser = useAppStore(s => s.currentUser)
  const [subject, setSubject] = useState('')
  const [ticketMessage, setTicketMessage] = useState('')
  const [sending, setSending] = useState(false)

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (sending) return
    if (!currentUser) { showToast('error', 'Please log in to contact support.'); return }
    if (!subject.trim() || !ticketMessage.trim()) { showToast('error', 'Add a subject and a message.'); return }
    setSending(true)
    const { error } = await supabase.from('support_tickets').insert({
      user_id: currentUser.id, subject: subject.trim(), message: ticketMessage.trim(),
    })
    setSending(false)
    if (error) { showToast('error', 'Could not send your message. Please try again.'); return }
    setSubject(''); setTicketMessage('')
    showToast('success', 'Message sent. We will get back to you.')
  }

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
          <button aria-label="Go back"
            onClick={() => goBackTo('dashboard')}
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
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
        >
          <div className="bg-card rounded-lg p-4 text-center">
            <Mail size={28} className="text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium text-foreground text-sm">support@butso.ng</p>
          </div>
          <div className="bg-card rounded-lg p-4 text-center cursor-pointer hover:bg-opacity-80 transition"
            onClick={() => setCurrentPage('messaging')}>
            <MessageCircle size={28} className="text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Chat</p>
            <p className="font-medium text-foreground text-sm">Message us</p>
          </div>
        </motion.div>

        <HowToGuide />

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
          <form className="space-y-4" onSubmit={handleSubmitTicket}>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Subject
              </label>
              <input aria-label="Subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={120}
                placeholder="What can we help with?"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Message
              </label>
              <textarea aria-label="Message"
                placeholder="Tell us more about your issue..."
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                maxLength={2000}
                rows={4}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="w-full bg-primary text-primary-foreground py-2 rounded-lg hover:opacity-90 transition font-medium disabled:opacity-60"
            >
              {sending ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        </motion.div>
      </div>
    </motion.div>
  )
}
