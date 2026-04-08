export type PluginCategory = 
  | 'natural'
  | 'transport'
  | 'infrastructure'
  | 'communications'
  | 'space'
  | 'economic'
  | 'other'

export interface MapMarker {
  id: string | number
  lat: number
  lng: number
  title: string
  type: string
  
  color?: string
  size?: number
  icon?: string
  opacity?: number
  rotation?: number
  
  metadata?: Record<string, any>
  timestamp?: number
  expiresAt?: number
  
  clickable?: boolean
  draggable?: boolean
  popup?: string
}

export interface RateLimit {
  requests: number
  period: number
}

export interface LegendItem {
  color: string
  label: string
  icon?: string
}

export interface DataSourcePlugin {
  id: string
  name: string
  icon: string
  category: PluginCategory
  
  fetch: () => Promise<MapMarker[]>
  refreshInterval: number
  
  description?: string
  attribution?: string
  website?: string
  rateLimit?: RateLimit
  
  onMarkerClick?: (marker: MapMarker) => void
  popupTemplate?: (marker: MapMarker) => string
  legend?: LegendItem[]
}

export interface PluginState {
  enabled: boolean
  lastFetch?: number
  lastError?: string
  markers: MapMarker[]
  isLoading: boolean
}
