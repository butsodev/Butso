import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// Missing keys must not crash the build: static pages are prerendered without
// touching the database. Say so loudly instead; every query fails until fixed.
if (!supabaseConfigured) {
  console.error(
    '[butso] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env.local and fill them in.',
  )
}

export const supabase = createClient(
  supabaseUrl || 'http://supabase-not-configured.invalid',
  supabaseAnonKey || 'missing-anon-key',
)
