import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Cpu, Pause, Play, ArrowRight, CheckCircle, WarningCircle, Database, Brain, ChartLine } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { PipelineStage, PipelineFlow } from '@/lib/types'
import { fetchAllRepositories } from '@/lib/github-api'

export function PipelineSimulator() {
  const [isRunning, setIsRunning] = useState(false)
  const [stages, setStages] = useState<PipelineStage[]>([
    {
      id: 'stage1',
      name: 'Data Ingestion',
      status: 'idle',
      processingTime: 0,
      accuracy: 99.8,
      throughput: '1.2k events/sec'
    },
    {
      id: 'stage2',
      name: 'YOLOv8 Detection',
      status: 'idle',
      processingTime: 0,
      accuracy: 94.3,
      throughput: '45 images/sec'
    },
    {
      id: 'stage3',
      name: 'Change Detection',
      status: 'idle',
      processingTime: 0,
      accuracy: 91.7,
      throughput: '120 tiles/sec'
    },
    {
      id: 'stage4',
      name: 'Classification & Tagging',
      status: 'idle',
      processingTime: 0,
      accuracy: 96.1,
      throughput: '2.8k objects/sec'
    },
    {
      id: 'stage5',
      name: 'Output Generation',
      status: 'idle',
      processingTime: 0,
      accuracy: 100,
      throughput: '850 reports/sec'
    }
  ])
  
  const [flows, setFlows] = useState<PipelineFlow[]>([])
  const [processedItems, setProcessedItems] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [repoStats, setRepoStats] = useState<any[]>([])

  useEffect(() => {
    async function loadRepoData() {
      const repos = await fetchAllRepositories()
      setRepoStats(repos)
      const total = repos.reduce((sum, repo) => sum + (repo.stars || 0), 0)
      setTotalItems(Math.floor(total / 1000))
    }
    loadRepoData()
  }, [])

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setStages(currentStages => {
        const newStages = [...currentStages]
        let currentActiveIndex = newStages.findIndex(s => s.status === 'processing')
        
        if (currentActiveIndex === -1) {
          currentActiveIndex = 0
          newStages[0].status = 'processing'
          newStages[0].processingTime = 0
        } else {
          newStages[currentActiveIndex].processingTime += Math.random() * 200 + 50
          
          if (newStages[currentActiveIndex].processingTime > 2000) {
            newStages[currentActiveIndex].status = 'complete'
            
            if (currentActiveIndex < newStages.length - 1) {
              newStages[currentActiveIndex + 1].status = 'processing'
              newStages[currentActiveIndex + 1].processingTime = 0
              
              setFlows(currentFlows => [
                ...currentFlows,
                {
                  id: `flow-${Date.now()}`,
                  sourceStage: currentActiveIndex,
                  targetStage: currentActiveIndex + 1,
                  dataPoints: Math.floor(Math.random() * 1000) + 500,
                  status: 'active'
                }
              ])
            } else {
              setProcessedItems(prev => prev + 1)
              setTimeout(() => {
                setStages(s => s.map(stage => ({
                  ...stage,
                  status: 'idle',
                  processingTime: 0
                })))
              }, 1000)
            }
          }
        }
        
        return newStages
      })
      
      setFlows(currentFlows => 
        currentFlows.filter(flow => Date.now() - parseInt(flow.id.split('-')[1]) < 1500)
      )
    }, 100)

    return () => clearInterval(interval)
  }, [isRunning])

  const getStageIcon = (index: number) => {
    switch (index) {
      case 0: return <Database size={24} />
      case 1: return <Cpu size={24} />
      case 2: return <ChartLine size={24} />
      case 3: return <Brain size={24} />
      case 4: return <CheckCircle size={24} />
      default: return <Cpu size={24} />
    }
  }

  const getStatusIcon = (status: PipelineStage['status']) => {
    switch (status) {
      case 'idle':
        return <Pause size={18} className="text-muted-foreground" />
      case 'processing':
        return <Cpu size={18} className="text-[oklch(0.65_0.18_290)] status-pulse" />
      case 'complete':
        return <CheckCircle size={18} weight="fill" className="text-[oklch(0.70_0.20_145)]" />
      case 'error':
        return <WarningCircle size={18} weight="fill" className="text-destructive" />
    }
  }

  const getStatusBadge = (status: PipelineStage['status']) => {
    switch (status) {
      case 'idle':
        return <Badge variant="outline" className="text-xs">IDLE</Badge>
      case 'processing':
        return <Badge className="bg-[oklch(0.65_0.18_290)] text-background border-0 text-xs">PROCESSING</Badge>
      case 'complete':
        return <Badge className="bg-[oklch(0.70_0.20_145)] text-background border-0 text-xs">COMPLETE</Badge>
      case 'error':
        return <Badge variant="destructive" className="text-xs">ERROR</Badge>
    }
  }

  const progress = totalItems > 0 ? (processedItems / totalItems) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground">AI PROCESSING PIPELINE</h2>
          <p className="text-sm text-muted-foreground">
            Real-time simulation based on live GitHub repository activity
          </p>
        </div>
        <Button
          size="lg"
          onClick={() => setIsRunning(!isRunning)}
          className="gap-2"
        >
          {isRunning ? (
            <>
              <Pause size={20} weight="fill" />
              Pause Simulation
            </>
          ) : (
            <>
              <Play size={20} weight="fill" />
              Start Simulation
            </>
          )}
        </Button>
      </div>

      <Card className="p-6 border-border bg-card">
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="text-foreground font-medium">
              {processedItems.toLocaleString()} / {totalItems.toLocaleString()} batches processed
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div>
            <span className="text-xs text-muted-foreground block mb-1">Processing Rate</span>
            <span className="text-lg font-bold text-foreground">
              {isRunning ? `${(Math.random() * 50 + 20).toFixed(1)}/s` : '0/s'}
            </span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block mb-1">Active Repositories</span>
            <span className="text-lg font-bold text-foreground">{repoStats.length}</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block mb-1">Total Data Points</span>
            <span className="text-lg font-bold text-foreground">
              {repoStats.reduce((sum, repo) => sum + (repo.stars || 0), 0).toLocaleString()}
            </span>
          </div>
        </div>
      </Card>

      <div className="relative">
        <div className="space-y-4">
          {stages.map((stage, index) => (
            <div key={stage.id} className="relative">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`p-5 border-border bg-card transition-all ${
                  stage.status === 'processing' ? 'border-accent shadow-[0_0_20px_rgba(118,213,223,0.3)]' : ''
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <motion.div
                        animate={stage.status === 'processing' ? {
                          scale: [1, 1.1, 1],
                          rotate: [0, 180, 360]
                        } : {}}
                        transition={{
                          duration: 2,
                          repeat: stage.status === 'processing' ? Infinity : 0
                        }}
                        className={`w-12 h-12 rounded-lg ${
                          stage.status === 'processing' ? 'bg-accent' : 'bg-primary'
                        } flex items-center justify-center ${
                          stage.status === 'processing' ? 'text-accent-foreground' : 'text-primary-foreground'
                        }`}
                      >
                        {getStageIcon(index)}
                      </motion.div>
                      <div>
                        <h3 className="font-semibold text-card-foreground text-lg">{stage.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Stage {index + 1} of {stages.length}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusIcon(stage.status)}
                      {getStatusBadge(stage.status)}
                    </div>
                  </div>

                  {stage.status === 'processing' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mb-4"
                    >
                      <Progress 
                        value={(stage.processingTime / 2000) * 100} 
                        className="h-2" 
                      />
                    </motion.div>
                  )}

                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground block mb-1 text-xs">Time (ms)</span>
                      <span className="text-card-foreground font-medium">
                        {stage.processingTime > 0 ? Math.floor(stage.processingTime).toLocaleString() : '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-1 text-xs">Accuracy</span>
                      <span className="text-card-foreground font-medium">{stage.accuracy}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-1 text-xs">Throughput</span>
                      <span className="text-card-foreground font-medium">{stage.throughput}</span>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {index < stages.length - 1 && (
                <div className="flex items-center justify-center my-3 relative">
                  <ArrowRight 
                    size={24} 
                    className={`${
                      stage.status === 'complete' ? 'text-accent' : 'text-muted-foreground'
                    } transition-colors`}
                    weight="bold"
                  />
                  
                  <AnimatePresence>
                    {flows.filter(f => f.sourceStage === index).map(flow => (
                      <motion.div
                        key={flow.id}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 1.5] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        className="absolute w-3 h-3 rounded-full bg-accent"
                        style={{
                          boxShadow: '0 0 20px oklch(0.75 0.15 200)'
                        }}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Card className="p-6 border-border bg-card">
        <h3 className="font-semibold text-foreground mb-4">Repository Activity Feed</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {repoStats.slice(0, 10).map((repo, idx) => (
            <motion.div
              key={repo.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{repo.name}</p>
                <p className="text-xs text-muted-foreground">{repo.fullName}</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="text-right">
                  <span className="text-muted-foreground block">Stars</span>
                  <span className="text-foreground font-medium">{repo.stars?.toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-muted-foreground block">Category</span>
                  <Badge variant="outline" className="text-xs">{repo.category.toUpperCase()}</Badge>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  )
}
