import type { Metadata } from 'next'
import { JobDetails } from '@/components/JobDetails'
import { WithJob } from '@/components/RouteSync'
import { jobMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  return jobMetadata(id)
}

export default function JobsIdRoute() {
  return (
    <WithJob>
      <JobDetails />
    </WithJob>
  )
}