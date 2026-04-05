export interface Repository {
  id: string
  name: string
  fullName: string
  description: string
  url: string
  stars: number
  language: string
  lastUpdated: string
  category: 'data' | 'ai' | 'viz' | 'infra'
  watchers?: number
  forks?: number
  openIssues?: number
  size?: number
  pushedAt?: string
}

export interface DataSource {
  id: string
  name: string
  status: 'active' | 'warning' | 'critical'
  lastSync: string
  recordCount: number
  coverageArea: string
  repository: string
}

export interface PipelineStage {
  id: string
  name: string
  status: 'idle' | 'processing' | 'complete' | 'error'
  processingTime: number
  accuracy: number
  throughput: string
}

export interface MapEvent {
  id: string
  type: 'conflict' | 'satellite' | 'detection' | 'change'
  lat: number
  lng: number
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: Date
  repository: string
}

export interface PipelineFlow {
  id: string
  sourceStage: number
  targetStage: number
  dataPoints: number
  status: 'active' | 'complete'
}

export type ViewMode = 'stack' | 'monitor' | 'pipeline' | 'map' | 'guide'
