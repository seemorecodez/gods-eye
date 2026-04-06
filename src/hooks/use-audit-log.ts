import { useKV } from '@github/spark/hooks'
import { useAuth } from './use-auth'
import { createAuditEntry, AuditLogEntry, AuditEventType } from '@/lib/audit-log'
import { useNotifications, createNotificationFromAuditLog } from './use-notifications'

export function useAuditLog() {
  const [auditLogs, setAuditLogs] = useKV<AuditLogEntry[]>('audit-logs', [])
  const { session } = useAuth()
  const { addNotification } = useNotifications()

  const logEvent = (
    eventType: AuditEventType,
    action: string,
    details: Record<string, any> = {},
    severity: AuditLogEntry['severity'] = 'low'
  ) => {
    if (!session) {
      console.warn('Cannot log audit event: no session')
      return
    }

    const entry = createAuditEntry(
      eventType,
      session.userId,
      session.login,
      action,
      details,
      severity
    )

    setAuditLogs(current => {
      const updated = [...(current || []), entry]
      return updated.slice(-10000)
    })

    const shouldNotify = ['permission:change', 'role:update', 'threat:create', 'data:export', 'alert:acknowledge']
    if (shouldNotify.includes(eventType)) {
      const notification = createNotificationFromAuditLog(entry)
      if (notification) {
        addNotification(notification)
      }
    }
  }

  return {
    auditLogs: auditLogs || [],
    logEvent
  }
}
