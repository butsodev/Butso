import Link from 'next/link'

export const metadata = { title: 'Page not found · Butsó' }

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-lg text-center">
        {/* White card so the illustration looks the same in light and dark mode */}
        <div className="mx-auto mb-8 w-full max-w-sm rounded-3xl bg-white p-4 shadow-sm border border-border">
          <img src="/404_error.svg" alt="Error 404: page not found" className="w-full h-auto" />
        </div>
        <h1 className="text-2xl font-black mb-2">We can&apos;t find that page</h1>
        <p className="text-muted-foreground mb-8">
          The link may be old or mistyped. Let&apos;s get you back to work.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="bg-primary text-primary-foreground font-bold px-6 min-h-[48px] inline-flex items-center justify-center rounded-xl hover:opacity-90 transition">
            Go to home
          </Link>
          <Link href="/?p=jobs" className="border border-border text-foreground font-semibold px-6 min-h-[48px] inline-flex items-center justify-center rounded-xl hover:bg-secondary transition">
            Browse jobs
          </Link>
        </div>
      </div>
    </main>
  )
}
