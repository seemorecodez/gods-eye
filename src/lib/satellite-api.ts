import { CameraFeed } from './types'

  noradId: string
  orbitAlt: nu

  id: string
  lat: number
 

const REAL_SATELLITES: SatelliteData[] = [
  { name: 'Sentinel-2A', noradId: '40697', type: 'earth-observation', orbitAlt: 786 },
  { name: 'Landsat 8', noradId: '39084', type: 'earth-observation', orbitAlt: 705 },
  { name: 'Terra (EOS AM-1)', noradId: '25994', type: 'earth-observation', orbitAlt: 705 },
  { name: 'NOAA 20', noradId: '43013', type: 'weather', orbitAlt: 824 },
  { name: 'GOES-16', noradId: '41866', type: 'weather', orbitAlt: 35786 },
  { name: 'Sentinel-3A', noradId: '41335', type: 'earth-observation', orbitAlt: 814 },
  { name: 'SPOT 7', noradId: '40053', type: 'earth-observation', orbitAlt: 694 },
  { name: 'Aqua', noradId: '27424', type: 'earth-observation', orbitAlt: 705 },
  { name: 'GOES-16', noradId: '41866', type: 'weather', orbitAlt: 35786 },
  { name: 'SPOT 7', noradId: '40053', type: 'earth-observation', orbitAl
  { name: 'Suomi NPP', noradId: '37849', type: 'weather', orbitAlt: 824 },
 

  const period = 90 + (sat.orbitAlt / 100)
  const inclination = 98.2 * (Math.PI / 18
  return {
    lng: ((angle * (180 / Math.PI)) % 360) -
  

  const now = new Date()
  return REAL_SATELLITES.map((sat, index) => {
    const nextPassTime = new Date(now.getTime(
   
 

      status: 'active' as const,
      noradId: sat.norad
  
  })

  co
  return sat
    name: `${sat.name} Live Fee
    lng: sat.lng,
    status: 'online' as 
    provider: 'NASA EOSD
    thumbnail: `https://earthobser
}






















