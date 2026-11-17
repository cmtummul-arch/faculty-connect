import { useEffect, useState } from 'react'

import { fetchNotifications, markNotificationRead } from '../../api/notificationsApi'
import { EmptyState } from '../../components/common/EmptyState'
import { SectionCard } from '../../components/common/SectionCard'
import { formatDateTime } from '../../utils/format'

export function NotificationsPage() {
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    let ignore = false

    const loadInitialNotifications = async () => {
      const data = await fetchNotifications()
      if (!ignore) {
        setNotifications(data)
      }
    }

    loadInitialNotifications()

    return () => {
      ignore = true
    }
  }, [])

  async function handleMarkRead(notificationId) {
    await markNotificationRead(notificationId)
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId
          ? { ...notification, is_read: true }
          : notification,
      ),
    )
  }

  return (
    <SectionCard
      title="Notifications"
      subtitle="Every appointment request, response, and system message stays visible here."
    >
      <div className="space-y-4">
        {notifications.length === 0 && (
          <EmptyState
            title="No notifications yet"
            copy="As soon as activity begins in appointments or the hub, updates will show up here."
          />
        )}
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="rounded-[24px] border border-slate-200 bg-white/90 p-5"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-semibold text-slate-900">{notification.title}</h2>
                  {!notification.is_read && (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                      Unread
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{notification.message}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                  {notification.kind} | {formatDateTime(notification.created_at)}
                </p>
              </div>
              {!notification.is_read && (
                <button
                  type="button"
                  onClick={() => handleMarkRead(notification.id)}
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
                >
                  Mark as read
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}
