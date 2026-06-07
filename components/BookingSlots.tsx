'use client'

import { motion } from 'framer-motion'
import { Calendar, Clock, CheckCircle, ChevronLeft } from 'lucide-react'
import { useState } from 'react'
import { useAppStore } from '@/lib/store'

export function BookingSlots() {
  const { setCurrentPage, addBooking } = useAppStore()
  const [step, setStep] = useState<'date' | 'slots' | 'confirm' | 'success'>('date')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedSlots, setSelectedSlots] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  // Generate available dates (next 30 days)
  const generateDates = () => {
    const dates = []
    const today = new Date()
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const availableDates = generateDates()

  // Time slots
  const timeSlots = [
    '08:00 - 09:00',
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    '12:00 - 13:00',
    '13:00 - 14:00',
    '14:00 - 15:00',
    '15:00 - 16:00',
    '16:00 - 17:00',
    '17:00 - 18:00',
  ]

  const selectedDateObj = selectedDate ? new Date(selectedDate) : null
  const formattedDate = selectedDateObj?.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date.toISOString().split('T')[0])
    setSelectedSlots([])
    setStep('slots')
  }

  const toggleSlot = (slot: string) => {
    setSelectedSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    )
  }

  const handleCreateBooking = () => {
    setIsProcessing(true)
    setTimeout(() => {
      const newBooking = {
        id: Math.random().toString(36).substr(2, 9),
        jobId: 'job1',
        workerId: 'worker1',
        employerId: 'emp1',
        status: 'pending' as const,
        date: selectedDate,
        slots: selectedSlots,
        totalPrice: selectedSlots.length * 50000, // 50k per slot
        createdAt: new Date().toISOString(),
      }
      addBooking(newBooking)
      setStep('success')
      setIsProcessing(false)
    }, 1200)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background pb-20"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6 pt-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center gap-4 mb-4">
            {step !== 'success' && (
              <motion.button
                whileHover={{ x: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (step === 'date') {
                    setCurrentPage('dashboard')
                  } else {
                    setStep('date')
                    setSelectedDate('')
                    setSelectedSlots([])
                  }
                }}
                className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition font-semibold"
              >
                <ChevronLeft size={20} />
                Back
              </motion.button>
            )}
          </div>
          <h1 className="text-3xl font-bold">
            {step === 'success' ? 'Booking Confirmed!' : 'Create Booking'}
          </h1>
          <p className="text-primary-foreground/80">
            {step === 'date' && 'Select a date for your work'}
            {step === 'slots' && 'Select available time slots'}
            {step === 'confirm' && 'Review and confirm your booking'}
            {step === 'success' && 'Your booking has been created'}
          </p>
        </motion.div>
      </div>

      {/* Progress Bar */}
      {step !== 'success' && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="max-w-4xl mx-auto px-4 py-6"
        >
          <div className="flex gap-2">
            {['date', 'slots', 'confirm'].map((s, i) => (
              <motion.div
                key={s}
                className="flex-1 h-2 rounded-full transition"
                animate={{
                  backgroundColor:
                    step === s || (['slots', 'confirm'].includes(step) && i < 1) ||
                    (step === 'confirm' && i < 2)
                      ? '#2BA06F'
                      : '#E5E5E5',
                }}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        {/* Date Selection */}
        {step === 'date' && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-lg border border-border shadow-sm p-8"
          >
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Calendar className="text-primary" size={24} />
              Select a Date
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
              {availableDates.map((date, index) => {
                const dateStr = date.toISOString().split('T')[0]
                const isSelected = selectedDate === dateStr
                
                return (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDateSelect(date)}
                    className={`p-4 rounded-lg border-2 transition text-center ${
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <p className="text-lg font-bold text-foreground">
                      {date.getDate()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {date.toLocaleDateString('en-US', { month: 'short' })}
                    </p>
                  </motion.button>
                )
              })}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!selectedDate}
              onClick={() => setStep('slots')}
              className="w-full py-3 px-6 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
            >
              Continue to Time Slots
            </motion.button>
          </motion.div>
        )}

        {/* Slot Selection */}
        {step === 'slots' && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-lg border border-border shadow-sm p-8"
          >
            <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Clock className="text-primary" size={24} />
              Select Time Slots
            </h2>
            <p className="text-muted-foreground mb-6">{formattedDate}</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
              {timeSlots.map((slot, index) => {
                const isSelected = selectedSlots.includes(slot)
                
                return (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleSlot(slot)}
                    className={`p-4 rounded-lg border-2 transition font-semibold ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-foreground hover:border-primary/50'
                    }`}
                  >
                    {slot}
                  </motion.button>
                )
              })}
            </div>

            {selectedSlots.length > 0 && (
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6"
              >
                <p className="text-sm font-semibold text-foreground mb-2">Selected Slots ({selectedSlots.length}):</p>
                <div className="flex flex-wrap gap-2">
                  {selectedSlots.map((slot) => (
                    <span key={slot} className="px-3 py-1 bg-primary/20 text-primary text-xs font-semibold rounded-full">
                      {slot}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep('date')}
                className="flex-1 py-3 px-6 border border-border text-foreground font-semibold rounded-lg hover:bg-secondary transition"
              >
                Back
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={selectedSlots.length === 0}
                onClick={() => setStep('confirm')}
                className="flex-1 py-3 px-6 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
              >
                Review Booking
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Confirmation */}
        {step === 'confirm' && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-lg border border-border shadow-sm p-8"
          >
            <h2 className="text-2xl font-bold text-foreground mb-6">Review Your Booking</h2>

            <div className="space-y-4 mb-8 pb-8 border-b border-border">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Job</p>
                  <p className="font-bold text-foreground">Bathroom Renovation</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Date</p>
                  <p className="font-bold text-foreground">{formattedDate}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-3">Time Slots</p>
                <div className="flex flex-wrap gap-2">
                  {selectedSlots.map((slot) => (
                    <span key={slot} className="px-3 py-2 bg-primary/10 text-primary text-sm font-semibold rounded-lg">
                      {slot}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-secondary/50 rounded-lg p-6 mb-8">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Rate per slot</p>
                  <p className="text-lg font-bold text-foreground">₦50,000</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Number of slots</p>
                  <p className="text-lg font-bold text-foreground">{selectedSlots.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Price</p>
                  <p className="text-3xl font-bold text-primary">₦{(selectedSlots.length * 50000).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep('slots')}
                className="flex-1 py-3 px-6 border border-border text-foreground font-semibold rounded-lg hover:bg-secondary transition"
              >
                Edit Slots
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreateBooking}
                disabled={isProcessing}
                className="flex-1 py-3 px-6 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
              >
                {isProcessing ? 'Creating...' : 'Confirm Booking'}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Success */}
        {step === 'success' && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-card rounded-lg border border-border shadow-sm p-12 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="inline-block mb-6"
            >
              <CheckCircle className="text-primary" size={80} />
            </motion.div>

            <h2 className="text-3xl font-bold text-foreground mb-2">Booking Confirmed!</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Your booking has been created successfully. The employer will review and confirm it shortly.
            </p>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-bold text-foreground mb-3">Booking Details:</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Job</dt>
                  <dd className="font-semibold text-foreground">Bathroom Renovation</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Date</dt>
                  <dd className="font-semibold text-foreground">{formattedDate}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Slots</dt>
                  <dd className="font-semibold text-foreground">{selectedSlots.length}</dd>
                </div>
                <div className="flex justify-between pt-3 border-t border-primary/20">
                  <dt className="text-foreground font-bold">Total Price</dt>
                  <dd className="font-bold text-primary">₦{(selectedSlots.length * 50000).toLocaleString()}</dd>
                </div>
              </dl>
            </div>

            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentPage('dashboard')}
                className="flex-1 py-3 px-6 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition"
              >
                Go to Dashboard
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentPage('bookings')}
                className="flex-1 py-3 px-6 border border-border text-foreground font-semibold rounded-lg hover:bg-secondary transition"
              >
                View Bookings
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
