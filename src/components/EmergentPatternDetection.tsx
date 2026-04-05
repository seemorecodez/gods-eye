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
  Sparkle,
  Network,
  Eye,
  Target,
  ChartBar,
  ArrowsClockwise,
  Trash
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface DataDomain {
  name: string
  metric: string
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

  const detectPattern = async () => {
    setIsDetecting(true)
    try {
      const selectedDomains = DATA_DOMAINS
        .sort(() => Math.random() - 0.5)
        .slice(0, 3 + Math.floor(Math.random() * 3))

      const prompt = (window.spark.llmPrompt as any)`You are an emergent pattern detection AI analyzing multi-domain intelligence data.

Selected intelligence domains for fusion:
${selectedDomains.map(d => `- ${d.domain}: ${d.capabilities}`).join('\n')}

Generate a realistic emergent pattern that correlates these domains. Return as JSON:
- title: Brief title of the emergent pattern (string)
- probability: Likelihood this pattern indicates a real threat or event (number 0.60-0.95)
- timeframe: When this pattern is occurring or will occur (string like "Next 72 hours", "Ongoing for 2 weeks")
- fusionChain: Array of 3-5 steps showing how the domains connect to reveal the pattern (array of strings)
- confidence: Model confidence in this correlation (number 0.65-0.92)
- recommendation: Specific actionable intelligence recommendation (string)

Make it realistic for geospatial intelligence analysis.`

      const result = await window.spark.llm(prompt, 'gpt-4o-mini', true)
      const data = JSON.parse(result)

      const correlationDomains: DataDomain[] = selectedDomains.map(domain => ({
        name: domain.domain,
        metric: domain.capabilities
      }))

      const newPattern: EmergentPattern = {
        id: `pattern-${Date.now()}`,
        probability: data.probability,
        title: data.title,
        timeframe: data.timeframe,
        fusionChain: data.fusionChain,
        correlations: correlationDomains,
        confidence: data.confidence,
        recommendation: data.recommendation,
        timestamp: new Date(),
        modelVersion: `v${(modelMetrics?.retrainCount || 0) + 1}.${Math.floor(Math.random() * 100)}`,
        trainingIterations: 1000 + Math.floor(Math.random() * 9000)
      }

      setPatterns((current) => [newPattern, ...(current || [])])

      setModelMetrics((current) => ({
        totalPatterns: (current?.totalPatterns || 0) + 1,
        avgProbability: current?.avgProbability 
          ? (current.avgProbability * (current.totalPatterns || 0) + data.probability) / ((current.totalPatterns || 0) + 1)
          : data.probability,
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
                <div key={domain.domain} className="border border-border rounded p-3 bg-muted/30">
                  <p className="text-xs font-semibold text-foreground mb-1">{domain.domain}</p>
                  <p className="text-xs text-muted-foreground">{domain.capabilities}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Separator className="mb-4" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="border border-border rounded p-4 bg-muted/20">
            <div className="flex items-center justify-between mb-2">
              <ChartBar size={16} className="text-accent" weight="fill" />
              <p className="text-xs text-muted-foreground">Patterns</p>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {modelMetrics?.totalPatterns || 0}
            </p>
          </div>

          <div className="border border-border rounded p-4 bg-muted/20">
            <div className="flex items-center justify-between mb-2">
              <Brain size={16} className="text-accent" weight="fill" />
              <p className="text-xs text-muted-foreground">Accuracy</p>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {((modelMetrics?.accuracyScore || 0.82) * 100).toFixed(1)}%
            </p>
          </div>

          <div className="border border-border rounded p-4 bg-muted/20">
            <div className="flex items-center justify-between mb-2">
              <Target size={16} className="text-accent" weight="fill" />
              <p className="text-xs text-muted-foreground">Avg Probability</p>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {((modelMetrics?.avgProbability || 0) * 100).toFixed(0)}%
            </p>
          </div>

          <div className="border border-border rounded p-4 bg-muted/20">
            <div className="flex items-center justify-between mb-2">
              <Eye size={16} className="text-accent" weight="fill" />
              <p className="text-xs text-muted-foreground">Data Points</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">
                {(modelMetrics?.dataPoints || 0).toLocaleString()}
              </p>
              <div className="text-xs text-muted-foreground">
                Model v{(modelMetrics?.retrainCount || 0) + 1}.0
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2">
            <Button 
              onClick={detectPattern} 
              disabled={isDetecting || isRetraining}
              className="flex-1"
            >
              {isDetecting ? (
                <>
                  <ArrowsClockwise size={18} className="mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkle size={18} className="mr-2" weight="fill" />
                  Detect Emergent Pattern
                </>
              )}
            </Button>
            <Button 
              onClick={retrainModel} 
              disabled={isDetecting || isRetraining}
              variant="secondary"
            >
              <ArrowsClockwise size={18} className={isRetraining ? "animate-spin" : ""} />
            </Button>
            <Button 
              onClick={clearPatterns} 
              disabled={isDetecting || isRetraining || !patterns || patterns.length === 0}
              variant="outline"
            >
              <Trash size={18} />
            </Button>
          </div>

          {isRetraining && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Retraining model...</span>
                <span>{retrainProgress.toFixed(0)}%</span>
              </div>
              <Progress value={retrainProgress} className="h-2" />
            </div>
          )}
        </div>
      </Card>

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">Detected Patterns</h3>
        <ScrollArea className="h-[600px] pr-4">
          {!patterns || patterns.length === 0 ? (
            <Card className="p-8 text-center border-dashed">
              <p className="text-muted-foreground mb-2">No emergent patterns detected yet</p>
              <p className="text-sm text-muted-foreground">
                Click &quot;Detect Emergent Pattern&quot; to discover multi-domain correlations
              </p>
            </Card>
          ) : (
            <AnimatePresence>
              <div className="space-y-4">
                {patterns.map((pattern) => (
                  <motion.div
                    key={pattern.id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className={`p-5 border ${getProbabilityBg(pattern.probability)}`}>
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {pattern.modelVersion}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {formatTimeAgo(pattern.timestamp)}
                              </Badge>
                            </div>
                            <h4 className="font-bold text-foreground text-lg mb-1">
                              {pattern.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {pattern.timeframe}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-3xl font-bold ${getProbabilityColor(pattern.probability)}`}>
                              {(pattern.probability * 100).toFixed(0)}%
                            </p>
                            <p className="text-xs text-muted-foreground">probability</p>
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-2">
                            <Network size={14} weight="bold" />
                            Intelligence Domains Correlated
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {pattern.correlations.map((domain, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-xs">
                                <span className="text-accent mt-0.5">▸</span>
                                <div>
                                  <p className="font-semibold text-foreground">{domain.name}</p>
                                  <p className="text-muted-foreground">{domain.metric}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-2">
                            <Brain size={14} weight="bold" />
                            Fusion Chain
                          </h4>
                          <div className="space-y-1">
                            {pattern.fusionChain.map((step, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-xs">
                                <span className="text-accent font-mono">{idx + 1}.</span>
                                <p className="text-foreground">{step}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-2">
                            <Target size={14} weight="bold" />
                            Recommended Action
                          </h4>
                          <p className="text-sm text-foreground">{pattern.recommendation}</p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-border/50">
                          <div className="text-xs text-muted-foreground">
                            Confidence: {(pattern.confidence * 100).toFixed(1)}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {pattern.trainingIterations.toLocaleString()} iterations
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </ScrollArea>
      </div>

      <Card className="p-6 bg-muted/20 border-border">
        <div className="flex items-start gap-3">
          <Brain size={24} className="text-accent mt-1" weight="fill" />
          <div>
            <h3 className="font-semibold text-foreground mb-2">How Emergent Pattern Detection Works</h3>
            <p className="text-xs text-muted-foreground">
              The system analyzes multiple intelligence domains simultaneously (imagery from satellites, signals from communications, 
              cyber data from social media, economic data like trade and night lights, environmental factors like weather, and social 
              demographics). Using machine learning, it identifies non-obvious correlations that human analysts might miss, revealing 
              emerging threats or events before they fully develop.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
