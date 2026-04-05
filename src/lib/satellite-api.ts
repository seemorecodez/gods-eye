import { CameraFeed } from './types'

  name: string
  lng: numbe
  velocity: nu
  status: 'ac
  noradId?: s

  velocity: number
  nextPass: Date
  status: 'active' | 'inactive'
  type: 'earth-observation' | 'weather' | 'communication' | 'military'
  noradId?: string
 

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
      id: `sat-${sat.noradId}`,
      lat: position.lat,
      altitude: sat.orbitAlt,
      nextPass,
      type: sat.type,
 

export async function generateSatelliteImageryFeeds(): Promise<CameraFeed[]> {
  
    id: `${sat.id}-feed`,
    lat: sat.lat,
  
    lastFrame: new Date(),
  
  }))

















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
