import { ApplyJob } from '@/components/ApplyJob'
import { WithJob } from '@/components/RouteSync'

export const metadata = { title: 'Apply for a job · Butsó' }

export default function JobsIdApplyRoute() {
  return (
    <WithJob>
      <ApplyJob />
    </WithJob>
  )
}
