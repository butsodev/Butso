'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle, AlertCircle, Info, Trash2 } from 'lucide-react'
import { goBackTo, useAppStore } from '@/lib/store'
import { timeAgo } from '@/lib/data'
import { markNotificationRead, markAllNotificationsRead, deleteNotification } from '@/lib/dataNotifications'
import { showToast } from '@/lib/toast'

export function Notifications() {
  const { notifications, currentUser, setCurrentPage } = useAppStore()

  const handleDelete = async (id: string) => {
    const error = await deleteNotification(id)
    if (error) showToast('error', 'Could not delete that notification.')
  }

  const handleMarkAsRead = (id: string, alreadyRead: boolean, type?: string) => {
    if (!alreadyRead) markNotificationRead(id)
    // Requests are answered in Messages
    if (type === 'request') setCurrentPage('messaging')
  }

  const handleMarkAll = async () => {
    if (!currentUser) return
    const error = await markAllNotificationsRead(currentUser.id)
    if (error) showToast('error', 'Could not mark everything as read.')
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <AlertCircle size={24} className="text-accent" />
      case 'booking':
      case 'application':
      case 'review':
      case 'request':
        return <CheckCircle size={24} className="text-primary" />
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
            <button aria-label="Go back"
              onClick={() => goBackTo('dashboard')}
              className="p-2 hover:bg-secondary rounded-lg transition"
            >
              <ArrowLeft size={24} className="text-foreground" />
            </button>
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          </div>
          {unreadCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                {unreadCount} New
              </span>
              <button
                onClick={handleMarkAll}
                className="text-xs font-semibold text-primary hover:underline px-2 min-h-[44px]"
              >
                Mark all read
              </button>
            </div>
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
              onClick={() => handleMarkAsRead(notification.id, notification.read, notification.type)}
              className={`rounded-lg p-4 flex items-start gap-4 cursor-pointer transition ${notification.read
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
                  {notification.body}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {timeAgo(notification.createdAt)}
                </p>
              </div>
              <button aria-label="Delete notification"
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