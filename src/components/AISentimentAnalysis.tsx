import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ExportButton } from '@/components/ExportButton'
import { Brain, Spinner, ThumbsUp, ThumbsDown, Minus, GithubLogo, Globe, Clock, ChartLine } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  SentimentAnalysis,
  ScheduledAnalysisConfig,
  analyzeGitHubSentiment,
  analyzeRegionalSentiment,
  analyzeGlobalSentiment,
  calculateSentimentTrends
} from '@/lib/ai-sentiment-analysis'

const REGIONS = [
  'Middle East',
  'Eastern Europe',
  'North Africa',
  'Central Asia',
  'East Asia',
  'South Asia',
  'Sub-Saharan Africa',
  'Latin America',
  'Southeast Asia'
]

export function AISentimentAnalysis() {
  const [analyses, setAnalyses] = useKV<SentimentAnalysis[]>('ai-sentiment-analyses', [])
  const [schedules, setSchedules] = useKV<ScheduledAnalysisConfig[]>('sentiment-schedules', [])
  const [loading, setLoading] = useState(false)
  const [selectedRegion, setSelectedRegion] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'analyses' | 'trends' | 'schedule'>('analyses')
  const [scheduleInterval, setScheduleInterval] = useState(30)

  const currentAnalyses = analyses || []
  const currentSchedules = schedules || []
  const trends = calculateSentimentTrends(currentAnalyses)

  useEffect(() => {
    const activeSchedules = currentSchedules.filter(s => s.enabled)
    if (activeSchedules.length === 0) return

    const checkSchedules = async () => {
      const now = new Date()
      
      for (const schedule of activeSchedules) {
        if (!schedule.nextRun || new Date(schedule.nextRun) <= now) {
          try {
            let analysis: SentimentAnalysis
            
            if (schedule.analysisType === 'github') {
              analysis = await analyzeGitHubSentiment()
            } else if (schedule.analysisType === 'global') {
              analysis = await analyzeGlobalSentiment()
            } else if (schedule.region) {
              analysis = await analyzeRegionalSentiment(schedule.region, `Scheduled analysis of ${schedule.region}`)
            } else {
              continue
            }
            
            setAnalyses((current) => [analysis, ...(current || [])].slice(0, 50))
            
            const nextRun = new Date(now.getTime() + schedule.intervalMinutes * 60000)
            setSchedules((current) => 
              (current || []).map(s => 
                s.id === schedule.id 
                  ? { ...s, lastRun: now, nextRun }
                  : s
              )
            )
            
            toast.success(`Scheduled ${schedule.analysisType} analysis completed`)
          } catch (error) {
            console.error('Scheduled analysis failed:', error)
          }
        }
      }
    }

    const interval = setInterval(checkSchedules, 60000)
    checkSchedules()

    return () => clearInterval(interval)
  }, [currentSchedules, setAnalyses, setSchedules])

  const runGitHubAnalysis = async () => {
    setLoading(true)
    try {
      const analysis = await analyzeGitHubSentiment()
      setAnalyses((current) => [analysis, ...(current || [])].slice(0, 20))
      toast.success('GitHub sentiment analysis complete')
    } catch (error) {
      console.error('Error analyzing GitHub sentiment:', error)
      toast.error('Failed to analyze GitHub sentiment')
    } finally {
      setLoading(false)
    }
  }

  const runRegionalAnalysis = async () => {
    if (!selectedRegion) {
      toast.error('Please select a region')
      return
    }

    setLoading(true)
    try {
      const contextData = `Analysis of ${selectedRegion} region including political stability, economic factors, and social climate`
      const analysis = await analyzeRegionalSentiment(selectedRegion, contextData)
      setAnalyses((current) => [analysis, ...(current || [])].slice(0, 20))
      toast.success(`${selectedRegion} sentiment analysis complete`)
    } catch (error) {
      console.error('Error analyzing regional sentiment:', error)
      toast.error('Failed to analyze regional sentiment')
    } finally {
      setLoading(false)
    }
  }

  const runGlobalAnalysis = async () => {
    setLoading(true)
    try {
      const analysis = await analyzeGlobalSentiment()
      setAnalyses((current) => [analysis, ...(current || [])].slice(0, 20))
      toast.success('Global sentiment analysis complete')
    } catch (error) {
      console.error('Error analyzing global sentiment:', error)
      toast.error('Failed to analyze global sentiment')
    } finally {
      setLoading(false)
    }
  }

  const clearAnalyses = () => {
    setAnalyses([])
    toast.success('Sentiment analyses cleared')
  }

  const addSchedule = (type: 'github' | 'global' | 'region', region?: string) => {
    const now = new Date()
    const nextRun = new Date(now.getTime() + scheduleInterval * 60000)
    
    const newSchedule: ScheduledAnalysisConfig = {
      id: `schedule-${Date.now()}`,
      analysisType: type,
      region,
      intervalMinutes: scheduleInterval,
      enabled: true,
      lastRun: undefined,
      nextRun
    }
    
    setSchedules((current) => [...(current || []), newSchedule])
    toast.success(`Scheduled ${type} analysis every ${scheduleInterval} minutes`)
  }

  const toggleSchedule = (id: string) => {
    setSchedules((current) =>
      (current || []).map(s =>
        s.id === id ? { ...s, enabled: !s.enabled } : s
      )
    )
  }

  const removeSchedule = (id: string) => {
    setSchedules((current) => (current || []).filter(s => s.id !== id))
    toast.success('Schedule removed')
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-400'
      case 'negative': return 'text-red-400'
      default: return 'text-yellow-400'
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <ThumbsUp size={20} weight="fill" />
      case 'negative': return <ThumbsDown size={20} weight="fill" />
      default: return <Minus size={20} weight="bold" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score > 30) return 'bg-green-500/20 text-green-400'
    if (score < -30) return 'bg-red-500/20 text-red-400'
    return 'bg-yellow-500/20 text-yellow-400'
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">AI SENTIMENT ANALYSIS</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Real-time AI-powered sentiment analysis with historical trending and automated scheduling
        </p>

        <Card className="bg-card border-border p-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mb-4">
            <TabsList>
              <TabsTrigger value="analyses">
                <Brain size={16} className="mr-2" />
                Analyses ({currentAnalyses.length})
              </TabsTrigger>
              <TabsTrigger value="trends">
                <ChartLine size={16} className="mr-2" />
                Trends ({trends.length})
              </TabsTrigger>
              <TabsTrigger value="schedule">
                <Clock size={16} className="mr-2" />
                Scheduled ({currentSchedules.filter(s => s.enabled).length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analyses" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Button
                  onClick={runGitHubAnalysis}
                  disabled={loading}
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  {loading ? (
                    <Spinner size={18} className="mr-2 animate-spin" />
                  ) : (
                    <GithubLogo size={18} className="mr-2" weight="fill" />
                  )}
                  Analyze GitHub
                </Button>

                <div className="flex gap-2">
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select Region" />
                    </SelectTrigger>
                    <SelectContent>
                      {REGIONS.map(region => (
                        <SelectItem key={region} value={region}>{region}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={runRegionalAnalysis}
                    disabled={loading || !selectedRegion}
                    variant="outline"
                  >
                    <Globe size={18} />
                  </Button>
                </div>

                <Button
                  onClick={runGlobalAnalysis}
                  disabled={loading}
                  variant="outline"
                >
                  {loading ? (
                    <Spinner size={18} className="mr-2 animate-spin" />
                  ) : (
                    <Brain size={18} className="mr-2" />
                  )}
                  Global Analysis
                </Button>
              </div>

              <div className="flex gap-2 justify-end">
                {currentAnalyses.length > 0 && (
                  <ExportButton
                    data={currentAnalyses as unknown as Record<string, unknown>[]}
                    filename="sentiment-analyses"
                    type="patterns"
                  />
                )}
                <Button
                  onClick={clearAnalyses}
                  variant="destructive"
                  size="sm"
                  disabled={currentAnalyses.length === 0}
                >
                  Clear All
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="mt-4">
              <div className="text-sm text-muted-foreground mb-4">
                Historical sentiment trends showing changes over time for each analyzed source
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="mt-4">
              <div className="space-y-4">
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label htmlFor="interval">Interval (minutes)</Label>
                    <Input
                      id="interval"
                      type="number"
                      min="5"
                      value={scheduleInterval}
                      onChange={(e) => setScheduleInterval(parseInt(e.target.value) || 30)}
                    />
                  </div>
                  <Button onClick={() => addSchedule('github')} variant="outline">
                    <GithubLogo size={16} className="mr-2" />
                    Schedule GitHub
                  </Button>
                  <Button onClick={() => addSchedule('global')} variant="outline">
                    <Globe size={16} className="mr-2" />
                    Schedule Global
                  </Button>
                </div>

                <div className="space-y-2">
                  {currentSchedules.map(schedule => (
                    <Card key={schedule.id} className="p-4 bg-muted/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={schedule.enabled}
                            onCheckedChange={() => toggleSchedule(schedule.id)}
                          />
                          <div>
                            <div className="font-medium text-sm">
                              {schedule.analysisType.toUpperCase()} Analysis
                              {schedule.region && ` - ${schedule.region}`}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Every {schedule.intervalMinutes} minutes
                              {schedule.nextRun && ` • Next: ${new Date(schedule.nextRun).toLocaleTimeString()}`}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSchedule(schedule.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </Card>
                  ))}

                  {currentSchedules.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No scheduled analyses. Add one above to enable automated monitoring.
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      <ScrollArea className="h-[600px]">
        <div className="space-y-4 pr-4">
          {activeTab === 'analyses' && (
            <>
              <AnimatePresence>
                {currentAnalyses.map((analysis, index) => (
                  <motion.div
                    key={analysis.id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="bg-card border-border p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`${getSentimentColor(analysis.overallSentiment)}`}>
                            {getSentimentIcon(analysis.overallSentiment)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-foreground">{analysis.sourceName}</h3>
                              <Badge variant="outline" className={getScoreColor(analysis.sentimentScore)}>
                                Score: {analysis.sentimentScore > 0 ? '+' : ''}{analysis.sentimentScore.toFixed(0)}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(analysis.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={analysis.overallSentiment === 'positive' ? 'default' : 
                                  analysis.overallSentiment === 'negative' ? 'destructive' : 'secondary'}
                        >
                          {analysis.overallSentiment.toUpperCase()}
                        </Badge>
                      </div>

                      <p className="text-sm text-foreground mb-4">
                        {analysis.analysisText}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-2">EMOTIONAL TONE</p>
                          <div className="flex flex-wrap gap-2">
                            {analysis.emotionalTone.map((tone, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {tone}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-2">KEY THEMES</p>
                          <div className="flex flex-wrap gap-2">
                            {analysis.keyThemes.map((theme, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {theme}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      {analysis.concernAreas.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-2">AREAS OF CONCERN</p>
                          <div className="flex flex-wrap gap-2">
                            {analysis.concernAreas.map((concern, idx) => (
                              <Badge key={idx} variant="destructive" className="text-xs">
                                {concern}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">AI Confidence:</span>
                          <Badge variant="outline">
                            {analysis.confidenceLevel}%
                          </Badge>
                        </div>
                        {analysis.region && (
                          <div className="flex items-center gap-2">
                            <Globe size={14} className="text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{analysis.region}</span>
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {currentAnalyses.length === 0 && !loading && (
                <Card className="bg-card border-border p-12 text-center">
                  <Brain size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No sentiment analyses yet. Run an analysis to get started.
                  </p>
                </Card>
              )}
            </>
          )}

          {activeTab === 'trends' && (
            <>
              {trends.map((trend, index) => (
                <Card key={index} className="bg-card border-border p-6">
                  <div className="mb-4">
                    <h3 className="font-semibold text-foreground mb-1">{trend.sourceName}</h3>
                    <p className="text-xs text-muted-foreground">{trend.sourceType.toUpperCase()} • {trend.dataPoints.length} data points</p>
                  </div>

                  <div className="space-y-2">
                    {trend.dataPoints.slice().reverse().slice(0, 10).map((point, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className={getSentimentColor(point.sentiment)}>
                            {getSentimentIcon(point.sentiment)}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(point.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <Badge variant="outline" className={getScoreColor(point.score)}>
                          {point.score > 0 ? '+' : ''}{point.score.toFixed(0)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}

              {trends.length === 0 && (
                <Card className="bg-card border-border p-12 text-center">
                  <ChartLine size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No historical trends available. Run multiple analyses to generate trends.
                  </p>
                </Card>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
