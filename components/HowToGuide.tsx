'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { AnimatePresence } from 'framer-motion'
import { BookOpen, ChevronDown, PlayCircle } from 'lucide-react'
import { GUIDES, type Guide } from '@/lib/guideContent'

// The walkthrough pop-up is only downloaded when someone taps "Show me"
const StepGuide = dynamic(() => import('@/components/StepGuide'), { ssr: false })

/** "How to use Butsó": a short card per task, with a written version and a step-by-step walkthrough. */
export function HowToGuide() {
  const [open, setOpen] = useState<string | null>(null)
  const [playing, setPlaying] = useState<Guide | null>(null)

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-1">
        <BookOpen size={24} className="text-primary" />
        <h2 className="text-2xl font-bold text-foreground">How to use Butsó</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">Pick what you want to do. Each guide takes about a minute.</p>

      <div className="space-y-3">
        {GUIDES.map(g => (
          <div key={g.id} className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-4">
              <p className="text-xs font-bold text-primary uppercase tracking-wide">{g.forWho}</p>
              <h3 className="font-bold text-foreground">{g.title}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">{g.intro}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => setPlaying(g)}
                  className="min-h-[44px] px-4 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center gap-2">
                  <PlayCircle size={16} /> Show me
                </button>
                <button onClick={() => setOpen(open === g.id ? null : g.id)} aria-expanded={open === g.id}
                  className="min-h-[44px] px-4 rounded-xl border border-border text-sm font-bold text-foreground flex items-center gap-1">
                  Read the steps <ChevronDown size={16} className={`transition-transform ${open === g.id ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
            {open === g.id && (
              <ol className="px-4 pb-4 pt-0 space-y-2 list-decimal list-inside text-sm text-foreground">
                {g.steps.map((s, n) => <li key={n}>{s.text}</li>)}
              </ol>
            )}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {playing && <StepGuide key={playing.id} guide={playing} onClose={() => setPlaying(null)} />}
      </AnimatePresence>
    </section>
  )
}
