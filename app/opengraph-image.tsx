import { ImageResponse } from 'next/og'

// Default preview picture for every shared link (WhatsApp, Telegram, X).
export const alt = 'Butsó: Your Local Work Network'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
                    justifyContent: 'center', padding: 80, background: '#0f5132', color: '#ffffff',
                }}
            >
                <div style={{ fontSize: 140, fontWeight: 800, letterSpacing: -4 }}>Butsó</div>
                <div style={{ fontSize: 52, marginTop: 16 }}>Your local work network</div>
                <div style={{ fontSize: 36, marginTop: 36, opacity: 0.85 }}>Find skilled workers and jobs near you. Free to join.</div>
            </div>
        ),
        size,
    )
}