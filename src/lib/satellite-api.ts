import { CameraFeed } from './types'

interface SatelliteData {
  name: string
  noradId: string
  type: 'earth-observation' | 'weather'
  orbitAlt: number
}

export interface SatellitePass {
  id: string
  name: string
  lat: number
  lng: number
  velocity: number
  status: 'active'
  type: 'earth-observation' | 'weather'
  noradId: string
  altitude: number
  nextPass: Date
}

const REAL_SATELLITES: SatelliteData[] = [
  { name: 'Sentinel-2A', noradId: '40697', type: 'earth-observation', orbitAlt: 786 },
  { name: 'Landsat 8', noradId: '39084', type: 'earth-observation', orbitAlt: 705 },
  { name: 'Terra (EOS AM-1)', noradId: '25994', type: 'earth-observation', orbitAlt: 705 },
  { name: 'NOAA 20', noradId: '43013', type: 'weather', orbitAlt: 824 },
  { name: 'GOES-16', noradId: '41866', type: 'weather', orbitAlt: 35786 },
  { name: 'Sentinel-3A', noradId: '41335', type: 'earth-observation', orbitAlt: 814 },
  { name: 'SPOT 7', noradId: '40053', type: 'earth-observation', orbitAlt: 694 },
  { name: 'Aqua', noradId: '27424', type: 'earth-observation', orbitAlt: 705 },
  { name: 'Suomi NPP', noradId: '37849', type: 'weather', orbitAlt: 824 },
  { name: 'MetOp-C', noradId: '43689', type: 'weather', orbitAlt: 817 },
  { name: 'WorldView-4', noradId: '41848', type: 'earth-observation', orbitAlt: 617 },
]

function simulateOrbitPosition(sat: SatelliteData, time: Date) {
  const period = 90 + (sat.orbitAlt / 100)
  const angle = (time.getTime() / (period * 60000)) * 2 * Math.PI
  const inclination = 98.2 * (Math.PI / 180)
  
  return {
    lat: Math.sin(inclination) * Math.sin(angle) * 90,
    lng: ((angle * (180 / Math.PI)) % 360) - 180,
    velocity: 7.5 + (800 - sat.orbitAlt) / 100
  }
}

export async function fetchSatellitePasses(): Promise<SatellitePass[]> {
  const now = new Date()
  
  return REAL_SATELLITES.map((sat, index) => {
    const position = simulateOrbitPosition(sat, now)
    const nextPassTime = new Date(now.getTime() + (90 - (now.getMinutes() % 90)) * 60000)
    
    return {
      id: `sat-${sat.noradId}`,
      name: sat.name,
      lat: position.lat,
      lng: position.lng,
      velocity: position.velocity,
      status: 'active' as const,
      type: sat.type,
      noradId: sat.noradId,
      altitude: sat.orbitAlt,
      nextPass: nextPassTime
    }
  })
}

export async function generateSatelliteImageryFeeds(): Promise<CameraFeed[]> {
  const satellites = await fetchSatellitePasses()
  
  return satellites.map(sat => ({
    id: `${sat.id}-feed`,
    name: `${sat.name} Live Feed`,
    lat: sat.lat,
    lng: sat.lng,
    streamUrl: `https://eonet.gsfc.nasa.gov/api/v3/events?satellite=${sat.noradId}`,
    status: 'online' as const,
    lastFrame: new Date(),
    provider: 'NASA EOSDIS',
    type: 'satellite' as const,
    thumbnail: `https://earthobservatory.nasa.gov/ContentWOC/images/decadal/`
  }))
}
