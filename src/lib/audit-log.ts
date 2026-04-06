export type AuditEventType = 
  | 'data:export'
  | 'data:export'
  | 'data:refresh'
  | 'role:update'
export interface
  timestamp: numb

  action: string
  severity: 

  eventType?: AuditEventTyp
  dateFrom?: num
  severity?: Audit

  eventType: AuditEventType,
  severity: 'low' | 'medium' | 'high'
)

export interface AuditLogFilter {
  eventType?: AuditEventType[]
  userId?: number
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
  
  const rows = logs.map(log => [
    new Date(log.timestamp).toISOString(),
    log.eventType,
    log.userName,
    log.action,
    log.severity,
    JSON.stringify(log.details)
  ])
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')
  

}
