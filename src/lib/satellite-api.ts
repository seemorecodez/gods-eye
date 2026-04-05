import { CameraFeed } from './types'

export interface SatelliteData {
  noradId: string
  orbitAlt: nu

  id: string
 

  status: 'active' | 'offline' | 'er
  noradId: s

  id: string
  passTime: D
  lat: number
  alt: number
  nextPass: Date
  noradId: string
  velocity: numbe


  { name: 'Sentinel-1A', noradId
  { name: 'Lan
  { name: 'Terra
  { name: 'NOAA-20', n
  { name: 'Wo
]
function calc
  const orbitalP
  const inclination = 98.2 * (Math.PI / 
  return {
 

export function getSatellitePositions(): S
    const pos = calculateSatellitePosition(sat)
    return {
      name: sat.name,
      lng: pos.lng,
      velocity: 7.5 + Math.random() * 0.5,
      type: sat.type,
    }
}
export function fetchSatellitePasses(): SatellitePass[] {
    const pos = calculateSatellitePosition(sat)
    const nextPassTime = new Date(Date.now() + passMinutes * 60000)
    
 

      lat: pos.lat,
      alt: sat.orbitAlt,
      nextPass: nextPassTime,
      noradId: sat.noradId,
      velocity,
  

  const satellites = getSatellitePositions()
    id: `sat-${sat.noradId}`,
   
 

    provider: 'ESA/NASA',
    thumbnail: `https://satellite-fee
}
expo
}

















































