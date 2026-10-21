import { PeopleSearch } from '@/components/PeopleSearch'
import { MainShell } from '@/components/Shells'

export const metadata = { title: 'Worker profile · Butsó' }

// /@wunuken  →  opens PeopleSearch with that worker pre-selected.
// MainShell handles auth: guests get the GuestShell banner, signed-in users get AppShell.
export default function UsernameRoute() {
  return (
    <MainShell>
      <PeopleSearch />
    </MainShell>
  )
}
