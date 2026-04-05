import { CameraFeed } from './types'

  status: 'active' | 'inactive
  image: {
  status: 'active' | 'inactive'
  title: string
  image: {
    current: {
  }
    d
   
}
export async functio
    const response = 
        'x-windy-
    })
   
      retur

    const webcams: 
    r
   
 

      provider: webcam.location.city && webcam.location.country 
       
      thumbnail: webcam.image?.current?.thumbnail
  } catch (error
    return []
}
const 

  'Border Security Arra
  'Research Station Feed'

  { n

  { name: 'Black Sea', lat: 43.5, lng:
  { name: 'Korean DMZ', lat: 38.0, lng: 127.0, type: 'border'

function generateStrategicCameras(): CameraFeed[]
  let cameraId = 5000
  STRATEGIC_LOCATIONS.forEach(location => {
    
      const latOffset = (Math.random(
      
      
      let status: CameraFeed
      else if (statusRandom < 0.95) status = 'offline'
      
      const prefix = locat
      cameras.push({
        name: `${location.name} ${location.type.t
       
        status,
        provider,
      })
   
 


  const [publicWebcams, strateg
    Promise.resolve(generateS

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


export async function fetchAllCameraFeeds(): Promise<CameraFeed[]> {
  const [publicWebcams, strategicCameras] = await Promise.all([
    fetchPublicWebcams(),
    Promise.resolve(generateStrategicCameras())
  ])

  return [...publicWebcams, ...strategicCameras]
}
