'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, AlertCircle, Info, Trash2, Calendar, Briefcase, Star, MessageCircle, ChevronRight } from 'lucide-react'
import { goBackTo, useAppStore, type Notification } from '@/lib/store'
import { timeAgo, refreshJobs } from '@/lib/data'
import { markNotificationRead, markAllNotificationsRead, deleteNotification } from '@/lib/dataNotifications'
import { showToast } from '@/lib/toast'

export function Notifications() {
  const { notifications, currentUser, setCurrentPage, setSelectedJobId, openReviews } = useAppStore()

  const handleDelete = async (id: string) => {
    const error = await deleteNotification(id)
    if (error) showToast('error', 'Could not delete that notification.')
  }

  // Tapping a notification marks it read and takes you to the thing it is about
  const handleOpen = async (n: Notification) => {
    if (!n.read) void markNotificationRead(n.id)

    switch (n.type) {
      case 'request':
      case 'message':
        setCurrentPage('messaging') // requests are answered in Messages
        return

      case 'booking':
        setCurrentPage('bookings')
        return

      case 'review':
        if (currentUser) openReviews(currentUser.id)
        return

      case 'payment':
        setCurrentPage('payments')
        return

      case 'application': {
        // Older notifications have no job attached, so just open the jobs list
        if (!n.refId) { setCurrentPage('jobs'); return }
        let job = useAppStore.getState().jobs.find(j => j.id === n.refId)
        if (!job) {
          await refreshJobs()
          job = useAppStore.getState().jobs.find(j => j.id === n.refId)
        }
        if (!job) { showToast('info', 'That job is no longer available.'); return }
        setSelectedJobId(job.id)
        // The employer sees who applied. The applicant sees the job.
        setCurrentPage(job.employerId === currentUser?.id ? 'job-applicants' : 'job-details')
        return
      }

      default:
        return
    }
  }

  const handleMarkAll = async () => {
    if (!currentUser) return
    const error = await markAllNotificationsRead(currentUser.id)
    if (error) showToast('error', 'Could not mark everything as read.')
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <AlertCircle size={22} className="text-accent" />
      case 'booking':
        return <Calendar size={22} className="text-primary" />
      case 'application':
        return <Briefcase size={22} className="text-primary" />
      case 'review':
        return <Star size={22} className="text-primary" />
      case 'request':
      case 'message':
        return <MessageCircle size={22} className="text-primary" />
      default:
        return <Info size={22} className="text-primary" />
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
              <motion.span
                key={unreadCount}
                initial={{ scale: 1.25 }}
                animate={{ scale: 1 }}
                className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full"
              >
                {unreadCount} New
              </motion.span>
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
          <AnimatePresence initial={false}>
            {notifications.map(notification => (
              <motion.div
                key={notification.id}
                layout
                initial={{ y: -16, opacity: 0, scale: 0.97 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ x: 40, opacity: 0 }}
                transition={{ duration: 0.25 }}
                role="button"
                tabIndex={0}
                onClick={() => { void handleOpen(notification) }}
                onKeyDown={e => { if (e.key === 'Enter') void handleOpen(notification) }}
                className={`rounded-lg p-4 flex items-start gap-4 cursor-pointer transition border ${notification.read
                  ? 'bg-card border-border hover:bg-secondary'
                  : 'bg-primary/10 border-primary/30 border-l-4 border-l-primary hover:bg-primary/15'
                  }`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-foreground ${notification.read ? 'font-semibold' : 'font-bold'}`}>
                    {notification.title}
                  </p>
                  <p className={`text-sm mt-1 ${notification.read ? 'text-muted-foreground' : 'text-foreground/80'}`}>
                    {notification.body}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {timeAgo(notification.createdAt)}
                  </p>
                </div>
                <div className="flex-shrink-0 flex items-center gap-1">
                  {!notification.read && <span aria-label="Unread" className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  <button aria-label="Delete notification"
                    onClick={(e) => {
                      e.stopPropagation()
                      void handleDelete(notification.id)
                    }}
                    className="p-2 hover:bg-secondary rounded-lg transition"
                  >
                    <Trash2 size={18} className="text-muted-foreground hover:text-foreground" />
                  </button>
                  <ChevronRight size={18} className="text-muted-foreground" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}
