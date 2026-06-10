'use client'

/**
 * ShopPage — Public shop profile
 * Browsable without an account. Account needed to book.
 * Shows: hero, portfolio/about, services, reviews, owner info
 */

import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, MapPin, Phone, Star, Clock, Check, ChevronRight, Share2, MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { useAppStore, type Shop, type ShopService } from '@/lib/store'

const DAY_LABELS: Record<string, string> = {
    mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun',
}

function ServiceCard({ svc, onBook }: { svc: ShopService; onBook: (svc: ShopService) => void }) {
    return (
        <motion.div whileHover={{ y: -2 }}
            className="flex items-center gap-4 p-4 bg-card border border-border rounded-2xl hover:border-primary/30 transition">
            <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground text-sm">{svc.name}</p>
                {svc.description && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{svc.description}</p>}
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-base font-black text-primary">₦{svc.price.toLocaleString()}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${svc.pricingType === 'fixed' ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'}`}>
                        {svc.pricingType === 'fixed' ? '✅ Fixed price' : '🤝 Negotiable'}
                    </span>
                    {svc.durationMinutes ? (
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock size={10} />{svc.durationMinutes}min</span>
                    ) : null}
                </div>
            </div>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => onBook(svc)}
                className="shrink-0 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-bold text-xs hover:bg-primary/90 transition">
                Book
            </motion.button>
        </motion.div>
    )
}

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
                <svg key={i} width={size} height={size} viewBox="0 0 20 20" fill={i <= Math.round(rating) ? '#F59E0B' : 'none'} stroke="#F59E0B" strokeWidth="1.5">
                    <polygon points="10,2 12.9,7 18.5,7.6 14.3,11.5 15.6,17 10,14.1 4.4,17 5.7,11.5 1.5,7.6 7.1,7" />
                </svg>
            ))}
        </div>
    )
}

export function ShopPage() {
    const { selectedShopId, shops, setCurrentPage, currentUser, goBack } = useAppStore()
    const shop = shops.find(s => s.id === selectedShopId)
    const [activeTab, setActiveTab] = useState<'services' | 'reviews' | 'hours'>('services')
    const [bookingService, setBookingService] = useState<ShopService | null>(null)
    const [showShareToast, setShowShareToast] = useState(false)

    if (!shop) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
                <p className="text-4xl mb-3">🏪</p>
                <p className="font-bold text-foreground mb-1">Shop not found</p>
                <button onClick={() => setCurrentPage('shops')} className="text-primary text-sm font-semibold hover:underline">Browse shops</button>
            </div>
        </div>
    )

    const handleBook = (svc: ShopService) => {
        if (!currentUser) {
            sessionStorage.setItem('bookingShopId', shop.id)
            sessionStorage.setItem('bookingServiceId', svc.id)
            setCurrentPage('phone-verification')
            return
        }
        setBookingService(svc)
        // TODO: navigate to booking slots with shop context
        setCurrentPage('booking-slots')
    }

    const handleShare = () => {
        navigator.clipboard.writeText(`Check out ${shop.name} on Butsó!`)
        setShowShareToast(true)
        setTimeout(() => setShowShareToast(false), 2000)
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
                    <button onClick={goBack} className="p-2 hover:bg-secondary rounded-xl transition">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-2">
                        <button onClick={handleShare} className="p-2 hover:bg-secondary rounded-xl transition">
                            <Share2 size={18} className="text-muted-foreground" />
                        </button>
                        <button onClick={() => setCurrentPage('messaging')} className="p-2 hover:bg-secondary rounded-xl transition">
                            <MessageCircle size={18} className="text-muted-foreground" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4">

                {/* ── Hero ── */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="pt-5 pb-6">
                    <div className="flex items-start gap-4 mb-4">
                        {/* Shop avatar */}
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 border border-primary/20">
                            {shop.category === 'Barbing' ? '✂️' : shop.category === 'Cleaning' ? '🧹' : shop.category === 'Tailoring' ? '👗' : shop.category === 'Cooking' ? '🍳' : shop.category === 'Auto Repair' ? '🚗' : '🏪'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                                <h1 className="font-black text-foreground text-xl leading-tight">{shop.name}</h1>
                                {shop.verified && (
                                    <span className="shrink-0 flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                                        <Check size={10} /> Verified
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">by @{shop.ownerUsername}</p>
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                                <div className="flex items-center gap-1.5">
                                    <StarRating rating={shop.rating} />
                                    <span className="text-sm font-bold text-foreground">{shop.rating > 0 ? shop.rating.toFixed(1) : 'New'}</span>
                                    {shop.reviewCount > 0 && <span className="text-xs text-muted-foreground">({shop.reviewCount})</span>}
                                </div>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${shop.isOpen ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-500'}`}>
                                    {shop.isOpen ? '● Open now' : '● Closed'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Location + phone */}
                    <div className="flex flex-wrap gap-3">
                        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <MapPin size={13} className="text-primary" />
                            {shop.isMobile ? 'Mobile — comes to you' : shop.location}
                        </span>
                        {shop.phone && (
                            <a href={`tel:${shop.phone}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition">
                                <Phone size={13} className="text-primary" /> {shop.phone}
                            </a>
                        )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mt-4 leading-relaxed">{shop.description}</p>
                </motion.div>

                {/* ── Tabs ── */}
                <div className="flex border-b border-border mb-5">
                    {(['services', 'reviews', 'hours'] as const).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2.5 text-sm font-bold capitalize transition border-b-2 -mb-px ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                            {tab === 'reviews' ? `Reviews (${shop.reviewCount})` : tab === 'hours' ? 'Hours' : 'Services'}
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
                                    <ServiceCard key={svc.id} svc={svc} onBook={handleBook} />
                                ))
                            )}

                            {/* Book all CTA */}
                            {shop.services.length > 0 && (
                                <div className="pt-2">
                                    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                                        onClick={() => handleBook(shop.services[0])}
                                        className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black text-base shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                                        Book an Appointment <ChevronRight size={18} />
                                    </motion.button>
                                    <p className="text-xs text-center text-muted-foreground mt-2">
                                        {currentUser ? 'Select a service above to book' : 'You\'ll need to sign up — takes 2 minutes'}
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Reviews */}
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
                                    <p className="text-3xl mb-2">⭐</p>
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

                            {currentUser && (
                                <div className="pt-2 text-center text-xs text-muted-foreground">
                                    Reviews are only available after a completed booking.
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
                                                {DAY_LABELS[day]}{isToday && <span className="ml-1.5 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">Today</span>}
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
            <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-4">
                <div className="max-w-2xl mx-auto">
                    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
                        onClick={() => handleBook(shop.services[0] ?? { id: '', name: '', price: 0, pricingType: 'fixed' })}
                        disabled={shop.services.length === 0}
                        className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black text-base shadow-lg shadow-primary/20 disabled:opacity-40 flex items-center justify-center gap-2">
                        <span>{shop.isOpen ? 'Book Now' : 'Book Ahead'}</span>
                        <span className="opacity-70">·</span>
                        <span>from ₦{Math.min(...shop.services.map(s => s.price)).toLocaleString()}</span>
                    </motion.button>
                </div>
            </div>
        </div>
    )
}