import { supabase } from '@/lib/supabase'

export type Review = {
  id: string
  bookingId: string
  reviewerId: string
  reviewerName: string
  rating: number
  comment: string
  createdAt: string
}

export type ReviewedPerson = {
  id: string
  name: string
  username: string
  rating: number | null
  completedJobs: number
}

type ReviewRow = {
  id: string; booking_id: string; reviewer_id: string; reviewer_name: string | null
  rating: number; comment: string | null; created_at: string
}

/** Every review written about one person, newest first. Reviews are public. */
export async function fetchReviews(workerId: string): Promise<{ reviews: Review[]; error: string | null }> {
  const { data, error } = await supabase
    .from('reviews')
    .select('id, booking_id, reviewer_id, reviewer_name, rating, comment, created_at')
    .eq('worker_id', workerId)
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) return { reviews: [], error: error.message }
  return {
    reviews: (data as ReviewRow[]).map(r => ({
      id: r.id,
      bookingId: r.booking_id,
      reviewerId: r.reviewer_id,
      reviewerName: r.reviewer_name?.trim() || 'Butsó member',
      rating: r.rating,
      comment: r.comment ?? '',
      createdAt: r.created_at,
    })),
    error: null,
  }
}

/** Name and headline numbers for the person being reviewed. Null if they are not in the public directory. */
export async function fetchReviewedPerson(workerId: string): Promise<ReviewedPerson | null> {
  const { data } = await supabase
    .from('public_profiles')
    .select('id, name, username, rating, completed_jobs')
    .eq('id', workerId)
    .maybeSingle()
  if (!data) return null
  const d = data as any
  return {
    id: d.id,
    name: d.name ?? 'This person',
    username: d.username ?? '',
    rating: d.rating == null ? null : Number(d.rating),
    completedJobs: d.completed_jobs ?? 0,
  }
}

export async function submitReview(input: {
  bookingId: string; reviewerId: string; workerId: string; rating: number; comment: string
}): Promise<{ error: string | null; alreadyReviewed?: boolean }> {
  const { error } = await supabase.from('reviews').insert({
    booking_id: input.bookingId,
    reviewer_id: input.reviewerId,
    worker_id: input.workerId,
    rating: input.rating,
    comment: input.comment.trim() || null,
  })
  if (!error) return { error: null }
  if (error.code === '23505') return { error: 'You already reviewed this booking.', alreadyReviewed: true }
  return { error: error.message }
}
