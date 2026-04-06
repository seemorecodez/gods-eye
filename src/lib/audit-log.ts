export type AuditEventType = 
  | 'data:export'
  | 'data:refresh'
  | 'role:update'

  userName: string
  details: R
}
export interface AuditLogFi
  userId?: numbe
  dateTo?: number
}
export function createAuditLog
  userId: number,
 

  return {
    timestamp: Date.now(),
    userId,
    action,
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


































