// Real share links. Uses the phone's share sheet (WhatsApp, SMS, etc.) when available,
// and copies the link when it is not.

export type ShareResult = 'shared' | 'copied' | 'failed'

export function siteOrigin(): string {
    if (typeof window !== 'undefined') return window.location.origin
    return process.env.NEXT_PUBLIC_SITE_URL ?? ''
}

export async function shareLink(input: { path: string; title: string; text: string }): Promise<ShareResult> {
    const url = `${siteOrigin()}${input.path}`
    try {
        if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
            await navigator.share({ title: input.title, text: input.text, url })
            return 'shared'
        }
    } catch (e: any) {
        // The person closed the share sheet: not an error, and no copy needed
        if (e?.name === 'AbortError') return 'failed'
    }
    try {
        await navigator.clipboard.writeText(`${input.text} ${url}`)
        return 'copied'
    } catch {
        return 'failed'
    }
}