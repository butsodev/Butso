import { JobDetails } from '@/components/JobDetails'
import { WithJob } from '@/components/RouteSync'

export const metadata = { title: 'Job · Butsó' }

export default function JobsIdRoute() {
  return (
    <WithJob>
      <JobDetails />
    </WithJob>
  )
}
