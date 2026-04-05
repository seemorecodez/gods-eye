import { PipelineStage } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Cpu, Pause, CheckCircle, WarningCircle } from '@phosphor-icons/react'

interface PipelineStageCardProps {
  stage: PipelineStage
  index: number
}

export function PipelineStageCard({ stage, index }: PipelineStageCardProps) {
  const getStatusIcon = () => {
    switch (stage.status) {
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

  const getStatusBadge = () => {
    switch (stage.status) {
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

  return (
    <Card className="p-5 border-border bg-card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
            {index + 1}
          </div>
          <div>
            <h3 className="font-semibold text-card-foreground">{stage.name}</h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          {getStatusBadge()}
        </div>
      </div>

      {stage.status === 'processing' && (
        <div className="mb-4">
          <Progress value={65} className="h-1.5" />
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 text-xs">
        <div>
          <span className="text-muted-foreground block mb-1">Time (ms)</span>
          <span className="text-card-foreground font-medium">
            {stage.processingTime > 0 ? stage.processingTime.toLocaleString() : '-'}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground block mb-1">Accuracy</span>
          <span className="text-card-foreground font-medium">{stage.accuracy}%</span>
        </div>
        <div>
          <span className="text-muted-foreground block mb-1">Throughput</span>
          <span className="text-card-foreground font-medium">{stage.throughput}</span>
        </div>
      </div>
    </Card>
  )
}
