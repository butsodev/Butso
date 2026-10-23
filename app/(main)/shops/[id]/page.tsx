import type { Metadata } from 'next'
import { ShopPage } from '@/components/ShopPage'
import { WithShop } from '@/components/RouteSync'
import { shopMetadata } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  return shopMetadata(id)
}

export default function ShopsIdRoute() {
  return (
    <WithShop>
      <ShopPage />
    </WithShop>
  )
}