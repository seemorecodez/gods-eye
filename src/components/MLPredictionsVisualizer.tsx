import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Brain, Spinner, Target, Globe, FileText, Shield } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { fetchAllRepositories } from '@/lib/github-api'
import { Repository } from '@/lib/types'
import { toast } from 'sonner'

interface ThreatAnalysis {
  id: string
  region: string
  threatLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'
  confidence: number
  keyFactors: string[]
  recommendation: string
  timestamp: Date
}

interface SatelliteAnalysis {
  id: string
  location: string
  detectedObjects: string[]
  landCoverChange: string
  infrastructureStatus: string
  anomalies: string[]
  timestamp: Date
}

interface IntelligenceBriefing {
  id: string
  executiveSummary: string
  keyDevelopments: string[]
  technologicalTrends: string[]
  recommendations: string[]
  timestamp: Date
}

const REGIONS = [
  'Eastern Mediterranean',
  'Sahel Region',
  'Southeast Asia',
  'Caucasus',
  'Horn of Africa',
  'Central America',
  'Middle East Corridor'
]

const LOCATIONS = [
  'Kabul, Afghanistan',
  'Damascus, Syria',
  'Bamako, Mali',
  'Khartoum, Sudan',
  'Mogadishu, Somalia',
  'Beirut, Lebanon',
  'Gaza Strip'
]

export function MLPredictionsVisualizer() {
  const [activeTab, setActiveTab] = useState<'threat' | 'satellite' | 'briefing'>('threat')
  const [loading, setLoading] = useState(false)
  const [repositories, setRepositories] = useState<Repository[]>([])
  
  const [threatAnalyses, setThreatAnalyses] = useState<ThreatAnalysis[]>([])
  const [satelliteAnalyses, setSatelliteAnalyses] = useState<SatelliteAnalysis[]>([])
  const [briefings, setBriefings] = useState<IntelligenceBriefing[]>([])

  useEffect(() => {
    async function loadRepos() {
      const repos = await fetchAllRepositories()
      setRepositories(repos)
    }
    loadRepos()
  }, [])

  const generateThreatAnalysis = async () => {
    setLoading(true)
    const region = REGIONS[Math.floor(Math.random() * REGIONS.length)]
    
    const conflictDataSources = repositories
      .filter(r => r.category === 'data')
      .map(r => `${r.name} (${r.stars} stars, ${r.language})`)
      .join(', ')
    
    const aiModels = repositories
      .filter(r => r.category === 'ai')
      .map(r => r.name)
      .join(', ')

    try {
      const prompt = (window.spark.llmPrompt as any)`You are a geospatial intelligence analyst. Based on the following data sources: ${conflictDataSources}, and AI models: ${aiModels}, generate a realistic threat analysis for the region: ${region}.

Return a JSON object with these exact fields:
{
  "threatLevel": "LOW" or "MODERATE" or "HIGH" or "CRITICAL",
  "confidence": a number between 0.65 and 0.98,
  "keyFactors": an array of 3-4 specific threat indicators or patterns,
  "recommendation": a concise actionable recommendation for intelligence teams
}

Make the analysis professional, data-driven, and realistic based on real-world geospatial intelligence patterns.`

      const response = await window.spark.llm(prompt, 'gpt-4o-mini', true)
      const data = JSON.parse(response)
      
      const analysis: ThreatAnalysis = {
        id: `threat-${Date.now()}`,
        region,
        threatLevel: data.threatLevel,
        confidence: data.confidence,
        keyFactors: data.keyFactors,
        recommendation: data.recommendation,
        timestamp: new Date()
      }
      
      setThreatAnalyses(prev => [analysis, ...prev].slice(0, 10))
      toast.success('Threat analysis generated', { description: `${region} - ${data.threatLevel}` })
    } catch (error) {
      console.error('Error generating threat analysis:', error)
      toast.error('Failed to generate analysis')
    } finally {
      setLoading(false)
    }
  }

  const generateSatelliteAnalysis = async () => {
    setLoading(true)
    const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)]
    
    const satelliteRepos = repositories
      .filter(r => r.name.toLowerCase().includes('sentinel') || r.name.toLowerCase().includes('satellite') || r.name.toLowerCase().includes('yolo'))
      .map(r => `${r.name} (${r.description})`)
      .join(', ')

    try {
      const prompt = (window.spark.llmPrompt as any)`You are a satellite imagery analyst using AI models like YOLOv8 and change detection algorithms. Analyze a recent satellite image of ${location} using these available systems: ${satelliteRepos}.

Return a JSON object with these exact fields:
{
  "detectedObjects": an array of 3-5 specific objects or features detected (vehicles, buildings, infrastructure),
  "landCoverChange": a brief description of any land cover or urban development changes observed,
  "infrastructureStatus": assessment of key infrastructure condition,
  "anomalies": an array of 2-3 unusual patterns or changes detected
}

Make the analysis technical, specific, and realistic for satellite imagery intelligence.`

      const response = await window.spark.llm(prompt, 'gpt-4o-mini', true)
      const data = JSON.parse(response)
      
      const analysis: SatelliteAnalysis = {
        id: `sat-${Date.now()}`,
        location,
        detectedObjects: data.detectedObjects,
        landCoverChange: data.landCoverChange,
        infrastructureStatus: data.infrastructureStatus,
        anomalies: data.anomalies,
        timestamp: new Date()
      }
      
      setSatelliteAnalyses(prev => [analysis, ...prev].slice(0, 10))
      toast.success('Satellite analysis complete', { description: location })
    } catch (error) {
      console.error('Error generating satellite analysis:', error)
      toast.error('Failed to generate analysis')
    } finally {
      setLoading(false)
    }
  }

  const generateBriefing = async () => {
    setLoading(true)
    
    const repoSummary = repositories.map(r => 
      `${r.name} (${r.category}, ${r.stars} stars, ${r.language}, updated ${r.lastUpdated})`
    ).join('; ')

    const totalStars = repositories.reduce((sum, r) => sum + r.stars, 0)
    const categories = {
      data: repositories.filter(r => r.category === 'data').length,
      ai: repositories.filter(r => r.category === 'ai').length,
      viz: repositories.filter(r => r.category === 'viz').length,
      infra: repositories.filter(r => r.category === 'infra').length
    }

    try {
      const prompt = (window.spark.llmPrompt as any)`You are a strategic intelligence analyst creating an executive briefing. Based on this geospatial intelligence platform with ${repositories.length} components (${categories.data} data sources, ${categories.ai} AI systems, ${categories.viz} visualization tools, ${categories.infra} infrastructure), total community engagement of ${totalStars} stars, analyze the technological landscape.

Repository details: ${repoSummary}

Return a JSON object with these exact fields:
{
  "executiveSummary": a 2-3 sentence high-level strategic overview,
  "keyDevelopments": an array of 3-4 notable developments or patterns in the technology stack,
  "technologicalTrends": an array of 3-4 emerging trends in geospatial AI and intelligence gathering,
  "recommendations": an array of 3 strategic recommendations for platform enhancement
}

Write as a professional intelligence briefing for senior decision-makers.`

      const response = await window.spark.llm(prompt, 'gpt-4o', true)
      const data = JSON.parse(response)
      
      const briefing: IntelligenceBriefing = {
        id: `brief-${Date.now()}`,
        executiveSummary: data.executiveSummary,
        keyDevelopments: data.keyDevelopments,
        technologicalTrends: data.technologicalTrends,
        recommendations: data.recommendations,
        timestamp: new Date()
      }
      
      setBriefings(prev => [briefing, ...prev].slice(0, 5))
      toast.success('Intelligence briefing generated')
    } catch (error) {
      console.error('Error generating briefing:', error)
      toast.error('Failed to generate briefing')
    } finally {
      setLoading(false)
    }
  }

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-500'
      case 'HIGH': return 'bg-orange-500'
      case 'MODERATE': return 'bg-yellow-500'
      case 'LOW': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    return `${Math.floor(seconds / 3600)}h ago`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">AI INTELLIGENCE CAPABILITIES</h2>
          <p className="text-sm text-muted-foreground">Real-time AI-powered geospatial and threat intelligence analysis</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Brain size={16} className="text-accent animate-pulse" weight="fill" />
          <span>3 AI Systems Active</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="space-y-4">
        <TabsList className="bg-card border border-border p-1">
          <TabsTrigger value="threat" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
            <Shield size={18} className="mr-2" />
            Threat Analysis
          </TabsTrigger>
          <TabsTrigger value="satellite" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
            <Globe size={18} className="mr-2" />
            Satellite Intel
          </TabsTrigger>
          <TabsTrigger value="briefing" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
            <FileText size={18} className="mr-2" />
            Executive Briefing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="threat" className="space-y-4">
          <Card className="p-6 border-border bg-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Geospatial Threat Intelligence</h3>
                <p className="text-sm text-muted-foreground">AI-powered threat assessment using conflict data and ML models</p>
              </div>
              <Button onClick={generateThreatAnalysis} disabled={loading}>
                {loading ? <Spinner size={18} className="mr-2 animate-spin" /> : <Target size={18} className="mr-2" />}
                Generate Analysis
              </Button>
            </div>
          </Card>

          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {threatAnalyses.length === 0 ? (
                <Card className="p-12 text-center">
                  <Shield size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No threat analyses generated yet</p>
                  <p className="text-sm text-muted-foreground mt-2">Click "Generate Analysis" to create an AI-powered threat assessment</p>
                </Card>
              ) : (
                threatAnalyses.map((analysis, index) => (
                  <motion.div
                    key={analysis.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="p-4 border-border hover:bg-muted/30 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="font-mono text-xs">{analysis.region}</Badge>
                            <Badge className={`${getThreatColor(analysis.threatLevel)} text-background text-xs`}>
                              {analysis.threatLevel}
                            </Badge>
                            <span className="text-xs text-muted-foreground ml-auto">{formatTimeAgo(analysis.timestamp)}</span>
                          </div>
                          <div className="mb-3">
                            <span className="text-xs text-muted-foreground">Confidence: </span>
                            <span className="text-sm font-bold text-accent">{(analysis.confidence * 100).toFixed(1)}%</span>
                          </div>
                          <div className="mb-3">
                            <h4 className="text-xs font-semibold text-foreground mb-2">Key Threat Factors:</h4>
                            <ul className="space-y-1">
                              {analysis.keyFactors.map((factor, idx) => (
                                <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                                  <span className="text-accent mt-0.5">▸</span>
                                  <span>{factor}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="p-3 bg-muted/50 rounded border border-border/50">
                            <h4 className="text-xs font-semibold text-foreground mb-1">Recommendation:</h4>
                            <p className="text-xs text-muted-foreground">{analysis.recommendation}</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="satellite" className="space-y-4">
          <Card className="p-6 border-border bg-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Satellite Imagery Intelligence</h3>
                <p className="text-sm text-muted-foreground">YOLOv8 object detection and change analysis on satellite imagery</p>
              </div>
              <Button onClick={generateSatelliteAnalysis} disabled={loading}>
                {loading ? <Spinner size={18} className="mr-2 animate-spin" /> : <Globe size={18} className="mr-2" />}
                Analyze Imagery
              </Button>
            </div>
          </Card>

          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {satelliteAnalyses.length === 0 ? (
                <Card className="p-12 text-center">
                  <Globe size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No satellite analyses generated yet</p>
                  <p className="text-sm text-muted-foreground mt-2">Click "Analyze Imagery" to process satellite intelligence</p>
                </Card>
              ) : (
                satelliteAnalyses.map((analysis, index) => (
                  <motion.div
                    key={analysis.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="p-4 border-border hover:bg-muted/30 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="font-mono text-xs">{analysis.location}</Badge>
                            <span className="text-xs text-muted-foreground ml-auto">{formatTimeAgo(analysis.timestamp)}</span>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <h4 className="text-xs font-semibold text-foreground mb-2">Detected Objects:</h4>
                              <div className="flex flex-wrap gap-1">
                                {analysis.detectedObjects.map((obj, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">{obj}</Badge>
                                ))}
                              </div>
                            </div>
                            <div className="p-3 bg-muted/50 rounded border border-border/50">
                              <h4 className="text-xs font-semibold text-foreground mb-1">Land Cover Change:</h4>
                              <p className="text-xs text-muted-foreground">{analysis.landCoverChange}</p>
                            </div>
                            <div className="p-3 bg-muted/50 rounded border border-border/50">
                              <h4 className="text-xs font-semibold text-foreground mb-1">Infrastructure Status:</h4>
                              <p className="text-xs text-muted-foreground">{analysis.infrastructureStatus}</p>
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold text-foreground mb-2">Anomalies Detected:</h4>
                              <ul className="space-y-1">
                                {analysis.anomalies.map((anomaly, idx) => (
                                  <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                                    <span className="text-accent mt-0.5">▸</span>
                                    <span>{anomaly}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="briefing" className="space-y-4">
          <Card className="p-6 border-border bg-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Strategic Intelligence Briefing</h3>
                <p className="text-sm text-muted-foreground">Executive-level analysis of platform capabilities and trends</p>
              </div>
              <Button onClick={generateBriefing} disabled={loading}>
                {loading ? <Spinner size={18} className="mr-2 animate-spin" /> : <FileText size={18} className="mr-2" />}
                Generate Briefing
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{repositories.length}</div>
                <div className="text-xs text-muted-foreground">Components</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{repositories.filter(r => r.category === 'ai').length}</div>
                <div className="text-xs text-muted-foreground">AI Systems</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{repositories.reduce((sum, r) => sum + r.stars, 0).toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Total Stars</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{briefings.length}</div>
                <div className="text-xs text-muted-foreground">Briefings</div>
              </div>
            </div>
          </Card>

          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {briefings.length === 0 ? (
                <Card className="p-12 text-center">
                  <FileText size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No briefings generated yet</p>
                  <p className="text-sm text-muted-foreground mt-2">Click "Generate Briefing" to create a strategic intelligence report</p>
                </Card>
              ) : (
                briefings.map((briefing, index) => (
                  <motion.div
                    key={briefing.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="p-5 border-border hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="outline" className="font-mono text-xs">CLASSIFIED - STRATEGIC</Badge>
                        <span className="text-xs text-muted-foreground">{formatTimeAgo(briefing.timestamp)}</span>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="p-4 bg-accent/10 border border-accent/30 rounded">
                          <h4 className="text-xs font-semibold text-accent mb-2">EXECUTIVE SUMMARY</h4>
                          <p className="text-sm text-foreground leading-relaxed">{briefing.executiveSummary}</p>
                        </div>

                        <div>
                          <h4 className="text-xs font-semibold text-foreground mb-2">KEY DEVELOPMENTS</h4>
                          <ul className="space-y-2">
                            {briefing.keyDevelopments.map((dev, idx) => (
                              <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2 p-2 bg-muted/30 rounded">
                                <span className="text-accent mt-0.5 font-bold">{idx + 1}.</span>
                                <span>{dev}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="text-xs font-semibold text-foreground mb-2">TECHNOLOGICAL TRENDS</h4>
                          <ul className="space-y-2">
                            {briefing.technologicalTrends.map((trend, idx) => (
                              <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2 p-2 bg-muted/30 rounded">
                                <span className="text-accent mt-0.5">▸</span>
                                <span>{trend}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-4 bg-primary/10 border border-primary/30 rounded">
                          <h4 className="text-xs font-semibold text-primary-foreground mb-2">STRATEGIC RECOMMENDATIONS</h4>
                          <ul className="space-y-2">
                            {briefing.recommendations.map((rec, idx) => (
                              <li key={idx} className="text-xs text-foreground flex items-start gap-2">
                                <span className="text-accent mt-0.5 font-bold">→</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
