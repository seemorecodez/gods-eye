export type AuditEventType = 
  | 'permission:change'
  | 'data:refresh
  | 'annotation:edit'
  | 'threat:update'
  | 'camera:add'
  | 'role:update'
export interface Au
  timestamp: number
  userId: number
  action: string


  eventType?
  dateFrom?: number
  severity?: AuditLogEntry[

  eventType: Audit
  userName: stri
  details: Record<string, any>
): AuditLogEntry {
 

    userName,
    details,
  }

  return logs.fil
    if (filter.userId && log.userId !== 
 

}
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

export function filterAuditLogs(logs: AuditLogEntry[], filter: AuditLogFilter): AuditLogEntry[] {
  return logs.filter(log => {
    if (filter.eventType && !filter.eventType.includes(log.eventType)) return false
    if (filter.userId && log.userId !== filter.userId) return false
    if (filter.dateFrom && log.timestamp < filter.dateFrom) return false
    if (filter.dateTo && log.timestamp > filter.dateTo) return false
    if (filter.severity && !filter.severity.includes(log.severity)) return false
    return true
  })
}

export function exportAuditLogsToCSV(logs: AuditLogEntry[]): string {
  const headers = ['Timestamp', 'Event Type', 'User', 'Action', 'Severity', 'Details']



























