'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flag } from 'lucide-react'
import { reportUser } from '@/lib/dataRequests'
import { useAppStore } from '@/lib/store'
import { showToast } from '@/lib/toast'
import { useFocusTrap } from '@/lib/useFocusTrap'

export type ReportKind = 'job' | 'shop' | 'review' | 'profile'

const REASONS = ['Spam or scam', 'Rude or threatening', 'Fake profile or shop', 'Asked for money upfront', 'Illegal or unsafe work', 'Inappropriate photo or content', 'Other']
const NOUN: Record<ReportKind, string> = { job: 'this job', shop: 'this shop', review: 'this review', profile: 'this profile' }

/**
 * Report a job, shop, review or profile. Every report goes to the person responsible for it
 * (the job's poster, the shop's owner, the review's author, the profile's owner), with a note saying what was reported.
 */
export function ReportButton({ targetUserId, kind, refId, label, className }: {
  targetUserId?: string
  kind: ReportKind
  refId?: string
  label?: string
  className?: string
}) {
  const me = useAppStore(s => s.currentUser?.id)
  const [open, setOpen] = useState(false)
  if (!targetUserId || targetUserId === me) return null

  return (
    <>
      <button type="button" aria-label={`Report ${NOUN[kind]}`}
        onClick={() => { if (!me) { useAppStore.getState().openAuth('login'); return } setOpen(true) }}
        className={className ?? 'p-2 hover:bg-secondary rounded-xl transition text-muted-foreground'}>
        <Flag size={16} aria-hidden="true" />
        {label && <span className="ml-1.5 text-xs font-bold">{label}</span>}
      </button>
      <AnimatePresence>
        {open && <ReportDialog key="report" targetUserId={targetUserId} kind={kind} refId={refId} onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  )
}

function ReportDialog({ targetUserId, kind, refId, onClose }: { targetUserId: string; kind: ReportKind; refId?: string; onClose: () => void }) {
  const [reason, setReason] = useState(REASONS[0])
  const [details, setDetails] = useState('')
  const [busy, setBusy] = useState(false)
  const panel = useRef<HTMLDivElement>(null)
  useFocusTrap(panel)

  const submit = async () => {
    if (busy) return
    setBusy(true)
    // The note tells whoever reads the report exactly what was reported
    const note = `[${kind}${refId ? ' ' + refId : ''}] ${details.trim()}`.trim()
    const error = await reportUser(targetUserId, reason, note)
    setBusy(false)
    if (error) { showToast('error', error); return }
    showToast('success', 'Thank you. We will look into it.')
    onClose()
  }

  return (
    <motion.div className="fixed inset-0 z-[125] flex items-end sm:items-center justify-center bg-black/50 p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
      onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="report-title">
      <motion.div ref={panel} onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.18 }}
        className="w-full max-w-sm bg-card text-card-foreground rounded-2xl p-5 shadow-xl border border-border">
        <h2 id="report-title" className="text-lg font-black text-foreground">Report {NOUN[kind]}</h2>
        <p className="text-sm text-muted-foreground mt-1 mb-3">Tell us what is wrong. We read every report.</p>
        <select aria-label="Reason" value={reason} onChange={e => setReason(e.target.value)}
          className="w-full px-4 py-3 border-2 border-border rounded-xl bg-background text-foreground text-sm mb-3">
          {REASONS.map(r => <option key={r}>{r}</option>)}
        </select>
        <textarea aria-label="Details (optional)" value={details} onChange={e => setDetails(e.target.value.slice(0, 500))}
          placeholder="What happened? (optional)" rows={3}
          className="w-full px-4 py-3 border-2 border-border rounded-xl focus:outline-none focus:border-primary text-foreground bg-background text-sm mb-4 resize-none" />
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 min-h-[46px] rounded-xl border border-border font-bold text-sm text-foreground">Cancel</button>
          <button onClick={submit} disabled={busy} className="flex-1 min-h-[46px] rounded-xl bg-primary text-primary-foreground font-bold text-sm disabled:opacity-60">
            {busy ? 'Sending...' : 'Send report'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
