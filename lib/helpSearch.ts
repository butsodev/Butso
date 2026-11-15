// Search for Help & Support: looks through the how-to guides and the FAQs.
// Small on purpose: no library, no server. The content is a few KB and searched as you type.
//
// What it handles:
//  - accents and case: "butso" finds "Butsó"
//  - word endings: "booking", "booked" and "books" all match "book"
//  - partial words while typing: "pay" finds "payment"
//  - everyday words: "money" finds payments, "scam" finds reporting (see SYNONYMS)
//  - filler words: "how do I post a job" searches for "post job"
import { GUIDES, type Guide } from '@/lib/guideContent'
import { FAQS, type Faq } from '@/lib/faqContent'

/** Words that mean the same thing here. A search word matching one finds all of them. */
const SYNONYMS: string[][] = [
  ['pay', 'payment', 'money', 'naira', 'cash', 'transfer', 'price', 'cost', 'fee', 'charge', 'budget', 'rate', 'earn'],
  ['job', 'work', 'gig', 'task', 'vacancy'],
  ['hire', 'employ', 'recruit', 'choose', 'pick', 'employer'],
  ['worker', 'artisan', 'handyman', 'freelancer', 'applicant'],
  ['shop', 'store', 'business', 'salon', 'barber', 'tailor'],
  ['book', 'appointment', 'reserve', 'schedule'],
  ['message', 'chat', 'dm', 'inbox', 'text', 'request'],
  ['phone', 'number', 'contact', 'call', 'whatsapp'],
  ['delete', 'remove', 'deactivate', 'close', 'leave'],
  ['account', 'profile'],
  ['report', 'flag', 'scam', 'fraud', 'abuse', 'fake', 'complaint'],
  ['block', 'ban', 'stop', 'harass', 'bother'],
  ['photo', 'picture', 'image', 'pic', 'gallery'],
  ['review', 'rating', 'star', 'feedback'],
  ['safe', 'safety', 'security', 'privacy', 'private', 'hidden', 'hide'],
  ['apply', 'application'],
  ['signup', 'register', 'join'],
  ['login', 'signin'],
  ['password', 'forgot'],
  ['data', 'download', 'export', 'copy'],
]

const STOP = new Set(['a', 'an', 'the', 'i', 'me', 'my', 'do', 'does', 'how', 'can', 'to', 'is', 'it', 'of', 'for',
  'on', 'in', 'and', 'or', 'what', 'where', 'when', 'why', 'who', 'with', 'you', 'your', 'we', 'be', 'am', 'are', 'want', 'way', 'please'])

/** Lowercase, no accents, letters and digits only. */
export function normalize(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9₦]+/g, ' ').trim()
}

/** A rough stem, good enough for English help text: booking/booked/books -> book. */
export function stem(w: string): string {
  // Plural first, then -ing / -ed, so "bookings" -> "booking" -> "book"
  if (w.length > 4 && w.endsWith('es') && !w.endsWith('ses')) w = w.slice(0, -2)
  else if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) w = w.slice(0, -1)
  if (w.length > 5 && w.endsWith('ing')) w = w.slice(0, -3)
  else if (w.length > 4 && w.endsWith('ed')) w = w.slice(0, -2)
  return w
}

// "sign up" and "log in" are typed as two words but mean one thing
const joinPhrases = (s: string) => s.replace(/\bsign (up|in)\b/g, 'sign$1').replace(/\blog (in|on)\b/g, 'login')

/** The words to look for. Each entry holds the word plus its synonyms, all stemmed. */
export function queryTerms(query: string): string[][] {
  const words = joinPhrases(normalize(query)).split(' ').filter(w => w && !STOP.has(w))
  return words.map(w => {
    const base = stem(w)
    const alts = new Set([base])
    for (const group of SYNONYMS) {
      if (group.some(g => stem(g) === base)) group.forEach(g => alts.add(stem(g)))
    }
    return [...alts]
  })
}

const wordsOf = (s: string) => joinPhrases(normalize(s)).split(' ').filter(Boolean).map(stem)

/** Does any word in the text start with one of the alternatives? (prefix = works while typing) */
function fieldHas(words: string[], alts: string[]): boolean {
  return words.some(w => alts.some(a => w.startsWith(a)))
}

type Field = { words: string[]; weight: number }

function score(fields: Field[], terms: string[][]): { score: number; matched: number } {
  let total = 0, matched = 0
  for (const alts of terms) {
    let best = 0
    for (const f of fields) if (f.weight > best && fieldHas(f.words, alts)) best = f.weight
    if (best > 0) { matched++; total += best }
  }
  return { score: total, matched }
}

/** Enough of the search words must match: all of them for short searches, all but one for long ones. */
const enough = (matched: number, count: number) => matched >= (count >= 4 ? count - 1 : count)

export type GuideHit = { guide: Guide; score: number; /** The step that matched best, to start the walkthrough there. */ step: number }
export type FaqHit = { faq: Faq; score: number }

export function searchHelp(query: string, guides: Guide[] = GUIDES, faqs: Faq[] = FAQS): { terms: string[][]; guides: GuideHit[]; faqs: FaqHit[] } {
  const terms = queryTerms(query)
  if (terms.length === 0) return { terms, guides: [], faqs: [] }

  const guideHits: GuideHit[] = []
  for (const g of guides) {
    const stepWords = g.steps.map(s => wordsOf(`${s.text} ${s.screen.title} ${(s.screen.rows ?? []).join(' ')} ${s.screen.button ?? ''}`))
    const r = score([
      { words: wordsOf(g.title), weight: 6 },
      { words: wordsOf((g.keywords ?? []).join(' ')), weight: 4 },
      { words: wordsOf(`${g.intro} ${g.forWho}`), weight: 2 },
      { words: stepWords.flat(), weight: 1 },
    ], terms)
    if (!enough(r.matched, terms.length)) continue
    // Which step mentions the most search words? Start there. Ties go to the earlier step.
    let step = 0, bestStep = 0
    stepWords.forEach((w, i) => {
      const n = terms.filter(alts => fieldHas(w, alts)).length
      if (n > bestStep) { bestStep = n; step = i }
    })
    guideHits.push({ guide: g, score: r.score, step })
  }

  const faqHits: FaqHit[] = []
  for (const f of faqs) {
    const r = score([
      { words: wordsOf(f.question), weight: 6 },
      { words: wordsOf((f.keywords ?? []).join(' ')), weight: 4 },
      { words: wordsOf(f.answer), weight: 1 },
    ], terms)
    if (enough(r.matched, terms.length)) faqHits.push({ faq: f, score: r.score })
  }

  guideHits.sort((a, b) => b.score - a.score)
  faqHits.sort((a, b) => b.score - a.score)
  return { terms, guides: guideHits, faqs: faqHits }
}

/**
 * Splits text into plain and matching pieces, so the screen can highlight what matched.
 * Works word by word, so accents and endings are handled the same way as the search.
 */
export function highlightParts(text: string, terms: string[][]): { text: string; hit: boolean }[] {
  if (terms.length === 0) return [{ text, hit: false }]
  return text.split(/(\s+)/).map(piece => {
    const w = stem(normalize(piece).replace(/ /g, ''))
    const hit = w.length > 0 && terms.some(alts => alts.some(a => w.startsWith(a)))
    return { text: piece, hit }
  })
}
