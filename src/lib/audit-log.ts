export type AuditEventType = 
  | 'data:export'
  | 'data:refresh'
  | 'role:update'
  | 'settings:change'
  | 'user:login'
  | 'user:logout'

export interface AuditLogEntry<R = Record<string, any>> {
  id: string
  timestamp: number
  eventType: AuditEventType
  userId: number
  userName: string
  action: string
  details: R
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
  details: Record<string, any>,
  severity: AuditLogEntry['severity'] = 'low'
): AuditLogEntry {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    eventType,
    userId,
    userName,
    action,
    details,
    severity
  }
}

export function filterAuditLogs(
  logs: AuditLogEntry[],
  filter: AuditLogFilter
): AuditLogEntry[] {
  return logs.filter(log => {
    if (filter.userId !== undefined && log.userId !== filter.userId) return false
    if (filter.eventType && log.eventType !== filter.eventType) return false
    if (filter.dateFrom && log.timestamp < filter.dateFrom) return false
    if (filter.dateTo && log.timestamp > filter.dateTo) return false
    if (filter.severity && !filter.severity.includes(log.severity)) return false
    return true
  })
}

export function exportAuditLogsToCSV(logs: AuditLogEntry[]): string {
  const headers = ['ID', 'Timestamp', 'Event Type', 'User ID', 'User Name', 'Action', 'Severity', 'Details']
  const rows = logs.map(log => [
    log.id,
    new Date(log.timestamp).toISOString(),
    log.eventType,
    log.userId.toString(),
    log.userName,
    log.action,
    log.severity,
    JSON.stringify(log.details)
  ])
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')
  
  return csvContent
}
