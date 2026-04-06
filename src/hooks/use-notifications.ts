import { useKV } from '@github/spark/hooks'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { AuditLogEntry, AuditEventType } from '@/lib/audit-log'

export interface SystemNotification {
  id: string
  type: 'permission' | 'role' | 'data' | 'export' | 'alert' | 'security'
  title: string
  message: string
  timestamp: number
  userId?: number
  userName?: string
  severity: 'info' | 'warning' | 'error' | 'success'
  read: boolean
  actionType?: AuditEventType
  metadata?: Record<string, any>
}

export function useNotifications() {
  const [notifications, setNotifications] = useKV<SystemNotification[]>('system-notifications', [])
  const [unreadCount, setUnreadCount] = useKV<number>('unread-notification-count', 0)

  useEffect(() => {
    const count = (notifications || []).filter(n => !n.read).length
    setUnreadCount(count)
  }, [notifications])

  const addNotification = (notification: Omit<SystemNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: SystemNotification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      read: false
    }

    setNotifications(current => {
      const updated = [newNotification, ...(current || [])]
      return updated.slice(0, 500)
    })

    showToastForNotification(newNotification)
  }

  const markAsRead = (notificationId: string) => {
    setNotifications(current =>
      (current || []).map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(current =>
      (current || []).map(n => ({ ...n, read: true }))
    )
  }

  const deleteNotification = (notificationId: string) => {
    setNotifications(current =>
      (current || []).filter(n => n.id !== notificationId)
    )
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const getUnreadNotifications = () => {
    return (notifications || []).filter(n => !n.read)
  }

  return {
    notifications: notifications || [],
    unreadCount: unreadCount || 0,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    getUnreadNotifications
  }
}

function showToastForNotification(notification: SystemNotification) {
  const toastConfig = {
    description: notification.message,
    duration: 5000
  }

  switch (notification.severity) {
    case 'success':
      toast.success(notification.title, toastConfig)
      break
    case 'warning':
      toast.warning(notification.title, toastConfig)
      break
    case 'error':
      toast.error(notification.title, toastConfig)
      break
    default:
      toast(notification.title, toastConfig)
  }
}

export function createNotificationFromAuditLog(
  entry: AuditLogEntry
): Omit<SystemNotification, 'id' | 'timestamp' | 'read'> | null {
  const eventTypeMap: Record<string, { type: SystemNotification['type'], severity: SystemNotification['severity'], title: string }> = {
    'permission:change': {
      type: 'permission',
      severity: 'warning',
      title: 'Permission Changed'
    },
    'role:update': {
      type: 'role',
      severity: 'warning',
      title: 'Role Updated'
    },
    'data:refresh': {
      type: 'data',
      severity: 'info',
      title: 'Data Refreshed'
    },
    'data:export': {
      type: 'export',
      severity: 'success',
      title: 'Data Exported'
    },
    'threat:create': {
      type: 'security',
      severity: 'error',
      title: 'Threat Alert Created'
    },
    'alert:acknowledge': {
      type: 'alert',
      severity: 'info',
      title: 'Alert Acknowledged'
    }
  }

  const config = eventTypeMap[entry.eventType]
  if (!config) return null

  return {
    type: config.type,
    severity: config.severity,
    title: config.title,
    message: entry.action,
    userId: entry.userId,
    userName: entry.userName,
    actionType: entry.eventType,
    metadata: entry.details
  }
}
