import { CameraFeed } from './types'

  noradId: string
  orbitAlt: nu
  noradId: string
  name: string
  maxElevation: nu
}

  noradId: string

  id: string
  lat: number
  alt: number
  status: 'ac
  noradId: st

  { name: 'Sentinel-2A', noradI
  { name: 'Terra 
 

export interface SatellitePosition {
  const incl
  return {
    lng: ((an
}
export functi
    const pos = ca
    return {
      name: sa
      lng: pos.ln
 

    }
}
export function fetchSatellitePasses(): SatellitePass[] {
    const pos = calculateSatellitePosition(sat)
    const nextPassTime = new Date(Date.now() + passMinutes * 60000)
    return {
 

      alt: sat.orbitAlt,
      status: 'active' as const,
    }
  const inclination = 98.2 * (Math.PI / 180)
  
  return {
    lat: Math.sin(inclination) * Math.sin(angle) * 90,
    lng: ((angle * 180) / Math.PI - 180) % 360,
  }
 

export function getSatellitePositions(): SatellitePosition[] {
  return REAL_SATELLITES.map(sat => {
    const pos = calculateSatellitePosition(sat)
    
    return {
      id: sat.noradId,
      name: sat.name,
      lat: pos.lat,
      lng: pos.lng,
      alt: sat.orbitAlt,
      velocity: 7.5 + Math.random() * 0.5,
      status: 'active' as const,
      type: sat.type,
      noradId: sat.noradId,
    }
  })
}

export function fetchSatellitePasses(): SatellitePass[] {
  return REAL_SATELLITES.map(sat => {
    const pos = calculateSatellitePosition(sat)
    const passMinutes = Math.floor(Math.random() * 120) + 30
    const nextPassTime = new Date(Date.now() + passMinutes * 60000)
    
    return {
      name: sat.name,
      passTime: nextPassTime,
      maxElevation: 45 + Math.random() * 45,
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

    lat: sat.lat,









