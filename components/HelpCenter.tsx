'use client'

// The searchable part of Help & Support: how-to guides (with step-by-step walkthroughs)
// and frequently asked questions, behind one search box.
//
// Links straight into it:
//   /support?q=book+a+shop          opens with that search
//   /support?guide=set-up-shop      opens that guide's walkthrough (guide ids: lib/guideContent.ts)
//   /support?guide=set-up-shop&step=3   ...at step 3
import { useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { AnimatePresence } from 'framer-motion'
import { BookOpen, ChevronDown, HelpCircle, PlayCircle, Search, X, Compass, Film, MessageCircle } from 'lucide-react'
import { GUIDES, type Guide } from '@/lib/guideContent'
import { FAQS, type Faq } from '@/lib/faqContent'
import { searchHelp, highlightParts } from '@/lib/helpSearch'
import { useTourStore } from '@/lib/tour'
import { useAppStore } from '@/lib/store'

// The walkthrough pop-up is only downloaded when someone taps "Show me"
const StepGuide = dynamic(() => import('@/components/StepGuide'), { ssr: false })

const TOPICS = ['Post a job', 'Apply for work', 'Book a shop', 'Payments', 'Block or report', 'Delete my account']

function Hl({ text, terms }: { text: string; terms: string[][] }) {
  if (terms.length === 0) return <>{text}</>
  return (
    <>
      {highlightParts(text, terms).map((p, n) => p.hit
        ? <mark key={n} className="bg-primary/20 text-foreground rounded px-0.5">{p.text}</mark>
        : <span key={n}>{p.text}</span>)}
    </>
  )
}

function GuideCard({ guide, terms, matchStep, onPlay }: {
  guide: Guide; terms: string[][]; matchStep?: number; onPlay: (g: Guide, step: number) => void
}) {
  const [open, setOpen] = useState(false)
  const showMatch = terms.length > 0 && matchStep !== undefined && matchStep > 0
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-4">
        <div className="flex items-center gap-2">
          <p className="text-xs font-bold text-primary uppercase tracking-wide">{guide.forWho}</p>
          {guide.video && (
            <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground bg-secondary rounded px-1.5 py-0.5 inline-flex items-center gap-1">
              <Film size={11} aria-hidden="true" /> Video
            </span>
          )}
        </div>
        <h3 className="font-bold text-foreground"><Hl text={guide.title} terms={terms} /></h3>
        <p className="text-sm text-muted-foreground mt-0.5"><Hl text={guide.intro} terms={terms} /></p>
        {showMatch && (
          <p className="text-sm text-foreground mt-2 border-l-2 border-primary/50 pl-2">
            <span className="font-bold">Step {matchStep + 1}:</span> <Hl text={guide.steps[matchStep].text} terms={terms} />
          </p>
        )}
        <div className="flex flex-wrap gap-2 mt-3">
          <button onClick={() => onPlay(guide, showMatch ? matchStep : 0)}
            className="min-h-[44px] px-4 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center gap-2">
            <PlayCircle size={16} /> {showMatch ? `Show me from step ${matchStep + 1}` : 'Show me'}
          </button>
          <button onClick={() => setOpen(o => !o)} aria-expanded={open}
            className="min-h-[44px] px-4 rounded-xl border border-border text-sm font-bold text-foreground flex items-center gap-1">
            Read the steps <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
      {open && (
        <ol className="px-4 pb-4 pt-0 space-y-2 list-decimal list-inside text-sm text-foreground">
          {guide.steps.map((s, n) => <li key={n}><Hl text={s.text} terms={terms} /></li>)}
        </ol>
      )}
    </div>
  )
}

function FaqItem({ faq, terms, defaultOpen }: { faq: Faq; terms: string[][]; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  useEffect(() => { setOpen(defaultOpen) }, [defaultOpen])
  const id = `faq-${faq.id}`
  return (
    <div className={`rounded-lg transition-colors ${open ? 'bg-primary/10' : ''}`}>
      <button onClick={() => setOpen(o => !o)} aria-expanded={open} aria-controls={id}
        className="w-full bg-card rounded-lg p-4 flex items-center justify-between gap-3 text-left min-h-[48px]">
        <span className="font-medium text-foreground"><Hl text={faq.question} terms={terms} /></span>
        <ChevronDown size={20} className={`text-primary shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div id={id} className="px-4 py-3 text-muted-foreground text-sm leading-relaxed">
          <Hl text={faq.answer} terms={terms} />
        </div>
      )}
    </div>
  )
}

export function HelpCenter({ onAskUs }: { onAskUs: (question: string) => void }) {
  const [query, setQuery] = useState('')
  const [playing, setPlaying] = useState<{ guide: Guide; step: number } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const openTour = useTourStore(s => s.openTour)
  const isMember = useAppStore(s => !!s.currentUser && !s.currentUser.id.startsWith('guest-'))

  // Deep links: ?q=... and ?guide=...&step=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const q = params.get('q')
    if (q) setQuery(q.slice(0, 100))
    const g = GUIDES.find(x => x.id === params.get('guide'))
    if (g) {
      const step = Math.max(0, Math.min(Number(params.get('step') ?? 1) - 1 || 0, g.steps.length - 1))
      setPlaying({ guide: g, step })
    }
  }, [])

  const trimmed = query.trim()
  const results = useMemo(() => (trimmed ? searchHelp(trimmed) : null), [trimmed])
  const terms = results?.terms ?? []
  const nothing = !!results && results.guides.length === 0 && results.faqs.length === 0

  const summary = !results ? '' : nothing
    ? `No results for ${trimmed}`
    : [
        results.guides.length ? `${results.guides.length} ${results.guides.length === 1 ? 'guide' : 'guides'}` : '',
        results.faqs.length ? `${results.faqs.length} ${results.faqs.length === 1 ? 'answer' : 'answers'}` : '',
      ].filter(Boolean).join(' and ') + ' found'

  const play = (guide: Guide, step: number) => setPlaying({ guide, step })

  return (
    <section className="mb-8" aria-label="Help articles">
      {/* Search */}
      <form role="search" onSubmit={e => { e.preventDefault(); inputRef.current?.blur() }} className="mb-3">
        <label htmlFor="help-search" className="sr-only">Search help</label>
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden="true" />
          <input id="help-search" ref={inputRef} type="search" enterKeyHint="search" autoComplete="off" maxLength={100}
            value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Escape' && query) { e.stopPropagation(); setQuery('') } }}
            placeholder="Search help, e.g. “book a shop”"
            className="w-full min-h-[50px] pl-11 pr-12 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition [&::-webkit-search-cancel-button]:hidden" />
          {query && (
            <button type="button" aria-label="Clear search" onClick={() => { setQuery(''); inputRef.current?.focus() }}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary">
              <X size={18} />
            </button>
          )}
        </div>
      </form>
      <p className="sr-only" aria-live="polite">{summary}</p>

      {!results && (
        <div className="flex flex-wrap gap-2 mb-6" aria-label="Popular topics">
          {TOPICS.map(t => (
            <button key={t} onClick={() => setQuery(t)}
              className="min-h-[36px] px-3 rounded-full bg-secondary text-sm font-semibold text-foreground hover:bg-primary/10 transition">
              {t}
            </button>
          ))}
        </div>
      )}

      {results ? (
        <div className="space-y-6 mt-4">
          <p className="text-sm text-muted-foreground" aria-hidden="true">{summary}</p>

          {nothing && (
            <div className="bg-card border border-border rounded-xl p-5 text-center">
              <HelpCircle size={28} className="text-muted-foreground mx-auto mb-2" aria-hidden="true" />
              <p className="font-bold text-foreground">We could not find “{trimmed}”</p>
              <p className="text-sm text-muted-foreground mt-1">Try fewer or simpler words, like “job”, “shop” or “payment”. Or ask us, and a person will reply.</p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                <button onClick={() => onAskUs(trimmed)}
                  className="min-h-[44px] px-4 rounded-xl bg-primary text-primary-foreground text-sm font-bold flex items-center gap-2">
                  <MessageCircle size={16} /> Ask us
                </button>
                <button onClick={() => { setQuery(''); inputRef.current?.focus() }}
                  className="min-h-[44px] px-4 rounded-xl border border-border text-sm font-bold text-foreground">
                  Clear search
                </button>
              </div>
            </div>
          )}

          {results.guides.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2"><BookOpen size={20} className="text-primary" /> Guides</h2>
              <div className="space-y-3">
                {results.guides.map(h => <GuideCard key={h.guide.id} guide={h.guide} terms={terms} matchStep={h.step} onPlay={play} />)}
              </div>
            </div>
          )}

          {results.faqs.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2"><HelpCircle size={20} className="text-primary" /> Answers</h2>
              <div className="space-y-3">
                {results.faqs.map((h, n) => <FaqItem key={h.faq.id} faq={h.faq} terms={terms} defaultOpen={n === 0} />)}
              </div>
            </div>
          )}

          {!nothing && (
            <p className="text-sm text-muted-foreground text-center">
              Not what you needed?{' '}
              <button onClick={() => onAskUs(trimmed)} className="font-bold text-primary underline underline-offset-2">Ask us</button>
            </p>
          )}
        </div>
      ) : (
        <>
          {isMember && (
            <button onClick={openTour}
              className="w-full mb-6 bg-card border border-border rounded-xl p-4 flex items-center gap-3 text-left hover:border-primary/40 transition">
              <span className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><Compass size={20} className="text-primary" /></span>
              <span className="flex-1">
                <span className="block font-bold text-foreground">Take the welcome tour again</span>
                <span className="block text-sm text-muted-foreground">A one-minute look at what you can do on Butsó.</span>
              </span>
              <PlayCircle size={20} className="text-primary shrink-0" />
            </button>
          )}

          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={24} className="text-primary" />
            <h2 className="text-2xl font-bold text-foreground">How to use Butsó</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Pick what you want to do. Each guide takes about a minute.</p>
          <div className="space-y-3 mb-8">
            {GUIDES.map(g => <GuideCard key={g.id} guide={g} terms={[]} onPlay={play} />)}
          </div>

          <div className="flex items-center gap-2 mb-4">
            <HelpCircle size={24} className="text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Frequently asked questions</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map(f => <FaqItem key={f.id} faq={f} terms={[]} defaultOpen={false} />)}
          </div>
        </>
      )}

      <AnimatePresence>
        {playing && (
          <StepGuide key={`${playing.guide.id}-${playing.step}`} guide={playing.guide} startAt={playing.step} autoPlay
            onClose={() => setPlaying(null)} />
        )}
      </AnimatePresence>
    </section>
  )
}
