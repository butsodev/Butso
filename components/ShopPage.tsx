'use client'

/**
 * ShopPage — Public shop profile
 * Browsable without an account. Account needed to book.
 * Shows: hero, portfolio/about, services, reviews, owner info
 */

import { motion, AnimatePresence } from 'framer-motion'
import { shareLink } from '@/lib/share'
import { ArrowLeft, MapPin, Phone, Award, Clock, Check, ChevronRight, Share2, MessageCircle, Trash2, Camera } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { addShopReview, addPortfolioPhoto, removePortfolioPhoto } from '@/lib/dataShops'
import { confirmAction } from '@/lib/confirm'
import { PhotoPicker } from '@/components/PhotoPicker'
import { PhotoViewer, type ViewerPhoto } from '@/components/PhotoViewer'
import { FoundingBadge } from '@/components/FoundingBadge'
import { imgUrl } from '@/lib/upload'
import { showToast } from '@/lib/toast'
import { useAppStore, type Shop, type ShopService, rememberReturnTo } from '@/lib/store'

import { EmojiIcon } from '@/components/EmojiIcon'
import { RatingMeter } from '@/components/Rating'
const DAY_LABELS: Record<string, string> = {
    mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun',
}

function ServiceCard({ svc, onBook, canBook }: { svc: ShopService; onBook: (svc: ShopService) => void; canBook: boolean }) {
    return (
        <motion.div whileHover={{ y: -2 }}
            className="flex items-center gap-4 p-4 bg-card border border-border rounded-2xl hover:border-primary/30 transition">
            <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground text-sm">{svc.name}</p>
                {svc.description && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{svc.description}</p>}
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-base font-black text-primary">₦{svc.price.toLocaleString()}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${svc.pricingType === 'fixed' ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'}`}>
                        {svc.pricingType === 'fixed' ? 'Fixed price' : 'Negotiable'}
                    </span>
                    {svc.durationMinutes ? (
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock size={10} />{svc.durationMinutes}min</span>
                    ) : null}
                </div>
            </div>
            {canBook && (
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => onBook(svc)}
                    className="shrink-0 px-4 min-h-[44px] bg-primary text-primary-foreground rounded-xl font-bold text-xs hover:bg-primary/90 transition">
                    Book
                </motion.button>
            )}
        </motion.div>
    )
}

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
    return <RatingMeter value={rating} size={size >= 16 ? 'md' : 'sm'} />
}

export function ShopPage() {
    const { selectedShopId, shops, setCurrentPage, currentUser, goBack, openChatWith, bookings, setPendingBooking } = useAppStore()
    const [reviewRating, setReviewRating] = useState(0)
    const [reviewComment, setReviewComment] = useState('')
    const [reviewSaving, setReviewSaving] = useState(false)
    const shop = shops.find(s => s.id === selectedShopId)
    const isOwner = !!shop && !!currentUser && shop.ownerId === currentUser.id
    const hasReviewed = !!shop && !!currentUser && shop.reviews.some(r => r.userId === currentUser.id)
    const canReview = !!shop && !!currentUser && shop.ownerId !== currentUser.id && !hasReviewed &&
        bookings.some(b => b.shopId === shop.id && b.employerId === currentUser.id && b.status === 'completed')

    const submitReview = async () => {
        if (!shop || !currentUser || reviewRating === 0 || reviewSaving) return
        setReviewSaving(true)
        const error = await addShopReview(shop.id, { id: currentUser.id, name: currentUser.name }, reviewRating, reviewComment)
        setReviewSaving(false)
        if (error) { showToast('error', error); return }
        setReviewRating(0)
        setReviewComment('')
        showToast('success', 'Thanks for your review.')
    }
    const [activeTab, setActiveTab] = useState<'services' | 'work' | 'reviews' | 'hours'>('services')
    const [workCaption, setWorkCaption] = useState('')
    const [showShareToast, setShowShareToast] = useState(false)
    const [viewerIndex, setViewerIndex] = useState<number | null>(null)
    const [bannerOpen, setBannerOpen] = useState(false)
    const [emptyNote, setEmptyNote] = useState(false)
    const openedFromLink = useRef(false)
    // Newest work first
    const photos = useMemo<ViewerPhoto[]>(
        () => shop ? [...shop.portfolio].sort((a, b) => b.createdAt.localeCompare(a.createdAt)) : [],
        [shop],
    )
    // A shared photo link (/shops/ID?photo=PHOTO_ID) opens straight onto that photo
    useEffect(() => {
        if (openedFromLink.current || photos.length === 0) return
        const id = new URLSearchParams(window.location.search).get('photo')
        if (!id) { openedFromLink.current = true; return }
        const idx = photos.findIndex(p => p.id === id)
        if (idx >= 0) { setViewerIndex(idx); setActiveTab('work') }
        openedFromLink.current = true
    }, [photos])

    if (!shop) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
                <p className="text-4xl mb-3"><EmojiIcon e="🏪" size={34} /></p>
                <p className="font-bold text-foreground mb-1">Shop not found</p>
                <button onClick={() => setCurrentPage('shops')} className="text-primary text-sm font-semibold hover:underline">Browse shops</button>
            </div>
        </div>
    )

    const handleBook = (svc: ShopService) => {
        if (!currentUser) {
            sessionStorage.setItem('bookingShopId', shop.id)
            sessionStorage.setItem('bookingServiceId', svc.id)
            rememberReturnTo()
            setCurrentPage('auth')
            return
        }
        if (shop.ownerId === currentUser.id) { showToast('error', 'You cannot book your own shop.'); return }
        if (!svc.id) { showToast('error', 'This shop has not added any services yet.'); return }
        // The booking screen reads everything it needs from here
        setPendingBooking({
            shopId: shop.id,
            shopName: shop.name,
            serviceId: svc.id,
            serviceName: svc.name,
            servicePrice: svc.price,
            durationMinutes: svc.durationMinutes || undefined,
        })
        setCurrentPage('booking-slots')
    }

    const handleShare = async () => {
        const r = await shareLink({ path: `/shops/${shop.id}`, title: `${shop.name} on Butsó`, text: `Check out ${shop.name} on Butsó.` })
        if (r === 'copied') {
            setShowShareToast(true)
            setTimeout(() => setShowShareToast(false), 2000)
        }
    }

    const sharePhoto = async (p: ViewerPhoto) => {
        const r = await shareLink({
            path: `/shops/${shop.id}?photo=${p.id}`,
            title: `${shop.name} on Butsó`,
            text: p.caption ? `${p.caption}: work by ${shop.name} on Butsó.` : `See this work by ${shop.name} on Butsó.`,
        })
        if (r === 'copied') showToast('success', 'Photo link copied')
    }

    const openDays = Object.entries(shop.openingHours).filter(([, h]) => h.open)

    return (
        <div className="min-h-screen bg-background pb-24">

            {/* Toast */}
            <AnimatePresence>
                {showShareToast && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background px-4 py-2 rounded-xl text-sm font-semibold shadow-lg">
                        Link copied!
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-sm border-b border-border">
                <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
                    <button aria-label="Go back" onClick={() => goBack('shops')} className="p-2 hover:bg-secondary rounded-xl transition">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2">
                        <button aria-label="Share shop" onClick={handleShare} className="p-2 hover:bg-secondary rounded-xl transition">
                            <Share2 size={18} className="text-muted-foreground" />
                        </button>
                        <button aria-label="Message shop" onClick={() => openChatWith({ userId: shop.ownerId, name: shop.ownerName || shop.name, context: shop.name })} className="p-2 hover:bg-secondary rounded-xl transition">
                            <MessageCircle size={18} className="text-muted-foreground" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4">

                {/* ── Hero ── */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="pb-6">
                    {/* Main shop photo: one wide picture, square corners, edge to edge */}
                    <div className="relative -mx-4 aspect-[3/1] bg-gradient-to-r from-primary/25 via-primary/10 to-primary/5 flex items-center justify-center text-5xl mb-4">
                        {shop.photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <button aria-label="View shop photo full screen" onClick={() => setBannerOpen(true)} className="absolute inset-0 w-full h-full">
                                <img src={imgUrl(shop.photoUrl, 'f_auto,q_auto,w_1200,h_400,c_fill,g_auto')} alt={shop.name} className="w-full h-full object-cover" />
                            </button>
                        ) : (
                            <span aria-hidden="true">
                                {shop.category === 'Barbing' ? '' : shop.category === 'Cleaning' ? '' : shop.category === 'Tailoring' ? '' : shop.category === 'Cooking' ? '' : shop.category === 'Auto Repair' ? '' : ''}
                            </span>
                        )}
                    </div>

                    <div className="flex items-start gap-4 mb-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                                <h1 className="font-black text-foreground text-xl leading-tight">{shop.name}</h1>
                                {shop.verified && (
                                    <span className="shrink-0 flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                                        <Check size={10} /> Verified
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                <p className="text-sm text-muted-foreground">by @{shop.ownerUsername}</p>
                                <FoundingBadge userId={shop.ownerId} />
                            </div>
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                                <div className="flex items-center gap-1.5">
                                    <StarRating rating={shop.rating} />
                                    <span className="text-sm font-bold text-foreground">{shop.rating > 0 ? shop.rating.toFixed(1) : 'New'}</span>
                                    {shop.reviewCount > 0 && <span className="text-xs text-muted-foreground">({shop.reviewCount})</span>}
                                </div>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${shop.isOpen ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-500'}`}>
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-current mr-1 align-middle" />{shop.isOpen ? 'Open now' : 'Closed'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Location + phone */}
                    <div className="flex flex-wrap gap-3">
                        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <MapPin size={13} className="text-primary" />
                            {shop.isMobile ? 'Mobile service that comes to you' : shop.location}
                        </span>
                        {shop.phone && (shop.showPhonePublicly || shop.ownerId === currentUser?.id) && (
                            <a href={`tel:${shop.phone}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition">
                                <Phone size={13} className="text-primary" /> {shop.phone}
                            </a>
                        )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mt-4 leading-relaxed">{shop.description}</p>
                </motion.div>

                {/* ── Recent work: three boxes ── */}
                <div className="mb-5">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-sm font-black text-foreground">Recent work</h2>
                        {photos.length > 0 && (
                            <button onClick={() => { setActiveTab('work'); document.getElementById('shop-tabs')?.scrollIntoView({ behavior: 'smooth' }) }}
                                className="text-xs font-bold text-primary min-h-[32px]">See all ({photos.length})</button>
                        )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {[0, 1, 2].map(slot => {
                            const p = photos[slot]
                            const box = 'relative aspect-square overflow-hidden bg-gradient-to-br from-primary/15 to-primary/5 border border-border flex items-center justify-center'
                            if (p) {
                                return (
                                    <button key={p.id} aria-label={`Open gallery, photo ${slot + 1} of ${photos.length}`}
                                        onClick={() => { setEmptyNote(false); setViewerIndex(slot) }} className={box}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={imgUrl(p.imageUrl, 'f_auto,q_auto,w_360,h_360,c_fill')} alt={p.caption || `Work by ${shop.name}`} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                                        {slot === 2 && photos.length > 3 && (
                                            <span className="absolute inset-0 bg-black/55 text-white text-base font-black flex items-center justify-center">+{photos.length - 3}</span>
                                        )}
                                    </button>
                                )
                            }
                            return (
                                <button key={`empty-${slot}`} aria-label="Empty gallery slot"
                                    onClick={() => {
                                        if (photos.length === 0) setEmptyNote(n => !n)
                                        else if (isOwner) { setActiveTab('work'); document.getElementById('shop-tabs')?.scrollIntoView({ behavior: 'smooth' }) }
                                    }}
                                    className={box}>
                                    <Camera size={22} className="text-muted-foreground/50" aria-hidden="true" />
                                </button>
                            )
                        })}
                    </div>
                    {emptyNote && photos.length === 0 && (
                        <p className="mt-2 text-sm text-muted-foreground text-center" role="status">
                            {isOwner ? 'Your gallery is empty. ' : 'This shop has not added any work photos yet.'}
                            {isOwner && (
                                <button onClick={() => { setActiveTab('work'); document.getElementById('shop-tabs')?.scrollIntoView({ behavior: 'smooth' }) }}
                                    className="font-bold text-primary underline">Add photos</button>
                            )}
                        </p>
                    )}
                </div>

                {/* ── Tabs ── */}
                <div id="shop-tabs" className="flex border-b border-border mb-5 scroll-mt-16">
                    {(['services', 'work', 'reviews', 'hours'] as const).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2.5 text-sm font-bold capitalize transition border-b-2 -mb-px ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                            {tab === 'reviews' ? `Reviews (${shop.reviewCount})` : tab === 'hours' ? 'Hours' : tab === 'work' ? `Work (${shop.portfolio.length})` : 'Services'}
                        </button>
                    ))}
                </div>

                {/* ── Tab content ── */}
                <AnimatePresence mode="wait">

                    {/* Services */}
                    {activeTab === 'services' && (
                        <motion.div key="services" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3 pb-6">
                            {shop.services.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8 text-sm">No services listed yet.</p>
                            ) : (
                                shop.services.map(svc => (
                                    <ServiceCard key={svc.id} svc={svc} onBook={handleBook} canBook={!isOwner} />
                                ))
                            )}

                            {/* Book all CTA */}
                            {shop.services.length > 0 && !isOwner && (
                                <div className="pt-2">
                                    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                                        onClick={() => handleBook(shop.services[0])}
                                        className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black text-base shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                                        Book an Appointment <ChevronRight size={18} />
                                    </motion.button>
                                    <p className="text-xs text-center text-muted-foreground mt-2">
                                        {currentUser ? 'Select a service above to book' : 'You\'ll need to sign up first. It takes 2 minutes'}
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Reviews */}
                    {/* Work photos */}
                    {activeTab === 'work' && (
                        <motion.div key="work" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pb-6 space-y-4">
                            {isOwner && (
                                <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
                                    <p className="text-sm font-bold text-foreground">Show your work</p>
                                    <input aria-label="Photo caption" value={workCaption} onChange={e => setWorkCaption(e.target.value.slice(0, 80))}
                                        placeholder="Caption (optional), e.g. Knotless braids"
                                        className="w-full px-4 py-3 border-2 border-border rounded-xl focus:outline-none focus:border-primary text-foreground text-sm transition" />
                                    <PhotoPicker label="Add a work photo" folder="butso/portfolio" disabled={shop.portfolio.length >= 12}
                                        onUploaded={async url => {
                                            const { error } = await addPortfolioPhoto(shop.id, url, workCaption)
                                            if (error) showToast('error', error)
                                            else { setWorkCaption(''); showToast('success', 'Photo added') }
                                        }} />
                                    <p className="text-xs text-muted-foreground">{shop.portfolio.length} of 12 photos. Only post your own work.</p>
                                </div>
                            )}
                            {shop.portfolio.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8 text-sm">{isOwner ? 'No photos yet. Add your first one above.' : 'No work photos yet.'}</p>
                            ) : (
                                <div className="grid grid-cols-3 gap-2">
                                    {photos.map((p, idx) => (
                                        <div key={p.id} className="relative aspect-square rounded-xl overflow-hidden bg-secondary">
                                            <button aria-label={`Open photo ${idx + 1} of ${photos.length}`} onClick={() => setViewerIndex(idx)} className="absolute inset-0">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={imgUrl(p.imageUrl, 'f_auto,q_auto,w_360,h_360,c_fill')} alt={p.caption || `Work by ${shop.name}`} loading="lazy" className="w-full h-full object-cover" />
                                            </button>
                                            {isOwner && (
                                                <button aria-label="Delete photo"
                                                    onClick={async () => {
                                                        if (!(await confirmAction({ title: 'Delete this photo?', confirmLabel: 'Delete', danger: true }))) return
                                                        const err = await removePortfolioPhoto(shop.id, p.id)
                                                        if (err) showToast('error', err)
                                                    }}
                                                    className="absolute top-1.5 right-1.5 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center">
                                                    <Trash2 size={13} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'reviews' && (
                        <motion.div key="reviews" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 pb-6">
                            {/* Summary */}
                            {shop.reviewCount > 0 && (
                                <div className="flex items-center gap-5 p-4 bg-card border border-border rounded-2xl">
                                    <div className="text-center">
                                        <p className="text-4xl font-black text-foreground">{shop.rating.toFixed(1)}</p>
                                        <StarRating rating={shop.rating} size={16} />
                                        <p className="text-xs text-muted-foreground mt-1">{shop.reviewCount} reviews</p>
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        {[5, 4, 3, 2, 1].map(star => {
                                            const count = shop.reviews.filter(r => Math.round(r.rating) === star).length
                                            const pct = shop.reviews.length > 0 ? (count / shop.reviews.length) * 100 : 0
                                            return (
                                                <div key={star} className="flex items-center gap-2">
                                                    <span className="text-xs text-muted-foreground w-3">{star}</span>
                                                    <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                                                        <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {shop.reviews.length === 0 ? (
                                <div className="text-center py-10">
                                    <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center"><Award size={24} /></div>
                                    <p className="font-semibold text-foreground mb-1">No reviews yet</p>
                                    <p className="text-sm text-muted-foreground">Be the first to book and leave a review</p>
                                </div>
                            ) : (
                                shop.reviews.map(review => (
                                    <div key={review.id} className="p-4 bg-card border border-border rounded-2xl">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <div>
                                                <p className="font-bold text-foreground text-sm">{review.userName}</p>
                                                <StarRating rating={review.rating} size={12} />
                                            </div>
                                            <p className="text-xs text-muted-foreground shrink-0">
                                                {new Date(review.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                                            </p>
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                                    </div>
                                ))
                            )}

                            {canReview ? (
                                <div className="p-4 bg-card border border-border rounded-2xl space-y-3">
                                    <p className="font-bold text-foreground text-sm">Rate your experience</p>
                                    <div className="flex gap-1" role="radiogroup" aria-label="Rating">
                                        {[1, 2, 3, 4, 5].map(n => (
                                            <button key={n} type="button" role="radio" aria-checked={reviewRating === n}
                                                aria-label={`${n} star${n > 1 ? 's' : ''}`}
                                                onClick={() => setReviewRating(n)}
                                                className="min-w-[44px] min-h-[44px] rounded-lg hover:bg-secondary transition text-2xl leading-none">
                                                <span className={n <= reviewRating ? 'text-amber-400' : 'text-muted-foreground/40'}>★</span>
                                            </button>
                                        ))}
                                    </div>
                                    <textarea aria-label="Your review" value={reviewComment} onChange={e => setReviewComment(e.target.value.slice(0, 500))}
                                        rows={3} placeholder="What was it like? (optional)"
                                        className="w-full px-4 py-3 border border-border rounded-xl bg-secondary/30 text-sm focus:outline-none focus:border-primary" />
                                    <button onClick={submitReview} disabled={reviewRating === 0 || reviewSaving}
                                        className="px-5 min-h-[44px] rounded-xl bg-primary text-primary-foreground text-sm font-bold disabled:opacity-50">
                                        {reviewSaving ? 'Posting...' : 'Post review'}
                                    </button>
                                </div>
                            ) : (
                                <div className="pt-2 text-center text-xs text-muted-foreground">
                                    {currentUser
                                        ? (hasReviewed ? 'Thanks, you have reviewed this shop.' : 'Reviews are only available after a completed booking.')
                                        : 'Log in to leave a review after a completed booking.'}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Hours */}
                    {activeTab === 'hours' && (
                        <motion.div key="hours" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pb-6">
                            <div className="bg-card border border-border rounded-2xl overflow-hidden">
                                {Object.entries(shop.openingHours).map(([day, h], i) => {
                                    const isToday = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][new Date().getDay()] === day
                                    return (
                                        <div key={day} className={`flex items-center justify-between px-4 py-3 ${i < 6 ? 'border-b border-border' : ''} ${isToday ? 'bg-primary/5' : ''}`}>
                                            <span className={`text-sm font-semibold ${isToday ? 'text-primary' : 'text-foreground'}`}>
                                                {DAY_LABELS[day]}{isToday && <span className="ml-1.5 text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">Today</span>}
                                            </span>
                                            {h.open
                                                ? <span className="text-sm text-muted-foreground">{h.from} – {h.to}</span>
                                                : <span className="text-sm text-red-500 font-semibold">Closed</span>}
                                        </div>
                                    )
                                })}
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>

            {/* Sticky book button */}
            <div className="fixed bottom-16 left-0 right-0 lg:bottom-0 bg-background/95 backdrop-blur-sm border-t border-border p-4">
                <div className="max-w-2xl mx-auto">
                    {isOwner ? (
                        <motion.button whileTap={{ scale: 0.97 }} onClick={() => setCurrentPage('shop-setup')}
                            className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black text-base shadow-lg shadow-primary/20">
                            Edit my shop
                        </motion.button>
                    ) : (
                        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
                            onClick={() => handleBook(shop.services[0] ?? { id: '', name: '', price: 0, pricingType: 'fixed' })}
                            disabled={shop.services.length === 0}
                            className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black text-base shadow-lg shadow-primary/20 disabled:opacity-40 flex items-center justify-center gap-2">
                            <span>{shop.isOpen ? 'Book Now' : 'Book Ahead'}</span>
                            <span className="opacity-70">·</span>
                            <span>from ₦{Math.min(...shop.services.map(s => s.price)).toLocaleString()}</span>
                        </motion.button>
                    )}
                </div>
            </div>

            <AnimatePresence>
            {bannerOpen && shop.photoUrl && (
                <PhotoViewer key="banner" photos={[{ id: 'shop-photo', imageUrl: shop.photoUrl, caption: shop.name }]} startIndex={0}
                    title={shop.name} onClose={() => setBannerOpen(false)} onShare={() => { handleShare() }} />
            )}

            {viewerIndex !== null && (
                <PhotoViewer key="gallery" photos={photos} startIndex={viewerIndex} title={shop.name}
                    onClose={() => setViewerIndex(null)} onShare={sharePhoto} />
            )}
            </AnimatePresence>
        </div>
    )
}