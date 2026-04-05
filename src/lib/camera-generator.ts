import { CameraFeed } from './types'

const CAMERA_PROVIDERS = [
  'Sentinel Satellite Network',
  'Global Earth Observation',
  'Skywatch Surveillance',
  'Urban Monitor Systems',
  'Border Security Array',
  'Traffic Analysis Network',
  'Weather Station Cams',
  'Port Security Grid',
  'Airport Surveillance',
  'Military Installation',
  'Research Station Feed',
  'Infrastructure Monitor'
]

const MAJOR_CITIES = [
  { name: 'New York', lat: 40.7128, lng: -74.0060, region: 'North America' },
  { name: 'London', lat: 51.5074, lng: -0.1278, region: 'Europe' },
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503, region: 'Asia' },
  { name: 'Beijing', lat: 39.9042, lng: 116.4074, region: 'Asia' },
  { name: 'Dubai', lat: 25.2048, lng: 55.2708, region: 'Middle East' },
  { name: 'Singapore', lat: 1.3521, lng: 103.8198, region: 'Asia' },
  { name: 'Sydney', lat: -33.8688, lng: 151.2093, region: 'Oceania' },
  { name: 'Moscow', lat: 55.7558, lng: 37.6173, region: 'Europe' },
  { name: 'Istanbul', lat: 41.0082, lng: 28.9784, region: 'Europe' },
  { name: 'Cairo', lat: 30.0444, lng: 31.2357, region: 'Africa' },
  { name: 'Lagos', lat: 6.5244, lng: 3.3792, region: 'Africa' },
  { name: 'São Paulo', lat: -23.5505, lng: -46.6333, region: 'South America' },
  { name: 'Mexico City', lat: 19.4326, lng: -99.1332, region: 'North America' },
  { name: 'Toronto', lat: 43.6532, lng: -79.3832, region: 'North America' },
  { name: 'Paris', lat: 48.8566, lng: 2.3522, region: 'Europe' },
  { name: 'Berlin', lat: 52.5200, lng: 13.4050, region: 'Europe' },
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777, region: 'Asia' },
  { name: 'Bangkok', lat: 13.7563, lng: 100.5018, region: 'Asia' },
  { name: 'Seoul', lat: 37.5665, lng: 126.9780, region: 'Asia' },
  { name: 'Los Angeles', lat: 34.0522, lng: -118.2437, region: 'North America' },
  { name: 'Hong Kong', lat: 22.3193, lng: 114.1694, region: 'Asia' },
  { name: 'Shanghai', lat: 31.2304, lng: 121.4737, region: 'Asia' },
  { name: 'Johannesburg', lat: -26.2041, lng: 28.0473, region: 'Africa' },
  { name: 'Buenos Aires', lat: -34.6037, lng: -58.3816, region: 'South America' },
  { name: 'Chicago', lat: 41.8781, lng: -87.6298, region: 'North America' }
]

export function generate300PlusCameraFeeds(): CameraFeed[] {
  const cameras: CameraFeed[] = []
  let cameraId = 1

  MAJOR_CITIES.forEach(city => {
    const camerasPerCity = 10 + Math.floor(Math.random() * 15)
    
    for (let i = 0; i < camerasPerCity; i++) {
      const latOffset = (Math.random() - 0.5) * 0.5
      const lngOffset = (Math.random() - 0.5) * 0.5
      
      const types: CameraFeed['type'][] = ['satellite', 'ground', 'aerial']
      const type = types[Math.floor(Math.random() * types.length)]
      
      const provider = CAMERA_PROVIDERS[Math.floor(Math.random() * CAMERA_PROVIDERS.length)]
      
      const statusRandom = Math.random()
      let status: CameraFeed['status']
      if (statusRandom < 0.75) status = 'online'
      else if (statusRandom < 0.95) status = 'offline'
      else status = 'error'
      
      const cameraNum = String(cameraId).padStart(4, '0')
      
      cameras.push({
        id: `CAM-${cameraNum}`,
        name: `${city.name} ${type.toUpperCase()} ${i + 1}`,
        lat: city.lat + latOffset,
        lng: city.lng + lngOffset,
        streamUrl: `rtsp://stream.godseye.io/${city.region.toLowerCase().replace(' ', '-')}/${city.name.toLowerCase().replace(' ', '-')}/cam-${cameraNum}`,
        status,
        lastFrame: new Date(Date.now() - Math.random() * 300000),
        provider,
        type
      })
      
      cameraId++
    }
  })

  const borderCams = 50
  for (let i = 0; i < borderCams; i++) {
    const lat = -60 + Math.random() * 120
    const lng = -180 + Math.random() * 360
    
    const cameraNum = String(cameraId).padStart(4, '0')
    const statusRandom = Math.random()
    
    cameras.push({
      id: `CAM-${cameraNum}`,
      name: `BORDER SURVEILLANCE ${cameraNum}`,
      lat,
      lng,
      streamUrl: `rtsp://stream.godseye.io/border/cam-${cameraNum}`,
      status: statusRandom < 0.8 ? 'online' : 'offline',
      lastFrame: new Date(Date.now() - Math.random() * 600000),
      provider: 'Border Security Array',
      type: 'ground'
    })
    
    cameraId++
  }

  const satelliteCams = 30
  for (let i = 0; i < satelliteCams; i++) {
    const lat = -80 + Math.random() * 160
    const lng = -180 + Math.random() * 360
    
    const cameraNum = String(cameraId).padStart(4, '0')
    
    cameras.push({
      id: `SAT-${cameraNum}`,
      name: `ORBITAL SAT ${cameraNum}`,
      lat,
      lng,
      streamUrl: `rtsp://stream.godseye.io/satellite/sat-${cameraNum}`,
      status: Math.random() < 0.9 ? 'online' : 'error',
      lastFrame: new Date(Date.now() - Math.random() * 180000),
      provider: 'Sentinel Satellite Network',
      type: 'satellite'
    })
    
    cameraId++
  }

  return cameras
}
