'use client'

/**
 * ShopsBrowsing — Discover shops near you
 * Filterable by category, searchable by name/service
 * Each card shows: name, category, location, open/closed, rating, starting price
 */

import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, Star, X, SlidersHorizontal, Store, Users } from 'lucide-react'
import { useState, useMemo } from 'react'
import { useAppStore, type Shop } from '@/lib/store'
import { PeopleSearch } from '@/components/PeopleSearch'

const CATEGORIES = [
    { emoji: '✂️', name: 'Barbing' },
    { emoji: '👗', name: 'Tailoring' },
    { emoji: '🧹', name: 'Cleaning' },
    { emoji: '🔧', name: 'Plumbing' },
    { emoji: '⚡', name: 'Electrical' },
    { emoji: '🍳', name: 'Cooking' },
    { emoji: '🚗', name: 'Auto Repair' },
    { emoji: '💆', name: 'Beauty' },
    { emoji: '🪚', name: 'Carpentry' },
    { emoji: '🎨', name: 'Painting' },
    { emoji: '📸', name: 'Photography' },
    { emoji: '🌿', name: 'Gardening' },
]

const getCategoryEmoji = (cat: string) => CATEGORIES.find(c => c.name === cat)?.emoji ?? '🏪'

function ShopCard({ shop, onPress }: { shop: Shop; onPress: () => void }) {
    const minPrice = shop.services.length > 0 ? Math.min(...shop.services.map(s => s.price)) : 0

    return (
        <motion.button
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
            onClick={onPress}
            className="w-full text-left bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-md transition-all duration-200"
        >
            {/* Card header — coloured band */}
            <div className="h-2 w-full" style={{ background: shop.isOpen ? 'var(--color-primary)' : '#E4E3DF' }} />

            <div className="p-4">
                <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 border border-primary/15">
                        {getCategoryEmoji(shop.category)}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="font-black text-foreground text-sm leading-tight truncate">{shop.name}</h3>
                            <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${shop.isOpen ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                                {shop.isOpen ? '● Open' : '● Closed'}
                            </span>
                        </div>

                        <p className="text-xs text-muted-foreground mt-0.5">{shop.category}</p>

                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                            {/* Rating */}
                            {shop.reviewCount > 0 ? (
                                <div className="flex items-center gap-1">
                                    <Star size={11} className="text-amber-500 fill-amber-500" />
                                    <span className="text-xs font-bold text-foreground">{shop.rating.toFixed(1)}</span>
                                    <span className="text-xs text-muted-foreground">({shop.reviewCount})</span>
                                </div>
                            ) : (
                                <span className="text-xs text-muted-foreground">New shop</span>
                            )}

                            {/* Location */}
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin size={10} />
                                {shop.isMobile ? 'Mobile' : shop.location.split(',')[0]}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Services preview */}
                {shop.services.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                        <div className="flex gap-1.5 flex-wrap">
                            {shop.services.slice(0, 3).map(svc => (
                                <span key={svc.id} className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                                    {svc.name}
                                </span>
                            ))}
                            {shop.services.length > 3 && (
                                <span className="text-[10px] text-muted-foreground px-1">+{shop.services.length - 3} more</span>
                            )}
                        </div>
                        <span className="text-xs font-black text-primary shrink-0">
                            from ₦{minPrice.toLocaleString()}
                        </span>
                    </div>
                )}
            </div>
        </motion.button>
    )
}

export function ShopsBrowsing() {
    const { shops, setCurrentPage, setSelectedShopId, getRankedCategories } = useAppStore()
    const [query, setQuery] = useState('')
    const [selectedCat, setSelectedCat] = useState<string | null>(null)
    const [onlyOpen, setOnlyOpen] = useState(false)
    const [showFilters, setShowFilters] = useState(false)
    const [tab, setTab] = useState<'shops' | 'people'>('shops')

    // Personalised category order
    const rankedCats = getRankedCategories(CATEGORIES.map(c => c.name))
    const sortedCategories = [...CATEGORIES].sort((a, b) => rankedCats.indexOf(a.name) - rankedCats.indexOf(b.name))

    const filtered = useMemo(() => {
        let result = [...shops]
        if (selectedCat) result = result.filter(s => s.category === selectedCat)
        if (onlyOpen) result = result.filter(s => s.isOpen)
        if (query.trim()) {
            const q = query.toLowerCase()
            result = result.filter(s =>
                s.name.toLowerCase().includes(q) ||
                s.category.toLowerCase().includes(q) ||
                s.description.toLowerCase().includes(q) ||
                s.services.some(svc => svc.name.toLowerCase().includes(q))
            )
        }
        // Sort: open first, then by rating
        return result.sort((a, b) => {
            if (a.isOpen !== b.isOpen) return a.isOpen ? -1 : 1
            return b.rating - a.rating
        })
    }, [shops, selectedCat, onlyOpen, query])

    const openShop = (shop: Shop) => {
        setSelectedShopId(shop.id)
        setCurrentPage('shop')
    }

    return (
        <div className="min-h-screen bg-background pb-24">

            {/* ── Sliding tab toggle — always sticky at top ── */}
            <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border px-4 pt-3 pb-3">
                <div className="max-w-2xl mx-auto">
                    <div className="relative flex bg-secondary/60 rounded-2xl p-1">
                        {/* Sliding pill */}
                        <div
                            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-background rounded-xl shadow-sm border border-border transition-all duration-300 ease-in-out"
                            style={{ left: tab === 'shops' ? '4px' : 'calc(50%)' }}
                        />
                        <button
                            onClick={() => setTab('shops')}
                            className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-colors duration-200 z-10 ${tab === 'shops' ? 'text-foreground' : 'text-muted-foreground'}`}
                        >
                            <Store size={15} /> Shops
                        </button>
                        <button
                            onClick={() => setTab('people')}
                            className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-colors duration-200 z-10 ${tab === 'people' ? 'text-foreground' : 'text-muted-foreground'}`}
                        >
                            <Users size={15} /> People
                        </button>
                    </div>
                </div>
            </div>

            {/* ── People tab ── */}
            {tab === 'people' && <PeopleSearch embedded />}

            {/* ── Shops tab ── */}
            {tab === 'shops' && (
                <>
                    {/* Shops filter bar — second sticky row */}
                    <div className="sticky top-[57px] z-30 bg-background/90 backdrop-blur-sm border-b border-border">
                        <div className="max-w-2xl mx-auto px-4 py-3">
                            <div className="flex items-center gap-2 mb-3">
                                <h1 className="font-black text-foreground text-lg flex-1">Shops near you</h1>
                                <button onClick={() => setShowFilters(f => !f)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${showFilters || onlyOpen ? 'bg-primary/10 border-primary text-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}>
                                    <SlidersHorizontal size={13} /> Filters {onlyOpen ? '· 1' : ''}
                                </button>
                            </div>

                            {/* Search */}
                            <div className="relative mb-3">
                                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    value={query}
                                    onChange={e => setQuery(e.target.value)}
                                    placeholder='Search "barber", "cleaner", "tailor"...'
                                    className="w-full pl-9 pr-9 py-2.5 border-2 border-border rounded-xl focus:outline-none focus:border-primary text-foreground text-sm transition bg-background"
                                />
                                {query && (
                                    <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <X size={14} className="text-muted-foreground" />
                                    </button>
                                )}
                            </div>

                            {/* Filters panel */}
                            <AnimatePresence>
                                {showFilters && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden mb-3"
                                    >
                                        <label className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl cursor-pointer">
                                            <input type="checkbox" checked={onlyOpen} onChange={e => setOnlyOpen(e.target.checked)} className="w-4 h-4 accent-primary" />
                                            <span className="text-sm font-semibold text-foreground">Show only open shops</span>
                                            <span className="ml-auto text-xs text-muted-foreground">{shops.filter(s => s.isOpen).length} open now</span>
                                        </label>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Category pills */}
                            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                <button onClick={() => setSelectedCat(null)}
                                    className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold border-2 transition ${!selectedCat ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}>
                                    All
                                </button>
                                {sortedCategories.map(cat => (
                                    <button key={cat.name} onClick={() => setSelectedCat(selectedCat === cat.name ? null : cat.name)}
                                        className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border-2 transition ${selectedCat === cat.name ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}>
                                        <span>{cat.emoji}</span> {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Shop results */}
                    <div className="max-w-2xl mx-auto px-4 pt-5">

                        {/* Result count */}
                        <p className="text-xs text-muted-foreground mb-4 font-medium">
                            {filtered.length === 0 ? 'No shops found' : `${filtered.length} shop${filtered.length !== 1 ? 's' : ''} in Wukari${selectedCat ? ` · ${selectedCat}` : ''}`}
                        </p>

                        {/* Shop grid */}
                        {filtered.length === 0 ? (
                            <div className="text-center py-16">
                                <p className="text-4xl mb-3">🏪</p>
                                <p className="font-bold text-foreground mb-1">No shops found</p>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {query ? `No results for "${query}"` : 'No shops in this category yet'}
                                </p>
                                <button onClick={() => { setQuery(''); setSelectedCat(null) }}
                                    className="text-primary text-sm font-semibold hover:underline">Clear filters</button>
                            </div>
                        ) : (
                            <motion.div
                                initial="hidden"
                                animate="show"
                                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
                                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                            >
                                {filtered.map(shop => (
                                    <motion.div key={shop.id} variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}>
                                        <ShopCard shop={shop} onPress={() => openShop(shop)} />
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}

                        {/* Empty state CTA for workers */}
                        {shops.length === 0 && (
                            <div className="mt-8 p-5 bg-primary/5 border border-primary/20 rounded-2xl text-center">
                                <p className="text-2xl mb-2">🏪</p>
                                <p className="font-bold text-foreground mb-1">Be the first to open a shop</p>
                                <p className="text-sm text-muted-foreground mb-4">Set up your shop and start getting bookings today</p>
                                <button onClick={() => setCurrentPage('shop-setup')}
                                    className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition">
                                    Set Up My Shop
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}