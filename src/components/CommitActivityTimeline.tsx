import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CommitActivity } from '@/lib/types'
import { fetchRecentCommits } from '@/lib/github-api'
import { GitCommit, Clock, Plus, Minus, Spinner } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

const repositoryNames = [
  'blazeiburgess/acled',
  'datapartnership/acled_conflict_analysis',
  'giswqs/geemap',
  'sentinelsat/sentinelsat',
  'CSSEGISandData/COVID-19',
  'ultralytics/ultralytics',
  'Shakkak/Satellite-Image-Analysis-Using-YOLO',
  'wenhwu/awesome-remote-sensing-change-detection',
  'satellite-image-deep-learning/techniques',
  'alexipt90/Sentinel2_LULC_YoloV8',
  'streamlit/streamlit',
  'python-visualization/folium',
  'keplergl/kepler.gl',
  'plotly/plotly.py'
]

export function CommitActivityTimeline() {
  const [commits, setCommits] = useState<CommitActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date())

  const loadCommits = async () => {
    setLoading(true)
    const fetchedCommits = await fetchRecentCommits(repositoryNames, 30)
    setCommits(fetchedCommits)
    setLastUpdateTime(new Date())
    setLoading(false)
  }

  useEffect(() => {
    loadCommits()

    const interval = setInterval(() => {
      loadCommits()
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (commits.length > 0 && !loading) {
      const latestCommit = commits[0]
      const timeSinceLastUpdate = Date.now() - lastUpdateTime.getTime()
      
      if (timeSinceLastUpdate < 2000) {
        toast.success('New commit detected!', {
          description: `${latestCommit.repository}: ${latestCommit.message}`,
          duration: 3000
        })
      }
    }
  }, [commits, loading])

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
    
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">COMMIT ACTIVITY TIMELINE</h2>
          <p className="text-sm text-muted-foreground">Real-time repository commit stream across all tracked projects</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span>Live updates every 60s</span>
        </div>
      </div>

      {loading && commits.length === 0 ? (
        <Card className="p-12 flex items-center justify-center">
          <div className="text-center">
            <Spinner size={48} className="mx-auto mb-4 text-accent animate-spin" />
            <p className="text-muted-foreground">Loading commit activity...</p>
          </div>
        </Card>
      ) : (
        <ScrollArea className="h-[600px] rounded-lg border border-border bg-card">
          <div className="p-4 space-y-3">
            <AnimatePresence mode="popLayout">
              {commits.map((commit, index) => (
                <motion.div
                  key={commit.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                >
                  <Card className="p-4 hover:bg-muted/50 transition-colors border border-border/50">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <GitCommit size={20} className="text-accent" weight="bold" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="font-mono text-xs">
                            {commit.repository.split('/')[1]}
                          </Badge>
                          <Badge variant="secondary" className="font-mono text-xs">
                            {commit.sha}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                            <Clock size={14} />
                            {formatTimeAgo(commit.timestamp)}
                          </div>
                        </div>
                        
                        <p className="text-sm text-foreground mb-2 font-medium truncate">
                          {commit.message}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="font-mono">{commit.author}</span>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Plus size={12} className="text-green-400" weight="bold" />
                              <span className="text-green-400">{commit.additions}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Minus size={12} className="text-red-400" weight="bold" />
                              <span className="text-red-400">{commit.deletions}</span>
                            </span>
                            <span>{commit.filesChanged} file{commit.filesChanged !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {commits.length === 0 && !loading && (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No recent commit activity found</p>
              </Card>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
