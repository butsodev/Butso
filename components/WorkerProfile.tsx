'use client'

import { motion } from 'framer-motion'
import { Star, MapPin, Briefcase, Award, ChevronLeft, MessageCircle, Share2 } from 'lucide-react'
import { useAppStore } from '@/lib/store'

export function WorkerProfile() {
  const { setCurrentPage, currentUser } = useAppStore()

  // Sample worker data - in real app, would be fetched
  const worker = currentUser || {
    id: '1',
    name: 'Asoga Tarfa',
    phone: '+234 801 234 5678',
    role: 'worker' as const,
    bio: 'Professional with 5+ years of experience in construction and home repairs',
    skills: ['Carpentry', 'Plumbing', 'Electrical', 'Painting'],
    rating: 4.9,
    completedJobs: 23,
  }

  const reviews = [
    {
      id: '1',
      author: 'Larai Sule',
      rating: 5,
      comment: 'Excellent work! Very professional and completed ahead of schedule.',
      date: '2 weeks ago',
    },
    {
      id: '2',
      author: 'Chidonku Agbu',
      rating: 5,
      comment: 'Great communication and high-quality workmanship. Highly recommended!',
      date: '1 month ago',
    },
    {
      id: '3',
      author: 'Yusuf Garba',
      rating: 4,
      comment: 'Good work, very reliable. Minor delays but excellent finish.',
      date: '6 weeks ago',
    },
  ]

  const certifications = [
    { id: '1', name: 'Advanced Carpentry', issuer: 'TradeTech Institute', year: '2021' },
    { id: '2', name: 'Safety Certification', issuer: 'National Safety Board', year: '2022' },
    { id: '3', name: 'Customer Service Excellence', issuer: 'Professional Development', year: '2023' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background pb-20"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6 pt-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto flex items-start justify-between"
        >
          <motion.button
            whileHover={{ x: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage('dashboard')}
            className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition font-semibold mb-4"
          >
            <ChevronLeft size={20} />
            Back
          </motion.button>
        </motion.div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 -mt-12 pb-8">
        {/* Profile Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-lg border border-border shadow-lg p-8 mb-6"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-6">
              <div className="text-7xl">👨‍🔧</div>
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">{worker.name}</h1>
                <p className="text-muted-foreground mb-4">Professional Service Provider</p>

                <div className="flex items-center gap-6 mb-4">
                  <div className="flex items-center gap-2">
                    <Star className="text-accent" size={20} fill="currentColor" />
                    <span className="font-bold text-lg text-foreground">{worker.rating}</span>
                    <span className="text-muted-foreground">(from {reviews.length} reviews)</span>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-2xl text-foreground">{worker.completedJobs}</p>
                    <p className="text-xs text-muted-foreground">Jobs Completed</p>
                  </div>
                </div>

                <p className="text-foreground mb-4 max-w-2xl">{worker.bio}</p>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin size={16} />
                  <span>Wukari, Taraba State</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition flex items-center gap-2"
              >
                <MessageCircle size={20} />
                Message
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 border border-border text-foreground rounded-lg hover:bg-secondary transition"
              >
                <Share2 size={20} />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Skills */}
        {worker.skills && worker.skills.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-lg border border-border p-6 mb-6 shadow-sm"
          >
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Briefcase size={24} />
              Skills
            </h2>
            <div className="flex flex-wrap gap-3">
              {worker.skills.map((skill, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="px-4 py-2 bg-primary/10 text-primary font-semibold rounded-full"
                >
                  {skill}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Certifications */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="bg-card rounded-lg border border-border p-6 mb-6 shadow-sm"
        >
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Award size={24} />
            Certifications & Credentials
          </h2>
          <div className="space-y-4">
            {certifications.map((cert, index) => (
              <motion.div
                key={cert.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.45 + index * 0.05 }}
                className="p-4 border border-border rounded-lg hover:bg-secondary/30 transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-foreground">{cert.name}</h3>
                    <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground">{cert.year}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Reviews */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-lg border border-border p-6 shadow-sm"
        >
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Star size={24} className="text-accent" />
            Client Reviews
          </h2>
          <div className="space-y-4">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="p-4 border border-border rounded-lg"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-foreground">{review.author}</h3>
                  <span className="text-xs text-muted-foreground">{review.date}</span>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < review.rating ? 'text-accent' : 'text-border'}
                      fill={i < review.rating ? 'currentColor' : 'none'}
                    />
                  ))}
                </div>
                <p className="text-foreground text-sm">{review.comment}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}