import { DataSource } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, WarningCircle, XCircle, Database, ArrowsClockwise, Clock } from '@phosphor-icons/react'
import { healthMonitor, ReconnectionAttempt } from '@/lib/health-monitor'
import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'

interface DataSourceCardProps {
  dataSource: DataSource
  healthStatus?: 'active' | 'warning' | 'critical'
}

export function DataSourceCard({ dataSource, healthStatus }: DataSourceCardProps) {
  const [metrics, setMetrics] = useState({ avgResponseTime: 0, successRate: 0, totalChecks: 0, uptime: 0 })
  const [reconnectionStatus, setReconnectionStatus] = useState<ReconnectionAttempt | undefined>(undefined)

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(healthMonitor.getMetrics(dataSource.id))
      setReconnectionStatus(healthMonitor.getReconnectionStatus(dataSource.id))
    }, 2000)

    setMetrics(healthMonitor.getMetrics(dataSource.id))
    setReconnectionStatus(healthMonitor.getReconnectionStatus(dataSource.id))

    return () => clearInterval(interval)
  }, [dataSource.id])

  const status = healthStatus || dataSource.status
  const getStatusIcon = () => {
    switch (status) {
      case 'active':
        return <CheckCircle size={20} weight="fill" style={{ color: 'oklch(0.70 0.20 145)' }} className="status-pulse" />
      case 'warning':
        return <WarningCircle size={20} weight="fill" style={{ color: 'oklch(0.75 0.18 80)' }} />
      case 'critical':
        return <XCircle size={20} weight="fill" style={{ color: 'oklch(0.60 0.22 25)' }} />
    }
  }

  const getStatusBadge = () => {
    switch (status) {
      case 'active':
        return <Badge className="bg-[oklch(0.70_0.20_145)] text-background border-0">ONLINE</Badge>
      case 'warning':
        return <Badge className="bg-[oklch(0.75_0.18_80)] text-background border-0">DEGRADED</Badge>
      case 'critical':
        return <Badge className="bg-[oklch(0.60_0.22_25)] text-background border-0">OFFLINE</Badge>
    }
  }

  return (
    <Card className="p-6 border-border bg-card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Database size={24} className="text-accent" />
          <div>
            <h3 className="font-semibold text-card-foreground">{dataSource.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{dataSource.repository}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          {getStatusBadge()}
        </div>
      </div>

      {reconnectionStatus && (
        <div className="mb-4 p-3 bg-[oklch(0.60_0.22_25_/_0.1)] border border-[oklch(0.60_0.22_25)] rounded-md">
          <div className="flex items-center gap-2 mb-2">
            <ArrowsClockwise size={16} className="text-[oklch(0.60_0.22_25)] animate-spin" />
            <span className="text-sm font-medium text-[oklch(0.60_0.22_25)]">
              Reconnecting... (Attempt {reconnectionStatus.attempt}/10)
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock size={12} />
            <span>Next retry {formatDistanceToNow(reconnectionStatus.nextRetry, { addSuffix: true })}</span>
          </div>
          <div className="mt-2">
            <Progress value={(reconnectionStatus.attempt / 10) * 100} className="h-1" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <div>
          <span className="text-muted-foreground block mb-1">Last Sync</span>
          <span className="text-card-foreground font-medium">{dataSource.lastSync}</span>
        </div>
        <div>
          <span className="text-muted-foreground block mb-1">Records</span>
          <span className="text-card-foreground font-medium">{dataSource.recordCount.toLocaleString()}</span>
        </div>
        <div className="col-span-2">
          <span className="text-muted-foreground block mb-1">Coverage</span>
          <span className="text-card-foreground font-medium">{dataSource.coverageArea}</span>
        </div>
      </div>

      {metrics.totalChecks > 0 && (
        <div className="pt-4 border-t border-border">
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-muted-foreground block mb-1">Uptime</span>
              <span className="text-card-foreground font-medium">{metrics.uptime.toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-muted-foreground block mb-1">Avg Response</span>
              <span className="text-card-foreground font-medium">{metrics.avgResponseTime}ms</span>
            </div>
            <div>
              <span className="text-muted-foreground block mb-1">Health Checks</span>
              <span className="text-card-foreground font-medium">{metrics.totalChecks}</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
