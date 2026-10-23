import { supabase } from '@/lib/supabase'

export async function updateJobDetails(id: string, f: {
  title: string; description: string; budget: number; location: string
}): Promise<string | null> {
  const { error } = await supabase.from('jobs').update({
    title: f.title, description: f.description, budget: f.budget, location: f.location,
  }).eq('id', id)
  return error ? error.message : null
}

/** Close a job (hidden from the jobs list) or reopen it. */
export async function setJobOpen(id: string, open: boolean): Promise<string | null> {
  const { error } = await supabase.from('jobs').update({ status: open ? 'open' : 'cancelled' }).eq('id', id)
  return error ? error.message : null
}

export async function deleteJob(id: string): Promise<string | null> {
  const { data, error } = await supabase.from('jobs').delete().eq('id', id).select('id')
  if (error) return error.message
  if (!data || data.length === 0) return 'Could not delete this job. Close it instead.'
  return null
}
