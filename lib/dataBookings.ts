import { supabase } from '@/lib/supabase'
import { useAppStore, type Booking } from '@/lib/store'

type BookingRow = {
  id: string
  type: string | null
  job_id: string | null
  shop_id: string | null
  service_id: string | null
  job_title: string | null
  shop_name: string | null
  service_name: string | null
  worker_id: string
  worker_name: string | null
  employer_id: string
  employer_name: string | null
  status: Booking['status'] | null
  booking_date: string | null
  slots: string[] | null
  total_price: number | string | null
  negotiated: boolean | null
  created_at: string | null
}

export function mapBooking(r: BookingRow): Booking {
  return {
    id: r.id,
    type: r.type === 'job' ? 'job' : 'shop',
    jobId: r.job_id ?? undefined,
    jobTitle: r.job_title ?? undefined,
    shopId: r.shop_id ?? undefined,
    shopName: r.shop_name ?? undefined,
    serviceId: r.service_id ?? undefined,
    serviceName: r.service_name ?? undefined,
    workerId: r.worker_id,
    workerName: r.worker_name ?? undefined,
    employerId: r.employer_id,
    employerName: r.employer_name ?? undefined,
    status: r.status ?? 'pending',
    date: r.booking_date ?? '',
    slots: r.slots ?? [],
    totalPrice: Number(r.total_price ?? 0),
    negotiated: r.negotiated ?? false,
    createdAt: r.created_at ?? new Date().toISOString(),
  }
}

/** Bookings where the signed-in user is either the customer or the person booked. */
export async function fetchBookings(userId: string): Promise<{ bookings: Booking[]; error: string | null }> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .or(`worker_id.eq.${userId},employer_id.eq.${userId}`)
    .order('created_at', { ascending: false })
    .limit(200)
  if (error) return { bookings: [], error: error.message }
  return { bookings: (data as BookingRow[]).map(mapBooking), error: null }
}

export async function refreshBookings(userId: string) {
  const { bookings, error } = await fetchBookings(userId)
  if (!error) useAppStore.getState().setBookings(bookings)
  return error
}

export type CreateBookingInput = {
  type: 'job' | 'shop'
  shopId?: string
  serviceId?: string
  jobId?: string
  jobTitle?: string
  shopName?: string
  serviceName?: string
  workerId: string
  workerName?: string
  employerId: string
  employerName?: string
  date: string            // yyyy-mm-dd
  slots: string[]
  totalPrice: number
  negotiated?: boolean
}

const isUuid = (v?: string) => !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)

export async function createBooking(input: CreateBookingInput): Promise<{ booking: Booking | null; error: string | null }> {
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      type: input.type,
      shop_id: isUuid(input.shopId) ? input.shopId : null,
      service_id: isUuid(input.serviceId) ? input.serviceId : null,
      job_id: isUuid(input.jobId) ? input.jobId : null,
      job_title: input.jobTitle ?? null,
      shop_name: input.shopName ?? null,
      service_name: input.serviceName ?? null,
      worker_id: input.workerId,
      worker_name: input.workerName ?? null,
      employer_id: input.employerId,
      employer_name: input.employerName ?? null,
      status: 'pending',
      booking_date: input.date,
      slots: input.slots,
      total_price: input.totalPrice,
      negotiated: input.negotiated ?? false,
    })
    .select('*')
    .single()
  if (error || !data) return { booking: null, error: error?.message ?? 'Could not save the booking' }
  return { booking: mapBooking(data as BookingRow), error: null }
}

export async function updateBookingStatus(id: string, status: Booking['status']): Promise<string | null> {
  const { error } = await supabase.from('bookings').update({ status }).eq('id', id)
  if (error) return error.message
  const st = useAppStore.getState()
  st.setBookings(st.bookings.map(b => (b.id === id ? { ...b, status } : b)))
  return null
}
