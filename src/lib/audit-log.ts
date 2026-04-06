export type AuditEventType = 
  | 'data:refresh
  | 'settings:chan
  | 'user:logout'
export interface Audi
  timestamp: num
  userId: number

  severity: 'low' | 'medium' | 'high' | 'critical'

  userId?: number
  dateFrom?: number
  severity?: Aud

  eventType: Aud
  userName: 
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
  logs: AuditLogEntry[],
): AuditLogEntry[] {
    if (filter.use
    if (fi
    if (filter.severity && !filter.severity.includes(log.severity)) retur
  })

  const hea
    log.id,
    log.eve
    log.user
    log.seve
  ]
 

  
}











