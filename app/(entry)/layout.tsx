import { EntryShell } from '@/components/Shells'

// Sign-in and onboarding screens
export default function EntryLayout({ children }: { children: React.ReactNode }) {
  return <EntryShell>{children}</EntryShell>
}
