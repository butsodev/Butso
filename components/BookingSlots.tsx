'use client'

import { motion } from 'framer-motion'
import { Calendar, Clock, CheckCircle, ChevronLeft } from 'lucide-react'
import { useState } from 'react'
import { useAppStore } from '@/lib/store'

export function BookingSlots() {
  const { setCurrentPage, addBooking, currentUser, pendingBooking, setPendingBooking } = useAppStore()
  const [step, setStep] = useState<'date' | 'slots' | 'confirm' | 'success'>('date')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedSlots, setSelectedSlots] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  // Context from wherever the user came from (ShopPage, JobDetails, etc.)
  const shopName = pendingBooking?.shopName ?? 'Service Booking'
  const serviceName = pendingBooking?.serviceName ?? 'Service'
  const servicePrice = pendingBooking?.servicePrice ?? 5000
  const duration = pendingBooking?.durationMinutes

  // Generate available dates (next 30 days, skip today)
  const availableDates = Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i + 1)
    return d
  })

  const timeSlots = [
    '08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00',
    '11:00 - 12:00', '12:00 - 13:00', '13:00 - 14:00',
    '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00',
  ]

  const selectedDateObj = selectedDate ? new Date(selectedDate) : null
  const formattedDate = selectedDateObj?.toLocaleDateString('en-NG', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const totalPrice = duration
    ? servicePrice  // fixed price per booking if duration known
    : servicePrice * selectedSlots.length

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date.toISOString().split('T')[0])
    setSelectedSlots([])
    setStep('slots')
  }

  const toggleSlot = (slot: string) => {
    if (duration) {
      // Single slot only if service has fixed duration
      setSelectedSlots(prev => prev.includes(slot) ? [] : [slot])
    } else {
      setSelectedSlots(prev =>
        prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]
      )
    }
  }

  const handleConfirm = () => {
    setIsProcessing(true)
    setTimeout(() => {
      const newBooking = {
        id: Math.random().toString(36).slice(2, 9),
        jobId: pendingBooking?.shopId ?? 'direct',
        jobTitle: `${serviceName} at ${shopName}`,
        workerId: pendingBooking?.shopId ?? 'worker1',
        workerName: shopName,
        employerId: currentUser?.id ?? 'user',
        employerName: currentUser?.name ?? 'Customer',
        type: 'shop' as const,
        status: 'pending' as const,
        negotiated: false,
        date: selectedDate,
        slots: selectedSlots,
        totalPrice,
        createdAt: new Date().toISOString(),
      }
      addBooking(newBooking)
      setPendingBooking(null)
      setStep('success')
      setIsProcessing(false)
    }, 1200)
  }

  const stepIndex = { date: 0, slots: 1, confirm: 2, success: 3 }[step]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background pb-24"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 sm:px-6 pt-8 pb-12">
        <div className="max-w-2xl mx-auto">
          {step !== 'success' && (
            <button
              onClick={() => {
                if (step === 'date') { setCurrentPage('shop'); }
                else if (step === 'slots') { setStep('date'); setSelectedSlots([]) }
                else if (step === 'confirm') { setStep('slots') }
              }}
              className="flex items-center gap-2 mb-4 text-primary-foreground/80 hover:text-primary-foreground transition text-sm font-semibold"
            >
              <ChevronLeft size={18} /> Back
            </button>
          )}
          <p className="text-primary-foreground/70 text-sm font-medium mb-1">{shopName}</p>
          <h1 className="text-2xl font-black">
            {step === 'success' ? '🎉 Booking Confirmed!' : `Book ${serviceName}`}
          </h1>
          <p className="text-primary-foreground/75 text-sm mt-1">
            {step === 'date' && 'Pick a date'}
            {step === 'slots' && 'Pick a time slot'}
            {step === 'confirm' && 'Review your booking'}
            {step === 'success' && "You're all set!"}
          </p>
        </div>
      </div>

      {/* Progress */}
      {step !== 'success' && (
        <div className="max-w-2xl mx-auto px-4 py-5">
          <div className="flex gap-2">
            {['date', 'slots', 'confirm'].map((s, i) => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= stepIndex ? 'bg-primary' : 'bg-border'}`} />
            ))}
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 pb-8">

        {/* ── Date ── */}
        {step === 'date' && (
          <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-lg font-black text-foreground mb-5 flex items-center gap-2">
              <Calendar className="text-primary" size={20} /> Select a Date
            </h2>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-6">
              {availableDates.map((date, i) => {
                const dateStr = date.toISOString().split('T')[0]
                const isSelected = selectedDate === dateStr
                return (
                  <motion.button key={i} whileTap={{ scale: 0.95 }}
                    onClick={() => handleDateSelect(date)}
                    className={`p-2.5 rounded-xl border-2 text-center transition ${isSelected ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
                    <p className="text-[10px] font-bold text-muted-foreground">
                      {date.toLocaleDateString('en', { weekday: 'short' })}
                    </p>
                    <p className="text-base font-black text-foreground">{date.getDate()}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {date.toLocaleDateString('en', { month: 'short' })}
                    </p>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* ── Slots ── */}
        {step === 'slots' && (
          <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-lg font-black text-foreground mb-1 flex items-center gap-2">
              <Clock className="text-primary" size={20} /> Pick a Time
            </h2>
            <p className="text-sm text-muted-foreground mb-5">{formattedDate}</p>
            {duration && (
              <p className="text-xs text-muted-foreground mb-4 bg-secondary rounded-lg px-3 py-2">
                ⏱ This service takes ~{duration} minutes. Pick one slot.
              </p>
            )}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {timeSlots.map(slot => {
                const isSelected = selectedSlots.includes(slot)
                return (
                  <motion.button key={slot} whileTap={{ scale: 0.96 }}
                    onClick={() => toggleSlot(slot)}
                    className={`py-3 px-4 rounded-xl border-2 font-semibold text-sm transition ${isSelected ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground hover:border-primary/50'}`}>
                    {slot}
                  </motion.button>
                )
              })}
            </div>

            {selectedSlots.length > 0 && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-5">
                <p className="text-xs font-bold text-foreground mb-2">Selected: {selectedSlots.join(', ')}</p>
                <p className="text-sm font-black text-primary">Total: ₦{totalPrice.toLocaleString()}</p>
              </div>
            )}

            <motion.button whileTap={{ scale: 0.97 }}
              disabled={selectedSlots.length === 0}
              onClick={() => setStep('confirm')}
              className="w-full py-3.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition disabled:opacity-40">
              Review Booking
            </motion.button>
          </motion.div>
        )}

        {/* ── Confirm ── */}
        {step === 'confirm' && (
          <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="bg-card border border-border rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-black text-foreground">Confirm Booking</h2>

            <div className="space-y-3 text-sm">
              {[
                { label: 'Shop', value: shopName },
                { label: 'Service', value: serviceName },
                { label: 'Date', value: formattedDate ?? '' },
                { label: 'Time', value: selectedSlots.join(', ') },
              ].map(row => (
                <div key={row.label} className="flex justify-between py-2 border-b border-border last:border-0">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-bold text-foreground text-right max-w-[60%]">{row.value}</span>
                </div>
              ))}
              <div className="flex justify-between py-3 bg-primary/5 rounded-xl px-4 mt-2">
                <span className="font-bold text-foreground">Total</span>
                <span className="text-xl font-black text-primary">₦{totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep('slots')}
                className="flex-1 py-3 border border-border rounded-xl font-bold text-foreground hover:bg-secondary transition text-sm">
                Edit
              </button>
              <motion.button whileTap={{ scale: 0.97 }}
                onClick={handleConfirm} disabled={isProcessing}
                className="flex-1 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition disabled:opacity-50 text-sm">
                {isProcessing ? 'Booking...' : 'Confirm & Book'}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── Success ── */}
        {step === 'success' && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="bg-card border border-border rounded-2xl p-8 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
              className="text-6xl mb-4">✅</motion.div>
            <h2 className="text-2xl font-black text-foreground mb-2">You're booked!</h2>
            <p className="text-muted-foreground text-sm mb-6">
              {shopName} will confirm shortly. Check your bookings for updates.
            </p>

            <div className="bg-secondary/50 rounded-xl p-4 text-left text-sm mb-6 space-y-2">
              <div className="flex justify-between"><span className="text-muted-foreground">Service</span><span className="font-bold">{serviceName}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-bold">{formattedDate}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span className="font-bold">{selectedSlots.join(', ')}</span></div>
              <div className="flex justify-between pt-2 border-t border-border"><span className="font-bold">Total</span><span className="font-black text-primary">₦{totalPrice.toLocaleString()}</span></div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setCurrentPage('bookings')}
                className="flex-1 py-3 border border-border rounded-xl font-bold text-sm hover:bg-secondary transition">
                View Bookings
              </button>
              <button onClick={() => setCurrentPage('shops')}
                className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary/90 transition">
                Browse More
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}