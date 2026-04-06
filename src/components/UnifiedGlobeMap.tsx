import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Globe } from '@phosphor-icons/react'

export function UnifiedGlobeMap() {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe size={32} className="text-accent" weight="fill" />
            <div>
              <CardTitle className="text-2xl">Unified Intelligence Globe</CardTitle>
              <CardDescription>
                Interactive 3D visualization platform
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary">Coming Soon</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[700px] rounded-lg border border-border bg-muted/20 flex items-center justify-center">
          <div className="text-center space-y-3">
            <Globe size={64} className="text-muted-foreground mx-auto" weight="duotone" />
            <p className="text-lg font-medium text-foreground">3D Globe Visualization</p>
            <p className="text-sm text-muted-foreground max-w-md">
              This component will display an interactive 3D globe with flight tracking, 
              camera feeds, satellites, and collaborative intelligence layers.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
