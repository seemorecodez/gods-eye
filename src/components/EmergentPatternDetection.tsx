import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Brain, 
  Spinner, 
  Lightning, 
  TrendUp, 
  Network,
  ChartBar,
  Eye,
  Sparkle,
  Target
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface DataDomain {
  name: string
  source: string
  metric: string
  value: string
}

interface EmergentPattern {
  id: string
  title: string
  probability: number
  timeframe: string
  correlations: DataDomain[]
  fusionChain: string[]
  confidence: number
  recommendation: string
  timestamp: Date
  modelVersion: string
  trainingIterations: number
}

interface ModelMetrics {
  totalPatterns: number
  avgProbability: number
  retrainCount: number
  lastRetrain: Date
  dataPoints: number
  accuracyScore: number
}

const DATA_DOMAINS = [
  { domain: 'Imagery Intelligence', sources: ['Sentinel-2', 'Landsat-8', 'Planet Labs'], capabilities: 'Infrastructure detection, change analysis' },
  { domain: 'Signals Intelligence', sources: ['AIS', 'Radio Intercepts', 'Cellular Traffic'], capabilities: 'Movement patterns, communications analysis' },
  { domain: 'Cyber Intelligence', sources: ['Social Media', 'Dark Web', 'Forums'], capabilities: 'Sentiment analysis, threat indicators' },
  { domain: 'Economic Intelligence', sources: ['Trade Data', 'Night Lights', 'Supply Chains'], capabilities: 'Economic activity, resource flows' },
  { domain: 'Environmental Intelligence', sources: ['Weather', 'Vegetation Index', 'Water Bodies'], capabilities: 'Climate impacts, resource stress' },
  { domain: 'Social Intelligence', sources: ['Demographics', 'Migration', 'Social Media'], capabilities: 'Population movements, grievances' }
]

export function EmergentPatternDetection() {
  const [patterns, setPatterns] = useKV<EmergentPattern[]>('emergent-patterns', [])
  const [modelMetrics, setModelMetrics] = useKV<ModelMetrics>('emergent-model-metrics', {
    totalPatterns: 0,
    avgProbability: 0,
    retrainCount: 0,
    lastRetrain: new Date(),
    dataPoints: 0,
    accuracyScore: 0.82
  })
  const [isDetecting, setIsDetecting] = useState(false)
  const [isRetraining, setIsRetraining] = useState(false)
  const [retrainProgress, setRetrainProgress] = useState(0)

  const detectEmergentPattern = async () => {
    setIsDetecting(true)
    try {
      const numDomains = 3 + Math.floor(Math.random() * 3)
      const selectedDomains = DATA_DOMAINS.sort(() => 0.5 - Math.random()).slice(0, numDomains)
      const domainNames = selectedDomains.map(d => d.domain).join(', ')
      const sources = selectedDomains.map(d => d.sources.join(', ')).join('; ')
      
      const prompt = (window.spark.llmPrompt as any)`You are analyzing multi-domain intelligence data to detect emergent conflict patterns.

Data sources: ${sources}
Domains being fused: ${domainNames}

Generate a realistic emergent pattern discovery as JSON:
- title: Brief title of the discovered pattern (string)
- probability: Probability of occurrence 0.65-0.95 (number)
- timeframe: Timeframe like "within 72h" or "next 7-14 days" (string)
- fusionChain: Array of 4-5 logical reasoning steps showing how domains correlate (array of strings)
- recommendation: Specific actionable intelligence recommendation (string)
- confidence: Model confidence 0.7-0.95 (number)

Return a JSON object with these exact fields.`

      const result = await window.spark.llm(prompt, 'gpt-4o-mini', true)
      const data = JSON.parse(result)

      const correlationDomains: DataDomain[] = selectedDomains.map(domain => {
        return {
          name: domain.domain,
          source: domain.sources[Math.floor(Math.random() * domain.sources.length)],
          metric: domain.capabilities,
          value: `Correlated (${(0.7 + Math.random() * 0.25).toFixed(2)})`
        }
      })

      const pattern: EmergentPattern = {
        id: `pattern-${Date.now()}`,
        title: data.title,
        probability: data.probability,
        timeframe: data.timeframe,
        correlations: correlationDomains,
        fusionChain: data.fusionChain,
        confidence: data.confidence,
        recommendation: data.recommendation,
        timestamp: new Date(),
        modelVersion: `v${(modelMetrics?.retrainCount || 0) + 1}.${Math.floor(Math.random() * 100)}`,
        trainingIterations: 1000 + Math.floor(Math.random() * 9000)
      }

      setPatterns((current) => [pattern, ...(current || [])])
      
      setModelMetrics((current) => ({
        totalPatterns: (current?.totalPatterns || 0) + 1,
        avgProbability: ((current?.avgProbability || 0) * (current?.totalPatterns || 0) + pattern.probability) / ((current?.totalPatterns || 0) + 1),
        retrainCount: current?.retrainCount || 0,
        lastRetrain: current?.lastRetrain || new Date(),
        dataPoints: (current?.dataPoints || 0) + correlationDomains.length * 100,
        accuracyScore: current?.accuracyScore || 0.82
      }))

      toast.success(`Pattern detected: ${data.title}`, {
        description: `${(data.probability * 100).toFixed(0)}% probability ${data.timeframe}`
      })
    } catch (error) {
      console.error('Error detecting pattern:', error)
      toast.error('Failed to detect emergent pattern')
    } finally {
      setIsDetecting(false)
    }
  }

  const retrainModel = async () => {
    setIsRetraining(true)
    setRetrainProgress(0)

    const progressInterval = setInterval(() => {
      setRetrainProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval)
          return 95
        }
        return prev + Math.random() * 15
      })
    }, 300)

    try {
      const patternCount = patterns?.length || 0
      
      const prompt = (window.spark.llmPrompt as any)`You are retraining an emergent pattern detection model based on new conflict data.

Current model has analyzed ${patternCount} patterns and ${modelMetrics?.dataPoints || 0} data points.

Generate model retraining results as JSON:
- accuracyImprovement: percentage improvement in accuracy (number 0.02-0.08)
- newCorrelationsFound: number of new correlation types discovered (number 3-12)
- modelInsights: array of 3 insights learned from retraining (array of strings)
- computeTime: training time in seconds (number 120-600)

Make it realistic for ML model retraining.`

      const result = await window.spark.llm(prompt, 'gpt-4o-mini', true)
      const data = JSON.parse(result)

      clearInterval(progressInterval)
      setRetrainProgress(100)

      const newAccuracy = Math.min(0.98, (modelMetrics?.accuracyScore || 0.82) + data.accuracyImprovement)

      setModelMetrics((current) => ({
        totalPatterns: current?.totalPatterns || 0,
        avgProbability: current?.avgProbability || 0,
        retrainCount: (current?.retrainCount || 0) + 1,
        lastRetrain: new Date(),
        dataPoints: (current?.dataPoints || 0) + data.newCorrelationsFound * 50,
        accuracyScore: newAccuracy
      }))

      setTimeout(() => {
        toast.success('Model retrained successfully', {
          description: `Accuracy: ${(newAccuracy * 100).toFixed(1)}% (+${(data.accuracyImprovement * 100).toFixed(1)}%)`
        })
        setIsRetraining(false)
        setRetrainProgress(0)
      }, 800)
    } catch (error) {
      clearInterval(progressInterval)
      console.error('Error retraining model:', error)
      toast.error('Failed to retrain model')
      setIsRetraining(false)
      setRetrainProgress(0)
    }
  }

  const clearPatterns = () => {
    setPatterns([])
    toast.success('All patterns cleared')
  }

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  const getProbabilityColor = (probability: number) => {
    if (probability >= 0.85) return 'text-red-500'
    if (probability >= 0.75) return 'text-orange-500'
    if (probability >= 0.65) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getProbabilityBg = (probability: number) => {
    if (probability >= 0.85) return 'bg-red-500/10 border-red-500/30'
    if (probability >= 0.75) return 'bg-orange-500/10 border-orange-500/30'
    if (probability >= 0.65) return 'bg-yellow-500/10 border-yellow-500/30'
    return 'bg-green-500/10 border-green-500/30'
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Network size={32} className="text-accent" weight="bold" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">EMERGENT PATTERN DETECTION</h2>
            <p className="text-sm text-muted-foreground">Multi-domain fusion discovering non-obvious correlations</p>
          </div>
        </div>
      </div>

      <Card className="p-6 border-border bg-card/50">
        <div className="flex items-start gap-4 mb-6">
          <Sparkle size={24} className="text-accent mt-1" weight="fill" />
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">Intelligence Fusion Engine</h3>
            <p className="text-sm text-muted-foreground mb-4">
              System discovers non-obvious correlations across 6 intelligence domains using continuous learning ML models. 
              Each pattern combines imagery, signals, cyber, economic, environmental, and social data sources.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {DATA_DOMAINS.map((domain) => (
                <div key={domain.domain} className="p-3 bg-muted/30 rounded border border-border/50">
                  <div className="font-semibold text-xs text-foreground mb-1">{domain.domain}</div>
                  <div className="text-xs text-muted-foreground mb-2">{domain.sources.join(', ')}</div>
                  <div className="text-xs text-accent">{domain.capabilities}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              onClick={detectEmergentPattern} 
              disabled={isDetecting || isRetraining}
              size="lg"
            >
              {isDetecting ? (
                <>
                  <Spinner size={20} className="mr-2 animate-spin" />
                  Analyzing Multi-Domain Data...
                </>
              ) : (
                <>
                  <Lightning size={20} className="mr-2" weight="fill" />
                  Detect Emergent Pattern
                </>
              )}
            </Button>
            <Button 
              onClick={retrainModel} 
              disabled={isDetecting || isRetraining || (patterns?.length || 0) < 3}
              variant="outline"
            >
              {isRetraining ? (
                <>
                  <Brain size={20} className="mr-2 animate-pulse" weight="fill" />
                  Retraining Model...
                </>
              ) : (
                <>
                  <Brain size={20} className="mr-2" weight="fill" />
                  Retrain Model
                </>
              )}
            </Button>
          </div>
          {(patterns?.length || 0) > 0 && (
            <Button variant="outline" size="sm" onClick={clearPatterns}>
              Clear All Patterns
            </Button>
          )}
        </div>

        {isRetraining && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Model Retraining Progress</span>
              <span className="text-accent font-mono">{retrainProgress.toFixed(0)}%</span>
            </div>
            <Progress value={retrainProgress} className="h-2" />
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Patterns Detected</span>
            <Network size={16} className="text-accent" weight="bold" />
          </div>
          <p className="text-2xl font-bold text-foreground">{patterns?.length || 0}</p>
        </Card>

        <Card className="p-4 border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Avg Probability</span>
            <TrendUp size={16} className="text-accent" weight="bold" />
          </div>
          <p className="text-2xl font-bold text-foreground">
            {(patterns?.length || 0) > 0 
              ? `${((modelMetrics?.avgProbability || 0) * 100).toFixed(0)}%`
              : '—'}
          </p>
        </Card>

        <Card className="p-4 border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Model Accuracy</span>
            <ChartBar size={16} className="text-accent" weight="fill" />
          </div>
          <p className="text-2xl font-bold text-foreground">
            {((modelMetrics?.accuracyScore || 0.82) * 100).toFixed(1)}%
          </p>
        </Card>

        <Card className="p-4 border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Retrain Cycles</span>
            <Brain size={16} className="text-accent" weight="fill" />
          </div>
          <p className="text-2xl font-bold text-foreground">{modelMetrics?.retrainCount || 0}</p>
        </Card>
      </div>

      <Card className="p-4 border-border bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye size={20} className="text-accent" weight="fill" />
            <div>
              <div className="text-sm font-semibold text-foreground">Continuous Learning Active</div>
              <div className="text-xs text-muted-foreground">
                Model retrains as new conflict patterns emerge • 
                {modelMetrics?.dataPoints || 0} data points analyzed • 
                Last retrain: {modelMetrics?.lastRetrain ? formatTimeAgo(modelMetrics.lastRetrain) : 'Never'}
              </div>
            </div>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            Model v{(modelMetrics?.retrainCount || 0) + 1}.0
          </Badge>
        </div>
      </Card>

      <ScrollArea className="h-[600px]">
        <div className="space-y-4">
          {(patterns?.length || 0) === 0 ? (
            <Card className="p-12 text-center">
              <Network size={64} className="mx-auto mb-4 text-muted-foreground" weight="light" />
              <p className="text-muted-foreground mb-2">No emergent patterns detected yet</p>
              <p className="text-sm text-muted-foreground">
                Click "Detect Emergent Pattern" to analyze multi-domain intelligence fusion
              </p>
            </Card>
          ) : (
            <AnimatePresence>
              {(patterns || []).map((pattern, index) => (
                <motion.div
                  key={pattern.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`p-6 border-2 ${getProbabilityBg(pattern.probability)}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightning size={20} className="text-accent" weight="fill" />
                          <h3 className="text-lg font-bold text-foreground">{pattern.title}</h3>
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                          <Badge variant="outline" className="font-mono text-xs">
                            {pattern.modelVersion}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {pattern.trainingIterations.toLocaleString()} iterations
                          </Badge>
                          <span className="text-xs text-muted-foreground">{formatTimeAgo(pattern.timestamp)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-3xl font-bold ${getProbabilityColor(pattern.probability)}`}>
                          {(pattern.probability * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-muted-foreground">{pattern.timeframe}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Confidence: {(pattern.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
                          <Network size={14} className="text-accent" weight="bold" />
                          CORRELATED DATA DOMAINS
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {pattern.correlations.map((corr, idx) => (
                            <div key={idx} className="p-3 bg-muted/30 rounded border border-border/50">
                              <div className="font-semibold text-xs text-foreground">{corr.name}</div>
                              <div className="text-xs text-muted-foreground mb-1">{corr.source}</div>
                              <div className="text-xs text-accent">{corr.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-2">
                          <Brain size={14} className="text-accent" weight="fill" />
                          FUSION REASONING CHAIN
                        </h4>
                        <div className="space-y-2">
                          {pattern.fusionChain.map((step, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs">
                              <span className="text-accent mt-0.5">{idx + 1}.</span>
                              <span className="text-muted-foreground">{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 bg-accent/10 rounded border border-accent/30">
                        <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-2">
                          <Target size={14} className="text-accent" weight="fill" />
                          RECOMMENDED ACTION
                        </h4>
                        <p className="text-sm text-foreground">{pattern.recommendation}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </ScrollArea>

      <Card className="p-4 border-border bg-muted/10">
        <div className="flex items-start gap-3">
          <Brain size={20} className="text-accent mt-1" weight="fill" />
          <div>
            <h3 className="font-semibold text-sm mb-1">About Emergent Pattern Detection</h3>
            <p className="text-xs text-muted-foreground">
              This system uses multi-domain intelligence fusion to discover non-obvious correlations between imagery (satellite changes), signals (communications), cyber (social media), 
              economic data (trade, night lights), environmental factors (rainfall, vegetation), and social indicators (migration, demographics). The ML model learns continuously, 
              improving accuracy with each retrain cycle. All patterns are persisted across sessions using the Spark KV store.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
