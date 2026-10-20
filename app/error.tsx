'use client'

import { useEffect } from 'react'

export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error('[route error]', error) }, [error])
  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <div className="max-w-sm text-center">
        <h1 className="text-2xl font-black mb-2">Something went wrong</h1>
        <p className="text-muted-foreground mb-6">This page hit a problem. Your data is safe. Try again, and if it keeps happening, go back home.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="bg-primary text-primary-foreground font-bold px-6 min-h-[48px] rounded-xl hover:opacity-90 transition">Try again</button>
          <a href="/" className="border border-border font-semibold px-6 min-h-[48px] inline-flex items-center rounded-xl hover:bg-secondary transition">Home</a>
        </div>
      </div>
    </main>
  )
}
