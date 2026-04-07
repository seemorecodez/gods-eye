import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { ExportButton } from '@/components/ExportButton'
import { Warning, Play, Stop, Spinner, Shield, ChartLine, Target } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  StreamingThreatAlert,
  RealTimeMetrics,
  streamingThreatMonitor
} from '@/lib/ai-streaming-monitor'

const SEVERITY_COLORS = {
  LOW: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  MODERATE: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/30'
}

const CATEGORY_ICONS = {
  cyber: '🛡️',
  military: '⚔️',
  social: '👥',
  environmental: '🌍',
  economic: '💰'
}

export function AIStreamingThreatMonitor() {
  const [alerts, setAlerts] = useKV<StreamingThreatAlert[]>('streaming-threat-alerts', [])
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [metrics, setMetrics] = useState<RealTimeMetrics | null>(null)
  const [pollingInterval, setPollingInterval] = useState(15)

  const currentAlerts = alerts || []

  useEffect(() => {
    const unsubscribeAlert = streamingThreatMonitor.onAlert((alert) => {
      setAlerts((current) => [alert, ...(current || [])].slice(0, 50))
    })

    const unsubscribeMetrics = streamingThreatMonitor.onMetricsUpdate((newMetrics) => {
      setMetrics(newMetrics)
    })

    return () => {
      unsubscribeAlert()
      unsubscribeMetrics()
    }
  }, [setAlerts])

  const startMonitoring = async () => {
    try {
      await streamingThreatMonitor.startMonitoring(pollingInterval * 1000)
      setIsMonitoring(true)
      toast.success('Real-time monitoring started', {
        description: `Scanning every ${pollingInterval} seconds`
      })
    } catch (error) {
      console.error('Error starting monitoring:', error)
      toast.error('Failed to start monitoring')
    }
  }

  const stopMonitoring = () => {
    streamingThreatMonitor.stopMonitoring()
    setIsMonitoring(false)
    const finalMetrics = streamingThreatMonitor.getMetrics()
    setMetrics(finalMetrics)
    toast.info('Real-time monitoring stopped')
  }

  const clearAlerts = () => {
    setAlerts([])
    streamingThreatMonitor.clearAlerts()
    toast.success('Alerts cleared')
  }

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    
    if (hours > 0) return `${hours}h ${minutes}m`
    if (minutes > 0) return `${minutes}m ${secs}s`
    return `${secs}s`
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">AI STREAMING THREAT MONITOR</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Continuous real-time AI analysis for emerging threats across all intelligence categories
        </p>

        <Card className="bg-card border-border p-6 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                SCAN INTERVAL: {pollingInterval}s
              </label>
              <Slider
                value={[pollingInterval]}
                onValueChange={(values) => setPollingInterval(values[0])}
                min={10}
                max={60}
                step={5}
                disabled={isMonitoring}
                className="mb-2"
              />
              <p className="text-[10px] text-muted-foreground">
                Recommended: 15-30 seconds for balanced monitoring
              </p>
            </div>

            <div className="flex items-end gap-2">
              {!isMonitoring ? (
                <Button
                  onClick={startMonitoring}
                  className="bg-accent text-accent-foreground hover:bg-accent/90 flex-1"
                >
                  <Play size={18} className="mr-2" weight="fill" />
                  Start Monitoring
                </Button>
              ) : (
                <Button
                  onClick={stopMonitoring}
                  variant="destructive"
                  className="flex-1"
                >
                  <Stop size={18} className="mr-2" weight="fill" />
                  Stop Monitoring
                </Button>
              )}
              
              {currentAlerts.length > 0 && (
                <ExportButton
                  data={currentAlerts as unknown as Record<string, unknown>[]}
                  filename="streaming-threats"
                  type="threats"
                />
              )}

              <Button
                onClick={clearAlerts}
                variant="outline"
                size="sm"
                disabled={currentAlerts.length === 0}
              >
                Clear
              </Button>
            </div>
          </div>

          {isMonitoring && (
            <div className="flex items-center gap-2 p-3 bg-accent/10 rounded border border-accent/30">
              <Spinner size={20} className="text-accent animate-spin" />
              <span className="text-sm text-foreground font-medium">
                Active Monitoring - Scanning for threats...
              </span>
            </div>
          )}
        </Card>

        {metrics && (
          <Card className="bg-card border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <ChartLine size={20} className="text-accent" weight="bold" />
              <h3 className="font-semibold text-foreground">Real-Time Metrics</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Threats Detected</p>
                <p className="text-2xl font-bold text-foreground">{metrics.threatsDetected}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Avg Severity</p>
                <p className="text-2xl font-bold text-foreground">{metrics.averageSeverity.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Most Active Region</p>
                <p className="text-sm font-medium text-foreground truncate">{metrics.mostActiveRegion}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Most Active Category</p>
                <p className="text-sm font-medium text-foreground">{metrics.mostActiveCategory}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Uptime</p>
                <p className="text-lg font-bold text-foreground">{formatUptime(metrics.uptime)}</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      <ScrollArea className="h-[600px]">
        <div className="space-y-3 pr-4">
          <AnimatePresence>
            {currentAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card className={`p-4 border-l-4 ${SEVERITY_COLORS[alert.severity]}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{CATEGORY_ICONS[alert.category]}</span>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground text-sm">{alert.title}</h4>
                          <Badge className={SEVERITY_COLORS[alert.severity]}>
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {alert.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {alert.region}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-xs text-foreground mb-3">
                    {alert.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground mb-1">DETECTION METHOD</p>
                      <Badge variant="secondary" className="text-xs">
                        {alert.detectionMethod}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground mb-1">DATA SOURCE</p>
                      <Badge variant="secondary" className="text-xs">
                        {alert.dataSource}
                      </Badge>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-[10px] font-semibold text-muted-foreground mb-1">RECOMMENDED ACTION</p>
                    <p className="text-xs text-foreground bg-accent/10 p-2 rounded">
                      {alert.recommendedAction}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Shield size={14} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">AI Confidence:</span>
                      <Badge variant="outline" className="text-xs">
                        {(alert.aiConfidence * 100).toFixed(0)}%
                      </Badge>
                    </div>
                    <Badge 
                      variant={alert.severity === 'CRITICAL' || alert.severity === 'HIGH' ? 'destructive' : 'default'}
                      className="text-xs"
                    >
                      <Target size={12} className="mr-1" />
                      Alert #{index + 1}
                    </Badge>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {currentAlerts.length === 0 && !isMonitoring && (
            <Card className="bg-card border-border p-12 text-center">
              <Warning size={48} className="mx-auto mb-4 text-muted-foreground" weight="bold" />
              <p className="text-muted-foreground mb-2">
                No threats detected yet.
              </p>
              <p className="text-xs text-muted-foreground">
                Start monitoring to begin real-time threat detection
              </p>
            </Card>
          )}

          {currentAlerts.length === 0 && isMonitoring && (
            <Card className="bg-card border-border p-12 text-center">
              <Spinner size={48} className="mx-auto mb-4 text-accent animate-spin" />
              <p className="text-foreground mb-2">
                Monitoring in progress...
              </p>
              <p className="text-xs text-muted-foreground">
                Waiting for threat detections
              </p>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
