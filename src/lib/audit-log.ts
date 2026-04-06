export type AuditEventType = 
  | 'data:refresh'
  | 'data:export'
  | 'settings:change'
  | 'settings:update'
  | 'user:logout'
  | 'user:login'
  | 'role:update'
  | 'permission:change'
  | 'permission:revoke'
  | 'system:start'
  | 'annotation:create'
  | 'annotation:edit'
  | 'annotation:delete'
  | 'ml:prediction'
  | 'threat:create'
  | 'threat:update'
  | 'camera:add'
  | 'camera:remove'
  | 'alert:acknowledge'

export interface AuditLogEntry {
  id: string
  timestamp: number
  userId: number
  userName: string
  eventType: AuditEventType
  action: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  details?: string
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
  severity: AuditLogEntry['severity'] = 'low',
  details?: string
): AuditLogEntry {
  return {
    id: crypto.randomUUID(),
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
  const rows = logs.map(log => [
    log.id,
    new Date(log.timestamp).toISOString(),
    log.userId.toString(),
    log.userName,
    log.eventType,
    log.action,
    log.severity
  ])
  return [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')
}











