import { CameraFeed } from './types'

  name: string
  lng: numbe
  velocity: nu
  status: 'ac
  noradId?: s

  { name: 'Sentine
  { name: 'Lands
  { name: 'Terra (EOS AM-1)', n
  { name: 'NOAA 20', noradId: '43013', 
  { name: 'GOES-16
 

const REAL_SATELLITES = [dId: '43689', type: 'weather' as const, orbitAlt: 817 },
  { name: 'WorldView-4', noradId: '41848', type: 'earth-observation' as const, orbitAlt: 617 },
]

function simulateOrbitPosition(sat: typeof REAL_SATELLITES[0], time: Date) {
  const period = 90 + (sat.orbitAlt / 100)
  const angle = (time.getTime() / (period * 60000)) * 2 * Math.PI
  const inclination = 98.2 * (Math.PI / 180)
  
  return {
    lat: Math.sin(inclination) * Math.sin(angle) * 90,
    lng: ((angle * (180 / Math.PI)) % 360) - 180,
    velocity: 7.5 + (800 - sat.orbitAlt) / 100
  }
}

  { name: 'WorldView-4', noradId: '41848', type: 'earth-observation' as const, orbitAlt: 617 },
]

function simulateOrbitPosition(sat: typeof REAL_SATELLITES[0], time: Date) {
  const period = 90 + (sat.orbitAlt / 100)
  const angle = (time.getTime() / (period * 60000)) * 2 * Math.PI
  const inclination = 98.2 * (Math.PI / 180)
  
  return {
    lat: Math.sin(inclination) * Math.sin(angle) * 90,
    lng: ((angle * (180 / Math.PI)) % 360) - 180,
    velocity: 7.5 + (800 - sat.orbitAlt) / 100
  }
}

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
