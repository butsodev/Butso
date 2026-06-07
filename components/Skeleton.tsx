'use client'

import { motion } from 'framer-motion'

export function SkeletonCard() {
  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="bg-card rounded-lg p-4 h-48"
    />
  )
}

export function SkeletonText() {
  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="bg-card rounded h-4 w-full mb-2"
    />
  )
}

export function SkeletonCircle() {
  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="bg-card rounded-full w-12 h-12"
    />
  )
}

export function SkeletonJobCard() {
  return (
    <div className="bg-card rounded-lg p-4 space-y-3">
      <SkeletonText />
      <SkeletonText />
      <div className="flex gap-2">
        <SkeletonText />
        <SkeletonText />
      </div>
    </div>
  )
}
