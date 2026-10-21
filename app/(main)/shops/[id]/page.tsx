import { ShopPage } from '@/components/ShopPage'
import { WithShop } from '@/components/RouteSync'

export const metadata = { title: 'Shop · Butsó' }

export default function ShopsIdRoute() {
  return (
    <WithShop>
      <ShopPage />
    </WithShop>
  )
}
