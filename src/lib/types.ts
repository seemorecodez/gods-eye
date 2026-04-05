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

export type ViewMode = 'stack' | 'monitor' | 'pipeline' | 'map' | 'guide'
