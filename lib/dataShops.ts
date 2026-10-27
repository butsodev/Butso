import { supabase } from '@/lib/supabase'
import {
  useAppStore, DEFAULT_HOURS, isShopOpenNow,
  type Shop, type ShopService, type ShopReview, type PortfolioItem, type OpeningHours, type ShopDefaultTab,
} from '@/lib/store'

type ServiceRow = {
  id: string; name: string | null; description: string | null; price: number | string | null
  pricing_type: string | null; duration_minutes: number | null; position: number | null
}
type PortfolioRow = {
  id: string; image_url: string | null; caption: string | null; service_id: string | null
  pinned: boolean | null; created_at: string | null
}
type ReviewRow = {
  id: string; user_id: string | null; user_name: string | null; rating: number | null
  comment: string | null; created_at: string | null
}
type ShopRow = {
  id: string; owner_id: string; owner_name: string | null; owner_username: string | null
  name: string | null; tagline: string | null; category: string | null; description: string | null
  location: string | null; is_mobile: boolean | null; phone: string | null; photo_url?: string | null; default_tab: string | null
  accept_messages_from_anyone?: boolean | null; show_phone_publicly?: boolean | null
  opening_hours: OpeningHours | null; is_open: boolean | null; verified: boolean | null
  rating: number | string | null; review_count: number | null; created_at: string | null
  shop_private?: { phone: string | null }[] | { phone: string | null } | null
  shop_services?: ServiceRow[] | null
  portfolio_items?: PortfolioRow[] | null
  shop_reviews?: ReviewRow[] | null
}

const SHOP_SELECT = '*, shop_private(phone), shop_services(*), portfolio_items(*), shop_reviews(*)'

export function mapShop(r: ShopRow): Shop {
  const hours = r.opening_hours ?? DEFAULT_HOURS
  const services: ShopService[] = [...(r.shop_services ?? [])]
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map(s => ({
      id: s.id,
      name: s.name ?? '',
      description: s.description ?? undefined,
      price: Number(s.price ?? 0),
      pricingType: s.pricing_type === 'negotiable' ? 'negotiable' : 'fixed',
      durationMinutes: s.duration_minutes ?? undefined,
    }))
  const portfolio: PortfolioItem[] = (r.portfolio_items ?? []).map(p => ({
    id: p.id,
    imageUrl: p.image_url ?? '',
    caption: p.caption ?? '',
    serviceId: p.service_id ?? undefined,
    pinned: p.pinned ?? false,
    createdAt: p.created_at ?? new Date().toISOString(),
  }))
  const reviews: ShopReview[] = (r.shop_reviews ?? [])
    .map(v => ({
      id: v.id,
      userId: v.user_id ?? '',
      userName: v.user_name ?? 'Customer',
      rating: v.rating ?? 0,
      comment: v.comment ?? '',
      createdAt: v.created_at ?? new Date().toISOString(),
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const tab = r.default_tab as ShopDefaultTab
  return {
    id: r.id,
    ownerId: r.owner_id,
    ownerName: r.owner_name ?? '',
    ownerUsername: r.owner_username ?? '',
    name: r.name ?? '',
    tagline: r.tagline ?? undefined,
    category: r.category ?? '',
    description: r.description ?? '',
    location: r.location ?? '',
    isMobile: r.is_mobile ?? false,
    photoUrl: r.photo_url ?? undefined,
    phone: (Array.isArray(r.shop_private) ? r.shop_private[0]?.phone : r.shop_private?.phone) ?? undefined,
    acceptMessagesFromAnyone: r.accept_messages_from_anyone ?? true,
    showPhonePublicly: r.show_phone_publicly ?? false,
    services,
    portfolio,
    defaultTab: tab === 'portfolio' || tab === 'reviews' ? tab : 'services',
    openingHours: hours,
    rating: Number(r.rating ?? 0),
    reviewCount: r.review_count ?? reviews.length,
    reviews,
    isOpen: isShopOpenNow(hours), // computed live from the hours, not the stored flag
    verified: r.verified ?? false,
    createdAt: r.created_at ?? new Date().toISOString(),
  }
}

/** Shops are public, so this works for guests too. */
export async function fetchShops(): Promise<{ shops: Shop[]; error: string | null }> {
  const { data, error } = await supabase
    .from('shops')
    .select(SHOP_SELECT)
    .order('created_at', { ascending: false })
    .limit(200)
  if (error) return { shops: [], error: error.message }
  return { shops: (data as ShopRow[]).map(mapShop), error: null }
}

export async function refreshShops() {
  const { shops, error } = await fetchShops()
  if (!error) useAppStore.getState().setShops(shops)
  return error
}

export type SaveShopInput = {
  ownerId: string
  ownerName: string
  ownerUsername: string
  name: string
  tagline?: string
  category: string
  description: string
  location: string
  isMobile: boolean
  photoUrl?: string
  phone?: string
  acceptMessagesFromAnyone: boolean
  showPhonePublicly: boolean
  defaultTab?: ShopDefaultTab
  openingHours: OpeningHours
  services: ShopService[]
}

const isUuid = (v?: string) => !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)

/** Create a shop (no existingId) or update one, including its services. */
export async function saveShop(input: SaveShopInput, existingId?: string): Promise<{ shop: Shop | null; error: string | null }> {
  const fields = {
    owner_name: input.ownerName,
    owner_username: input.ownerUsername,
    name: input.name,
    tagline: input.tagline || null,
    category: input.category,
    description: input.description,
    location: input.location,
    is_mobile: input.isMobile,
    photo_url: input.photoUrl || null,
    // '' means "remove my number" (the database trigger clears the private copy); null would mean "leave it alone"
    phone: (input.phone ?? '').trim(),
    accept_messages_from_anyone: input.acceptMessagesFromAnyone,
    show_phone_publicly: input.showPhonePublicly,
    default_tab: input.defaultTab ?? 'services',
    opening_hours: input.openingHours,
    is_open: isShopOpenNow(input.openingHours),
  }

  // Guard against a second shop if the store had not finished loading yet
  if (!existingId) {
    const { data: found } = await supabase.from('shops').select('id').eq('owner_id', input.ownerId).limit(1).maybeSingle()
    if (found?.id) existingId = found.id as string
  }

  let shopId = existingId
  if (existingId) {
    const { error } = await supabase.from('shops').update(fields).eq('id', existingId)
    if (error) return { shop: null, error: error.message }
  } else {
    const { data, error } = await supabase
      .from('shops')
      .insert({ ...fields, owner_id: input.ownerId })
      .select('id')
      .single()
    if (error || !data) return { shop: null, error: error?.message ?? 'Could not create the shop' }
    shopId = data.id as string
  }

  // Services: update the ones that already exist (keeps their ids, so old bookings
  // still point at them), insert new ones, delete the ones the owner removed.
  const keepIds = input.services.filter(s => isUuid(s.id)).map(s => s.id)
  if (existingId) {
    const { data: current } = await supabase.from('shop_services').select('id').eq('shop_id', shopId!)
    const toDelete = (current ?? []).map(r => r.id as string).filter(id => !keepIds.includes(id))
    if (toDelete.length) {
      const { error } = await supabase.from('shop_services').delete().in('id', toDelete)
      if (error) return { shop: null, error: error.message }
    }
  }
  const toRow = (s: ShopService, i: number) => ({
    shop_id: shopId!,
    name: s.name,
    description: s.description ?? null,
    price: s.price,
    pricing_type: s.pricingType,
    duration_minutes: s.durationMinutes ?? null,
    position: i,
  })
  // Two separate calls: rows with an id (update) and rows without (insert).
  const existingRows = input.services.flatMap((s, i) => (isUuid(s.id) ? [{ id: s.id, ...toRow(s, i) }] : []))
  const newRows = input.services.flatMap((s, i) => (isUuid(s.id) ? [] : [toRow(s, i)]))
  if (existingRows.length) {
    const { error } = await supabase.from('shop_services').upsert(existingRows, { onConflict: 'id' })
    if (error) return { shop: null, error: error.message }
  }
  if (newRows.length) {
    const { error } = await supabase.from('shop_services').insert(newRows)
    if (error) return { shop: null, error: error.message }
  }

  const { data, error } = await supabase.from('shops').select(SHOP_SELECT).eq('id', shopId!).single()
  if (error || !data) return { shop: null, error: error?.message ?? 'Saved, but could not reload the shop' }
  return { shop: mapShop(data as ShopRow), error: null }
}

/** A customer reviews a shop. The database only allows this after a completed booking. */
export async function addShopReview(
  shopId: string,
  user: { id: string; name: string },
  rating: number,
  comment: string,
): Promise<string | null> {
  const { error } = await supabase.from('shop_reviews').insert({
    shop_id: shopId,
    user_id: user.id,
    user_name: user.name,
    rating,
    comment: comment.trim(),
  })
  if (error) {
    if (error.code === '23505') return 'You have already reviewed this shop.'
    return error.message
  }
  // A database trigger updated the shop's rating, so reload the shop
  const { data } = await supabase.from('shops').select(SHOP_SELECT).eq('id', shopId).single()
  if (data) {
    const fresh = mapShop(data as ShopRow)
    useAppStore.getState().updateShop(shopId, fresh)
  }
  return null
}


/** Add one work photo to a shop's gallery (owner only; the database enforces this). */
export async function addPortfolioPhoto(shopId: string, imageUrl: string, caption: string): Promise<{ item: PortfolioItem | null; error: string | null }> {
  const { data, error } = await supabase
    .from('portfolio_items')
    .insert({ shop_id: shopId, image_url: imageUrl, caption: caption.trim() || null })
    .select('*')
    .single()
  if (error || !data) return { item: null, error: error?.message ?? 'Could not save the photo' }
  const r = data as PortfolioRow
  const item: PortfolioItem = {
    id: r.id, imageUrl: r.image_url ?? '', caption: r.caption ?? '', serviceId: r.service_id ?? undefined,
    pinned: r.pinned ?? false, createdAt: r.created_at ?? new Date().toISOString(),
  }
  useAppStore.getState().addPortfolioItem(shopId, item)
  return { item, error: null }
}

/** Remove one work photo from the gallery. */
export async function removePortfolioPhoto(shopId: string, itemId: string): Promise<string | null> {
  const { error } = await supabase.from('portfolio_items').delete().eq('id', itemId)
  if (error) return error.message
  useAppStore.getState().removePortfolioItem(shopId, itemId)
  return null
}
