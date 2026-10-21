import { RatingsReviews } from '@/components/RatingsReviews'
import { WithReviewPerson } from '@/components/RouteSync'

export const metadata = { title: 'Reviews · Butsó' }

export default function ReviewsIdRoute() {
  return (
    <WithReviewPerson>
      <RatingsReviews />
    </WithReviewPerson>
  )
}
