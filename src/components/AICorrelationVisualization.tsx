import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ExportButton } from '@/components/ExportButton'
import { Network, Spinner, ArrowRight, Sparkle, CirclesFour } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  CorrelationNetwork,
  generateCorrelationNetwork,
  getAvailableDimensions
} from '@/lib/ai-correlation-analysis'

const CATEGORY_COLORS = {
  environmental: 'bg-green-500/20 text-green-400 border-green-500/30',
  economic: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  social: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  military: 'bg-red-500/20 text-red-400 border-red-500/30',
  cyber: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  imagery: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
}

export function AICorrelationVisualization() {
  const [networks, setNetworks] = useKV<CorrelationNetwork[]>('ai-correlation-networks', [])
  const [loading, setLoading] = useState(false)
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([])

  const currentNetworks = networks || []
  const availableDimensions = getAvailableDimensions()

  const generateNetwork = async () => {
    setLoading(true)
    try {
      const dimensionIds = selectedDimensions.length > 0 
        ? selectedDimensions 
        : undefined
      
      const network = await generateCorrelationNetwork(dimensionIds)
      setNetworks((current) => [network, ...(current || [])].slice(0, 10))
      toast.success('Correlation network generated')
    } catch (error) {
      console.error('Error generating network:', error)
      toast.error('Failed to generate correlation network')
    } finally {
      setLoading(false)
    }
  }

  const clearNetworks = () => {
    setNetworks([])
    toast.success('Correlation networks cleared')
  }

  const toggleDimension = (dimId: string) => {
    setSelectedDimensions(prev => 
      prev.includes(dimId) 
        ? prev.filter(id => id !== dimId)
        : [...prev, dimId]
    )
  }

  const getCorrelationColor = (type: string) => {
    switch (type) {
      case 'positive': return 'text-green-400'
      case 'negative': return 'text-red-400'
      case 'causal': return 'text-blue-400'
      default: return 'text-muted-foreground'
    }
  }

  const getCorrelationSymbol = (type: string) => {
    switch (type) {
      case 'positive': return '+'
      case 'negative': return '-'
      case 'causal': return '→'
      default: return '~'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">AI CORRELATION VISUALIZATION</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Discover hidden patterns and relationships across multiple intelligence dimensions
        </p>

        <Card className="bg-card border-border p-6">
          <div className="mb-4">
            <p className="text-xs font-semibold text-muted-foreground mb-2">
              SELECT DIMENSIONS (Optional - leave empty for random selection)
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
              {availableDimensions.map(dim => (
                <Button
                  key={dim.id}
                  onClick={() => toggleDimension(dim.id)}
                  variant={selectedDimensions.includes(dim.id) ? 'default' : 'outline'}
                  size="sm"
                  className="justify-start text-xs h-auto py-2"
                >
                  <span className={`w-2 h-2 rounded-full mr-2 ${CATEGORY_COLORS[dim.category].split(' ')[0]}`} />
                  {dim.name}
                </Button>
              ))}
            </div>
            {selectedDimensions.length > 0 && (
              <Button
                onClick={() => setSelectedDimensions([])}
                variant="ghost"
                size="sm"
                className="text-xs"
              >
                Clear Selection ({selectedDimensions.length})
              </Button>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              onClick={generateNetwork}
              disabled={loading}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {loading ? (
                <Spinner size={18} className="mr-2 animate-spin" />
              ) : (
                <Network size={18} className="mr-2" />
              )}
              Generate Network
            </Button>

            {currentNetworks.length > 0 && (
              <ExportButton
                data={currentNetworks as unknown as Record<string, unknown>[]}
                filename="correlation-networks"
                type="patterns"
              />
            )}

            <Button
              onClick={clearNetworks}
              variant="destructive"
              size="sm"
              disabled={currentNetworks.length === 0}
            >
              Clear All
            </Button>
          </div>
        </Card>
      </div>

      <ScrollArea className="h-[700px]">
        <div className="space-y-6 pr-4">
          <AnimatePresence>
            {currentNetworks.map((network, index) => (
              <motion.div
                key={network.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="bg-card border-border p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Network size={24} className="text-accent" weight="bold" />
                        <h3 className="font-semibold text-foreground">Correlation Network Analysis</h3>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(network.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-accent/20 text-accent">
                        Complexity: {(network.overallComplexity * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-xs font-semibold text-muted-foreground mb-3">DATA DIMENSIONS ({network.dimensions.length})</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {network.dimensions.map((dim) => (
                        <Card key={dim.id} className={`p-3 border ${CATEGORY_COLORS[dim.category]}`}>
                          <p className="text-xs font-medium mb-1">{dim.name}</p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-[10px] h-5">
                              {dim.currentValue.toFixed(1)} {dim.unit}
                            </Badge>
                            <Badge
                              variant={dim.trend === 'up' ? 'destructive' : dim.trend === 'down' ? 'default' : 'secondary'}
                              className="text-[10px] h-5"
                            >
                              {dim.trend === 'up' ? '↑' : dim.trend === 'down' ? '↓' : '→'}
                            </Badge>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-xs font-semibold text-muted-foreground mb-3">
                      CORRELATIONS DETECTED ({network.correlations.length})
                    </p>
                    <div className="space-y-2">
                      {network.correlations.map((corr, idx) => {
                        const sourceDim = network.dimensions.find(d => d.id === corr.source)
                        const targetDim = network.dimensions.find(d => d.id === corr.target)
                        
                        return (
                          <Card key={idx} className="p-4 bg-muted/30 border-border">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {sourceDim?.name || corr.source}
                              </Badge>
                              <ArrowRight size={16} className={getCorrelationColor(corr.type)} weight="bold" />
                              <Badge variant="outline" className="text-xs">
                                {targetDim?.name || corr.target}
                              </Badge>
                              <Badge className={`ml-auto ${getCorrelationColor(corr.type)}`}>
                                {getCorrelationSymbol(corr.type)} {(corr.strength * 100).toFixed(0)}%
                              </Badge>
                            </div>
                            <p className="text-xs text-foreground">{corr.description}</p>
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-[10px] text-muted-foreground">Confidence:</span>
                              <Badge variant="outline" className="text-[10px] h-5">
                                {(corr.confidence * 100).toFixed(0)}%
                              </Badge>
                            </div>
                          </Card>
                        )
                      })}
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-xs font-semibold text-muted-foreground mb-3">
                      PATTERN CLUSTERS ({network.clusters.length})
                    </p>
                    <div className="space-y-3">
                      {network.clusters.map((cluster) => (
                        <Card key={cluster.id} className="p-4 bg-accent/10 border-accent/30">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <CirclesFour size={20} className="text-accent" weight="fill" />
                              <h4 className="font-semibold text-foreground text-sm">{cluster.name}</h4>
                            </div>
                            <Badge className="bg-accent/20 text-accent">
                              {(cluster.significance * 100).toFixed(0)}% significant
                            </Badge>
                          </div>
                          <p className="text-xs text-foreground mb-3">{cluster.centralTheme}</p>
                          <div className="mb-3">
                            <p className="text-[10px] font-semibold text-muted-foreground mb-1">DIMENSIONS IN CLUSTER</p>
                            <div className="flex flex-wrap gap-1">
                              {cluster.dimensions.map((dimId, idx) => {
                                const dim = network.dimensions.find(d => d.id === dimId)
                                return (
                                  <Badge key={idx} variant="outline" className="text-[10px]">
                                    {dim?.name || dimId}
                                  </Badge>
                                )
                              })}
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-muted-foreground mb-2">EMERGENT INSIGHTS</p>
                            <ul className="space-y-1">
                              {cluster.emergentInsights.map((insight, idx) => (
                                <li key={idx} className="text-xs text-foreground flex items-start gap-2">
                                  <Sparkle size={12} className="text-accent mt-0.5" weight="fill" />
                                  <span>{insight}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">KEY FINDINGS</p>
                    <ul className="space-y-2">
                      {network.keyFindings.map((finding, idx) => (
                        <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                          <span className="text-accent mt-1">▸</span>
                          <span>{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {currentNetworks.length === 0 && !loading && (
            <Card className="bg-card border-border p-12 text-center">
              <Network size={48} className="mx-auto mb-4 text-muted-foreground" weight="bold" />
              <p className="text-muted-foreground mb-2">
                No correlation networks generated yet.
              </p>
              <p className="text-xs text-muted-foreground">
                Select dimensions above or leave empty for automatic selection, then click Generate Network
              </p>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
