import { Repository } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowSquareOut, GithubLogo, Star } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface RepositoryCardProps {
  repository: Repository
}

export function RepositoryCard({ repository }: RepositoryCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="p-6 border-border bg-card hover:border-accent/50 hover:shadow-[0_0_20px_rgba(118,213,223,0.15)] transition-all duration-200">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <GithubLogo size={20} className="text-muted-foreground" />
            <h3 className="font-semibold text-card-foreground text-lg">{repository.name}</h3>
          </div>
          <a
            href={repository.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-accent/80 transition-colors"
          >
            <ArrowSquareOut size={20} />
          </a>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {repository.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs">
              {repository.language}
            </Badge>
            <div className="flex items-center gap-1 text-muted-foreground text-xs">
              <Star size={14} weight="fill" />
              <span>{repository.stars.toLocaleString()}</span>
            </div>
          </div>
          <span className="text-xs text-muted-foreground">
            Updated {repository.lastUpdated}
          </span>
        </div>
      </Card>
    </motion.div>
  )
}
