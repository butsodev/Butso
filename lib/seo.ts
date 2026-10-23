import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'

// Server-side reads for link previews (WhatsApp, Telegram, X, etc.).
// Only public information is used here: never a real name or a phone number.
const db = () =>
    createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        auth: { persistSession: false },
    })

export function siteUrl(): string {
    const explicit = process.env.NEXT_PUBLIC_SITE_URL
    if (explicit) return explicit.replace(/\/$/, '')
    const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL
    return vercel ? `https://${vercel}` : 'http://localhost:3000'
}

function cut(s: string | null | undefined, n: number): string {
    const t = (s ?? '').replace(/\s+/g, ' ').trim()
    return t.length > n ? `${t.slice(0, n - 1).trimEnd()}...` : t
}

function card(title: string, description: string, path: string): Metadata {
    const url = `${siteUrl()}${path}`
    return {
        title,
        description,
        alternates: { canonical: url },
        openGraph: { title, description, url, siteName: 'Butsó', type: 'website' },
        twitter: { card: 'summary_large_image', title, description },
    }
}

const FALLBACK = (path: string) =>
    card('Butsó: Your Local Work Network', 'Find skilled workers and jobs near you. Free to join.', path)

export async function workerMetadata(username: string): Promise<Metadata> {
    const path = `/@${username}`
    try {
        const { data } = await db()
            .from('public_profiles')
            .select('username, bio, skills, location')
            .ilike('username', username)
            .eq('role', 'worker')
            .limit(1)
            .maybeSingle()
        if (!data) return FALLBACK(path)
        const skills = Array.isArray(data.skills) ? data.skills.slice(0, 3).join(', ') : ''
        const bits = [skills, data.location].filter(Boolean).join(' · ')
        const desc = cut([bits, data.bio].filter(Boolean).join('. '), 150) || 'Skilled worker on Butsó. Free to join.'
        return card(`@${data.username} on Butsó`, desc, path)
    } catch {
        return FALLBACK(path)
    }
}

export async function jobMetadata(id: string): Promise<Metadata> {
    const path = `/jobs/${id}`
    try {
        const { data } = await db().from('jobs').select('title, category, budget, location, description').eq('id', id).maybeSingle()
        if (!data) return FALLBACK(path)
        const budget = Number(data.budget)
        const money = Number.isFinite(budget) && budget > 0 ? `₦${budget.toLocaleString('en-NG')}` : ''
        const head = [data.category, money, data.location].filter(Boolean).join(' · ')
        return card(`${cut(data.title, 70)} | Job on Butsó`, cut([head, data.description].filter(Boolean).join('. '), 150), path)
    } catch {
        return FALLBACK(path)
    }
}

export async function shopMetadata(id: string): Promise<Metadata> {
    const path = `/shops/${id}`
    try {
        const { data } = await db().from('shops').select('name, tagline, category, location, description').eq('id', id).maybeSingle()
        if (!data) return FALLBACK(path)
        const head = [data.category, data.location].filter(Boolean).join(' · ')
        const body = data.tagline || data.description
        return card(`${cut(data.name, 70)} on Butsó`, cut([head, body].filter(Boolean).join('. '), 150), path)
    } catch {
        return FALLBACK(path)
    }
}