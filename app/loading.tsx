import { SkeletonAppFrame } from '@/components/Skeleton'

// Shown while a route's code loads. The app's frame with placeholders, not a lone spinner,
// so the layout is already in place when the screen arrives.
export default function Loading() {
  return <SkeletonAppFrame />
}
