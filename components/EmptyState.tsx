'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-96 px-4"
    >
      <div className="text-center">
        <Icon size={48} className="text-muted-foreground mb-4 mx-auto opacity-50" />
        <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">{description}</p>
        {action && (
          <button
            onClick={action.onClick}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:opacity-90 transition font-medium"
          >
            {action.label}
          </button>
        )}
      </div>
    </motion.div>
  )
}
