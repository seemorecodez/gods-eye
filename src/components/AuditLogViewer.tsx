import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useKV } from '@github/spark/hooks'
import { AuditLogEntry, AuditEventType, filterAuditLogs, exportAuditLogsToCSV } from '@/lib/audit-log'
import { ClipboardText, Download, Funnel, MagnifyingGlass, Warning } from '@phosphor-icons/react'
import { useState, useMemo } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

export function AuditLogViewer() {
  const [auditLogs, setAuditLogs] = useKV<AuditLogEntry[]>('audit-logs', [])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterEventType, setFilterEventType] = useState<string>('all')
  const [filterSeverity, setFilterSeverity] = useState<string>('all')

  const eventTypes: Array<{ value: string; label: string }> = [
    { value: 'all', label: 'All Events' },
    { value: 'permission:change', label: 'Permission Changes' },
    { value: 'role:update', label: 'Role Updates' },
    { value: 'data:refresh', label: 'Data Refreshes' },
    { value: 'data:export', label: 'Data Exports' },
    { value: 'annotation:create', label: 'Annotation Created' },
    { value: 'annotation:edit', label: 'Annotation Edited' },
    { value: 'annotation:delete', label: 'Annotation Deleted' },
    { value: 'ml:prediction', label: 'ML Predictions' },
    { value: 'threat:create', label: 'Threat Created' },
    { value: 'threat:update', label: 'Threat Updated' },
    { value: 'camera:add', label: 'Camera Added' },
    { value: 'camera:remove', label: 'Camera Removed' },
    { value: 'settings:update', label: 'Settings Updated' },
    { value: 'alert:acknowledge', label: 'Alert Acknowledged' }
  ]

  const severityLevels: Array<{ value: string; label: string }> = [
    { value: 'all', label: 'All Severities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ]

  const filteredLogs = useMemo(() => {
    let logs = auditLogs || []

    const filters: any = {}
    
    if (filterEventType !== 'all') {
      filters.eventType = [filterEventType as AuditEventType]
    }
    
    if (filterSeverity !== 'all') {
      filters.severity = [filterSeverity as AuditLogEntry['severity']]
    }

    if (Object.keys(filters).length > 0) {
      logs = filterAuditLogs(logs, filters)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      logs = logs.filter(log =>
        log.action.toLowerCase().includes(query) ||
        log.userName.toLowerCase().includes(query) ||
        log.eventType.toLowerCase().includes(query) ||
        JSON.stringify(log.details).toLowerCase().includes(query)
      )
    }

    return logs.sort((a, b) => b.timestamp - a.timestamp)
  }, [auditLogs, filterEventType, filterSeverity, searchQuery])

  const handleExportCSV = () => {
    try {
      const csv = exportAuditLogsToCSV(filteredLogs)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `audit-log-${Date.now()}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success('Audit log exported successfully')
    } catch (error) {
      toast.error('Failed to export audit log')
      console.error(error)
    }
  }

  const getSeverityColor = (severity: AuditLogEntry['severity']) => {
    switch (severity) {
      case 'high':
        return 'bg-red-500/20 text-red-300 border-red-500/30'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'low':
        return 'bg-green-500/20 text-green-300 border-green-500/30'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  const getEventTypeColor = (eventType: AuditEventType) => {
    if (eventType.startsWith('permission') || eventType.startsWith('role')) {
      return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    }
    if (eventType.startsWith('data')) {
      return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    }
    if (eventType.startsWith('annotation') || eventType.startsWith('ml')) {
      return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
    }
    if (eventType.startsWith('threat') || eventType.startsWith('alert')) {
      return 'bg-red-500/20 text-red-300 border-red-500/30'
    }
    return 'bg-muted text-muted-foreground border-border'
  }

  const clearFilters = () => {
    setFilterEventType('all')
    setFilterSeverity('all')
    setSearchQuery('')
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
              <ClipboardText size={24} className="text-accent" weight="fill" />
              AUDIT LOG
            </CardTitle>
            <CardDescription>
              Complete history of all permission-based actions and system events
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="text-lg px-4 py-2">
              {filteredLogs.length} Entries
            </Badge>
            <Button size="sm" variant="secondary" onClick={handleExportCSV}>
              <Download size={16} className="mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">
              <MagnifyingGlass size={16} className="inline mr-1" />
              Search
            </Label>
            <Input
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">
              <Funnel size={16} className="inline mr-1" />
              Event Type
            </Label>
            <Select value={filterEventType} onValueChange={setFilterEventType}>
              <SelectTrigger>
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">
              <Warning size={16} className="inline mr-1" />
              Severity
            </Label>
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger>
                <SelectValue placeholder="Select severity" />
              </SelectTrigger>
              <SelectContent>
                {severityLevels.map(level => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {(filterEventType !== 'all' || filterSeverity !== 'all' || searchQuery) && (
          <div className="mt-4">
            <Button size="sm" variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardText size={64} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No audit log entries found</p>
          </div>
        ) : (
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-3">
              {filteredLogs.map(log => (
                <div
                  key={log.id}
                  className="rounded-lg border border-border bg-card p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className={`text-xs ${getSeverityColor(log.severity)}`}
                      >
                        {log.severity.toUpperCase()}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getEventTypeColor(log.eventType)}`}
                      >
                        {log.eventType}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(log.timestamp, { addSuffix: true })}
                    </div>
                  </div>

                  <div className="mb-2">
                    <p className="text-sm font-semibold text-foreground">{log.action}</p>
                    <p className="text-xs text-muted-foreground">by {log.userName}</p>
                  </div>

                  {log.details && Object.keys(log.details).length > 0 && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-lg border border-border">
                      <div className="text-xs font-semibold text-foreground mb-2">Details:</div>
                      <div className="space-y-1 font-mono text-xs">
                        {Object.entries(log.details).map(([key, value]) => (
                          <div key={key} className="flex items-start gap-2">
                            <span className="text-muted-foreground min-w-[120px]">{key}:</span>
                            <span className="text-foreground break-all">
                              {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
