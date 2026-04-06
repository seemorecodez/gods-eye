export type AuditEventType = 
  | 'data:refresh'
  | 'settings:change'
  | 'user:logout'
  | 'role:update
  | 'permission:r
  | 'annotation:create'
  | 'annotation:de

export interface AuditLogEntry {
  id: string
  timestamp: number
  userId: number
  userName: string
  eventType: AuditEventType
  action: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

  severity: 'low' | 'medium' | 'h
}
export interface AuditLogFil
  eventType?: Audit
  dateTo?: number
}
e

  action: string,
  details?: string
  return {
    timestamp: Date
    userName,
    action,
    details
}
export function filterAuditL
  filter: AuditLogFilter
  return lo
    if (filte
    if (filter
    return 
}
exp
 

    log.userName,
    log.action,
  ])
    headers.join(','
  ].join('\n')




































