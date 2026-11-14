// Tiny safe wrapper around the global toast exposed by components/Toast.tsx.
// Usage: showToast('error', 'Something went wrong')

export type ToastType = 'success' | 'error' | 'warning' | 'info'

declare global {
  interface Window {
    showToast?: (toast: { type: ToastType; message: string; duration?: number }) => void
  }
}

export function showToast(type: ToastType, message: string, duration?: number) {
  if (typeof window === 'undefined') return
  const fn = window.showToast
  if (typeof fn === 'function') fn({ type, message, duration })
  else console.warn('[toast]', type, message)
}
