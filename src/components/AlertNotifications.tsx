import { Bell, X, CheckCircle, WarningCircle, XCircle, ArrowsClockwise } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { HealthAlert } from '@/lib/health-monitor'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'

interface AlertNotificationsProps {
  alerts: HealthAlert[]
  onAcknowledge: (alertId: string) => void
  onAcknowledgeAll: () => void
}

export function AlertNotifications({ alerts, onAcknowledge, onAcknowledgeAll }: AlertNotificationsProps) {
  const getAlertIcon = (type: HealthAlert['alertType']) => {
    switch (type) {
      case 'offline':
        return <XCircle size={20} weight="fill" className="text-[oklch(0.60_0.22_25)]" />
      case 'degraded':
        return <WarningCircle size={20} weight="fill" className="text-[oklch(0.75_0.18_80)]" />
      case 'slow_sync':
        return <WarningCircle size={20} weight="fill" className="text-[oklch(0.75_0.18_80)]" />
      case 'reconnected':
        return <CheckCircle size={20} weight="fill" className="text-[oklch(0.70_0.20_145)]" />
    }
  }

  const getAlertBadge = (type: HealthAlert['alertType']) => {
    switch (type) {
      case 'offline':
        return <Badge className="bg-[oklch(0.60_0.22_25)] text-white border-0">OFFLINE</Badge>
      case 'degraded':
        return <Badge className="bg-[oklch(0.75_0.18_80)] text-background border-0">DEGRADED</Badge>
      case 'slow_sync':
        return <Badge className="bg-[oklch(0.75_0.18_80)] text-background border-0">SLOW SYNC</Badge>
      case 'reconnected':
        return <Badge className="bg-[oklch(0.70_0.20_145)] text-background border-0">RECONNECTED</Badge>
    }
  }

  if (alerts.length === 0) {
    return null
  }

  return (
    <Card className="p-4 border-border bg-card mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell size={20} className="text-accent" weight="fill" />
          <h3 className="font-semibold text-card-foreground">
            System Alerts ({alerts.length})
          </h3>
        </div>
        {alerts.length > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={onAcknowledgeAll}
            className="text-xs"
          >
            <CheckCircle size={16} className="mr-1" />
            Acknowledge All
          </Button>
        )}
      </div>

      <ScrollArea className="max-h-[400px]">
        <div className="space-y-2">
          <AnimatePresence>
            {alerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="p-4 border-border bg-card/50">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      {getAlertIcon(alert.alertType)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-card-foreground text-sm">
                            {alert.dataSourceName}
                          </span>
                          {getAlertBadge(alert.alertType)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {alert.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onAcknowledge(alert.id)}
                      className="shrink-0"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </Card>
  )
}
