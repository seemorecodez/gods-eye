import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAPIMonitoring } from '@/hooks/use-api-monitoring'
import { Lightning, Brain, Database } from '@phosphor-icons/react'

export function APIMonitoringDashboard() {
  const { metrics } = useAPIMonitoring()

  if (!metrics) return null

  const rateLimitPercentage = (metrics.githubRateLimit.remaining / metrics.githubRateLimit.limit) * 100
  const resetTime = new Date(metrics.githubRateLimit.reset).toLocaleTimeString()

  const getStatusColor = () => {
    if (rateLimitPercentage > 50) return 'bg-[var(--status-active)]'
    if (rateLimitPercentage > 20) return 'bg-[var(--status-warning)]'
    return 'bg-[var(--status-critical)]'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Database size={20} className="text-accent" />
            GitHub API Rate Limit
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Remaining Requests</span>
              <span className="text-foreground font-mono">
                {metrics.githubRateLimit.remaining} / {metrics.githubRateLimit.limit}
              </span>
            </div>
            <Progress value={rateLimitPercentage} className="h-2" />
          </div>
          
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={`${getStatusColor()} text-white border-transparent`}
            >
              <Lightning size={14} className="mr-1" />
              {rateLimitPercentage > 50 ? 'Healthy' : rateLimitPercentage > 20 ? 'Warning' : 'Critical'}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Resets at {resetTime}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain size={20} className="text-accent" />
            LLM Usage Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Total Calls</span>
            <span className="font-mono text-foreground">{metrics.llmUsage.totalCalls}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Estimated Tokens</span>
            <span className="font-mono text-foreground">
              {metrics.llmUsage.totalTokens.toLocaleString()}
            </span>
          </div>

          {metrics.llmUsage.callHistory.length > 0 && (
            <div>
              <div className="text-xs text-muted-foreground mb-2">Recent Calls</div>
              <div className="space-y-1 max-h-[100px] overflow-y-auto">
                {metrics.llmUsage.callHistory.slice(-5).reverse().map((call, idx) => (
                  <div key={idx} className="text-xs flex justify-between">
                    <span className="text-muted-foreground">
                      {new Date(call.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="font-mono text-foreground">
                      {call.tokensEstimate} tokens
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
