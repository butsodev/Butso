import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import { siteUrl } from '@/lib/seo'

// Rebuilt at most once an hour. Only public pages: open jobs, shops and worker
// profiles (by username, which is already public). Never names or phone numbers.
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl()
  const pages: MetadataRoute.Sitemap = ['', '/explore', '/jobs', '/shops', '/people', '/support', '/terms', '/privacy'].map(p => ({
    url: `${base}${p}`,
    changeFrequency: 'daily',
  }))

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return pages

  try {
    const db = createClient(url, key, { auth: { persistSession: false } })
    const [jobs, shops, workers] = await Promise.all([
      db.from('jobs').select('id, created_at').eq('status', 'open').order('created_at', { ascending: false }).limit(1000),
      db.from('shops').select('id, created_at').order('created_at', { ascending: false }).limit(1000),
      db.from('public_profiles').select('username').eq('role', 'worker').not('username', 'is', null).limit(2000),
    ])
    for (const j of jobs.data ?? []) pages.push({ url: `${base}/jobs/${j.id}`, lastModified: j.created_at ?? undefined })
    for (const s of shops.data ?? []) pages.push({ url: `${base}/shops/${s.id}`, lastModified: s.created_at ?? undefined })
    for (const w of workers.data ?? []) pages.push({ url: `${base}/@${w.username}` })
  } catch {
    // A sitemap with just the static pages is better than a failed one.
  }
  return pages
}
