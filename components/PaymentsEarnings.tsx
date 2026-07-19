'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, CreditCard, DollarSign, TrendingUp, Wallet, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { useAppStore } from '@/lib/store'

const mockTransactions = [
  {
    id: 1,
    type: 'earned',
    title: 'Carpentry Job - Payment Released',
    amount: '₦15,000',
    status: 'completed',
    date: '2 days ago',
    jobTitle: 'Furniture Repair',
  },
  {
    id: 2,
    type: 'escrow',
    title: 'Electrical Work - In Escrow',
    amount: '₦8,500',
    status: 'pending',
    date: '5 days ago',
    jobTitle: 'Light Installation',
  },
  {
    id: 3,
    type: 'earned',
    title: 'Painting Job - Payment Released',
    amount: '₦12,000',
    status: 'completed',
    date: '1 week ago',
    jobTitle: 'House Painting',
  },
  {
    id: 4,
    type: 'withdrawal',
    title: 'Withdrawal to Bank Account',
    amount: '-₦20,000',
    status: 'completed',
    date: '1 week ago',
    jobTitle: 'Bank Transfer',
  },
  {
    id: 5,
    type: 'earned',
    title: 'Plumbing Job - Payment Released',
    amount: '₦10,500',
    status: 'completed',
    date: '2 weeks ago',
    jobTitle: 'Pipe Repair',
  },
]

export function PaymentsEarnings() {
  const { setCurrentPage, currentUser } = useAppStore()
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')

  const filteredTransactions = mockTransactions.filter(t => {
    if (filter === 'all') return true
    if (filter === 'pending') return t.status === 'pending'
    if (filter === 'completed') return t.status === 'completed'
    return true
  })

  const totalEarnings = 45500
  const escrowBalance = 8500
  const availableBalance = 37000

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earned':
        return <TrendingUp size={20} className="text-primary" />
      case 'escrow':
        return <Wallet size={20} className="text-accent" />
      case 'withdrawal':
        return <ArrowRight size={20} className="text-destructive" />
      default:
        return <DollarSign size={20} className="text-primary" />
    }
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
            onClick={() => setCurrentPage('dashboard')}
            className="p-2 hover:bg-secondary rounded-lg transition"
          >
            <ArrowLeft size={24} className="text-foreground" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">
            {currentUser?.role === 'worker' ? 'Earnings' : 'Payments'}
          </h1>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* Balance Cards */}
        {currentUser?.role === 'worker' && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
          >
            {/* Total Earnings */}
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl p-6 text-primary-foreground">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm opacity-90">Total Earnings</p>
                <TrendingUp size={24} />
              </div>
              <h2 className="text-3xl font-bold">₦{totalEarnings.toLocaleString()}</h2>
            </div>

            {/* In Escrow */}
            <div className="bg-gradient-to-br from-accent to-accent/80 rounded-xl p-6 text-primary-foreground">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm opacity-90">In Escrow</p>
                <Wallet size={24} />
              </div>
              <h2 className="text-3xl font-bold">₦{escrowBalance.toLocaleString()}</h2>
            </div>

            {/* Available Balance */}
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl p-6 text-primary-foreground">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm opacity-90">Available</p>
                <CreditCard size={24} />
              </div>
              <h2 className="text-3xl font-bold">₦{availableBalance.toLocaleString()}</h2>
            </div>
          </motion.div>
        )}

        {/* Employer Budget */}
        {currentUser?.role === 'employer' && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-gradient-to-br from-primary to-primary/80 rounded-xl p-6 text-primary-foreground mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm opacity-90">Budget Spent</p>
              <CreditCard size={24} />
            </div>
            <h2 className="text-3xl font-bold">₦145,500</h2>
            <p className="text-sm opacity-90 mt-2">From 12 active jobs</p>
            <p className="text-xs opacity-70 mt-3">Payments processed via Paystack</p>
          </motion.div>
        )}

        {/* Action Buttons */}
        {currentUser?.role === 'worker' && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6"
          >
            <div>
              <button className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:opacity-90 transition font-medium flex items-center justify-center gap-2">
                <CreditCard size={20} />
                Withdraw via Paystack
              </button>
              <p className="text-xs text-muted-foreground text-center mt-1">Funds sent directly to your bank account</p>
            </div>
            <button
              onClick={() => setCurrentPage('bookings')}
              className="bg-card text-foreground py-3 rounded-lg hover:bg-opacity-80 transition font-medium flex items-center justify-center gap-2"
            >
              <Wallet size={20} />
              View Bookings
            </button>
          </motion.div>
        )}

        {/* Filter Tabs */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex gap-2 mb-4"
        >
          {(['all', 'pending', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition capitalize ${filter === f
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-foreground hover:bg-opacity-80'
                }`}
            >
              {f}
            </button>
          ))}
        </motion.div>

        {/* Transactions List */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          {filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="bg-card rounded-lg p-4 flex items-center justify-between hover:bg-opacity-80 transition"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="p-3 bg-background rounded-lg">
                  {getTransactionIcon(transaction.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{transaction.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{transaction.jobTitle}</p>
                  <p className="text-xs text-muted-foreground">{transaction.date}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`font-bold text-lg ${transaction.type === 'earned' || transaction.type === 'escrow'
                  ? 'text-primary'
                  : 'text-destructive'
                  }`}>
                  {transaction.amount}
                </p>
                <span className={`text-xs px-2 py-1 rounded capitalize ${transaction.status === 'completed'
                  ? 'bg-primary/15 dark:bg-primary/15 text-primary dark:text-primary'
                  : 'bg-accent/15 dark:bg-accent/20 text-accent dark:text-accent'
                  }`}>
                  {transaction.status}
                </span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}