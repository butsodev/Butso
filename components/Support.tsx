'use client'

import { HelpCenter } from '@/components/HelpCenter'
import { motion } from 'framer-motion'
import { ArrowLeft, MessageCircle, Mail } from 'lucide-react'
import { useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { showToast } from '@/lib/toast'
import { useAppStore, goBackTo } from '@/lib/store'

export function Support() {
  const { setCurrentPage } = useAppStore()
  const currentUser = useAppStore(s => s.currentUser)
  const [subject, setSubject] = useState('')
  const [ticketMessage, setTicketMessage] = useState('')
  const [sending, setSending] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)
  const messageRef = useRef<HTMLTextAreaElement>(null)

  // From a search with no good answer: carry the question into the support form
  const askUs = (question: string) => {
    if (question && !subject.trim()) setSubject(`Help with: ${question}`.slice(0, 120))
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setTimeout(() => messageRef.current?.focus({ preventScroll: true }), 350)
  }

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
        <HelpCenter onAskUs={askUs} />

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

        {/* Contact Form */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8 bg-card rounded-lg p-6 scroll-mt-24"
          ref={formRef}
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
              <textarea aria-label="Message" ref={messageRef}
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
