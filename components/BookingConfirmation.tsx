'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle, Clock, DollarSign, MapPin, Calendar, User } from 'lucide-react'
import { useState } from 'react'
import { useAppStore } from '@/lib/store'

export function BookingConfirmation() {
  const { setCurrentPage } = useAppStore()
  const [activeTab, setActiveTab] = useState<'details' | 'payment' | 'escrow'>('details')

  const bookingDetails = {
    id: 'BK-2024-001',
    jobTitle: 'Wooden Door Installation',
    worker: {
      name: 'Jinatswen Daka',
      rating: 4.8,
      reviews: 127,
      avatar: '🧑‍🔧'
    },
    employer: {
      name: 'Amaka Nwosu',
      avatar: '👩‍💼'
    },
    date: 'March 15, 2024',
    time: '9:00 AM - 2:00 PM',
    location: 'Wukari, Taraba',
    totalPrice: 25000,
    breakdown: {
      servicePrice: 20000,
      taxes: 2500,
      platformFee: 2500,
    },
    status: 'confirmed',
    paymentStatus: 'paid',
    escrowStatus: 'held',
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background text-foreground pb-20"
    >
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background border-b border-border">
        <div className="flex items-center gap-3 px-4 py-4 sm:px-6">
          <button
            onClick={() => setCurrentPage('bookings')}
            className="p-2 hover:bg-secondary rounded-lg transition"
          >
            <ArrowLeft size={24} className="text-foreground" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Booking Confirmed</h1>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* Success Banner */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-6 text-primary-foreground text-center mb-6"
        >
          <CheckCircle size={48} className="mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
          <p className="opacity-90 mb-4">ID: {bookingDetails.id}</p>
          <p className="opacity-75">Your booking is confirmed and payment has been secured in escrow</p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-6 border-b border-border"
        >
          {(['details', 'payment', 'escrow'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium capitalize transition border-b-2 ${activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
            >
              {tab}
            </button>
          ))}
        </motion.div>

        {/* Details Tab */}
        {activeTab === 'details' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Job Title */}
            <div className="bg-card rounded-lg p-6">
              <h3 className="text-lg font-bold text-foreground mb-2">
                {bookingDetails.jobTitle}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin size={16} />
                {bookingDetails.location}
              </div>
            </div>

            {/* Participants */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-card rounded-lg p-4">
                <p className="text-xs uppercase font-bold text-muted-foreground mb-3">
                  Worker
                </p>
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{bookingDetails.worker.avatar}</div>
                  <div>
                    <p className="font-bold text-foreground">
                      {bookingDetails.worker.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ★ {bookingDetails.worker.rating} ({bookingDetails.worker.reviews} reviews)
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg p-4">
                <p className="text-xs uppercase font-bold text-muted-foreground mb-3">
                  Employer
                </p>
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{bookingDetails.employer.avatar}</div>
                  <div>
                    <p className="font-bold text-foreground">
                      {bookingDetails.employer.name}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="bg-card rounded-lg p-6 space-y-4">
              <div className="flex items-start gap-4">
                <Calendar size={20} className="text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium text-foreground">{bookingDetails.date}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Clock size={20} className="text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-medium text-foreground">{bookingDetails.time}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <MapPin size={20} className="text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium text-foreground">{bookingDetails.location}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setCurrentPage('messaging')}
                className="bg-primary text-primary-foreground py-3 rounded-lg hover:opacity-90 transition font-medium"
              >
                Message Worker
              </button>
              <button
                onClick={() => setCurrentPage('dashboard')}
                className="bg-card text-foreground py-3 rounded-lg hover:bg-opacity-80 transition font-medium"
              >
                Back to Dashboard
              </button>
            </div>
          </motion.div>
        )}

        {/* Payment Tab */}
        {activeTab === 'payment' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="bg-card rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-foreground">Payment Details</h3>
                <span className="bg-primary/15 dark:bg-primary/15 text-primary dark:text-primary text-xs px-3 py-1 rounded-full font-medium">
                  {bookingDetails.paymentStatus}
                </span>
              </div>

              <div className="space-y-3 border-t border-b border-border py-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Service Price</span>
                  <span className="font-medium text-foreground">₦{bookingDetails.breakdown.servicePrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxes (12.5%)</span>
                  <span className="font-medium text-foreground">₦{bookingDetails.breakdown.taxes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Platform Fee</span>
                  <span className="font-medium text-foreground">₦{bookingDetails.breakdown.platformFee.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between mt-4 pt-4">
                <span className="font-bold text-foreground">Total Paid</span>
                <span className="text-2xl font-bold text-primary">
                  ₦{bookingDetails.totalPrice.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="bg-primary/10 dark:bg-primary/20 border border-primary/30 dark:border-primary/40 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Payment has been processed successfully. You will receive a receipt in your email.
              </p>
            </div>
          </motion.div>
        )}

        {/* Escrow Tab */}
        {activeTab === 'escrow' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="bg-card rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-foreground">Escrow Status</h3>
                <span className="bg-accent/15 dark:bg-accent/20 text-accent dark:text-accent text-xs px-3 py-1 rounded-full font-medium">
                  {bookingDetails.escrowStatus}
                </span>
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-accent to-accent/80 rounded-lg p-4 text-primary-foreground">
                  <p className="text-sm opacity-90 mb-1">Amount in Escrow</p>
                  <h3 className="text-3xl font-bold">
                    ₦{bookingDetails.totalPrice.toLocaleString()}
                  </h3>
                </div>

                <div className="border-t border-border pt-4">
                  <h4 className="font-bold text-foreground mb-4">Escrow Timeline</h4>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-primary mb-4"></div>
                        <div className="w-0.5 h-12 bg-border"></div>
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">Payment Received</p>
                        <p className="text-xs text-muted-foreground">Today at 10:30 AM</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full border-2 border-muted"></div>
                        <div className="w-0.5 h-12 bg-border"></div>
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">Service Completion</p>
                        <p className="text-xs text-muted-foreground">March 15, 2024</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full border-2 border-muted"></div>
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">Payment Released</p>
                        <p className="text-xs text-muted-foreground">Upon mutual confirmation</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary/10 dark:bg-primary/20 border border-primary/30 dark:border-primary/40 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Your payment is secured in escrow. The worker can release it only after the job is completed and both parties confirm. This protects both you and the worker.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}