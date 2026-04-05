import { DataSource } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, WarningCircle, XCircle, Database } from '@phosphor-icons/react'

interface DataSourceCardProps {
  dataSource: DataSource
}

export function DataSourceCard({ dataSource }: DataSourceCardProps) {
  const getStatusIcon = () => {
    switch (dataSource.status) {
      case 'active':
        return <CheckCircle size={20} weight="fill" style={{ color: 'oklch(0.70 0.20 145)' }} className="status-pulse" />
      case 'warning':
        return <WarningCircle size={20} weight="fill" style={{ color: 'oklch(0.75 0.18 80)' }} />
      case 'critical':
        return <XCircle size={20} weight="fill" style={{ color: 'oklch(0.60 0.22 25)' }} />
    }
  }

  const getStatusBadge = () => {
    switch (dataSource.status) {
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

      <div className="grid grid-cols-2 gap-4 text-sm">
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
    </Card>
  )
}
