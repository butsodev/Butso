import { supabase } from '@/lib/supabase'

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn'

export type Applicant = {
  id: string            // application id
  workerId: string
  name: string
  username: string
  bio: string
  skills: string[]
  rating: number | null
  completedJobs: number
  message: string
  expectedRate: number | null
  availability: string | null
  status: ApplicationStatus
  createdAt: string
}

type ApplicationRow = {
  id: string; worker_id: string; message: string | null; expected_rate: number | string | null
  availability: string | null; status: ApplicationStatus; created_at: string
}

export async function applyToJob(input: {
  jobId: string; workerId: string; message?: string; expectedRate?: number | null; availability?: string
}): Promise<{ error: string | null; alreadyApplied?: boolean }> {
  const { error } = await supabase.from('job_applications').insert({
    job_id: input.jobId,
    worker_id: input.workerId,
    message: input.message?.trim() || null,
    expected_rate: input.expectedRate ?? null,
    availability: input.availability ?? null,
  })
  if (!error) return { error: null }
  if (error.code === '23505') return { error: 'You already applied for this job.', alreadyApplied: true }
  return { error: error.message }
}

/** Employer view: every application on one job, joined to public worker info. */
export async function fetchApplicants(jobId: string): Promise<{ applicants: Applicant[]; error: string | null }> {
  const { data, error } = await supabase
    .from('job_applications')
    .select('id, worker_id, message, expected_rate, availability, status, created_at')
    .eq('job_id', jobId)
    .neq('status', 'withdrawn')
    .order('created_at', { ascending: false })
  if (error) return { applicants: [], error: error.message }
  const rows = (data ?? []) as ApplicationRow[]
  if (rows.length === 0) return { applicants: [], error: null }

  const { data: profiles, error: pErr } = await supabase
    .from('public_profiles')
    .select('id, name, username, bio, skills, rating, completed_jobs')
    .in('id', rows.map(r => r.worker_id))
  if (pErr) return { applicants: [], error: pErr.message }
  const byId = new Map((profiles ?? []).map((p: any) => [p.id, p]))

  return {
    applicants: rows.map(r => {
      const p: any = byId.get(r.worker_id)
      return {
        id: r.id,
        workerId: r.worker_id,
        name: p?.name ?? 'Worker',
        username: p?.username ?? '',
        bio: p?.bio ?? '',
        skills: p?.skills ?? [],
        rating: p?.rating == null ? null : Number(p.rating),
        completedJobs: p?.completed_jobs ?? 0,
        message: r.message ?? '',
        expectedRate: r.expected_rate == null ? null : Number(r.expected_rate),
        availability: r.availability,
        status: r.status,
        createdAt: r.created_at,
      }
    }),
    error: null,
  }
}

export async function setApplicationStatus(
  applicationId: string, status: 'accepted' | 'rejected', jobId: string, workerId: string,
): Promise<string | null> {
  const { error } = await supabase.from('job_applications').update({ status }).eq('id', applicationId)
  if (error) return error.message
  if (status === 'accepted') {
    // Record who got the job. Application status is the source of truth, so a failure here is non-fatal.
    await supabase.from('jobs').update({ selected_worker_id: workerId, status: 'in-progress' }).eq('id', jobId)
  }
  return null
}
