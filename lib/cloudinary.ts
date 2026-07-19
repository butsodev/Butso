// Cloudinary config + helpers for Butso.
// Cloud name: dupugzphf
// "Unique filename" is OFF on the upload preset — public IDs match
// filenames exactly, so URLs never need to be hand-copied again.

export const CLOUD_NAME = 'dupugzphf'

/**
 * Build a Cloudinary delivery URL for a given public ID.
 * f_auto,q_auto = auto format (WebP/AVIF where supported) + auto compression.
 * Pass extra transformations (e.g. 'w_800') to override/extend the default.
 */
export function cld(publicId: string, transforms: string = 'f_auto,q_auto') {
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms}/${publicId}`
}

// Every content image currently used across the landing page + slideshow.
// Filenames are the Cloudinary public IDs (no extension needed).
export const IMAGES = {
    barberman: cld('barberman'),
    braidergirl: cld('braidergirl'),
    bricklayer: cld('bricklayer'),
    busyafricanstreet: cld('busyafricanstreet'),
    busystalls: cld('busystalls'),
    carpenterman: cld('carpenterman'),
    cheflady: cld('cheflady'),
    cleanerwoman: cld('cleanerwoman'),
    constructionworkerpointing: cld('constructionworkerpointing'),
    electricianman: cld('electricianman'),
    familyinparlor: cld('familyinparlor'),
    farmerwoman: cld('farmerwoman'),
    happyman: cld('happyman'),
    laundryladies: cld('laundryladies'),
    mancalling: cld('mancalling'),
    mechanicman: cld('mechanicman'),
    painterman: cld('painterman'),
    plumberman: cld('plumberman'),
    securityman: cld('securityman'),
    tailorgirl: cld('tailorgirl'),
    workershandshake: cld('workershandshake'),
} as const

export type ImageKey = keyof typeof IMAGES