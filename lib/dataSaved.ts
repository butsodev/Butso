import { supabase } from '@/lib/supabase'

export async function isJobSaved(userId: string, jobId: string): Promise<boolean> {
  const { data } = await supabase.from('saved_jobs').select('job_id').eq('user_id', userId).eq('job_id', jobId).maybeSingle()
  return !!data
}

export async function setJobSaved(userId: string, jobId: string, saved: boolean): Promise<string | null> {
  const { error } = saved
    ? await supabase.from('saved_jobs').upsert({ user_id: userId, job_id: jobId })
    : await supabase.from('saved_jobs').delete().eq('user_id', userId).eq('job_id', jobId)
  return error ? error.message : null
}
