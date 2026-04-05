import { CameraFeed } from './types'

const CAMERA_PROVIDERS = [
  'Sentinel Satellite Network',
  'ISR Surveillance',
  'Border Monitoring System',
  'Military Installation',
  'Research Station Feed'
]

const STRATEGIC_LOCATIONS = [
  { name: 'Taiwan Strait', lat: 24.5, lng: 120.5, type: 'satellite' as const },
  { name: 'Persian Gulf', lat: 27.0, lng: 51.5, type: 'satellite' as const },
  { name: 'Kashmir Region', lat: 34.0, lng: 76.0, type: 'border' as const },
  { name: 'Korean DMZ', lat: 38.0, lng: 127.0, type: 'ground' as const },
  { name: 'Baltic Sea', lat: 58.0, lng: 20.0, type: 'aerial' as const },
  { name: 'South China Sea', lat: 12.0, lng: 114.0, type: 'satellite' as const },
  { name: 'Black Sea', lat: 43.5, lng: 34.0, type: 'satellite' as const },
  { name: 'Eastern Mediterranean', lat: 35.0, lng: 33.0, type: 'satellite' as const },
  { name: 'Red Sea', lat: 20.0, lng: 38.0, type: 'satellite' as const },
  { name: 'Arctic Circle', lat: 70.0, lng: 25.0, type: 'aerial' as const }
]

export async function fetchAllCameraFeeds(): Promise<CameraFeed[]> {
  const cameras: CameraFeed[] = []
  let cameraId = 1000

  for (const location of STRATEGIC_LOCATIONS) {
    const prefix = location.name.replace(/\s+/g, '-').toLowerCase()
    const camerasPerLocation = 8 + Math.floor(Math.random() * 5)
    
    for (let i = 0; i < camerasPerLocation; i++) {
      const latOffset = (Math.random() - 0.5) * 2
      const lngOffset = (Math.random() - 0.5) * 2
      const provider = CAMERA_PROVIDERS[Math.floor(Math.random() * CAMERA_PROVIDERS.length)]
      
      let status: 'online' | 'offline' | 'error' = 'online'
      const statusRandom = Math.random()
      if (statusRandom < 0.7) status = 'online'
      else if (statusRandom < 0.9) status = 'offline'
      else status = 'error'

      const cameraNum = String(cameraId).padStart(4, '0')
      
      cameras.push({
        id: `${prefix}-${cameraNum}`,
        name: `${location.name} - Camera ${cameraNum}`,
        lat: location.lat + latOffset,
        lng: location.lng + lngOffset,
        streamUrl: `rtsp://camera.feed/${prefix}/${cameraNum}`,
        status,
        lastFrame: new Date(Date.now() - Math.random() * 3600000),
        provider,
        type: location.type === 'satellite' ? 'satellite' : location.type === 'aerial' ? 'aerial' : location.type === 'border' ? 'ground' : 'ground'
      })

      cameraId++
    }
  }

  return cameras
}

export async function getCameraFeedById(id: string): Promise<CameraFeed | null> {
  const feeds = await fetchAllCameraFeeds()
  return feeds.find(feed => feed.id === id) || null
}
