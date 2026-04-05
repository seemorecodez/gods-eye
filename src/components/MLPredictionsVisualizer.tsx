import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MLPrediction } from '@/lib/types'
import { Brain, Clock, Target, Image, Spinner } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'

const ML_MODELS = [
  'YOLOv8-Satellite',
  'Change-Detection-v2',
  'LULC-Classifier',
  'Object-Detection-Enhanced',
  'Sentinel2-Analyzer'
]

const PREDICTION_TYPES = [
  'Vehicle Detection',
  'Building Change',
  'Land Cover Classification',
  'Infrastructure Analysis',
  'Agricultural Monitoring',
  'Urban Expansion',
  'Forest Cover Change',
  'Military Asset Detection'
]

export function MLPredictionsVisualizer() {
  const [predictions, setPredictions] = useState<MLPrediction[]>([])
  const [loading, setLoading] = useState(true)

  const generatePrediction = (): MLPrediction => {
    const modelName = ML_MODELS[Math.floor(Math.random() * ML_MODELS.length)]
    const predictionType = PREDICTION_TYPES[Math.floor(Math.random() * PREDICTION_TYPES.length)]
    const confidence = 0.65 + Math.random() * 0.34
    const objectsDetected = Math.floor(Math.random() * 50) + 1
    
    return {
      id: `pred-${Date.now()}-${Math.random()}`,
      modelName,
      inputType: predictionType,
      prediction: `${objectsDetected} object${objectsDetected > 1 ? 's' : ''} detected`,
      confidence,
      timestamp: new Date(),
      metadata: {
        processingTime: Math.floor(Math.random() * 500) + 100,
        imageSize: `${Math.floor(Math.random() * 2000) + 512}x${Math.floor(Math.random() * 2000) + 512}`,
        objectsDetected,
        modelVersion: `v${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}`
      }
    }
  }

  useEffect(() => {
    const initialPredictions = Array.from({ length: 15 }, () => generatePrediction())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    
    setPredictions(initialPredictions)
    setLoading(false)

    const interval = setInterval(() => {
      const newPrediction = generatePrediction()
      setPredictions(prev => [newPrediction, ...prev].slice(0, 30))
    }, 8000)

    return () => clearInterval(interval)
  }, [])

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

      {loading ? (
        <Card className="p-12 flex items-center justify-center">
          <div className="text-center">
            <Spinner size={48} className="mx-auto mb-4 text-accent animate-spin" />
            <p className="text-muted-foreground">Initializing ML inference engine...</p>
          </div>
        </Card>
      ) : (
        <ScrollArea className="h-[600px] rounded-lg border border-border bg-card">
          <div className="p-4 space-y-3">
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
          </div>
        </ScrollArea>
      )}

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
            <span className="text-xs text-muted-foreground">Avg Confidence</span>
            <Badge variant="outline" className="text-green-400 border-green-400">
              High
            </Badge>
          </div>
          <p className="text-2xl font-bold text-green-400">
            {(predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length * 100).toFixed(1)}%
          </p>
        </Card>

        <Card className="p-4 border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Total Predictions</span>
            <Badge variant="outline" className="text-accent border-accent">
              Live
            </Badge>
          </div>
          <p className="text-2xl font-bold text-foreground">{predictions.length}</p>
        </Card>
      </div>
    </div>
  )
}
