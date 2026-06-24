'use client'

import { motion } from 'framer-motion'
import { Calendar, DollarSign, User, ChevronRight } from 'lucide-react'
import { useAppStore } from '@/lib/store'

export function Bookings() {
  const { bookings, setCurrentPage } = useAppStore()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-primary/15 text-primary'
      case 'pending':
        return 'bg-accent/15 text-accent'
      case 'completed':
        return 'bg-primary/15 text-primary'
      case 'cancelled':
        return 'bg-destructive/15 text-destructive'
      default:
        return 'bg-secondary text-foreground'
    }
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
          <h1 className="text-3xl font-bold mb-1">Your Bookings</h1>
          <p className="text-primary-foreground/80">Manage your scheduled bookings and payments</p>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        {/* Booking Stats */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-3 gap-4 my-6"
        >
          <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
            <p className="text-muted-foreground text-xs font-medium">Total Bookings</p>
            <p className="text-3xl font-bold text-foreground mt-2">{bookings.length}</p>
          </div>
          <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
            <p className="text-muted-foreground text-xs font-medium">Confirmed</p>
            <p className="text-3xl font-bold text-primary mt-2">
              {bookings.filter((b) => b.status === 'confirmed').length}
            </p>
          </div>
          <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
            <p className="text-muted-foreground text-xs font-medium">Pending</p>
            <p className="text-3xl font-bold text-accent mt-2">
              {bookings.filter((b) => b.status === 'pending').length}
            </p>
          </div>
        </motion.div>

        {/* Bookings List */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-lg border border-border shadow-sm p-6"
        >
          <h2 className="text-xl font-bold text-foreground mb-4">Active & Upcoming Bookings</h2>

          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No bookings yet</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentPage('jobs')}
                className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition"
              >
                Browse Jobs
              </motion.button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  whileHover={{ x: 5 }}
                  className="p-4 border border-border rounded-lg hover:bg-secondary/50 transition cursor-pointer"
                  onClick={() => setCurrentPage('booking-details')}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground">{booking.jobTitle || `Job #${booking.jobId}`}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar size={16} />
                          <span>{new Date(booking.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <DollarSign size={16} />
                          <span className="font-semibold">₦{booking.totalPrice}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User size={16} />
                          <span className="text-xs">{booking.workerName || booking.slots.length + ' slot(s)'}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="text-muted-foreground mt-2" size={20} />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}