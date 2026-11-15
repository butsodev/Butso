'use client'

import { motion } from 'framer-motion'

// Base pulse animation shared by all skeletons
const pulse = {
  animate: { opacity: [0.4, 0.8, 0.4] },
  transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' as const },
}

export function SkeletonCard() {
  return (
    <motion.div
      {...pulse}
      className="bg-muted rounded-2xl p-4 h-48"
    />
  )
}

export function SkeletonText({ width = 'w-full' }: { width?: string }) {
  return (
    <motion.div
      {...pulse}
      className={`bg-muted rounded-lg h-4 ${width} mb-2`}
    />
  )
}

export function SkeletonCircle({ size = 'w-12 h-12' }: { size?: string }) {
  return (
    <motion.div
      {...pulse}
      className={`bg-muted rounded-full ${size}`}
    />
  )
}

export function SkeletonJobCard() {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <SkeletonText width="w-2/3" />
          <SkeletonText width="w-full" />
          <SkeletonText width="w-4/5" />
        </div>
        <motion.div {...pulse} className="bg-muted rounded-full h-6 w-20 shrink-0" />
      </div>
      <div className="flex gap-4">
        <SkeletonText width="w-20" />
        <SkeletonText width="w-24" />
        <SkeletonText width="w-16" />
      </div>
      <motion.div {...pulse} className="bg-muted rounded-xl h-10 w-full" />
    </div>
  )
}

// Used in JobsBrowsing
export function SkeletonJobsList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {/* Category pills skeleton */}
      <div className="flex gap-2 overflow-hidden pb-1">
        {[80, 110, 90, 100, 85, 95].map((w, i) => (
          <motion.div
            key={i}
            {...pulse}
            className="bg-muted rounded-full h-9 shrink-0"
            style={{ width: w }}
          />
        ))}
      </div>
      {/* Job cards */}
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonJobCard key={i} />
      ))}
    </div>
  )
}

// Skeleton for dashboard stat cards
export function SkeletonDashboard() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero header skeleton */}
      <div className="bg-muted px-4 sm:px-6 pt-8 pb-12">
        <div className="max-w-4xl mx-auto flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <SkeletonText width="w-24" />
            <SkeletonText width="w-40" />
            <SkeletonText width="w-32" />
          </div>
          <motion.div {...pulse} className="bg-muted-foreground/20 rounded-xl w-10 h-10 shrink-0" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-8 pb-8 space-y-4">
        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              {...pulse}
              className="bg-card border border-border rounded-2xl p-4 h-24"
            />
          ))}
        </div>

        {/* Quick action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div {...pulse} className="bg-muted rounded-2xl h-20 col-span-2" />
          <motion.div {...pulse} className="bg-card border border-border rounded-2xl h-20" />
          <motion.div {...pulse} className="bg-card border border-border rounded-2xl h-20" />
          <motion.div {...pulse} className="bg-card border border-border rounded-2xl h-20" />
          <motion.div {...pulse} className="bg-card border border-border rounded-2xl h-20" />
        </div>

        {/* Recent activity */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
          <SkeletonText width="w-36" />
          <SkeletonText width="w-full" />
          <SkeletonText width="w-4/5" />
          <SkeletonText width="w-3/5" />
        </div>
      </div>
    </div>
  )
}

/**
 * The app's frame (top bar, side menu on desktop, bottom bar on phones) with placeholder
 * content. Shown while the sign-in check runs on a private screen, so the layout is already
 * in place instead of a spinner on a blank page. Plain CSS so it renders on the server too.
 */
export function SkeletonAppFrame() {
  const bar = 'rounded-lg bg-muted animate-pulse'
  return (
    <div className="min-h-screen bg-background" aria-busy="true" aria-label="Loading">
      <div className="h-14 border-b border-border bg-card px-4 flex items-center gap-3 lg:ml-64">
        <div className={`${bar} h-8 w-8 rounded-xl`} />
        <div className={`${bar} h-4 w-28`} />
        <div className={`${bar} ml-auto h-8 w-8 rounded-full`} />
      </div>
      <div className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col gap-3 border-r border-border bg-card p-4">
        <div className={`${bar} h-8 w-32 mb-4`} />
        {Array.from({ length: 7 }).map((_, i) => <div key={i} className={`${bar} h-9 w-full`} />)}
      </div>
      <main className="lg:ml-64 p-4 sm:p-6 space-y-4 max-w-3xl">
        <div className={`${bar} h-7 w-48`} />
        <div className={`${bar} h-4 w-72 max-w-full`} />
        <div className="grid grid-cols-3 gap-3 pt-2">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className={`${bar} h-20 rounded-2xl`} />)}
        </div>
        {Array.from({ length: 3 }).map((_, i) => <div key={i} className={`${bar} h-28 rounded-2xl`} />)}
      </main>
      <div className="lg:hidden fixed bottom-0 inset-x-0 h-16 border-t border-border bg-card flex items-center justify-around">
        {Array.from({ length: 5 }).map((_, i) => <div key={i} className={`${bar} h-6 w-6 rounded-md`} />)}
      </div>
    </div>
  )
}
