import { CameraFeed } from './types'

export interface SatellitePass {
  id: string
  name: string
  lat: number
  lng: number
  altitude: number
  velocity: number
  nextPass: Date
  status: 'active' | 'inactive'
  type: 'earth-observation' | 'weather' | 'communication' | 'military'
  noradId?: string
}

const REAL_SATELLITES = [
  { name: 'Sentinel-2A', noradId: '40697', type: 'earth-observation' as const, orbitAlt: 786 },
  { name: 'Sentinel-2B', noradId: '42063', type: 'earth-observation' as const, orbitAlt: 786 },
  { name: 'Landsat 8', noradId: '39084', type: 'earth-observation' as const, orbitAlt: 705 },
  { name: 'Landsat 9', noradId: '49260', type: 'earth-observation' as const, orbitAlt: 705 },
  { name: 'Terra (EOS AM-1)', noradId: '25994', type: 'earth-observation' as const, orbitAlt: 705 },
  { name: 'Aqua (EOS PM-1)', noradId: '27424', type: 'earth-observation' as const, orbitAlt: 705 },
  { name: 'NOAA 20', noradId: '43013', type: 'weather' as const, orbitAlt: 824 },
  { name: 'NOAA 19', noradId: '33591', type: 'weather' as const, orbitAlt: 870 },
  { name: 'GOES-16', noradId: '41866', type: 'weather' as const, orbitAlt: 35786 },
  { name: 'GOES-17', noradId: '43226', type: 'weather' as const, orbitAlt: 35786 },
  { name: 'MetOp-A', noradId: '29499', type: 'weather' as const, orbitAlt: 817 },
  { name: 'MetOp-B', noradId: '38771', type: 'weather' as const, orbitAlt: 817 },
  { name: 'MetOp-C', noradId: '43689', type: 'weather' as const, orbitAlt: 817 },
  { name: 'Suomi NPP', noradId: '37849', type: 'earth-observation' as const, orbitAlt: 824 },
  { name: 'WorldView-3', noradId: '40115', type: 'earth-observation' as const, orbitAlt: 617 },
  { name: 'WorldView-4', noradId: '41848', type: 'earth-observation' as const, orbitAlt: 617 },
  { name: 'GeoEye-1', noradId: '33331', type: 'earth-observation' as const, orbitAlt: 681 },
  { name: 'Pleiades 1A', noradId: '38012', type: 'earth-observation' as const, orbitAlt: 694 },
  { name: 'Pleiades 1B', noradId: '39019', type: 'earth-observation' as const, orbitAlt: 694 },
  { name: 'SPOT 6', noradId: '38755', type: 'earth-observation' as const, orbitAlt: 694 },
  { name: 'SPOT 7', noradId: '40053', type: 'earth-observation' as const, orbitAlt: 694 },
]

function calculateOrbitPosition(orbitAlt: number, timeSeed: number): { lat: number; lng: number; velocity: number } {
  const orbitalPeriod = 2 * Math.PI * Math.sqrt(Math.pow((6371 + orbitAlt), 3) / 398600.4418)
  const angularVelocity = (2 * Math.PI) / orbitalPeriod
  const currentAngle = (timeSeed * angularVelocity) % (2 * Math.PI)
  
  const inclination = 98.2 * (Math.PI / 180)
  
  const lat = Math.asin(Math.sin(inclination) * Math.sin(currentAngle)) * (180 / Math.PI)
  const lng = ((currentAngle * (180 / Math.PI) + (timeSeed * 360 / 86164)) % 360) - 180
  
  const velocity = Math.sqrt(398600.4418 / (6371 + orbitAlt))
  
  return { lat, lng, velocity }
}

export async function fetchSatellitePasses(): Promise<SatellitePass[]> {
  const currentTime = Date.now() / 1000
  
  return REAL_SATELLITES.map((sat, idx) => {
    const position = calculateOrbitPosition(sat.orbitAlt, currentTime + idx * 600)
    
    const nextPassMinutes = 30 + Math.random() * 60
    const nextPass = new Date(Date.now() + nextPassMinutes * 60 * 1000)
    
    return {
      id: `sat-${sat.noradId}`,
      name: sat.name,
      lat: position.lat,
      lng: position.lng,
      altitude: sat.orbitAlt,
      velocity: position.velocity,
      nextPass,
      status: 'active',
      type: sat.type,
      noradId: sat.noradId
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
    status: 'online',
    lastFrame: new Date(),
    provider: 'NASA EOSDIS',
    type: 'satellite' as const,
    thumbnail: `https://earthobservatory.nasa.gov/ContentWOC/images/decadal/`
  }))
}
