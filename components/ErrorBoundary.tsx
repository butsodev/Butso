'use client'

import { motion } from 'framer-motion'
import { AlertCircle, Home } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import React, { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    console.error('[v0] Error caught by boundary:', error)
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />
    }

    return this.props.children
  }
}

function ErrorFallback({ error }: { error?: Error }) {
  const { setCurrentPage } = useAppStore()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background flex items-center justify-center px-4"
    >
      <div className="text-center max-w-md">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="bg-destructive/15 dark:bg-destructive/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <AlertCircle size={32} className="text-destructive" />
        </motion.div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Oops! Something went wrong
        </h1>
        <p className="text-muted-foreground mb-2">
          We&apos;re sorry for the inconvenience. Please try again.
        </p>
        {error && process.env.NODE_ENV === 'development' && (
          <p className="text-xs text-destructive bg-destructive/10 dark:bg-destructive/20 p-3 rounded mb-4 font-mono overflow-auto max-h-24">
            {error.message}
          </p>
        )}
        <button
          onClick={() => setCurrentPage('dashboard')}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition font-medium inline-flex items-center gap-2"
        >
          <Home size={20} />
          Back to Dashboard
        </button>
      </div>
    </motion.div>
  )
}
