'use client'

/**
 * ShopSetup — Create or edit your shop
 * Accessible from the dashboard ("Set Up My Shop" button)
 * Workers fill in: name, category, description, location, services, hours
 */

import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, Trash2, ChevronRight, ChevronLeft, MapPin, Phone, Check } from 'lucide-react'
import { useState } from 'react'
import { useAppStore, DEFAULT_HOURS, isShopOpenNow, type ShopService, type OpeningHours, type DayOfWeek, type Shop } from '@/lib/store'

const SHOP_CATEGORIES = [
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
    { emoji: '👔', name: 'Fashion' },
    { emoji: '🌿', name: 'Gardening' },
    { emoji: '🛠️', name: 'General Repairs' },
    { emoji: '🧑‍🏫', name: 'Teaching' },
    { emoji: '📦', name: 'Moving' },
]

const DAYS: { key: DayOfWeek; label: string }[] = [
    { key: 'mon', label: 'Monday' },
    { key: 'tue', label: 'Tuesday' },
    { key: 'wed', label: 'Wednesday' },
    { key: 'thu', label: 'Thursday' },
    { key: 'fri', label: 'Friday' },
    { key: 'sat', label: 'Saturday' },
    { key: 'sun', label: 'Sunday' },
]

const TIME_SLOTS = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00',
]

type Step = 'basics' | 'services' | 'hours' | 'review'

export function ShopSetup() {
    const { currentUser, setCurrentPage, addShop, updateShop, getShopByOwner, setCurrentUser } = useAppStore()
    const existing = currentUser ? getShopByOwner(currentUser.id) : undefined

    const [step, setStep] = useState<Step>('basics')
    const [saving, setSaving] = useState(false)

    // ── Form state ────────────────────────────────────────────────────────────
    const [name, setName] = useState(existing?.name ?? '')
    const [category, setCategory] = useState(existing?.category ?? '')
    const [description, setDescription] = useState(existing?.description ?? '')
    const [location, setLocation] = useState(existing?.location ?? '')
    const [isMobile, setIsMobile] = useState(existing?.isMobile ?? false)
    const [phone, setPhone] = useState(existing?.phone ?? currentUser?.phone ?? '')
    const [tagline, setTagline] = useState(existing?.tagline ?? '')
    const [defaultTab, setDefaultTab] = useState<'services' | 'portfolio' | 'reviews'>(existing?.defaultTab ?? 'services')
    const [services, setServices] = useState<ShopService[]>(existing?.services ?? [])
    const [hours, setHours] = useState<OpeningHours>(existing?.openingHours ?? DEFAULT_HOURS)

    // ── Service editor ────────────────────────────────────────────────────────
    const [editingSvc, setEditingSvc] = useState<Partial<ShopService> | null>(null)
    const [editingIdx, setEditingIdx] = useState<number | null>(null)

    const openNewService = () => setEditingSvc({ name: '', price: 0, pricingType: 'fixed', durationMinutes: 30 })
    const openEditService = (svc: ShopService, idx: number) => { setEditingSvc({ ...svc }); setEditingIdx(idx) }

    const saveService = () => {
        if (!editingSvc?.name || !editingSvc.price) return
        const svc: ShopService = {
            id: editingIdx !== null ? services[editingIdx].id : `svc-${Date.now()}`,
            name: editingSvc.name!,
            description: editingSvc.description,
            price: editingSvc.price!,
            pricingType: editingSvc.pricingType ?? 'fixed',
            durationMinutes: editingSvc.durationMinutes,
        }
        if (editingIdx !== null) {
            setServices(s => s.map((x, i) => i === editingIdx ? svc : x))
        } else {
            setServices(s => [...s, svc])
        }
        setEditingSvc(null)
        setEditingIdx(null)
    }

    const removeService = (idx: number) => setServices(s => s.filter((_, i) => i !== idx))

    // ── Hours editor ──────────────────────────────────────────────────────────
    const toggleDay = (day: DayOfWeek) =>
        setHours(h => ({ ...h, [day]: { ...h[day], open: !h[day].open } }))
    const setHourVal = (day: DayOfWeek, field: 'from' | 'to', val: string) =>
        setHours(h => ({ ...h, [day]: { ...h[day], [field]: val } }))

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSave = () => {
        if (!currentUser) return
        setSaving(true)
        setTimeout(() => {
            if (existing) {
                updateShop(existing.id, { name, category, description, location, isMobile, phone, services, openingHours: hours, isOpen: isShopOpenNow(hours) })
            } else {
                const shop: Shop = {
                    id: `shop-${Date.now()}`,
                    ownerId: currentUser.id,
                    ownerName: currentUser.name,
                    ownerUsername: currentUser.username,
                    name, category, description, location, isMobile, phone,
                    services, openingHours: hours,
                    rating: 0, reviewCount: 0, reviews: [],
                    isOpen: isShopOpenNow(hours),
                    verified: false,
                    createdAt: new Date().toISOString(),
                }
                addShop(shop)
                setCurrentUser({ ...currentUser, shopId: shop.id })
            }
            setSaving(false)
            setCurrentPage('dashboard')
        }, 800)
    }

    const steps: Step[] = ['basics', 'services', 'hours', 'review']
    const stepIdx = steps.indexOf(step)
    const canProceed = {
        basics: name.trim().length > 0 && category.length > 0 && description.trim().length > 0 && (isMobile || location.trim().length > 0),
        services: services.length > 0,
        hours: true,
        review: true,
    }

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-sm border-b border-border">
                <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-3">
                    <button onClick={() => stepIdx > 0 ? setStep(steps[stepIdx - 1]) : setCurrentPage('dashboard')}
                        className="p-2 hover:bg-secondary rounded-xl transition">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex-1">
                        <h1 className="font-black text-foreground text-base">{existing ? 'Edit Shop' : 'Set Up Your Shop'}</h1>
                        <p className="text-xs text-muted-foreground">Step {stepIdx + 1} of 4</p>
                    </div>
                    {/* Step dots */}
                    <div className="flex gap-1.5">
                        {steps.map((s, i) => (
                            <div key={s} className={`w-2 h-2 rounded-full transition-all ${i <= stepIdx ? 'bg-primary' : 'bg-border'}`} />
                        ))}
                    </div>
                </div>
                {/* Progress bar */}
                <div className="h-0.5 bg-border">
                    <div className="h-full bg-primary transition-all duration-300" style={{ width: `${((stepIdx + 1) / 4) * 100}%` }} />
                </div>
            </div>

            <div className="max-w-xl mx-auto px-4 py-6">
                <AnimatePresence mode="wait">

                    {/* ── Step 1: Basics ── */}
                    {step === 'basics' && (
                        <motion.div key="basics" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                            <div>
                                <h2 className="text-xl font-black text-foreground mb-1">Shop basics</h2>
                                <p className="text-sm text-muted-foreground">Tell people what your shop is about.</p>
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-bold text-foreground mb-2">Shop Name *</label>
                                <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Hassan's Barbershop"
                                    className="w-full px-4 py-3 border-2 border-border rounded-xl focus:outline-none focus:border-primary text-foreground text-base transition" />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-bold text-foreground mb-2">Category *</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {SHOP_CATEGORIES.map(cat => (
                                        <button key={cat.name} onClick={() => setCategory(cat.name)}
                                            className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition text-center ${category === cat.name ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40'}`}>
                                            <span className="text-xl">{cat.emoji}</span>
                                            <span className={`text-[10px] font-semibold leading-tight ${category === cat.name ? 'text-primary' : 'text-muted-foreground'}`}>{cat.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-bold text-foreground mb-2">Description *</label>
                                <textarea value={description} onChange={e => setDescription(e.target.value.slice(0, 300))} rows={3}
                                    placeholder="Tell customers what makes your shop great, your experience, what you specialise in..."
                                    className="w-full px-4 py-3 border-2 border-border rounded-xl focus:outline-none focus:border-primary text-foreground text-sm resize-none transition" />
                                <p className="text-xs text-muted-foreground text-right mt-1">{description.length}/300</p>
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-sm font-bold text-foreground mb-2">Location *</label>
                                <label className="flex items-center gap-3 p-3 border-2 border-border rounded-xl cursor-pointer hover:border-primary/40 transition mb-3">
                                    <input type="checkbox" checked={isMobile} onChange={e => setIsMobile(e.target.checked)} className="w-4 h-4 accent-primary" />
                                    <div>
                                        <p className="font-semibold text-foreground text-sm">Mobile — I come to the customer</p>
                                        <p className="text-xs text-muted-foreground">Your shop travels to them</p>
                                    </div>
                                </label>
                                {!isMobile && (
                                    <div className="relative">
                                        <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                        <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. 12 Market Road, Central Wukari"
                                            className="w-full pl-9 pr-4 py-3 border-2 border-border rounded-xl focus:outline-none focus:border-primary text-foreground text-sm transition" />
                                    </div>
                                )}
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-bold text-foreground mb-2">Contact Number</label>
                                <div className="relative">
                                    <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="080XXXXXXXX" type="tel"
                                        className="w-full pl-9 pr-4 py-3 border-2 border-border rounded-xl focus:outline-none focus:border-primary text-foreground text-sm transition" />
                                </div>
                            </div>

                            {/* Tagline */}
                            <div>
                                <label className="block text-sm font-bold text-foreground mb-1">
                                    Tagline <span className="text-muted-foreground font-normal">(optional)</span>
                                </label>
                                <p className="text-xs text-muted-foreground mb-2">One punchy sentence shown under your shop name — e.g. "Cleanest fades in Wukari, guaranteed."</p>
                                <input value={tagline} onChange={e => setTagline(e.target.value.slice(0, 80))} placeholder="What are you known for?"
                                    className="w-full px-4 py-3 border-2 border-border rounded-xl focus:outline-none focus:border-primary text-foreground text-sm transition" />
                                <p className="text-xs text-muted-foreground text-right mt-1">{tagline.length}/80</p>
                            </div>
                        </motion.div>
                    )}

                    {/* ── Step 2: Services ── */}
                    {step === 'services' && (
                        <motion.div key="services" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                            <div>
                                <h2 className="text-xl font-black text-foreground mb-1">Your services</h2>
                                <p className="text-sm text-muted-foreground">Add what you offer. Set a price — fixed or negotiable.</p>
                            </div>

                            {/* Service list */}
                            {services.map((svc, idx) => (
                                <motion.div key={svc.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-foreground text-sm">{svc.name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs font-semibold text-primary">₦{svc.price.toLocaleString()}</span>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${svc.pricingType === 'fixed' ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'}`}>
                                                {svc.pricingType}
                                            </span>
                                            {svc.durationMinutes ? <span className="text-xs text-muted-foreground">{svc.durationMinutes}min</span> : null}
                                        </div>
                                        {svc.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{svc.description}</p>}
                                    </div>
                                    <div className="flex gap-1 shrink-0">
                                        <button onClick={() => openEditService(svc, idx)} className="p-2 hover:bg-secondary rounded-lg transition text-muted-foreground hover:text-foreground">
                                            <ChevronRight size={16} />
                                        </button>
                                        <button onClick={() => removeService(idx)} className="p-2 hover:bg-destructive/10 rounded-lg transition text-muted-foreground hover:text-destructive">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}

                            <button onClick={openNewService}
                                className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:border-primary hover:text-primary transition font-semibold text-sm">
                                <Plus size={18} /> Add a service
                            </button>

                            {/* Service editor modal */}
                            <AnimatePresence>
                                {editingSvc !== null && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4">
                                        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
                                            className="bg-card rounded-2xl p-5 w-full max-w-md space-y-4 border border-border">
                                            <h3 className="font-black text-foreground text-lg">{editingIdx !== null ? 'Edit Service' : 'New Service'}</h3>

                                            <div>
                                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Service Name *</label>
                                                <input value={editingSvc.name ?? ''} onChange={e => setEditingSvc(s => ({ ...s, name: e.target.value }))}
                                                    placeholder="e.g. Haircut, Deep Clean, Full Shave"
                                                    className="w-full px-4 py-3 border-2 border-border rounded-xl focus:outline-none focus:border-primary text-foreground text-sm transition" />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Description (optional)</label>
                                                <input value={editingSvc.description ?? ''} onChange={e => setEditingSvc(s => ({ ...s, description: e.target.value }))}
                                                    placeholder="Brief description of what's included"
                                                    className="w-full px-4 py-3 border-2 border-border rounded-xl focus:outline-none focus:border-primary text-foreground text-sm transition" />
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Price (₦) *</label>
                                                    <input type="number" value={editingSvc.price ?? ''} onChange={e => setEditingSvc(s => ({ ...s, price: Number(e.target.value) }))}
                                                        placeholder="1500"
                                                        className="w-full px-4 py-3 border-2 border-border rounded-xl focus:outline-none focus:border-primary text-foreground text-sm transition" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Duration (min)</label>
                                                    <input type="number" value={editingSvc.durationMinutes ?? ''} onChange={e => setEditingSvc(s => ({ ...s, durationMinutes: Number(e.target.value) }))}
                                                        placeholder="30"
                                                        className="w-full px-4 py-3 border-2 border-border rounded-xl focus:outline-none focus:border-primary text-foreground text-sm transition" />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Pricing Type</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {(['fixed', 'negotiable'] as const).map(t => (
                                                        <button key={t} onClick={() => setEditingSvc(s => ({ ...s, pricingType: t }))}
                                                            className={`py-2.5 rounded-xl font-semibold text-sm border-2 transition capitalize ${editingSvc.pricingType === t ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}>
                                                            {t === 'fixed' ? '✅ Fixed price' : '🤝 Negotiable'}
                                                        </button>
                                                    ))}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1.5">
                                                    {editingSvc.pricingType === 'fixed' ? 'Customer books and pays this price directly.' : 'Customer sends a request, you respond with a quote.'}
                                                </p>
                                            </div>

                                            <div className="flex gap-2 pt-1">
                                                <button onClick={() => { setEditingSvc(null); setEditingIdx(null) }}
                                                    className="flex-1 py-3 border-2 border-border rounded-xl font-bold text-sm text-foreground hover:bg-secondary transition">
                                                    Cancel
                                                </button>
                                                <button onClick={saveService} disabled={!editingSvc.name || !editingSvc.price}
                                                    className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary/90 transition disabled:opacity-40">
                                                    {editingIdx !== null ? 'Save Changes' : 'Add Service'}
                                                </button>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}

                    {/* ── Step 3: Opening Hours ── */}
                    {step === 'hours' && (
                        <motion.div key="hours" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                            <div>
                                <h2 className="text-xl font-black text-foreground mb-1">Opening hours</h2>
                                <p className="text-sm text-muted-foreground">Set when you're available. Customers see this on your shop.</p>
                            </div>

                            <div className="space-y-2">
                                {DAYS.map(({ key, label }) => (
                                    <div key={key} className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition ${hours[key].open ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'}`}>
                                        <button onClick={() => toggleDay(key)} className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${hours[key].open ? 'bg-primary' : 'bg-border'}`}>
                                            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${hours[key].open ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                        </button>
                                        <span className={`text-sm font-semibold w-24 flex-shrink-0 ${hours[key].open ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
                                        {hours[key].open ? (
                                            <div className="flex items-center gap-2 flex-1">
                                                <select value={hours[key].from} onChange={e => setHourVal(key, 'from', e.target.value)}
                                                    className="flex-1 px-2 py-1.5 border border-border rounded-lg text-xs bg-background text-foreground">
                                                    {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                                                </select>
                                                <span className="text-xs text-muted-foreground">–</span>
                                                <select value={hours[key].to} onChange={e => setHourVal(key, 'to', e.target.value)}
                                                    className="flex-1 px-2 py-1.5 border border-border rounded-lg text-xs bg-background text-foreground">
                                                    {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                                                </select>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">Closed</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* ── Step 4: Review ── */}
                    {step === 'review' && (
                        <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                            <div>
                                <h2 className="text-xl font-black text-foreground mb-1">Looks good?</h2>
                                <p className="text-sm text-muted-foreground">Review your shop before publishing.</p>
                            </div>

                            <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                                        {SHOP_CATEGORIES.find(c => c.name === category)?.emoji ?? '🏪'}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-foreground text-lg leading-tight">{name}</h3>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">{category}</span>
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <MapPin size={10} /> {isMobile ? 'Mobile' : location}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">{description}</p>
                                <div className="border-t border-border pt-3">
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">{services.length} Services</p>
                                    <div className="space-y-1.5">
                                        {services.map(svc => (
                                            <div key={svc.id} className="flex items-center justify-between">
                                                <span className="text-sm text-foreground">{svc.name}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-primary">₦{svc.price.toLocaleString()}</span>
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${svc.pricingType === 'fixed' ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'}`}>
                                                        {svc.pricingType}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 text-sm text-muted-foreground">
                                <Check size={16} className="text-primary mt-0.5 shrink-0" />
                                <p>Your shop will be visible to everyone in Wukari. You can edit it anytime from your dashboard.</p>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>

                {/* Bottom nav */}
                <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4">
                    <div className="max-w-xl mx-auto flex gap-3">
                        {stepIdx > 0 && (
                            <button onClick={() => setStep(steps[stepIdx - 1])}
                                className="flex items-center gap-1 px-5 py-3.5 border-2 border-border rounded-xl font-bold text-sm text-foreground hover:bg-secondary transition">
                                <ChevronLeft size={16} /> Back
                            </button>
                        )}
                        {step !== 'review' ? (
                            <motion.button whileTap={{ scale: 0.98 }}
                                onClick={() => canProceed[step] && setStep(steps[stepIdx + 1])}
                                disabled={!canProceed[step]}
                                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary/90 transition disabled:opacity-40">
                                Continue <ChevronRight size={16} />
                            </motion.button>
                        ) : (
                            <motion.button whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={saving}
                                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary/90 transition disabled:opacity-50">
                                {saving ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Publishing...</> : '🚀 Publish Shop'}
                            </motion.button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}