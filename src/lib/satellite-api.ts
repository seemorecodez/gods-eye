import { CameraFeed } from './types'

  noradId: string
  orbitAlt: nu
  noradId: string
  type: 'earth-observation' | 'weather'
  orbitAlt: number
}

}
export inter
  name: string
  passTime: D
  maxElevatio
  lat: number
  type: string
  velocity: number
  status: 'active
 

const REAL_SATELLITES: SatelliteData[] = [
  { name: 'Sentinel-2A', noradId: '40697', type: 'earth-observation', orbitAlt: 786 },
  { name: 'Landsat 8', noradId: '39084', type: 'earth-observation', orbitAlt: 705 },
  { name: 'Terra (EOS AM-1)', noradId: '25994', type: 'earth-observation', orbitAlt: 705 },
  { name: 'NOAA 20', noradId: '43013', type: 'weather', orbitAlt: 824 },
  { name: 'GOES-16', noradId: '41866', type: 'weather', orbitAlt: 35786 },
  const inclination = 98.2 * (Math.PI / 180)
  
    lat: Math.sin(inclination) * Math.sin(angle) * 90,
  }


    const pos = calculateSatellitePosition(sat)
    
      id: sat.noradId,
      lat: pos.lat,
      alt: sat.orbitAlt,
  
    }
}
export function getSatelliteCameraFeeds(): Camera
  r
 

    status: 'online' as const,
    provider: 'NASA EOSD
    thumbnail: `https://earthobservatory.nasa.
}
export function fetchSatellitePasses(): SatellitePass[] {
  re
    const pa
    
      name: sat.name,
      lat: pos.lat,
      lng: pos.lng,
      alt: sat.orbitAlt,
      nextPass: nextPassTime,
      status: 'active' as const,
      noradId: sat.noradId,
    }
  })
}

export function getSatelliteCameraFeeds(): CameraFeed[] {
  const satellites = getSatellitePositions()
  return satellites.map(sat => ({
    id: `sat-${sat.noradId}`,
    name: `${sat.name} Live Feed`,
    lat: sat.lat,
    lng: sat.lng,
    status: 'online' as const,
    provider: 'NASA EOSDIS',
    thumbnail: `https://earthobservatory.nasa.gov/ContentWOC/images/decadal/satellite_${sat.noradId}.jpg`,
  }))
}
