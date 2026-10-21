import { PeopleSearch } from '@/components/PeopleSearch'
import { MainShell } from '@/components/Shells'

export const metadata = { title: 'Worker profile · Butsó' }

// Public link: /@wunuken (next.config.mjs rewrites it to /u/wunuken).
// AuthGate reads the username from the URL and PeopleSearch opens that worker.
// MainShell handles auth: guests get the GuestShell banner, signed-in users get AppShell.
export default function UsernameRoute() {
  return (
    <MainShell>
      <PeopleSearch />
    </MainShell>
  )
}
