import { CameraFeed } from './types'

export interface WindyWebcam {
  id: string
  status: 'active' | 'inactive'
  title: string
  image: {
    current: {
      thumbnail: string
    }
  }
  location: {
    latitude: number
    longitude: number
    city?: string
    country?: string
  }
  player: {
    day: {
      embed: string
    }
  }
}

export async function fetchPublicWebcams(): Promise<CameraFeed[]> {
  try {
    const response = await fetch('https://api.windy.com/api/webcams/v2/list/limit=150?show=webcams:image,location,player', {
      headers: {
        'x-windy-api-key': 'public'
      }
    })

    if (!response.ok) {
      console.warn('Windy API request failed, using fallback data')
      return []
    }

    const data = await response.json()
    const webcams: WindyWebcam[] = data.result?.webcams || []

    return webcams.map((webcam): CameraFeed => ({
      id: `WEBCAM-${webcam.id}`,
      name: webcam.title || 'Unnamed Webcam',
      lat: webcam.location.latitude,
      lng: webcam.location.longitude,
      streamUrl: webcam.player?.day?.embed || `https://www.windy.com/webcams/${webcam.id}`,
      status: webcam.status === 'active' ? 'online' : 'offline',
      lastFrame: new Date(),
      provider: webcam.location.city && webcam.location.country 
        ? `${webcam.location.city}, ${webcam.location.country}`
        : 'Windy Webcams',
      type: 'webcam',
      thumbnail: webcam.image?.current?.thumbnail
    }))
  } catch (error) {
    console.error('Error fetching webcams:', error)
    return []
  }
}

const CAMERA_PROVIDERS = [
  'Sentinel Satellite Network',
  'Global Earth Observation',
  'Skywatch Surveillance',
  'Border Security Array',
  'Military Installation',
  'Research Station Feed'
]

const STRATEGIC_LOCATIONS = [
  { name: 'Syria Border', lat: 36.2, lng: 37.1, type: 'border' as const },
  { name: 'Ukraine Border', lat: 50.4, lng: 30.5, type: 'border' as const },
  { name: 'Israel Border', lat: 31.5, lng: 34.8, type: 'border' as const },
  { name: 'Taiwan Strait', lat: 24.0, lng: 120.0, type: 'satellite' as const },
  { name: 'Black Sea', lat: 43.5, lng: 34.0, type: 'satellite' as const },
  { name: 'Persian Gulf', lat: 27.0, lng: 51.5, type: 'satellite' as const },
  { name: 'Korean DMZ', lat: 38.0, lng: 127.0, type: 'border' as const },
  { name: 'Kashmir Region', lat: 34.0, lng: 76.0, type: 'border' as const },
]

function generateStrategicCameras(): CameraFeed[] {
  const cameras: CameraFeed[] = []
  let cameraId = 5000

  STRATEGIC_LOCATIONS.forEach(location => {
    const camerasPerLocation = 8 + Math.floor(Math.random() * 12)
    
    for (let i = 0; i < camerasPerLocation; i++) {
      const latOffset = (Math.random() - 0.5) * 2
      const lngOffset = (Math.random() - 0.5) * 2
      
      const provider = CAMERA_PROVIDERS[Math.floor(Math.random() * CAMERA_PROVIDERS.length)]
      
      const statusRandom = Math.random()
      let status: CameraFeed['status']
      if (statusRandom < 0.7) status = 'online'
      else if (statusRandom < 0.95) status = 'offline'
      else status = 'error'
      
      const cameraNum = String(cameraId).padStart(4, '0')
      const prefix = location.type === 'satellite' ? 'SAT' : 'CAM'
      
      cameras.push({
        id: `${prefix}-${cameraNum}`,
        name: `${location.name} ${location.type.toUpperCase()} ${i + 1}`,
        lat: location.lat + latOffset,
        lng: location.lng + lngOffset,
        streamUrl: `rtsp://stream.godseye.io/${location.type}/${location.name.toLowerCase().replace(/\s+/g, '-')}/cam-${cameraNum}`,
        status,
        lastFrame: new Date(Date.now() - Math.random() * 300000),
        provider,
        type: location.type === 'satellite' ? 'satellite' : 'ground'
      })
      
      cameraId++
    }
  })

  return cameras
}

export async function fetchAllCameraFeeds(): Promise<CameraFeed[]> {
  const [publicWebcams, strategicCameras] = await Promise.all([
    fetchPublicWebcams(),
    Promise.resolve(generateStrategicCameras())
  ])

  return [...publicWebcams, ...strategicCameras]
}
