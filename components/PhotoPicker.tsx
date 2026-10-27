'use client'

import { useRef, useState } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { uploadImage } from '@/lib/upload'
import { showToast } from '@/lib/toast'

/** A button that picks a photo, shrinks it, uploads it, and hands back the URL. */
export function PhotoPicker({ label, onUploaded, folder, disabled, className }: {
  label: string
  onUploaded: (url: string) => void | Promise<void>
  folder?: string
  disabled?: boolean
  className?: string
}) {
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  const pick = async (file?: File) => {
    if (!file || busy) return
    setBusy(true)
    const { url, error } = await uploadImage(file, folder)
    if (error || !url) {
      showToast('error', error ?? 'Upload failed.')
    } else {
      await onUploaded(url)
    }
    setBusy(false)
    if (input.current) input.current.value = ''
  }

  return (
    <>
      <input ref={input} type="file" accept="image/*" className="hidden" aria-label={label}
        onChange={e => pick(e.target.files?.[0])} />
      <button type="button" disabled={busy || disabled} onClick={() => input.current?.click()}
        className={className ?? 'inline-flex items-center gap-2 px-4 min-h-[44px] rounded-xl border border-border bg-card text-sm font-bold text-foreground hover:border-primary hover:text-primary transition disabled:opacity-50'}>
        {busy ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
        {busy ? 'Uploading...' : label}
      </button>
    </>
  )
}
