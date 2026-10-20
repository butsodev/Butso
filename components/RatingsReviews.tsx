'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Star } from 'lucide-react'
import { RatingBadge, RatingMeter } from '@/components/Rating'
import { Avatar } from '@/components/Avatar'
import { EmptyState } from '@/components/EmptyState'
import { useAppStore, goBackTo } from '@/lib/store'
import { timeAgo } from '@/lib/data'
import { showToast } from '@/lib/toast'
import { fetchReviews, fetchReviewedPerson, submitReview, type Review, type ReviewedPerson } from '@/lib/dataReviews'

export function RatingsReviews() {
  const { currentUser, bookings, reviewWorkerId, setCurrentPage } = useAppStore()
  const workerId = reviewWorkerId

  const [person, setPerson] = useState<ReviewedPerson | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [pickedBookingId, setPickedBookingId] = useState('')
  const [stars, setStars] = useState(0)
  const [comment, setComment] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const load = useCallback(async () => {
    if (!workerId) return
    setLoading(true); setLoadError('')
    const [{ reviews: list, error }, who] = await Promise.all([fetchReviews(workerId), fetchReviewedPerson(workerId)])
    if (error) setLoadError('Could not load reviews. Please try again.')
    else setReviews(list)
    setPerson(who)
    setLoading(false)
  }, [workerId])

  useEffect(() => { void load() }, [load])

  // Completed bookings where the signed-in person was the customer and has not reviewed yet
  const reviewable = useMemo(() => {
    if (!currentUser || !workerId) return []
    const done = new Set(reviews.map(r => r.bookingId))
    return bookings.filter(b =>
      b.status === 'completed' && b.employerId === currentUser.id && b.workerId === workerId && !done.has(b.id))
  }, [bookings, reviews, currentUser, workerId])

  const alreadyReviewedSome = !!currentUser && reviews.some(r => r.reviewerId === currentUser.id)
  const activeBookingId = pickedBookingId || reviewable[0]?.id || ''
  const activeBooking = reviewable.find(b => b.id === activeBookingId)
  const bookingLabel = (b: { jobTitle?: string; serviceName?: string; shopName?: string; date: string }) =>
    b.jobTitle || b.serviceName || b.shopName || 'Booking'

  const total = reviews.length
  const average = total ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0
  const counts = [5, 4, 3, 2, 1].map(n => ({ n, count: reviews.filter(r => r.rating === n).length }))

  const send = async () => {
    if (saving || !currentUser || !workerId || !activeBooking) return
    if (stars < 1) { setFormError('Tap a star to rate.'); return }
    setFormError(''); setSaving(true)
    const { error, alreadyReviewed } = await submitReview({
      bookingId: activeBooking.id, reviewerId: currentUser.id, workerId, rating: stars, comment,
    })
    setSaving(false)
    if (error && !alreadyReviewed) { setFormError('Could not send your review. Please try again.'); return }
    showToast(alreadyReviewed ? 'info' : 'success', alreadyReviewed ? 'You already reviewed this booking.' : 'Thanks for your review.')
    setStars(0); setComment(''); setPickedBookingId('')
    void load()
  }

  if (!workerId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6 text-center">
        <div>
          <p className="text-foreground font-bold mb-2">Pick someone to see their reviews</p>
          <button onClick={() => setCurrentPage('people')} className="text-primary font-semibold">Find people</button>
        </div>
      </div>
    )
  }

  const displayName = person?.name ?? 'this person'
  const isSelf = currentUser?.id === workerId

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-background text-foreground pb-20">
      <div className="sticky top-0 z-30 bg-background border-b border-border">
        <div className="flex items-center gap-3 px-4 py-4 sm:px-6">
          <button aria-label="Go back" onClick={() => goBackTo('people')} className="p-2 hover:bg-secondary rounded-lg transition">
            <ArrowLeft size={24} className="text-foreground" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-foreground truncate">Reviews</h1>
            {person && <p className="text-xs text-muted-foreground truncate">{person.name}</p>}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 max-w-3xl mx-auto">
        {loading && <div className="rounded-lg bg-card p-6 text-center text-sm text-muted-foreground">Loading reviews…</div>}

        {!loading && loadError && (
          <div className="rounded-lg bg-card p-6 text-center text-sm">
            <p className="text-destructive mb-2">{loadError}</p>
            <button onClick={() => void load()} className="text-primary font-semibold">Try again</button>
          </div>
        )}

        {!loading && !loadError && (
          <>
            {total > 0 ? (
              <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-card rounded-lg p-6 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-primary mb-2">{average.toFixed(1)}</div>
                    <div className="flex justify-center mb-2"><RatingMeter value={average} /></div>
                    <p className="text-sm text-muted-foreground">{total} {total === 1 ? 'review' : 'reviews'}</p>
                  </div>
                  <div className="sm:col-span-2">
                    {counts.map(({ n, count }) => (
                      <div key={n} className="flex items-center gap-3 mb-3 last:mb-0">
                        <span className="text-sm font-medium text-foreground w-4">{n}</span>
                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 transition-all" style={{ width: `${(count / total) * 100}%` }} />
                        </div>
                        <span className="text-sm text-muted-foreground w-6 text-right">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <EmptyState
                icon={Star}
                title="No reviews yet"
                description={isSelf ? 'Reviews from your customers will show up here after your jobs are completed.' : `${displayName} has not been reviewed yet.`}
              />
            )}

            {/* Write a review: only for the customer of a completed booking */}
            {reviewable.length > 0 && activeBooking && (
              <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-card border border-border rounded-lg p-6 mb-6">
                <h2 className="font-bold text-foreground mb-1">Rate {displayName}</h2>
                {reviewable.length > 1 ? (
                  <select
                    aria-label="Which booking"
                    value={activeBookingId}
                    onChange={e => setPickedBookingId(e.target.value)}
                    className="w-full mb-3 px-3 py-2 border border-border rounded-lg bg-background text-sm text-foreground"
                  >
                    {reviewable.map(b => (
                      <option key={b.id} value={b.id}>{bookingLabel(b)} · {b.date ? new Date(b.date).toLocaleDateString() : ''}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm text-muted-foreground mb-3">For: {bookingLabel(activeBooking)}</p>
                )}
                <div className="flex gap-1 mb-3" role="radiogroup" aria-label="Your rating">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n} type="button" role="radio" aria-checked={stars === n} aria-label={`${n} star${n > 1 ? 's' : ''}`}
                      onClick={() => { setStars(n); setFormError('') }}
                      className="p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
                    >
                      <Star size={30} className={n <= stars ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground/40'} />
                    </button>
                  ))}
                </div>
                <textarea
                  aria-label="Your review (optional)" value={comment} onChange={e => setComment(e.target.value)} maxLength={500} rows={3}
                  placeholder="How did it go? (optional)"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm text-foreground placeholder:text-muted-foreground/50 resize-none"
                />
                {formError && <p role="alert" className="text-destructive text-sm mt-2">{formError}</p>}
                <button
                  onClick={send} disabled={saving || stars < 1}
                  className="mt-3 w-full bg-primary text-primary-foreground py-3 rounded-lg hover:opacity-90 transition font-semibold disabled:opacity-50"
                >
                  {saving ? 'Sending…' : 'Submit review'}
                </button>
              </motion.div>
            )}

            {!isSelf && reviewable.length === 0 && !alreadyReviewedSome && currentUser && (
              <p className="text-xs text-muted-foreground text-center mb-6">
                You can review {displayName} after a booking with them is marked completed.
              </p>
            )}

            {total > 0 && (
              <div className="space-y-4">
                {reviews.map(r => (
                  <div key={r.id} className="bg-card rounded-lg p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar name={r.reviewerName} size={44} />
                        <div className="min-w-0">
                          <p className="font-bold text-foreground truncate">{r.reviewerName}</p>
                          <p className="text-xs text-muted-foreground">{timeAgo(r.createdAt)}</p>
                        </div>
                      </div>
                      <RatingBadge value={r.rating} size="sm" />
                    </div>
                    {r.comment && <p className="text-sm text-muted-foreground leading-relaxed">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  )
}
