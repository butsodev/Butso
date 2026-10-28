// Photo uploads straight from the phone to Cloudinary.
// Data is expensive, so every photo is shrunk on the phone first (about 150 to 300 KB).
// Needs NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: the name of an UNSIGNED upload preset.
import { CLOUD_NAME } from '@/lib/cloudinary'

const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
const MAX_PICK_BYTES = 15 * 1024 * 1024

/** Only images hosted on our own Cloudinary account are accepted (the database checks this too). */
export const OUR_IMAGE_PREFIX = `https://res.cloudinary.com/${CLOUD_NAME}/`

/** Add Cloudinary transformations (size, format) to a stored image URL. */
export function imgUrl(url: string, transforms = 'f_auto,q_auto,w_700'): string {
  if (!url.startsWith(OUR_IMAGE_PREFIX)) return url
  return url.replace('/image/upload/', `/image/upload/${transforms}/`)
}

async function shrink(file: File, maxSide = 1280, quality = 0.8): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  const w = Math.round(bitmap.width * scale)
  const h = Math.round(bitmap.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('no canvas')
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close?.()
  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('compress failed'))), 'image/jpeg', quality),
  )
}

export async function uploadImage(file: File, folder = 'butso/user-uploads'): Promise<{ url: string | null; error: string | null }> {
  if (!PRESET) return { url: null, error: 'Photo uploads are not switched on yet.' }
  if (!file.type.startsWith('image/')) return { url: null, error: 'Please choose a photo.' }
  if (file.size > MAX_PICK_BYTES) return { url: null, error: 'That photo is too big. Choose one under 15 MB.' }

  let body: Blob = file
  try {
    body = await shrink(file)
  } catch {
    // Could not shrink (unusual format): send the original only if it is small
    if (file.size > 3 * 1024 * 1024) return { url: null, error: 'Could not prepare that photo. Try a different one.' }
  }

  // Cloudinary accounts on "dynamic folders" sort uploads with asset_folder (the old "folder" is deprecated there)
  const send = async (withFolder: boolean) => {
    const form = new FormData()
    form.append('file', body)
    form.append('upload_preset', PRESET)
    if (withFolder) form.append('asset_folder', folder)
    // No public_id sent: the preset gives every photo its own unguessable ID, so nobody can overwrite anyone
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: form })
    const json = await res.json().catch(() => null)
    return { res, json }
  }

  try {
    let { res, json } = await send(true)
    // If this account rejects the folder setting, retry once without it: the photo still uploads, just unsorted
    if (!res.ok && /folder/i.test(json?.error?.message ?? '')) ({ res, json } = await send(false))
    if (!res.ok || !json?.secure_url) return { url: null, error: json?.error?.message ?? 'Upload failed. Check your connection and try again.' }
    return { url: json.secure_url as string, error: null }
  } catch {
    return { url: null, error: 'Upload failed. Check your connection and try again.' }
  }
}
