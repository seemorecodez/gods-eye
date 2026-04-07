import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ExportButton } from '@/components/ExportButton'
import { Brain, Spinner, TrendUp, TrendDown, LineSegments, Calendar, Target, ChartBar } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  ForecastPrediction,
  ForecastTrend,
  ModelComparison,
  generateForecast,
  generateTrendForecast,
  generateMultiCategoryForecasts,
  compareModels
} from '@/lib/ai-prediction-forecasting'

const CATEGORIES: ForecastPrediction['category'][] = [
  'conflict',
  'economic',
  'environmental',
  'technology',
  'social'
]

const CATEGORY_COLORS = {
  conflict: 'bg-red-500/20 text-red-400',
  economic: 'bg-blue-500/20 text-blue-400',
  environmental: 'bg-green-500/20 text-green-400',
  technology: 'bg-purple-500/20 text-purple-400',
  social: 'bg-yellow-500/20 text-yellow-400'
}

export function AIPredictionForecasting() {
  const [forecasts, setForecasts] = useKV<ForecastPrediction[]>('ai-forecasts', [])
  const [trends, setTrends] = useKV<ForecastTrend[]>('ai-trends', [])
  const [comparisons, setComparisons] = useKV<ModelComparison[]>('ai-model-comparisons', [])
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<ForecastPrediction['category']>('conflict')
  const [activeTab, setActiveTab] = useState<'forecasts' | 'trends' | 'comparison'>('forecasts')
  const [comparisonRegion, setComparisonRegion] = useState<string>('Middle East')

  const currentForecasts = forecasts || []
  const currentTrends = trends || []
  const currentComparisons = comparisons || []

  const REGIONS = [
    'Middle East',
    'Eastern Europe',
    'North Africa',
    'Central Asia',
    'East Asia'
  ]

  const runSingleForecast = async () => {
    setLoading(true)
    try {
      const forecast = await generateForecast(selectedCategory)
      setForecasts((current) => [forecast, ...(current || [])].slice(0, 15))
      toast.success(`${selectedCategory} forecast generated`)
    } catch (error) {
      console.error('Error generating forecast:', error)
      toast.error('Failed to generate forecast')
    } finally {
      setLoading(false)
    }
  }

  const runMultiForecast = async () => {
    setLoading(true)
    try {
      const newForecasts = await generateMultiCategoryForecasts()
      setForecasts((current) => [...newForecasts, ...(current || [])].slice(0, 15))
      toast.success('Multi-category forecasts generated')
    } catch (error) {
      console.error('Error generating forecasts:', error)
      toast.error('Failed to generate forecasts')
    } finally {
      setLoading(false)
    }
  }

  const runTrendForecast = async () => {
    setLoading(true)
    try {
      const trendNames = [
        'Cyber Attack Frequency',
        'Military Deployment Intensity',
        'Economic Stability Index',
        'Social Unrest Level',
        'Infrastructure Vulnerability'
      ]
      const randomTrend = trendNames[Math.floor(Math.random() * trendNames.length)]
      const trend = await generateTrendForecast(randomTrend)
      setTrends((current) => [trend, ...(current || [])].slice(0, 10))
      toast.success('Trend forecast generated')
    } catch (error) {
      console.error('Error generating trend:', error)
      toast.error('Failed to generate trend')
    } finally {
      setLoading(false)
    }
  }

  const clearData = () => {
    if (activeTab === 'forecasts') {
      setForecasts([])
      toast.success('Forecasts cleared')
    } else if (activeTab === 'trends') {
      setTrends([])
      toast.success('Trends cleared')
    } else {
      setComparisons([])
      toast.success('Comparisons cleared')
    }
  }

  const runModelComparison = async () => {
    setLoading(true)
    try {
      const comparison = await compareModels(selectedCategory, comparisonRegion)
      setComparisons((current) => [comparison, ...(current || [])].slice(0, 10))
      toast.success('Model comparison completed')
    } catch (error) {
      console.error('Error comparing models:', error)
      toast.error('Failed to compare models')
    } finally {
      setLoading(false)
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendUp size={18} className="text-red-400" weight="bold" />
      case 'decreasing': return <TrendDown size={18} className="text-green-400" weight="bold" />
      default: return <LineSegments size={18} className="text-yellow-400" />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">AI PREDICTION FORECASTING</h2>
        <p className="text-sm text-muted-foreground mb-4">
          AI-powered predictive analysis for conflicts, economic trends, environmental changes, and more
        </p>

        <Card className="bg-card border-border p-6">
          <div className="flex gap-2 mb-4">
            <Button
              onClick={() => setActiveTab('forecasts')}
              variant={activeTab === 'forecasts' ? 'default' : 'outline'}
              size="sm"
            >
              <Target size={16} className="mr-2" />
              Forecasts
            </Button>
            <Button
              onClick={() => setActiveTab('trends')}
              variant={activeTab === 'trends' ? 'default' : 'outline'}
              size="sm"
            >
              <TrendUp size={16} className="mr-2" />
              Trends
            </Button>
          </div>

          {activeTab === 'forecasts' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex gap-2">
                <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as ForecastPrediction['category'])}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={runSingleForecast}
                  disabled={loading}
                  variant="outline"
                >
                  {loading ? <Spinner size={18} className="animate-spin" /> : <Brain size={18} />}
                </Button>
              </div>

              <Button
                onClick={runMultiForecast}
                disabled={loading}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {loading ? (
                  <Spinner size={18} className="mr-2 animate-spin" />
                ) : (
                  <Calendar size={18} className="mr-2" />
                )}
                All Categories
              </Button>

              <div className="flex gap-2">
                {currentForecasts.length > 0 && (
                  <ExportButton
                    data={currentForecasts as unknown as Record<string, unknown>[]}
                    filename="ai-forecasts"
                    type="predictions"
                  />
                )}
                <Button
                  onClick={clearData}
                  variant="destructive"
                  size="sm"
                  disabled={currentForecasts.length === 0}
                  className="ml-auto"
                >
                  Clear
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-4 mb-4">
              <Button
                onClick={runTrendForecast}
                disabled={loading}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {loading ? (
                  <Spinner size={18} className="mr-2 animate-spin" />
                ) : (
                  <TrendUp size={18} className="mr-2" />
                )}
                Generate Trend
              </Button>

              <div className="flex gap-2 ml-auto">
                {currentTrends.length > 0 && (
                  <ExportButton
                    data={currentTrends as unknown as Record<string, unknown>[]}
                    filename="ai-trends"
                    type="predictions"
                  />
                )}
                <Button
                  onClick={clearData}
                  variant="destructive"
                  size="sm"
                  disabled={currentTrends.length === 0}
                >
                  Clear
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      <ScrollArea className="h-[600px]">
        <div className="space-y-4 pr-4">
          {activeTab === 'forecasts' ? (
            <AnimatePresence>
              {currentForecasts.map((forecast, index) => (
                <motion.div
                  key={forecast.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="bg-card border-border p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={CATEGORY_COLORS[forecast.category]}>
                            {forecast.category.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">{forecast.region}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(forecast.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-muted-foreground">Probability:</span>
                          <Badge variant={forecast.probability > 0.7 ? 'destructive' : 'default'}>
                            {(forecast.probability * 100).toFixed(0)}%
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Confidence:</span>
                          <Badge variant="outline">
                            {(forecast.confidence * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-foreground mb-4 font-medium">
                      {forecast.prediction}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-2">TIMEFRAME</p>
                        <Badge variant="secondary">{forecast.timeframe}</Badge>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-2">DATA SOURCES</p>
                        <div className="flex flex-wrap gap-1">
                          {forecast.dataSourcesUsed.slice(0, 3).map((source, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {source}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-2">CONTRIBUTING FACTORS</p>
                        <ul className="space-y-1">
                          {forecast.contributingFactors.map((factor, idx) => (
                            <li key={idx} className="text-xs text-foreground flex items-start gap-2">
                              <span className="text-accent mt-0.5">▸</span>
                              <span>{factor}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-2">POTENTIAL IMPACTS</p>
                        <ul className="space-y-1">
                          {forecast.potentialImpacts.map((impact, idx) => (
                            <li key={idx} className="text-xs text-foreground flex items-start gap-2">
                              <span className="text-destructive mt-0.5">●</span>
                              <span>{impact}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-2">MITIGATION STRATEGIES</p>
                        <ul className="space-y-1">
                          {forecast.mitigationStrategies.map((strategy, idx) => (
                            <li key={idx} className="text-xs text-foreground flex items-start gap-2">
                              <span className="text-green-400 mt-0.5">✓</span>
                              <span>{strategy}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <AnimatePresence>
              {currentTrends.map((trend, index) => (
                <motion.div
                  key={trend.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="bg-card border-border p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          {getTrendIcon(trend.trend)}
                          <h3 className="font-semibold text-foreground">{trend.name}</h3>
                          <Badge variant="outline">{trend.trend.toUpperCase()}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(trend.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Badge className="bg-accent/20 text-accent">
                        Current: {trend.currentValue.toFixed(1)}
                      </Badge>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs font-semibold text-muted-foreground mb-3">PREDICTED VALUES</p>
                      <div className="grid grid-cols-6 gap-2">
                        {trend.predictedValues.map((pred, idx) => (
                          <div key={idx} className="bg-muted/30 rounded p-2 text-center">
                            <p className="text-xs text-muted-foreground mb-1">{pred.timepoint}</p>
                            <p className="text-sm font-medium text-foreground">{pred.value.toFixed(1)}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {(pred.confidence * 100).toFixed(0)}%
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {trend.anomaliesDetected.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-2">ANOMALIES DETECTED</p>
                        <div className="flex flex-wrap gap-2">
                          {trend.anomaliesDetected.map((anomaly, idx) => (
                            <Badge key={idx} variant="destructive" className="text-xs">
                              {anomaly}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {((activeTab === 'forecasts' && currentForecasts.length === 0) ||
            (activeTab === 'trends' && currentTrends.length === 0)) && !loading && (
            <Card className="bg-card border-border p-12 text-center">
              <Brain size={48} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                No {activeTab} generated yet. Click the buttons above to start.
              </p>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
