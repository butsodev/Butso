'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle, AlertCircle, Info, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useAppStore } from '@/lib/store'

const mockNotifications = [
  {
    id: 1,
    type: 'success',
    title: 'Job Completed',
    message: 'Your carpentry job has been marked as completed',
    timestamp: '2 hours ago',
    read: false,
  },
  {
    id: 2,
    type: 'info',
    title: 'New Job Match',
    message: 'A new painting job matches your skills',
    timestamp: '5 hours ago',
    read: false,
  },
  {
    id: 3,
    type: 'warning',
    title: 'Payment Pending',
    message: 'Release payment for completed carpentry work',
    timestamp: '1 day ago',
    read: true,
  },
  {
    id: 4,
    type: 'success',
    title: 'Booking Confirmed',
    message: 'Your booking with John Okafor is confirmed',
    timestamp: '2 days ago',
    read: true,
  },
  {
    id: 5,
    type: 'info',
    title: 'Review Received',
    message: 'You received a 5-star review from a client',
    timestamp: '3 days ago',
    read: true,
  },
  {
    id: 6,
    type: 'success',
    title: 'Application Accepted',
    message: 'Your application for electrical work has been accepted',
    timestamp: '4 days ago',
    read: true,
  },
]

export function Notifications() {
  const { setCurrentPage } = useAppStore()
  const [notifications, setNotifications] = useState(mockNotifications)

  const handleDelete = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id))
  }

  const handleMarkAsRead = (id: number) => {
    setNotifications(
      notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      )
    )
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={24} className="text-green-600" />
      case 'warning':
        return <AlertCircle size={24} className="text-orange-600" />
      case 'info':
        return <Info size={24} className="text-blue-600" />
      default:
        return <Info size={24} className="text-primary" />
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background text-foreground pb-20"
    >
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background border-b border-border">
        <div className="flex items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className="p-2 hover:bg-secondary rounded-lg transition"
            >
              <ArrowLeft size={24} className="text-foreground" />
            </button>
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          </div>
          {unreadCount > 0 && (
            <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
              {unreadCount} New
            </span>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col items-center justify-center min-h-96 text-center p-4"
        >
          <Info size={48} className="text-muted-foreground mb-4 opacity-50" />
          <p className="text-lg font-medium text-foreground mb-2">No notifications yet</p>
          <p className="text-muted-foreground">You&apos;re all caught up!</p>
        </motion.div>
      ) : (
        <div className="p-4 sm:p-6 space-y-3">
          {notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleMarkAsRead(notification.id)}
              className={`rounded-lg p-4 flex items-start gap-4 cursor-pointer transition ${
                notification.read
                  ? 'bg-card hover:bg-opacity-80'
                  : 'bg-primary bg-opacity-10 border-l-4 border-primary'
              }`}
            >
              <div className="flex-shrink-0 mt-1">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-foreground ${!notification.read ? 'font-bold' : ''}`}>
                  {notification.title}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {notification.message}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {notification.timestamp}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(notification.id)
                }}
                className="flex-shrink-0 p-2 hover:bg-secondary rounded-lg transition"
              >
                <Trash2 size={18} className="text-muted-foreground hover:text-foreground" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
