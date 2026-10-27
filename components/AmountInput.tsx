'use client'

import type { InputHTMLAttributes } from 'react'

/**
 * Naira amount field that shows commas as you type (15000 shows as 15,000).
 * `value` is the plain digits ("15000"); `onChange` gives plain digits back, so existing
 * code that does Number(value) keeps working.
 */
export function AmountInput({ value, onChange, ...rest }: {
  value: string | number | undefined
  onChange: (digits: string) => void
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type' | 'inputMode'>) {
  const digits = String(value ?? '').replace(/\D/g, '')
  const shown = digits ? Number(digits).toLocaleString('en-US') : ''
  return (
    <input {...rest} type="text" inputMode="numeric" autoComplete="off" value={shown}
      onChange={e => onChange(e.target.value.replace(/\D/g, '').slice(0, 9))} />
  )
}
