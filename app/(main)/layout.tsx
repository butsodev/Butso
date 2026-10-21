import { MainShell } from '@/components/Shells'

// Screens people can see signed in, and (for browsing screens) signed out.
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <MainShell>{children}</MainShell>
}
