// Tiny safe wrapper around the global toast exposed by components/Toast.tsx.
// Usage: showToast('error', 'Something went wrong')

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export function showToast(type: ToastType, message: string, duration?: number) {
  if (typeof window === 'undefined') return
  const fn = (window as any).showToast
  if (typeof fn === 'function') fn({ type, message, duration })
  else console.warn('[toast]', type, message)
}
