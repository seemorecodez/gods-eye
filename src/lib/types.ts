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

export interface CommitActivity {
  id: string
  repository: string
  sha: string
  message: string
  author: string
  timestamp: Date
  filesChanged: number
  additions: number
  deletions: number
}

export interface MLPrediction {
  id: string
  modelName: string
  inputType: string
  prediction: string
  confidence: number
  timestamp: Date
  metadata: {
    processingTime: number
    imageSize?: string
    objectsDetected?: number
    modelVersion?: string
  }
}

export interface MapAnnotation {
  id: string
  lat: number
  lng: number
  author: string
  content: string
  timestamp: Date
  type: 'note' | 'alert' | 'observation'
  attachments?: string[]
}

export interface CameraFeed {
  id: string
  name: string
  lat: number
  lng: number
  /**
   * Live stream URL for this feed.
   * May be empty ('') for satellite-type feeds where no public unauthenticated
   * stream endpoint is available — consumers should check before rendering.
   */
  streamUrl: string
  embedUrl?: string
  status: 'online' | 'offline' | 'error'
  lastFrame: Date
  provider: string
  type: 'satellite' | 'ground' | 'aerial' | 'webcam' | 'traffic'
  thumbnail?: string
  region?: string
  city?: string
  country?: string
}

export interface WeatherData {
  id: string
  lat: number
  lng: number
  temperature: number
  humidity: number
  windSpeed: number
  windDirection: number
  conditions: string
  visibility: number
  pressure: number
  timestamp: Date
}

export interface ThreatPrediction {
  id: string
  lat: number
  lng: number
  threatLevel: 'low' | 'moderate' | 'high' | 'critical'
  confidence: number
  factors: string[]
  historicalData: {
    date: Date
    eventCount: number
    severity: number
  }[]
  prediction: string
  timestamp: Date
}

export type ViewMode = 'stack' | 'monitor' | 'pipeline' | 'map' | 'guide' | 'activity' | 'ml-predictions' | 'emergent-patterns' | 'threat-alerts' | 'analytics'
