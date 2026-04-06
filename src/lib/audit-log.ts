export type AuditEventType = 
  | 'data:refresh'
  | 'data:export'
  | 'settings:change'
  | 'user:login'
  | 'user:logout'
  | 'role:update'
  | 'permission:grant'
  | 'permission:revoke'
  | 'annotation:create'
  | 'annotation:update'
  | 'annotation:delete'
  | 'system:start'
  | 'system:stop'

export interface AuditLogEntry {
  id: string
  timestamp: number
  userId: number
  userName: string
  eventType: AuditEventType
  action: string
  details?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface AuditLogFilter {
  eventType?: AuditEventType
  userId?: number
  dateFrom?: number
  dateTo?: number
  severity?: 'low' | 'medium' | 'high' | 'critical'
}

export function createAuditLogEntry(
  userId: number,
  userName: string,
  eventType: AuditEventType,
  action: string,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'low',
  details?: string
): AuditLogEntry {
  return {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    userId,
    userName,
    eventType,
    action,
    severity,
    details
  }
}

export function filterAuditLogs(
  logs: AuditLogEntry[],
  filter: AuditLogFilter
): AuditLogEntry[] {
  return logs.filter(log => {
    if (filter.eventType && log.eventType !== filter.eventType) return false
    if (filter.userId && log.userId !== filter.userId) return false
    if (filter.dateFrom && log.timestamp < filter.dateFrom) return false
    if (filter.dateTo && log.timestamp > filter.dateTo) return false
    if (filter.severity && log.severity !== filter.severity) return false
    return true
  })
}

export function exportAuditLogsToCSV(logs: AuditLogEntry[]): string {
  const headers = ['Timestamp', 'User ID', 'User Name', 'Event Type', 'Action', 'Severity', 'Details']
  const rows = logs.map(log => [
    new Date(log.timestamp).toISOString(),
    log.userId.toString(),
    log.userName,
    log.eventType,
    log.action,
    log.severity,
    log.details || ''
  ])
  
  return [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')
}
