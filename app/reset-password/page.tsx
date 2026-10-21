import { AuthShell } from '@/components/AuthShell'
import { ResetPassword } from '@/components/ResetPassword'

export const metadata = { title: 'Reset password · Butsó' }

// Works signed in or out, so it sits outside both groups
export default function ResetPasswordRoute() {
  return (
    <AuthShell>
      <ResetPassword />
    </AuthShell>
  )
}
