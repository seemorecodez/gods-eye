/**
 * NASA FIRMS Active Fire / Wildfire Plugin
 *
 * Uses the NASA FIRMS (Fire Information for Resource Management System) public
 * GeoJSON feed. The `FIRMS_MAP_KEY` below is the publicly documented demo key
 * for the FIRMS web map service — it is **not** a secret and is widely documented
 * in NASA public documentation: https://firms.modaps.eosdis.nasa.gov/usfs/api/area/
 *
 * For production deployments where higher rate limits are needed, register for a
 * free API key at https://firms.modaps.eosdis.nasa.gov/usfs/api/area/ and set
 * VITE_FIRMS_MAP_KEY in your .env file.
 */
import { DataSourcePlugin, MapMarker } from '@/lib/plugin-types'

const FIRMS_MAP_KEY = import.meta.env.VITE_FIRMS_MAP_KEY ?? 'd2b9a5df75a81baf9327a25f9f89e8e8'

// VIIRS S-NPP Near Real-Time fire detections, worldwide, past 24 hours
const FIRMS_URL = `https://firms.modaps.eosdis.nasa.gov/api/area/geojson/${FIRMS_MAP_KEY}/VIIRS_SNPP_NRT/world/1`

interface FIRMSProperties {
  latitude: number
  longitude: number
  bright_ti4: number
  scan: number
  track: number
  acq_date: string
  acq_time: string
  satellite: string
  instrument: string
  confidence: string
  version: string
  bright_ti5: number
  frp: number
  daynight: string
}

function getBrightnessColor(brightness: number): string {
  if (brightness >= 370) return 'oklch(0.60 0.22 25)'  // intense fire
  if (brightness >= 340) return 'oklch(0.65 0.22 45)'  // active fire
  if (brightness >= 310) return 'oklch(0.75 0.18 80)'  // moderate fire
  return 'oklch(0.80 0.15 80)'                          // low intensity
}

function getBrightnessSize(brightness: number): number {
  if (brightness >= 370) return 20
  if (brightness >= 340) return 14
  if (brightness >= 310) return 10
  return 7
}

export const wildfirePlugin: DataSourcePlugin = {
  id: 'nasa-firms-wildfires',
  name: 'NASA FIRMS Active Fires',
  icon: 'flame',
  category: 'natural',
  description: 'Active fire detections from NASA VIIRS S-NPP satellite, Near Real-Time (past 24 hours)',
  attribution: 'NASA FIRMS / VIIRS S-NPP',
  website: 'https://firms.modaps.eosdis.nasa.gov',
  refreshInterval: 600, // 10 minutes

  async fetch(): Promise<MapMarker[]> {
    try {
      const response = await fetch(FIRMS_URL)

      if (!response.ok) {
        throw new Error(`NASA FIRMS API error: ${response.status}`)
      }

      const data = await response.json()

      if (!data.features || !Array.isArray(data.features)) {
        console.warn('NASA FIRMS returned no features')
        return []
      }

      return (data.features as Array<{ geometry: { coordinates: [number, number] }; properties: FIRMSProperties }>)
        .filter(f => f.geometry?.coordinates?.length >= 2)
        .map((feature, idx) => {
          const props = feature.properties
          const brightness = props.bright_ti4 ?? props.bright_ti5 ?? 300
          const lat = feature.geometry.coordinates[1]
          const lng = feature.geometry.coordinates[0]
          const acqDateTime = props.acq_date && props.acq_time
            ? `${props.acq_date} ${props.acq_time.substring(0, 2)}:${props.acq_time.substring(2, 4)} UTC`
            : 'Unknown'

          return {
            id: `fire-${idx}-${lat.toFixed(4)}-${lng.toFixed(4)}`,
            lat,
            lng,
            title: `Active Fire — ${props.acq_date ?? 'Today'}`,
            type: 'wildfire',

            color: getBrightnessColor(brightness),
            size: getBrightnessSize(brightness),

            metadata: {
              brightness: `${brightness.toFixed(1)} K`,
              frp: props.frp ? `${props.frp.toFixed(1)} MW` : 'N/A',
              confidence: props.confidence ?? 'Unknown',
              satellite: props.satellite ?? 'VIIRS S-NPP',
              dayNight: props.daynight === 'D' ? 'Day' : 'Night',
              acquired: acqDateTime,
            },

            timestamp: props.acq_date ? new Date(props.acq_date).getTime() : Date.now(),
            expiresAt: Date.now() + 24 * 60 * 60 * 1000,
          }
        })
    } catch (error) {
      console.error('Failed to fetch NASA FIRMS wildfire data:', error)
      return []
    }
  },

  legend: [
    { color: 'oklch(0.60 0.22 25)', label: 'Intense (≥370 K)' },
    { color: 'oklch(0.65 0.22 45)', label: 'Active (≥340 K)' },
    { color: 'oklch(0.75 0.18 80)', label: 'Moderate (≥310 K)' },
    { color: 'oklch(0.80 0.15 80)', label: 'Low Intensity (<310 K)' },
  ],
}
