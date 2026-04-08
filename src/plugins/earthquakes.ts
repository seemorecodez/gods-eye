import { DataSourcePlugin, MapMarker } from '@/lib/plugin-types'

export const earthquakesPlugin: DataSourcePlugin = {
  id: 'usgs-earthquakes',
  name: 'USGS Earthquakes',
  icon: 'globe-hemisphere-east',
  category: 'natural',
  description: 'Recent earthquake activity from the U.S. Geological Survey (past 24 hours)',
  attribution: 'U.S. Geological Survey',
  website: 'https://earthquake.usgs.gov',
  refreshInterval: 300,
  
  async fetch(): Promise<MapMarker[]> {
    try {
      const response = await fetch(
        'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson'
      )
      
      if (!response.ok) {
        throw new Error(`USGS API error: ${response.status}`)
      }
      
      const data = await response.json()
      
      return data.features.map((feature: any) => ({
        id: feature.id,
        lat: feature.geometry.coordinates[1],
        lng: feature.geometry.coordinates[0],
        title: feature.properties.place || `Magnitude ${feature.properties.mag} Earthquake`,
        type: 'earthquake',
        
        color: getMagnitudeColor(feature.properties.mag),
        size: getMagnitudeSize(feature.properties.mag),
        
        metadata: {
          magnitude: feature.properties.mag?.toFixed(1) || 'Unknown',
          depth: `${feature.geometry.coordinates[2]?.toFixed(1) || 'Unknown'} km`,
          time: new Date(feature.properties.time).toLocaleString(),
          status: feature.properties.status,
          type: feature.properties.type,
          felt: feature.properties.felt || 'Not reported',
          cdi: feature.properties.cdi || 'N/A',
          tsunami: feature.properties.tsunami ? 'Possible' : 'No',
          url: feature.properties.url
        },
        
        timestamp: feature.properties.time,
        expiresAt: Date.now() + (48 * 60 * 60 * 1000)
      }))
    } catch (error) {
      console.error('Failed to fetch earthquake data:', error)
      return []
    }
  },
  
  legend: [
    { color: 'oklch(0.60 0.22 25)', label: 'Major (6.0+)' },
    { color: 'oklch(0.75 0.18 80)', label: 'Moderate (4.0-5.9)' },
    { color: 'oklch(0.75 0.15 200)', label: 'Light (2.0-3.9)' },
    { color: 'oklch(0.70 0.20 145)', label: 'Minor (<2.0)' }
  ]
}

function getMagnitudeColor(mag: number | null): string {
  if (!mag) return 'oklch(0.50 0.05 250)'
  if (mag >= 6) return 'oklch(0.60 0.22 25)'
  if (mag >= 4) return 'oklch(0.75 0.18 80)'
  if (mag >= 2) return 'oklch(0.75 0.15 200)'
  return 'oklch(0.70 0.20 145)'
}

function getMagnitudeSize(mag: number | null): number {
  if (!mag) return 8
  return Math.max(8, Math.min(32, mag * 5))
}
