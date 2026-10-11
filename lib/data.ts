import { supabase } from '@/lib/supabase'
import { useAppStore, type Job } from '@/lib/store'

type JobRow = {
  id: string
  title: string
  description: string
  category: string
  budget: number | string
  location: string
  employer_id: string
  status: Job['status'] | null
  selected_worker_id: string | null
  deadline: string | null
  created_at: string | null
  job_applications?: { worker_id: string; status: string }[] | null
}

export function mapJob(r: JobRow): Job {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    category: r.category,
    budget: Number(r.budget),
    location: r.location,
    employerId: r.employer_id,
    status: r.status ?? 'open',
    applicants: (r.job_applications ?? []).filter(a => a.status !== 'withdrawn').map(a => a.worker_id),
    selectedWorkerId: r.selected_worker_id ?? undefined,
    createdAt: r.created_at ?? new Date().toISOString(),
    deadline: r.deadline ?? undefined,
  }
}

export async function fetchJobs(): Promise<{ jobs: Job[]; error: string | null }> {
  const { data, error } = await supabase
    .from('jobs')
    .select('*, job_applications(worker_id, status)')
    .order('created_at', { ascending: false })
    .limit(200)
  if (error) return { jobs: [], error: error.message }
  return { jobs: (data as JobRow[]).map(mapJob), error: null }
}

/** Load jobs into the store and track loading / error state for the screens. */
export async function refreshJobs() {
  const st = useAppStore.getState()
  st.setJobsStatus('loading')
  const { jobs, error } = await fetchJobs()
  if (error) { st.setJobsStatus('error'); return }
  st.setJobs(jobs)
  st.setJobsStatus('ready')
}

export async function createJob(input: {
  title: string; description: string; category: string
  budget: number; location: string; employerId: string; deadline?: string
}): Promise<{ job: Job | null; error: string | null }> {
  const { data, error } = await supabase
    .from('jobs')
    .insert({
      title: input.title,
      description: input.description,
      category: input.category,
      budget: input.budget,
      location: input.location,
      employer_id: input.employerId,
      deadline: input.deadline || null,
    })
    .select('*')
    .single()
  if (error || !data) return { job: null, error: error?.message ?? 'Could not save the job' }
  return { job: mapJob(data as JobRow), error: null }
}

export type PublicProfile = {
  id: string; name: string; username: string; bio: string | null
  rating: number | null; completedJobs: number
}

export async function fetchProfile(id: string): Promise<PublicProfile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('id, name, username, bio, rating, completed_jobs')
    .eq('id', id)
    .maybeSingle()
  if (!data) return null
  return {
    id: data.id, name: data.name, username: data.username, bio: data.bio,
    rating: data.rating == null ? null : Number(data.rating),
    completedJobs: data.completed_jobs ?? 0,
  }
}

/** "just now", "3 hours ago", "2 days ago" */
export function timeAgo(iso: string): string {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`
  const days = Math.round(hrs / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}
