import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { RepositoryCard } from '@/components/RepositoryCard'
import { DataSourceCard } from '@/components/DataSourceCard'
import { InteractiveMap } from '@/components/InteractiveMap'
import { CollaborativeMap } from '@/components/CollaborativeMap'
import { PipelineSimulator } from '@/components/PipelineSimulator'
import { CommitActivityTimeline } from '@/components/CommitActivityTimeline'
import { MLPredictionsVisualizer } from '@/components/MLPredictionsVisualizer'
import { ViewMode, Repository } from '@/lib/types'
import { fetchAllRepositories } from '@/lib/github-api'
import { dataSources } from '@/lib/data'
import { Stack, Database, GitBranch, Globe, BookOpen, Eye, Spinner, GitCommit, Brain } from '@phosphor-icons/react'

function App() {
  const [activeView, setActiveView] = useState<ViewMode>('stack')
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadRepositories() {
      setLoading(true)
      const repos = await fetchAllRepositories()
      setRepositories(repos)
      setLoading(false)
    }
    loadRepositories()
  }, [])

  const dataRepos = repositories.filter(r => r.category === 'data')
  const aiRepos = repositories.filter(r => r.category === 'ai')
  const vizRepos = repositories.filter(r => r.category === 'viz')
  const infraRepos = repositories.filter(r => r.category === 'infra')

  return (
    <div className="min-h-screen hex-pattern">
      <div className="container mx-auto p-8 max-w-[1600px]">
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Eye size={48} className="text-accent" weight="fill" />
            <div>
              <h1 className="text-4xl font-bold text-foreground tracking-tight">GOD'S EYE</h1>
              <p className="text-muted-foreground text-sm tracking-wide">GEOSPATIAL INTELLIGENCE PLATFORM</p>
            </div>
          </div>
          <Separator className="bg-border" />
        </header>

        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as ViewMode)} className="space-y-6">
          <TabsList className="bg-card border border-border p-1">
            <TabsTrigger value="stack" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <Stack size={18} className="mr-2" />
              Stack
            </TabsTrigger>
            <TabsTrigger value="monitor" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <Database size={18} className="mr-2" />
              Monitor
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <GitBranch size={18} className="mr-2" />
              Pipeline
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <GitCommit size={18} className="mr-2" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="ml-predictions" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <Brain size={18} className="mr-2" />
              ML Predictions
            </TabsTrigger>
            <TabsTrigger value="map" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <Globe size={18} className="mr-2" />
              Collab Map
            </TabsTrigger>
            <TabsTrigger value="guide" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <BookOpen size={18} className="mr-2" />
              Guide
            </TabsTrigger>
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
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">DATA SOURCE STATUS</h2>
              <p className="text-sm text-muted-foreground mb-4">Real-time monitoring of data collection endpoints</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dataSources.map(source => (
                  <DataSourceCard key={source.id} dataSource={source} />
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

          <TabsContent value="map" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">COLLABORATIVE MAP WORKSPACE</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Team collaboration with annotations, real-time camera feeds, and geospatial data layers
              </p>
              <CollaborativeMap />
            </div>
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
  )
}

export default App