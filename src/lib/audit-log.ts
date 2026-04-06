export type AuditEventType = 
  | 'data:refresh'
  | 'settings:change'
  | 'user:logout'
  | 'user:login'
  | 'role:update'
  | 'permission:revoke
  | 'system:start'

  id: string
  userId: number

  severity: 'low' | 'medium' | '
}
export interface Au
  eventType?: Au
  userName: string
  eventType: AuditEventType
  action: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface AuditLogFilter {
  userId?: number
  eventType?: AuditEventType
  dateFrom?: number
  dateTo?: number
  severity?: AuditLogEntry['severity'][]
}

export function createAuditLogEntry(
  eventType: AuditEventType,
  userId: number,
  userName: string,
  action: string,
  severity: AuditLogEntry['severity'] = 'low'
): AuditLogEntry {
  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    userId,
    userName,
    eventType,
    action,
    severity
  }
}

export function filterAuditLogs(
  logs: AuditLogEntry[],
  filter: AuditLogFilter
): AuditLogEntry[] {
  return logs.filter(log => {
    if (filter.userId && log.userId !== filter.userId) return false
    if (filter.eventType && log.eventType !== filter.eventType) return false
    if (filter.dateFrom && log.timestamp < filter.dateFrom) return false
    if (filter.dateTo && log.timestamp > filter.dateTo) return false
    if (filter.severity && !filter.severity.includes(log.severity)) return false
    return true
  })
}

export function exportAuditLogsAsCSV(logs: AuditLogEntry[]): string {
  const headers = ['ID', 'Timestamp', 'User ID', 'User Name', 'Event Type', 'Action', 'Severity']
  ])
  return [
    ...rows.map(row => row.map(cell => `"$
}











