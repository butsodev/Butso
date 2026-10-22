// Big "it worked" moment after something important (publishing a shop, posting a job).
// Usage: showSuccess({ title: 'Job posted', message: '...', actionLabel: 'View it', onAction: () => ... })

export type SuccessOptions = {
  title: string
  message?: string
  actionLabel?: string
  onAction?: () => void
}

export const SUCCESS_EVENT = 'butso:success'

export function showSuccess(opts: SuccessOptions) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent<SuccessOptions>(SUCCESS_EVENT, { detail: opts }))
}
