import { create } from 'zustand'

// In-app replacement for window.confirm. Use it like this:
//   if (!(await confirmAction({ title: 'Delete this photo?', confirmLabel: 'Delete', danger: true }))) return
export interface ConfirmOptions {
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}

interface ConfirmState {
  open: boolean
  opts: ConfirmOptions | null
  resolve: ((answer: boolean) => void) | null
}

export const useConfirmStore = create<ConfirmState>(() => ({ open: false, opts: null, resolve: null }))

export function confirmAction(opts: ConfirmOptions): Promise<boolean> {
  useConfirmStore.getState().resolve?.(false) // a second dialog cancels the first
  return new Promise(resolve => useConfirmStore.setState({ open: true, opts, resolve }))
}

export function answerConfirm(answer: boolean) {
  const { resolve } = useConfirmStore.getState()
  useConfirmStore.setState({ open: false, resolve: null }) // keep opts so the exit animation still has text
  resolve?.(answer)
}
