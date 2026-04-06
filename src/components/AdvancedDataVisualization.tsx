import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAutoRefresh } from '@/hooks/use-auto-refresh'
import { useAuditLog } from '@/hooks/use-audit-log'
import { fetchAllRepositories } from '@/lib/github-api'
import { Repository } from '@/lib/types'
import { exportChart } from '@/lib/chart-export'
import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts'
import { ChartLine, ChartBar, ChartPie, Spinner, ArrowsClockwise, FileCsv, FileImage, FileSvg } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

interface RepositoryMetrics {
  timestamp: number
  totalStars: number
  totalForks: number
  totalIssues: number
  activeRepos: number
  totalSize: number
}

interface CategoryBreakdown {
  name: string
  value: number
  fill: string
}

interface LanguageStats {
  language: string
  count: number
  stars: number
}

interface RepoActivityScore {
  name: string
  stars: number
  forks: number
  issues: number
  fullMark: number
}

export function AdvancedDataVisualization() {
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [metrics, setMetrics] = useState<RepositoryMetrics[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { logEvent } = useAuditLog()

  const loadData = async () => {
    try {
      setRefreshing(true)
      const repos = await fetchAllRepositories()
      setRepositories(repos)

      const newMetric: RepositoryMetrics = {
        timestamp: Date.now(),
        totalStars: repos.reduce((sum, r) => sum + r.stars, 0),
        totalForks: repos.reduce((sum, r) => sum + (r.forks || 0), 0),
        totalIssues: repos.reduce((sum, r) => sum + (r.openIssues || 0), 0),
        activeRepos: repos.length,
        totalSize: repos.reduce((sum, r) => sum + (r.size || 0), 0)
      }

      setMetrics(prev => [...prev.slice(-9), newMetric])
      
      logEvent('data:refresh', 'Data visualization refreshed', {
        repositoryCount: repos.length,
        totalStars: newMetric.totalStars,
        totalForks: newMetric.totalForks
      }, 'low')
    } catch (error) {
      console.error('Failed to load repository data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleExport = async (chartId: string, chartName: string, data: any[], format: 'csv' | 'png' | 'svg') => {
    try {
      await exportChart(chartId, data, { filename: chartName, format })
      
      logEvent('data:export', `Exported ${chartName} as ${format.toUpperCase()}`, {
        chartName,
        format,
        dataPoints: data.length
      }, 'low')
      
      toast.success(`Chart exported as ${format.toUpperCase()}`)
    } catch (error) {
      toast.error(`Failed to export chart: ${error}`)
      console.error(error)
    }
  }

  const ExportButton = ({ chartId, chartName, data }: { chartId: string; chartName: string; data: any[] }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline">
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Export Format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport(chartId, chartName, data, 'csv')}>
          <FileCsv size={16} className="mr-2" />
          CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport(chartId, chartName, data, 'png')}>
          <FileImage size={16} className="mr-2" />
          PNG
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport(chartId, chartName, data, 'svg')}>
          <FileSvg size={16} className="mr-2" />
          SVG
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  useEffect(() => {
    loadData()
  }, [])

  const { manualRefresh } = useAutoRefresh('repositories', loadData)

  const categoryBreakdown: CategoryBreakdown[] = [
    {
      name: 'Data Collection',
      value: repositories.filter(r => r.category === 'data').length,
      fill: 'oklch(0.70 0.20 145)'
    },
    {
      name: 'AI/ML Processing',
      value: repositories.filter(r => r.category === 'ai').length,
      fill: 'oklch(0.65 0.18 290)'
    },
    {
      name: 'Visualization',
      value: repositories.filter(r => r.category === 'viz').length,
      fill: 'oklch(0.75 0.15 200)'
    },
    {
      name: 'Infrastructure',
      value: repositories.filter(r => r.category === 'infra').length,
      fill: 'oklch(0.75 0.18 80)'
    }
  ]

  const languageStats: LanguageStats[] = Object.entries(
    repositories.reduce((acc, repo) => {
      const lang = repo.language || 'Unknown'
      if (!acc[lang]) {
        acc[lang] = { count: 0, stars: 0 }
      }
      acc[lang].count += 1
      acc[lang].stars += repo.stars
      return acc
    }, {} as Record<string, { count: number; stars: number }>)
  ).map(([language, stats]) => ({
    language,
    count: stats.count,
    stars: stats.stars
  })).sort((a, b) => b.stars - a.stars).slice(0, 8)

  const topRepoActivity: RepoActivityScore[] = repositories
    .sort((a, b) => b.stars - a.stars)
    .slice(0, 6)
    .map(repo => ({
      name: repo.name.length > 20 ? repo.name.substring(0, 20) + '...' : repo.name,
      stars: repo.stars,
      forks: repo.forks || 0,
      issues: repo.openIssues || 0,
      fullMark: Math.max(repo.stars, repo.forks || 0, repo.openIssues || 0)
    }))

  const timeSeriesData = metrics.map((m, idx) => ({
    time: new Date(m.timestamp).toLocaleTimeString(),
    stars: m.totalStars,
    forks: m.totalForks,
    issues: m.totalIssues,
    repos: m.activeRepos
  }))

  const repoSizeDistribution = repositories.map(repo => ({
    name: repo.name.length > 15 ? repo.name.substring(0, 15) + '...' : repo.name,
    size: repo.size || 0,
    stars: repo.stars,
    category: repo.category
  })).filter(r => r.size > 0).sort((a, b) => b.size - a.size).slice(0, 20)

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-20">
          <div className="flex items-center justify-center">
            <Spinner size={48} className="text-accent animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">ADVANCED DATA VISUALIZATION</h2>
          <p className="text-sm text-muted-foreground">Real-time repository metrics and analytics</p>
        </div>
        <Button
          onClick={manualRefresh}
          disabled={refreshing}
          variant="outline"
          className="gap-2"
        >
          <ArrowsClockwise size={18} className={refreshing ? 'animate-spin' : ''} />
          Refresh Data
        </Button>
      </div>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="trends">
            <ChartLine size={18} className="mr-2" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="distributions">
            <ChartBar size={18} className="mr-2" />
            Distributions
          </TabsTrigger>
          <TabsTrigger value="comparisons">
            <ChartPie size={18} className="mr-2" />
            Comparisons
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Repository Growth Over Time</CardTitle>
                    <CardDescription>Tracked metrics across refresh intervals</CardDescription>
                  </div>
                  <ExportButton chartId="growth-chart" chartName="repository-growth" data={timeSeriesData} />
                </div>
              </CardHeader>
              <CardContent>
                <div id="growth-chart">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0.02 250)" />
                    <XAxis
                      dataKey="time"
                      stroke="oklch(0.60 0.01 240)"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis stroke="oklch(0.60 0.01 240)" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'oklch(0.18 0.01 250)',
                        border: '1px solid oklch(0.30 0.02 250)',
                        borderRadius: '6px'
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="stars"
                      stackId="1"
                      stroke="oklch(0.75 0.15 200)"
                      fill="oklch(0.75 0.15 200 / 0.6)"
                    />
                    <Area
                      type="monotone"
                      dataKey="forks"
                      stackId="1"
                      stroke="oklch(0.65 0.18 290)"
                      fill="oklch(0.65 0.18 290 / 0.6)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Language Popularity by Stars</CardTitle>
                    <CardDescription>Total stars grouped by programming language</CardDescription>
                  </div>
                  <ExportButton chartId="language-chart" chartName="language-popularity" data={languageStats} />
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={languageStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0.02 250)" />
                    <XAxis
                      dataKey="language"
                      stroke="oklch(0.60 0.01 240)"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis stroke="oklch(0.60 0.01 240)" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'oklch(0.18 0.01 250)',
                        border: '1px solid oklch(0.30 0.02 250)',
                        borderRadius: '6px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="stars" fill="oklch(0.75 0.15 200)" />
                    <Bar dataKey="count" fill="oklch(0.70 0.20 145)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Repository Activity Timeline</CardTitle>
              <CardDescription>Stars, forks, and issues tracked over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0.02 250)" />
                  <XAxis
                    dataKey="time"
                    stroke="oklch(0.60 0.01 240)"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis stroke="oklch(0.60 0.01 240)" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'oklch(0.18 0.01 250)',
                      border: '1px solid oklch(0.30 0.02 250)',
                      borderRadius: '6px'
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="stars"
                    stroke="oklch(0.75 0.15 200)"
                    strokeWidth={2}
                    dot={{ fill: 'oklch(0.75 0.15 200)', r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="forks"
                    stroke="oklch(0.65 0.18 290)"
                    strokeWidth={2}
                    dot={{ fill: 'oklch(0.65 0.18 290)', r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="issues"
                    stroke="oklch(0.75 0.18 80)"
                    strokeWidth={2}
                    dot={{ fill: 'oklch(0.75 0.18 80)', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distributions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Category Distribution</CardTitle>
                <CardDescription>Repository count by stack layer</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'oklch(0.18 0.01 250)',
                        border: '1px solid oklch(0.30 0.02 250)',
                        borderRadius: '6px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Repository Size Distribution</CardTitle>
                <CardDescription>Codebase size by repository (KB)</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={repoSizeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0.02 250)" />
                    <XAxis
                      dataKey="name"
                      stroke="oklch(0.60 0.01 240)"
                      style={{ fontSize: '10px' }}
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis stroke="oklch(0.60 0.01 240)" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'oklch(0.18 0.01 250)',
                        border: '1px solid oklch(0.30 0.02 250)',
                        borderRadius: '6px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="size" fill="oklch(0.70 0.20 145)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparisons" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Top Repository Activity Radar</CardTitle>
                <CardDescription>Multi-metric comparison of most active repos</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={topRepoActivity}>
                    <PolarGrid stroke="oklch(0.30 0.02 250)" />
                    <PolarAngleAxis
                      dataKey="name"
                      stroke="oklch(0.60 0.01 240)"
                      style={{ fontSize: '11px' }}
                    />
                    <PolarRadiusAxis stroke="oklch(0.60 0.01 240)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'oklch(0.18 0.01 250)',
                        border: '1px solid oklch(0.30 0.02 250)',
                        borderRadius: '6px'
                      }}
                    />
                    <Radar
                      name="Stars"
                      dataKey="stars"
                      stroke="oklch(0.75 0.15 200)"
                      fill="oklch(0.75 0.15 200)"
                      fillOpacity={0.6}
                    />
                    <Radar
                      name="Forks"
                      dataKey="forks"
                      stroke="oklch(0.65 0.18 290)"
                      fill="oklch(0.65 0.18 290)"
                      fillOpacity={0.6}
                    />
                    <Radar
                      name="Issues"
                      dataKey="issues"
                      stroke="oklch(0.75 0.18 80)"
                      fill="oklch(0.75 0.18 80)"
                      fillOpacity={0.6}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Stars vs Size Correlation</CardTitle>
                <CardDescription>Relationship between popularity and codebase size</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0.02 250)" />
                    <XAxis
                      type="number"
                      dataKey="size"
                      name="Size (KB)"
                      stroke="oklch(0.60 0.01 240)"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis
                      type="number"
                      dataKey="stars"
                      name="Stars"
                      stroke="oklch(0.60 0.01 240)"
                      style={{ fontSize: '12px' }}
                    />
                    <ZAxis range={[60, 400]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'oklch(0.18 0.01 250)',
                        border: '1px solid oklch(0.30 0.02 250)',
                        borderRadius: '6px'
                      }}
                      cursor={{ strokeDasharray: '3 3' }}
                    />
                    <Legend />
                    <Scatter
                      name="Repositories"
                      data={repoSizeDistribution}
                      fill="oklch(0.75 0.15 200)"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
