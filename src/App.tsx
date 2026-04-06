import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import { RepositoryCard } from '@/components/RepositoryCard'
import { DataSourceCard } from '@/components/DataSourceCard'
import { CollaborativeMapEnhanced as CollaborativeMap } from '@/components/CollaborativeMapEnhanced'
import { UnifiedGlobeMap } from '@/components/UnifiedGlobeMap'
import { PipelineSimulator } from '@/components/PipelineSimulator'
import { CommitActivityTimeline } from '@/components/CommitActivityTimeline'
import { MLPredictionsVisualizer } from '@/components/MLPredictionsVisualizer'
import { EmergentPatternDetection } from '@/components/EmergentPatternDetection'
import { AlertNotifications } from '@/components/AlertNotifications'
import { ThreatAlertManagement } from '@/components/ThreatAlertManagement'
import { APIMonitoringDashboard } from '@/components/APIMonitoringDashboard'
import { AdvancedDataVisualization } from '@/components/AdvancedDataVisualization'
import { RefreshSettingsPanel } from '@/components/RefreshSettingsPanel'
import { RoleManagementPanel } from '@/components/RoleManagementPanel'
import { HolographicGlobe } from '@/components/HolographicGlobe'
import { NotificationPanel } from '@/components/NotificationPanel'
import { AuditLogViewer } from '@/components/AuditLogViewer'
import { ViewMode, Repository } from '@/lib/types'
import { fetchAllRepositories } from '@/lib/github-api'
import { dataSources } from '@/lib/data'
import { useHealthMonitor } from '@/hooks/use-health-monitor'
import { useAuth } from '@/hooks/use-auth'
import { useAutoRefresh } from '@/hooks/use-auto-refresh'
import { usePermissions } from '@/hooks/use-permissions'
import { useNotifications } from '@/hooks/use-notifications'
import { Stack, Database, GitBranch, Globe, BookOpen, Eye, Spinner, GitCommit, Brain, Network, Bell, ChartBar, User, Gear, ArrowsClockwise, ShieldCheck, ClipboardText } from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'

function App() {
  const [activeView, setActiveView] = useState<ViewMode>('stack')
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)
  
  const { alerts, healthStatuses, isRateLimited, rateLimitResetTime, acknowledgeAlert, acknowledgeAllAlerts } = useHealthMonitor(dataSources)
  const { session, isLoading: authLoading } = useAuth()
  const { canAccessView, hasPermission, userRole } = usePermissions()
  const { unreadCount } = useNotifications()

  const loadRepositories = async () => {
    setLoading(true)
    try {
      const repos = await fetchAllRepositories()
      if (repos.length === 0) {
        console.warn('No repositories could be loaded - possible API rate limit')
      }
      setRepositories(repos)
    } catch (error) {
      console.error('Error loading repositories:', error)
      setRepositories([])
    } finally {
      setLoading(false)
    }
  }

  useAutoRefresh('repositories', loadRepositories)

  useEffect(() => {
    if (alerts.length > 0) {
      const latestAlert = alerts[alerts.length - 1]
      
      if (latestAlert.alertType === 'reconnected') {
        toast.success(`${latestAlert.dataSourceName} reconnected`, {
          description: latestAlert.message
        })
      } else if (latestAlert.alertType === 'offline') {
        toast.error(`${latestAlert.dataSourceName} is offline`, {
          description: latestAlert.message
        })
      } else if (latestAlert.alertType === 'slow_sync') {
        toast.warning(`${latestAlert.dataSourceName} sync delayed`, {
          description: latestAlert.message
        })
      }
    }
  }, [alerts])

  const dataRepos = repositories.filter(r => r.category === 'data')
  const aiRepos = repositories.filter(r => r.category === 'ai')
  const vizRepos = repositories.filter(r => r.category === 'viz')
  const infraRepos = repositories.filter(r => r.category === 'infra')

  return (
    <>
      <Toaster />
      <div className="min-h-screen hex-pattern">
        <div className="container mx-auto p-8 max-w-[1600px]">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Eye size={48} className="text-accent" weight="fill" />
              <div>
                <h1 className="text-4xl font-bold text-foreground tracking-tight">GOD'S EYE</h1>
                <p className="text-muted-foreground text-sm tracking-wide">GEOSPATIAL INTELLIGENCE PLATFORM</p>
              </div>
            </div>
            {session && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-foreground flex items-center gap-2 justify-end">
                    {session.login}
                    <Badge variant={session.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                      {session.role}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Last login: {new Date(session.lastLogin).toLocaleString()}
                  </div>
                </div>
                <img src={session.avatarUrl} alt={session.login} className="w-10 h-10 rounded-full border-2 border-accent" />
              </div>
            )}
          </div>
          <Separator className="bg-border" />
        </header>

        {isRateLimited && rateLimitResetTime && (
          <div className="mb-6 p-4 bg-[oklch(0.75_0.18_80_/_0.1)] border border-[oklch(0.75_0.18_80)] rounded-lg">
            <div className="flex items-center gap-3">
              <ArrowsClockwise size={20} className="text-[oklch(0.75_0.18_80)]" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">GitHub API Rate Limit Active</p>
                <p className="text-xs text-muted-foreground">
                  Health checks paused until {rateLimitResetTime.toLocaleTimeString()}. All data sources assumed healthy during this time.
                </p>
              </div>
            </div>
          </div>
        )}

        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as ViewMode)} className="space-y-6">
          <TabsList className="bg-card border border-border p-1">
            {canAccessView('stack') && (
              <TabsTrigger value="stack" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                <Stack size={18} className="mr-2" />
                Stack
              </TabsTrigger>
            )}
            {canAccessView('monitor') && (
              <TabsTrigger value="monitor" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                <Database size={18} className="mr-2" />
                Monitor
              </TabsTrigger>
            )}
            {canAccessView('pipeline') && (
              <TabsTrigger value="pipeline" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                <GitBranch size={18} className="mr-2" />
                Pipeline
              </TabsTrigger>
            )}
            {canAccessView('activity') && (
              <TabsTrigger value="activity" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                <GitCommit size={18} className="mr-2" />
                Activity
              </TabsTrigger>
            )}
            {canAccessView('ml-predictions') && (
              <TabsTrigger value="ml-predictions" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                <Brain size={18} className="mr-2" />
                ML Predictions
              </TabsTrigger>
            )}
            {canAccessView('emergent-patterns') && (
              <TabsTrigger value="emergent-patterns" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                <Network size={18} className="mr-2" />
                Emergent Patterns
              </TabsTrigger>
            )}
            {canAccessView('threat-alerts') && (
              <TabsTrigger value="threat-alerts" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                <Bell size={18} className="mr-2" />
                Threat Alerts
              </TabsTrigger>
            )}
            {canAccessView('analytics') && (
              <TabsTrigger value="analytics" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                <ChartBar size={18} className="mr-2" />
                Analytics
              </TabsTrigger>
            )}
            <TabsTrigger value="visualizations" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <ChartBar size={18} className="mr-2" />
              Data Viz
            </TabsTrigger>
            {canAccessView('map') && (
              <TabsTrigger value="map" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                <Globe size={18} className="mr-2" />
                Collab Map
              </TabsTrigger>
            )}
            <TabsTrigger value="globe" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <Globe size={18} className="mr-2" weight="fill" />
              Unified Globe
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground relative">
              <Bell size={18} className="mr-2" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="audit-log" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <ClipboardText size={18} className="mr-2" />
              Audit Log
            </TabsTrigger>
            {hasPermission('configure:refresh') && (
              <TabsTrigger value="refresh-settings" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                <ArrowsClockwise size={18} className="mr-2" />
                Refresh
              </TabsTrigger>
            )}
            {hasPermission('manage:users') && (
              <TabsTrigger value="roles" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                <ShieldCheck size={18} className="mr-2" />
                Roles
              </TabsTrigger>
            )}
            {canAccessView('guide') && (
              <TabsTrigger value="guide" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                <BookOpen size={18} className="mr-2" />
                Guide
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="stack" className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Spinner size={48} className="mx-auto mb-4 text-accent animate-spin" />
                  <p className="text-muted-foreground">Loading live GitHub data...</p>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">DATA COLLECTION LAYER</h2>
                  <p className="text-sm text-muted-foreground mb-4">Real-time conflict events, satellite imagery, and OSINT data sources</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dataRepos.map(repo => (
                      <RepositoryCard key={repo.id} repository={repo} />
                    ))}
                  </div>
                </div>

                <Separator className="bg-border" />

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">AI/ML PROCESSING LAYER</h2>
                  <p className="text-sm text-muted-foreground mb-4">YOLOv8 detection, change detection, and deep learning techniques</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {aiRepos.map(repo => (
                      <RepositoryCard key={repo.id} repository={repo} />
                    ))}
                  </div>
                </div>

                <Separator className="bg-border" />

                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">VISUALIZATION & DASHBOARD</h2>
                  <p className="text-sm text-muted-foreground mb-4">Interactive mapping, charting, and geospatial visualization tools</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vizRepos.map(repo => (
                      <RepositoryCard key={repo.id} repository={repo} />
                    ))}
                  </div>
                </div>

                {infraRepos.length > 0 && (
                  <>
                    <Separator className="bg-border" />

                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-2">INFRASTRUCTURE</h2>
                      <p className="text-sm text-muted-foreground mb-4">CI/CD automation, hosting, and cloud development environments</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {infraRepos.map(repo => (
                          <RepositoryCard key={repo.id} repository={repo} />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="monitor" className="space-y-6">
            <AlertNotifications 
              alerts={alerts}
              onAcknowledge={acknowledgeAlert}
              onAcknowledgeAll={acknowledgeAllAlerts}
            />
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">DATA SOURCE STATUS</h2>
              <p className="text-sm text-muted-foreground mb-4">Real-time monitoring of data collection endpoints with automatic health checks</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dataSources.map(source => (
                  <DataSourceCard 
                    key={source.id} 
                    dataSource={source}
                    healthStatus={healthStatuses.get(source.id)}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pipeline" className="space-y-6">
            <PipelineSimulator />
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <CommitActivityTimeline />
          </TabsContent>

          <TabsContent value="ml-predictions" className="space-y-6">
            <MLPredictionsVisualizer />
          </TabsContent>

          <TabsContent value="emergent-patterns" className="space-y-6">
            <EmergentPatternDetection />
          </TabsContent>

          <TabsContent value="threat-alerts" className="space-y-6">
            <ThreatAlertManagement />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">API & SYSTEM ANALYTICS</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Monitor API usage, rate limits, and LLM token consumption in real-time
              </p>
              <APIMonitoringDashboard />
            </div>
          </TabsContent>

          <TabsContent value="visualizations" className="space-y-6">
            <AdvancedDataVisualization />
          </TabsContent>

          <TabsContent value="refresh-settings" className="space-y-6">
            <RefreshSettingsPanel />
          </TabsContent>

          <TabsContent value="roles" className="space-y-6">
            <RoleManagementPanel />
          </TabsContent>

          <TabsContent value="map" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">COLLABORATIVE MAP WORKSPACE</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Team collaboration with annotations, real-time camera feeds, and geospatial data layers
              </p>
              <CollaborativeMap />
            </div>
          </TabsContent>

          <TabsContent value="globe" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">UNIFIED INTELLIGENCE GLOBE</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Interactive 3D globe combining flight tracking, camera feeds, satellites, and collaborative intelligence
              </p>
              <UnifiedGlobeMap />
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <NotificationPanel />
          </TabsContent>

          <TabsContent value="audit-log" className="space-y-6">
            <AuditLogViewer />
          </TabsContent>

          <TabsContent value="guide" className="space-y-6">
            <div className="border border-border rounded-lg bg-card p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">INTEGRATION GUIDE</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-muted-foreground mb-4">
                  God's Eye is built entirely from open-source GitHub repositories, creating a powerful 
                  geospatial intelligence platform using only free-tier services.
                </p>
                
                <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">System Architecture</h3>
                <p className="text-muted-foreground mb-4">
                  The platform consists of four main layers that work together to collect, process, 
                  analyze, and visualize geospatial intelligence data:
                </p>
                
                <ul className="space-y-2 text-muted-foreground mb-6">
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-1">▸</span>
                    <span><strong className="text-foreground">Data Collection:</strong> ACLED for conflict events, Sentinel for satellite imagery, Google Earth Engine for geospatial data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-1">▸</span>
                    <span><strong className="text-foreground">AI Processing:</strong> YOLOv8 for object detection, change detection algorithms for temporal analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-1">▸</span>
                    <span><strong className="text-foreground">Visualization:</strong> Kepler.gl and Folium for interactive mapping, Plotly for analytics dashboards</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-1">▸</span>
                    <span><strong className="text-foreground">Infrastructure:</strong> GitHub Actions for automation, Pages for hosting, Codespaces for development</span>
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Live Data Integration</h3>
                <p className="text-muted-foreground mb-4">
                  This platform integrates real-time data from the GitHub API to track repository 
                  activity, stars, forks, and recent updates. The map view and AI pipeline simulator 
                  use live data to generate dynamic geospatial visualizations and processing workflows.
                </p>

                <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Getting Started</h3>
                <p className="text-muted-foreground">
                  Each repository in the stack explorer links directly to its GitHub page where you can 
                  find installation instructions, API documentation, and example implementations. 
                  Start with the data collection layer to establish your data pipeline, then add 
                  AI processing capabilities, and finally integrate visualization components.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </>
  )
}

export default App