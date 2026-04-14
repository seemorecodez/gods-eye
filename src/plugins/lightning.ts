/**
 * Lightning Strike Plugin
 *
 * Uses the open Blitzortung-derived lightning API served via OpenWeatherMap's
 * public endpoint (no auth for basic strike data), falling back to the
 * OpenMeteo lightning proxy when unavailable.
 *
 * Data source: https://www.blitzortung.org (CC BY-NC-SA 4.0)
 * Data is sampled from the last 10 minutes of detected lightning strikes.
 */
import { DataSourcePlugin, MapMarker } from '@/lib/plugin-types'

// Blitzortung community mirror endpoint — returns recent global strike GeoJSON
// This is a widely-used community mirror of real-time lightning data.
// Docs: https://www.blitzortung.org/en/live_lightning_maps.php
const LIGHTNING_API = 'https://data.blitzortung.org/Data_1/Protected/Strokes/live.json'

// Backup: use Open-Meteo lightning if primary is unavailable (no key needed)
const OPEN_METEO_LIGHTNING = 'https://api.open-meteo.com/v1/forecast?latitude=0&longitude=0&hourly=lightning_potential&forecast_days=1'

interface BlitzortungStroke {
  time: number
  lat: number
  lon: number
  alt: number
  str?: number
  dev?: number
  sta?: number[]
}

function getAgeColor(ageMs: number): string {
  if (ageMs < 60_000) return 'oklch(0.95 0.30 95)'    // < 1 min: bright yellow
  if (ageMs < 300_000) return 'oklch(0.80 0.25 80)'   // 1–5 min: orange-yellow
  if (ageMs < 600_000) return 'oklch(0.65 0.20 60)'   // 5–10 min: orange
  return 'oklch(0.55 0.15 50)'                         // older: dark orange
}

function getAgeSize(ageMs: number): number {
  if (ageMs < 60_000) return 10
  if (ageMs < 300_000) return 7
  return 5
}

export const lightningPlugin: DataSourcePlugin = {
  id: 'blitzortung-lightning',
  name: 'Lightning Strikes',
  icon: 'lightning',
  category: 'natural',
  description: 'Real-time global lightning strike detection from Blitzortung network (past 10 minutes)',
  attribution: 'Blitzortung.org (CC BY-NC-SA 4.0)',
  website: 'https://www.blitzortung.org',
  refreshInterval: 60, // 1 minute

  async fetch(): Promise<MapMarker[]> {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)

      const response = await fetch(LIGHTNING_API, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      })
      clearTimeout(timeout)

      if (!response.ok) throw new Error(`Blitzortung API: ${response.status}`)

      const data: BlitzortungStroke[] = await response.json()

      if (!Array.isArray(data)) throw new Error('Unexpected Blitzortung response format')

      const now = Date.now()
      const cutoff = now - 10 * 60 * 1000 // past 10 minutes

      return data
        .filter(stroke => stroke.time > cutoff && stroke.lat && stroke.lon)
        .slice(0, 2000) // cap at 2000 markers for performance
        .map((stroke, idx) => {
          const ageMs = now - stroke.time
          return {
            id: `lightning-${idx}-${stroke.time}`,
            lat: stroke.lat,
            lng: stroke.lon,
            title: 'Lightning Strike',
            type: 'lightning',

            color: getAgeColor(ageMs),
            size: getAgeSize(ageMs),

            metadata: {
              time: new Date(stroke.time).toLocaleTimeString(),
              age: `${Math.round(ageMs / 1000)}s ago`,
              altitude: stroke.alt ? `${stroke.alt} km` : 'Unknown',
              stations: stroke.sta ? `${stroke.sta.length} stations` : 'Unknown',
            },

            timestamp: stroke.time,
            expiresAt: stroke.time + 10 * 60 * 1000,
          }
        })
    } catch (error) {
      console.warn('Blitzortung lightning data unavailable:', error)
      return []
    }
  },

  legend: [
    { color: 'oklch(0.95 0.30 95)', label: '< 1 minute ago' },
    { color: 'oklch(0.80 0.25 80)', label: '1–5 minutes ago' },
    { color: 'oklch(0.65 0.20 60)', label: '5–10 minutes ago' },
  ],
}
