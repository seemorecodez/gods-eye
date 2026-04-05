import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Network,
  ArrowsClockwise,
  Brain,
  CheckCircle,
  Warning,
  Sparkle
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
  fusionChain: string[]
  correlations: DataDomain[]
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
  { domain: 'Signals Intelligence', capabilities: 'Communications intercepts, radar tracking' },
  { domain: 'Economic Intelligence', capabilities: 'Trade flows, sanctions monitoring' },
  { domain: 'Imagery Intelligence', capabilities: 'Satellite imagery, object detection' },
  { domain: 'Cyber Intelligence', capabilities: 'Network traffic, threat monitoring' },
  { domain: 'Environmental Data', capabilities: 'Weather patterns, terrain analysis' },
  { domain: 'Social Intelligence', capabilities: 'Social media, demographic trends' }
]

export function EmergentPatternDetection() {
  const [patterns, setPatterns] = useKV<EmergentPattern[]>('emergent-patterns', [])
  const [modelMetrics, setModelMetrics] = useKV<ModelMetrics>('model-metrics', {
    totalPatterns: 0,
    avgProbability: 0,
    retrainCount: 0,
    lastRetrain: new Date(),
    dataPoints: 0,
    accuracyScore: 0.85
  })
  const [isDetecting, setIsDetecting] = useState(false)
  const [isRetraining, setIsRetraining] = useState(false)
  const [retrainProgress, setRetrainProgress] = useState(0)

  const currentPatterns = patterns || []
  const currentMetrics = modelMetrics || {
    totalPatterns: 0,
    avgProbability: 0,
    retrainCount: 0,
    lastRetrain: new Date(),
    dataPoints: 0,
    accuracyScore: 0.85
  }

  const detectPattern = async () => {
    setIsDetecting(true)
    try {
      const selectedDomains = DATA_DOMAINS
        .sort(() => Math.random() - 0.5)
        .slice(0, 3 + Math.floor(Math.random() * 2))

      const domainsList = selectedDomains.map(d => `- ${d.domain}: ${d.capabilities}`).join('\n')
      
      const promptText = `You are an AI fusion analyst detecting emergent patterns across intelligence domains.

Selected intelligence domains for fusion:
${domainsList}

Generate a realistic emergent pattern that could be detected by cross-correlating these intelligence domains. Return the result as a valid JSON object with the following structure:
{
  "title": "Brief title of the emergent pattern (string)",
  "probability": "Likelihood this pattern will manifest (number between 0-1)",
  "timeframe": "Expected timeframe (e.g., '24-48 hours', '2-3 weeks')",
  "fusionChain": ["Array of 3-5 strings describing the analysis steps taken"],
  "confidence": "Model confidence in this prediction (number between 0-1)",
  "recommendation": "Strategic recommendation based on this pattern (string, 1-2 sentences)"
}

Make it specific and realistic.`

      const result = await window.spark.llm(promptText, 'gpt-4o-mini', true)
      const data = JSON.parse(result)
      
      const correlationDomains: DataDomain[] = selectedDomains.map(domain => ({
        name: domain.domain,
        metric: domain.capabilities
      }))

      const newPattern: EmergentPattern = {
        id: `pattern-${Date.now()}`,
        title: data.title,
        probability: data.probability,
        timeframe: data.timeframe,
        fusionChain: data.fusionChain,
        correlations: correlationDomains,
        confidence: data.confidence,
        recommendation: data.recommendation,
        timestamp: new Date(),
        modelVersion: '3.2.1',
        trainingIterations: 1000 + Math.floor(Math.random() * 9000)
      }

      setPatterns((current) => [newPattern, ...(current || [])].slice(0, 10))
      setModelMetrics((current) => {
        const curr = current || currentMetrics
        return {
          totalPatterns: curr.totalPatterns + 1,
          avgProbability: curr.totalPatterns
            ? (curr.avgProbability * curr.totalPatterns + data.probability) / (curr.totalPatterns + 1)
            : data.probability,
          retrainCount: curr.retrainCount,
          lastRetrain: curr.lastRetrain,
          dataPoints: curr.dataPoints + correlationDomains.length,
          accuracyScore: curr.accuracyScore
        }
      })

      toast.success(`Pattern detected: ${data.title}`, {
        description: `${(data.probability * 100).toFixed(1)}% probability`
      })
    } catch (error) {
      console.error('Error detecting pattern:', error)
      toast.error('Failed to detect pattern')
    } finally {
      setIsDetecting(false)
    }
  }

  const retrainModel = async () => {
    setIsRetraining(true)
    setRetrainProgress(0)
    try {
      setRetrainProgress(30)
      await new Promise(resolve => setTimeout(resolve, 1000))

      setRetrainProgress(60)
      const patternCount = currentPatterns.length
      const promptText = `You are simulating ML model retraining for an intelligence fusion system.

Current model has analyzed ${patternCount} patterns across 6 intelligence domains.
Generate model retraining results as JSON with this structure:
{
  "newAccuracy": "New model accuracy after retraining (number between 0.80-0.99)",
  "newCorrelationsFound": "number of new correlations discovered (number 5-50)",
  "computeTime": "training time in seconds (number 30-300)",
  "improvementPct": "percentage improvement (number 0-15)"
}

Make it realistic for ML model retraining.`

      const result = await window.spark.llm(promptText, 'gpt-4o-mini', true)
      const data = JSON.parse(result)
      const newAccuracy = parseFloat(data.newAccuracy)

      setRetrainProgress(90)
      await new Promise(resolve => setTimeout(resolve, 500))

      setModelMetrics((current) => {
        const curr = current || currentMetrics
        return {
          totalPatterns: curr.totalPatterns,
          avgProbability: curr.avgProbability,
          dataPoints: curr.dataPoints,
          retrainCount: curr.retrainCount + 1,
          lastRetrain: new Date(),
          accuracyScore: newAccuracy
        }
      })

      setRetrainProgress(100)
      toast.success('Model retrained successfully', {
        description: `Accuracy: ${(newAccuracy * 100).toFixed(1)}% (+${data.improvementPct}%)`
      })
      setTimeout(() => setRetrainProgress(0), 500)
    } catch (error) {
      console.error('Error retraining model:', error)
      toast.error('Failed to retrain model')
    } finally {
      setIsRetraining(false)
    }
  }

  const clearPatterns = () => {
    setPatterns([])
    toast.info('All patterns cleared')
  }

  const formatTimeSince = (date: Date) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  const getProbabilityColor = (probability: number) => {
    if (probability >= 0.75) return 'text-destructive'
    if (probability >= 0.5) return 'text-yellow-400'
    if (probability >= 0.35) return 'text-blue-400'
    return 'text-muted-foreground'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Network size={32} className="text-accent" weight="fill" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">EMERGENT PATTERN DETECTION</h2>
            <p className="text-sm text-muted-foreground">Cross-domain intelligence fusion & predictive analytics</p>
          </div>
        </div>
      </div>

      <Card className="p-6 border-border bg-card">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
          <div>
            <h3 className="font-semibold text-foreground mb-2">Model Metrics</h3>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Patterns: <span className="text-foreground font-mono">{currentMetrics.totalPatterns}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Avg Probability: <span className="text-foreground font-mono">
                  {(currentMetrics.avgProbability * 100).toFixed(1)}%
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                Accuracy: <span className="text-foreground font-mono">
                  {(currentMetrics.accuracyScore * 100).toFixed(1)}%
                </span>
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-2">Training Stats</h3>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Retrains: <span className="text-foreground font-mono">{currentMetrics.retrainCount}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Data Points: <span className="text-foreground font-mono">{currentMetrics.dataPoints}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Last Retrain: <span className="text-foreground font-mono">
                  {formatTimeSince(currentMetrics.lastRetrain)}
                </span>
              </p>
            </div>
          </div>

          <div className="col-span-2 md:col-span-1">
            <h3 className="font-semibold text-foreground mb-2">Intelligence Domains</h3>
            <p className="text-sm text-muted-foreground">
              {DATA_DOMAINS.length} domains available for fusion analysis
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Button
            onClick={detectPattern}
            disabled={isDetecting || isRetraining}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {isDetecting ? (
              <>
                <ArrowsClockwise size={18} className="mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkle size={18} className="mr-2" />
                Detect Pattern
              </>
            )}
          </Button>
          
          <Button
            onClick={retrainModel}
            disabled={isDetecting || isRetraining}
            variant="secondary"
          >
            <Brain size={18} className="mr-2" />
            {isRetraining ? 'Retraining...' : 'Retrain Model'}
          </Button>
          
          <Button 
            onClick={clearPatterns}
            disabled={currentPatterns.length === 0}
            variant="outline"
            className="ml-auto"
          >
            Clear All
          </Button>
        </div>

        {isRetraining && retrainProgress > 0 && (
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Retraining model...</span>
              <span className="text-foreground font-mono">{retrainProgress}%</span>
            </div>
            <Progress value={retrainProgress} className="h-2" />
          </div>
        )}

        {currentPatterns.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Latest Detection</p>
              <p className="text-lg font-bold text-foreground">{formatTimeSince(currentPatterns[0].timestamp)}</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Highest Probability</p>
              <p className="text-lg font-bold text-foreground">
                {(Math.max(...currentPatterns.map(p => p.probability)) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Active Patterns</p>
              <p className="text-lg font-bold text-foreground">{currentPatterns.length}</p>
            </div>
          </div>
        )}
      </Card>

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Network size={20} weight="bold" />
          Detected Patterns
        </h3>

        {currentPatterns.length === 0 ? (
          <Card className="p-8 text-center border-dashed">
            <Sparkle size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              No patterns detected yet. Click "Detect Pattern" to analyze intelligence domains.
            </p>
          </Card>
        ) : (
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              <AnimatePresence>
                {currentPatterns.map((pattern, index) => (
                  <motion.div
                    key={pattern.id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="p-6 border-border bg-card hover:bg-card/80 transition-colors">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-lg font-bold text-foreground">
                                {pattern.title}
                              </h4>
                              <Badge variant="outline" className="text-xs">
                                #{currentMetrics.totalPatterns - index}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              Detected {formatTimeSince(pattern.timestamp)} • Model v{pattern.modelVersion}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className={`text-2xl font-bold ${getProbabilityColor(pattern.probability)}`}>
                              {(pattern.probability * 100).toFixed(1)}%
                            </p>
                            <p className="text-xs text-muted-foreground">probability</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                              <CheckCircle size={16} weight="fill" />
                              Fusion Chain
                            </h5>
                            <div className="space-y-2">
                              {pattern.fusionChain.map((step, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-sm">
                                  <span className="text-accent mt-1">→</span>
                                  <p className="text-muted-foreground">{step}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h5 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                              <Network size={16} weight="fill" />
                              Cross-Domain Correlations
                            </h5>
                            <div className="space-y-2">
                              {pattern.correlations.map((corr, idx) => (
                                <div key={idx} className="text-sm">
                                  <p className="font-medium text-foreground">{corr.name}</p>
                                  <p className="text-xs text-muted-foreground">{corr.metric}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div>
                          <h5 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                            <Warning size={16} weight="fill" />
                            Recommendation
                          </h5>
                          <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded border border-border">
                            {pattern.recommendation}
                          </p>
                        </div>

                        <div className="flex items-center gap-4 pt-2 border-t border-border text-xs text-muted-foreground">
                          <span>Confidence: {(pattern.confidence * 100).toFixed(1)}%</span>
                          <span>•</span>
                          <span>Timeframe: {pattern.timeframe}</span>
                          <span>•</span>
                          <span>{pattern.trainingIterations.toLocaleString()} iterations</span>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>
        )}
      </div>

      <Card className="p-6 border-border bg-muted/20">
        <div className="flex items-start gap-4">
          <Brain size={24} className="text-accent mt-1" />
          <div>
            <h3 className="font-semibold text-foreground mb-2">About Emergent Pattern Detection</h3>
            <p className="text-sm text-muted-foreground">
              The system analyzes data across 6 intelligence domains using AI-powered fusion techniques to identify
              potential threats or opportunities before they fully materialize. Each pattern is scored on probability,
              confidence, and strategic importance.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
