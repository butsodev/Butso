import { JobApplicants } from '@/components/JobApplicants'
import { WithJob } from '@/components/RouteSync'

export const metadata = { title: 'Applicants · Butsó' }

export default function JobsIdApplicantsRoute() {
  return (
    <WithJob>
      <JobApplicants />
    </WithJob>
  )
}
