'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'
import { useEffect, useState } from 'react'

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

export function Toast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const removeToast = (id: string) => {
    setToasts(toasts.filter(t => t.id !== id))
  }

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }
    setToasts([...toasts, newToast])

    if (toast.duration !== Infinity) {
      setTimeout(() => removeToast(id), toast.duration || 3000)
    }
  }

  // Expose to window for global usage
  useEffect(() => {
    ;(window as any).showToast = addToast
  }, [])

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-primary" />
      case 'error':
        return <AlertCircle size={20} className="text-destructive" />
      case 'warning':
        return <AlertCircle size={20} className="text-accent" />
      case 'info':
        return <Info size={20} className="text-primary" />
      default:
        return <Info size={20} />
    }
  }

  const getBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-primary/10 dark:bg-primary/20 border-primary/30 dark:border-primary/40'
      case 'error':
        return 'bg-destructive/10 dark:bg-destructive/20 border-destructive/30 dark:border-destructive/40'
      case 'warning':
        return 'bg-accent/10 dark:bg-accent/20 border-accent/30 dark:border-accent/40'
      case 'info':
        return 'bg-primary/10 dark:bg-primary/20 border-primary/30 dark:border-primary/40'
      default:
        return 'bg-secondary dark:bg-secondary'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, x: 400 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, x: 400 }}
            transition={{ duration: 0.3 }}
            className={`mb-3 ${getBgColor(toast.type)} border rounded-lg p-4 flex items-start gap-3 pointer-events-auto max-w-sm`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {getIcon(toast.type)}
            </div>
            <p className="flex-1 text-sm text-foreground">
              {toast.message}
            </p>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
