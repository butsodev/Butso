'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Star, Heart, MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { useAppStore } from '@/lib/store'

const mockReviews = [
  {
    id: 1,
    author: 'Wando Agishi',
    avatar: '👩‍💼',
    rating: 5,
    date: '2 days ago',
    title: 'Excellent work!',
    text: 'John did an amazing job with the carpentry. Very professional and finished ahead of schedule. Highly recommend!',
    helpful: 24,
    liked: false,
  },
  {
    id: 2,
    author: 'Isa Tarfa',
    avatar: '👨‍💻',
    rating: 5,
    date: '1 week ago',
    title: 'Perfect service',
    text: 'Exactly what I needed. Great communication throughout the project. Will hire again!',
    helpful: 18,
    liked: false,
  },
  {
    id: 3,
    author: 'Ashu Pwajok',
    avatar: '👩‍🎨',
    rating: 4,
    date: '2 weeks ago',
    title: 'Good quality work',
    text: 'Good quality work and reasonable pricing. Took a bit longer than expected but the result was worth it.',
    helpful: 12,
    liked: false,
  },
]

export function RatingsReviews() {
  const { setCurrentPage } = useAppStore()
  const [reviews, setReviews] = useState(mockReviews)
  const [likedReviews, setLikedReviews] = useState<number[]>([])

  const averageRating = (
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  ).toFixed(1)

  const ratingCounts = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
  }))

  const handleLike = (id: number) => {
    if (likedReviews.includes(id)) {
      setLikedReviews(likedReviews.filter(rid => rid !== id))
    } else {
      setLikedReviews([...likedReviews, id])
    }
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
          <button
            onClick={() => setCurrentPage('worker-profile')}
            className="p-2 hover:bg-secondary rounded-lg transition"
          >
            <ArrowLeft size={24} className="text-foreground" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Ratings & Reviews</h1>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* Rating Summary */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-card rounded-lg p-6 mb-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-5xl font-bold text-primary mb-2">
                {averageRating}
              </div>
              <div className="flex justify-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={i < Math.floor(parseFloat(averageRating)) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Based on {reviews.length} reviews
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="sm:col-span-2">
              {ratingCounts.map((item) => (
                <div key={item.rating} className="flex items-center gap-3 mb-3">
                  <span className="text-sm font-medium text-foreground w-8">
                    {item.rating}★
                  </span>
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${(item.count / reviews.length) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-muted-foreground w-8">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button className="w-full bg-primary text-primary-foreground py-2 rounded-lg hover:opacity-90 transition font-medium">
            Write a Review
          </button>
        </motion.div>

        {/* Reviews List */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-card rounded-lg p-6 hover:bg-opacity-80 transition"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="text-4xl">{review.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground">{review.author}</p>
                    <p className="text-xs text-muted-foreground">{review.date}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}
                    />
                  ))}
                </div>
              </div>

              {/* Review Content */}
              <h4 className="font-semibold text-foreground mb-2">{review.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {review.text}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-4 text-sm">
                <button
                  onClick={() => handleLike(review.id)}
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition"
                >
                  <Heart
                    size={16}
                    className={likedReviews.includes(review.id) ? 'fill-primary text-primary' : ''}
                  />
                  <span>Helpful ({review.helpful})</span>
                </button>
                <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition">
                  <MessageCircle size={16} />
                  <span>Reply</span>
                </button>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}