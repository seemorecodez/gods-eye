import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Brain, Spinner, Target, FileText, Globe, Shield, Clock, Image } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Repository, MLPrediction } from '@/lib/types'
import { fetchAllRepositories } from '@/lib/github-api'
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

const ML_MODELS = [
  'YOLOv8-Detection',
  'Change-Detection-CNN',
  'Conflict-Predictor-LSTM',
  'Sentinel-Classifier',
  'Infrastructure-Monitor'
]

const LOCATIONS = [
  'Damascus, Syria',
  'Khartoum, Sudan',
  'Kiev, Ukraine',
  'Gaza Strip',
  'Aleppo, Syria',
  'Donetsk, Ukraine'
]

const OBJECTS = [
  'Military Vehicle',
  'Building Complex',
  'Infrastructure',
  'Destroyed Structure',
  'Convoy',
  'Checkpoint',
  'Camp',
  'Aircraft'
]

export function MLPredictionsVisualizer() {
  const [activeTab, setActiveTab] = useState<'threat' | 'satellite' | 'briefing'>('threat')
  const [loading, setLoading] = useState(false)
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [predictions, setPredictions] = useState<MLPrediction[]>([])
  const [threatAnalyses, setThreatAnalyses] = useState<ThreatAnalysis[]>([])
  const [satelliteAnalyses, setSatelliteAnalyses] = useState<SatelliteAnalysis[]>([])
  const [briefings, setBriefings] = useState<IntelligenceBriefing[]>([])

  useEffect(() => {
    async function loadRepos() {
      const repos = await fetchAllRepositories()
      setRepositories(repos)
    }
    loadRepos()

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        addPrediction()
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const addPrediction = () => {
    const model = ML_MODELS[Math.floor(Math.random() * ML_MODELS.length)]
    const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)]
    const objects = Math.floor(Math.random() * 15) + 1

    const prediction: MLPrediction = {
      id: Date.now().toString(),
      modelName: model,
      inputType: `Satellite imagery - ${location}`,
      prediction: `Detected ${objects} object(s) of interest`,
      confidence: 0.65 + Math.random() * 0.34,
      timestamp: new Date(),
      metadata: {
        processingTime: Math.floor(Math.random() * 500) + 100,
        imageSize: '2048x2048',
        objectsDetected: objects,
        modelVersion: 'v' + (Math.floor(Math.random() * 3) + 1) + '.' + Math.floor(Math.random() * 10)
      }
    }

    setPredictions(prev => [prediction, ...prev].slice(0, 20))
  }

  const generateThreatAnalysis = async () => {
    setLoading(true)
    try {
      const region = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)]
      
      const prompt = (window.spark.llmPrompt as any)`You are a geospatial intelligence analyst. Generate a threat analysis for ${region}.

Return a JSON object with these fields:
- keyFactors: array of 3-4 specific threat factors (strings)
- recommendation: a brief tactical recommendation (string)
- threatLevel: one of LOW, MODERATE, HIGH, CRITICAL (string)
- confidence: a number between 0.7 and 1.0

Make it realistic and specific to the region.`

      const result = await window.spark.llm(prompt, 'gpt-4o-mini', true)
      const data = JSON.parse(result)

      const analysis: ThreatAnalysis = {
        id: Date.now().toString(),
        region,
        threatLevel: data.threatLevel as ThreatAnalysis['threatLevel'],
        confidence: data.confidence,
        keyFactors: data.keyFactors,
        recommendation: data.recommendation,
        timestamp: new Date()
      }

      setThreatAnalyses(prev => [analysis, ...prev])
      toast.success('Threat analysis generated')
    } catch (error) {
      console.error('Error generating threat analysis:', error)
      toast.error('Failed to generate threat analysis')
    } finally {
      setLoading(false)
    }
  }

  const generateSatelliteAnalysis = async () => {
    setLoading(true)
    try {
      const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)]
      
      const prompt = (window.spark.llmPrompt as any)`You are analyzing satellite imagery of ${location} using YOLOv8 and change detection algorithms.

Return a JSON object with these fields:
- detectedObjects: array of 4-6 detected objects like "Military Vehicle", "Building Complex", etc. (strings)
- landCoverChange: description of land cover changes observed (string)
- infrastructureStatus: current infrastructure status assessment (string)  
- anomalies: array of 2-3 anomalies detected (strings)

Make it realistic and specific to conflict zones.`

      const result = await window.spark.llm(prompt, 'gpt-4o-mini', true)
      const data = JSON.parse(result)

      const analysis: SatelliteAnalysis = {
        id: Date.now().toString(),
        location,
        detectedObjects: data.detectedObjects,
        landCoverChange: data.landCoverChange,
        infrastructureStatus: data.infrastructureStatus,
        anomalies: data.anomalies,
        timestamp: new Date()
      }

      setSatelliteAnalyses(prev => [analysis, ...prev])
      toast.success('Satellite analysis complete')
    } catch (error) {
      console.error('Error generating satellite analysis:', error)
      toast.error('Failed to analyze satellite imagery')
    } finally {
      setLoading(false)
    }
  }

  const generateBriefing = async () => {
    setLoading(true)
    try {
      const aiCount = repositories.filter(r => r.category === 'ai').length
      const totalStars = repositories.reduce((sum, r) => sum + r.stars, 0)
      
      const prompt = (window.spark.llmPrompt as any)`You are generating a strategic intelligence briefing for a geospatial intelligence platform called "God's Eye".

The platform has ${repositories.length} components, ${aiCount} AI systems, and ${totalStars} total GitHub stars.

Return a JSON object with these fields:
- executiveSummary: 2-3 sentence executive summary of platform capabilities (string)
- keyDevelopments: array of 3 key developments or capabilities (strings)
- technologicalTrends: array of 3 technological trends in geospatial intelligence (strings)
- recommendations: array of 3 strategic recommendations (strings)

Make it professional and strategic.`

      const result = await window.spark.llm(prompt, 'gpt-4o-mini', true)
      const data = JSON.parse(result)

      const briefing: IntelligenceBriefing = {
        id: Date.now().toString(),
        executiveSummary: data.executiveSummary,
        keyDevelopments: data.keyDevelopments,
        technologicalTrends: data.technologicalTrends,
        recommendations: data.recommendations,
        timestamp: new Date()
      }

      setBriefings(prev => [briefing, ...prev])
      toast.success('Intelligence briefing generated')
    } catch (error) {
      console.error('Error generating briefing:', error)
      toast.error('Failed to generate briefing')
    } finally {
      setLoading(false)
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-400'
    if (confidence >= 0.75) return 'text-yellow-400'
    return 'text-orange-400'
  }

  const getConfidenceBgColor = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-green-400'
    if (confidence >= 0.75) return 'bg-yellow-400'
    return 'bg-orange-400'
  }

  const getThreatColor = (level: ThreatAnalysis['threatLevel']) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-500'
      case 'HIGH': return 'bg-orange-500'
      case 'MODERATE': return 'bg-yellow-500'
      case 'LOW': return 'bg-green-500'
    }
  }

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
    
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    return `${Math.floor(seconds / 3600)}h ago`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">ML PREDICTION STREAM</h2>
          <p className="text-sm text-muted-foreground">Real-time machine learning inference results with confidence scores</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Brain size={16} className="text-accent animate-pulse" weight="fill" />
          <span>Live predictions</span>
        </div>
      </div>

      <ScrollArea className="h-[300px] rounded-lg border border-border bg-card">
        <div className="p-4 space-y-3">
          {predictions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Brain size={48} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Waiting for ML predictions...</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {predictions.map((prediction, index) => (
                <motion.div
                  key={prediction.id}
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: index * 0.015 }}
                >
                  <Card className="p-4 hover:bg-muted/50 transition-colors border border-border/50">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="mt-1">
                            <Target size={20} className="text-accent" weight="bold" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <Badge variant="outline" className="font-mono text-xs">
                                {prediction.modelName}
                              </Badge>
                              <Badge variant="secondary" className="font-mono text-xs">
                                {prediction.metadata.modelVersion}
                              </Badge>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                                <Clock size={14} />
                                {formatTimeAgo(prediction.timestamp)}
                              </div>
                            </div>
                            
                            <p className="text-sm text-foreground font-medium mb-1">
                              {prediction.inputType}
                            </p>
                            
                            <p className="text-xs text-muted-foreground mb-2">
                              {prediction.prediction}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Confidence Score</span>
                          <span className={`font-bold font-mono ${getConfidenceColor(prediction.confidence)}`}>
                            {(prediction.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="relative">
                          <Progress 
                            value={prediction.confidence * 100} 
                            className="h-2"
                          />
                          <div 
                            className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getConfidenceBgColor(prediction.confidence)}`}
                            style={{ width: `${prediction.confidence * 100}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border/50">
                        <span className="flex items-center gap-1">
                          <Image size={12} />
                          {prediction.metadata.imageSize}
                        </span>
                        <span className="flex items-center gap-1">
                          <Target size={12} />
                          {prediction.metadata.objectsDetected} objects
                        </span>
                        <span className="font-mono">
                          {prediction.metadata.processingTime}ms
                        </span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </ScrollArea>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Active Models</span>
            <Badge variant="outline" className="text-accent border-accent">
              {ML_MODELS.length}
            </Badge>
          </div>
          <p className="text-2xl font-bold text-foreground">{ML_MODELS.length}</p>
        </Card>

        <Card className="p-4 border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Predictions</span>
            <Badge variant="outline" className="text-accent border-accent">
              {predictions.length}
            </Badge>
          </div>
          <p className="text-2xl font-bold text-foreground">{predictions.length}</p>
        </Card>

        <Card className="p-4 border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Avg Confidence</span>
            <Brain size={16} className="text-accent" weight="fill" />
          </div>
          <p className="text-2xl font-bold text-foreground">
            {predictions.length > 0 
              ? ((predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length) * 100).toFixed(1) + '%'
              : '0%'
            }
          </p>
        </Card>
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
