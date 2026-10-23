import type { Metadata } from 'next'
import { PeopleSearch } from '@/components/PeopleSearch'
import { MainShell } from '@/components/Shells'
import { workerMetadata } from '@/lib/seo'

// Public link: /@wunuken (next.config.mjs rewrites it to /u/wunuken).
// AuthGate reads the username from the URL and PeopleSearch opens that worker.
// MainShell handles auth: guests get the GuestShell banner, signed-in users get AppShell.
export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params
  return workerMetadata(decodeURIComponent(username))
}

export default function UsernameRoute() {
  return (
    <MainShell>
      <PeopleSearch />
    </MainShell>
  )
}