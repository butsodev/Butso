// Line icon for the Naira sign. Same props as a lucide icon so it can replace DollarSign directly.
export function NairaIcon({
  size = 20,
  strokeWidth = 2,
  className = '',
}: {
  size?: number
  strokeWidth?: number
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M7 19V5l10 14V5" />
      <path d="M4 10h16" />
      <path d="M4 14h16" />
    </svg>
  )
}
