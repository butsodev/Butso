// Initials avatar, used wherever there is no profile photo.
export function Avatar({ name, size = 44, className = '' }: { name?: string; size?: number; className?: string }) {
  const initials = (name ?? '')
    .split(' ')
    .filter(Boolean)
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?'
  return (
    <div
      className={`rounded-full bg-primary/10 text-primary font-black flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size, fontSize: Math.max(11, Math.round(size * 0.36)) }}
      aria-hidden
    >
      {initials}
    </div>
  )
}
