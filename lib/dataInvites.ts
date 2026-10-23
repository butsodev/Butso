import { supabase } from '@/lib/supabase'

export type InviteStatus = 'pending' | 'accepted' | 'declined' | 'cancelled'

export type JobInvite = {
  id: string
  jobId: string
  employerId: string
  workerId: string
  status: InviteStatus
}

type Row = { id: string; job_id: string; employer_id: string; worker_id: string; status: InviteStatus }
const map = (r: Row): JobInvite => ({
  id: r.id, jobId: r.job_id, employerId: r.employer_id, workerId: r.worker_id, status: r.status,
})

/** Which of my jobs have I already invited this person to? (job id -> status) */
export async function fetchInvitesToWorker(employerId: string, workerId: string): Promise<Map<string, InviteStatus>> {
  const { data } = await supabase
    .from('job_invites')
    .select('id, job_id, employer_id, worker_id, status')
    .eq('employer_id', employerId)
    .eq('worker_id', workerId)
  return new Map(((data ?? []) as Row[]).map(r => [r.job_id, r.status]))
}

/** Worker side: a waiting invite for this job, if there is one. */
export async function fetchMyPendingInvite(jobId: string, workerId: string): Promise<JobInvite | null> {
  const { data } = await supabase
    .from('job_invites')
    .select('id, job_id, employer_id, worker_id, status')
    .eq('job_id', jobId)
    .eq('worker_id', workerId)
    .eq('status', 'pending')
    .maybeSingle()
  return data ? map(data as Row) : null
}

export async function sendJobInvite(jobId: string, workerId: string): Promise<string | null> {
  const { error } = await supabase.rpc('send_job_invite', { p_job: jobId, p_worker: workerId })
  return error ? error.message : null
}

export async function respondJobInvite(
  id: string, accept: boolean,
): Promise<{ result: 'accepted' | 'declined' | 'filled' | null; error: string | null }> {
  const { data, error } = await supabase.rpc('respond_job_invite', { p_id: id, p_accept: accept })
  if (error) return { result: null, error: error.message }
  return { result: data as 'accepted' | 'declined' | 'filled', error: null }
}
