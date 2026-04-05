import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { useRefreshSettings, RefreshSettings } from '@/hooks/use-auto-refresh'
import { Clock, ArrowsClockwise, Pause, Play, ArrowCounterClockwise } from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'
import { usePermissions } from '@/hooks/use-permissions'
import { Alert, AlertDescription } from '@/components/ui/alert'

const REFRESH_LABELS: Record<keyof RefreshSettings, { label: string; description: string }> = {
  repositories: {
    label: 'Repository Data',
    description: 'GitHub repository stats and metadata'
  },
  dataSourceStatus: {
    label: 'Data Source Status',
    description: 'Health monitoring and connectivity checks'
  },
  commitActivity: {
    label: 'Commit Activity',
    description: 'Repository commit timeline and updates'
  },
  mlPredictions: {
    label: 'ML Predictions',
    description: 'Machine learning model predictions'
  },
  cameraFeeds: {
    label: 'Camera Feeds',
    description: 'Live camera feed availability'
  },
  weatherData: {
    label: 'Weather Data',
    description: 'Real-time weather information'
  },
  threatAlerts: {
    label: 'Threat Alerts',
    description: 'Threat detection and analysis'
  },
  emergentPatterns: {
    label: 'Emergent Patterns',
    description: 'Multi-domain pattern detection'
  },
  apiMetrics: {
    label: 'API Metrics',
    description: 'API usage and rate limit monitoring'
  }
}

function formatInterval(ms: number): string {
  if (ms < 60000) return `${Math.round(ms / 1000)}s`
  if (ms < 3600000) return `${Math.round(ms / 60000)}m`
  return `${Math.round(ms / 3600000)}h`
}

function formatLastRefresh(timestamp?: number): string {
  if (!timestamp) return 'Never'
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ago`
}

export function RefreshSettingsPanel() {
  const {
    settings,
    toggleRefresh,
    setRefreshInterval,
    resetToDefaults,
    pauseAll,
    resumeAll
  } = useRefreshSettings()

  const { hasPermission } = usePermissions()
  const canConfigure = hasPermission('configure:refresh')

  if (!canConfigure) {
    return (
      <Alert className="bg-card border-border">
        <AlertDescription className="text-muted-foreground">
          You don't have permission to configure refresh intervals. Contact an administrator for access.
        </AlertDescription>
      </Alert>
    )
  }

  const allEnabled = settings ? Object.values(settings).every(config => config.enabled) : false
  const allDisabled = settings ? Object.values(settings).every(config => !config.enabled) : true

  if (!settings) {
    return (
      <Alert className="bg-card border-border">
        <AlertDescription className="text-muted-foreground">
          Loading refresh settings...
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">REFRESH INTERVAL SETTINGS</h2>
          <p className="text-sm text-muted-foreground">Configure automatic data refresh intervals for real-time updates</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={allDisabled ? resumeAll : pauseAll}
            className="gap-2"
          >
            {allDisabled ? (
              <>
                <Play size={18} weight="fill" />
                Resume All
              </>
            ) : (
              <>
                <Pause size={18} weight="fill" />
                Pause All
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={resetToDefaults}
            className="gap-2"
          >
            <ArrowCounterClockwise size={18} />
            Reset Defaults
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {(Object.keys(settings) as Array<keyof RefreshSettings>).map(key => {
          const config = settings[key]
          const info = REFRESH_LABELS[key]

          return (
            <Card key={key} className="bg-card border-border">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      {info.label}
                      {config.enabled ? (
                        <Badge variant="default" className="bg-status-active text-xs">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Paused
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {info.description}
                    </CardDescription>
                  </div>
                  <Switch
                    checked={config.enabled}
                    onCheckedChange={(checked) => toggleRefresh(key, checked)}
                    className="ml-2"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">Refresh Interval</Label>
                    <span className="text-sm font-mono text-accent">
                      {formatInterval(config.interval)}
                    </span>
                  </div>
                  <Slider
                    value={[config.interval]}
                    onValueChange={([value]) => setRefreshInterval(key, value)}
                    min={15000}
                    max={600000}
                    step={15000}
                    disabled={!config.enabled}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>15s</span>
                    <span>10m</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock size={14} />
                    <span>Last refresh:</span>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">
                    {formatLastRefresh(config.lastRefresh)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ArrowsClockwise size={20} />
            Refresh Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Total Sources</p>
              <p className="text-2xl font-bold text-foreground">
                {settings ? Object.keys(settings).length : 0}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Active</p>
              <p className="text-2xl font-bold text-status-active">
                {settings ? Object.values(settings).filter(c => c.enabled).length : 0}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Paused</p>
              <p className="text-2xl font-bold text-muted-foreground">
                {settings ? Object.values(settings).filter(c => !c.enabled).length : 0}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Avg Interval</p>
              <p className="text-2xl font-bold text-accent">
                {settings ? formatInterval(
                  Object.values(settings).reduce((sum, c) => sum + c.interval, 0) /
                  Object.values(settings).length
                ) : '0s'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
