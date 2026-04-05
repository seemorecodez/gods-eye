import { CameraFeed } from './types'

interface WindyWebcam {
  id: string
  title: string
  location: {
    latitude: number
    longitude: number
    city?: string
    country?: string
  }
  status: string
  image?: {
    current?: {
      preview?: string
    }
    daylight?: {
      preview?: string
    }
  }
  player?: {
    live?: {
      embed?: string
    }
  }
}

interface WindyResponse {
  result: {
    webcams: WindyWebcam[]
  }
}

const WINDY_API_KEY = 'rDKHGwB5l9peLLWdTdCRJhG1PqIGIqWQ'
const WINDY_BASE_URL = 'https://api.windy.com/api/webcams/v2'

export async function fetchWindyWebcams(limit: number = 300): Promise<CameraFeed[]> {
  const cameras: CameraFeed[] = []
  
  try {
    const response = await fetch(
      `${WINDY_BASE_URL}/list/limit=${limit}/orderby=popularity?show=webcams:image,location,player`,
      {
        headers: {
          'x-windy-api-key': WINDY_API_KEY
        }
      }
    )

    if (!response.ok) {
      console.error('Windy API error:', response.status, response.statusText)
      return []
    }

    const data: WindyResponse = await response.json()
    
    if (!data.result?.webcams) {
      console.error('Invalid Windy API response')
      return []
    }

    data.result.webcams.forEach(webcam => {
      const thumbnail = webcam.image?.current?.preview || webcam.image?.daylight?.preview
      const streamUrl = webcam.player?.live?.embed || `https://www.windy.com/webcams/${webcam.id}`
      
      const location = webcam.location.city 
        ? `${webcam.location.city}, ${webcam.location.country || ''}`
        : webcam.location.country || 'Unknown Location'

      cameras.push({
        id: `windy-${webcam.id}`,
        name: webcam.title || location,
        lat: webcam.location.latitude,
        lng: webcam.location.longitude,
        streamUrl,
        status: webcam.status === 'active' ? 'online' : 'offline',
        lastFrame: new Date(),
        provider: 'Windy.com Public Webcams',
        type: 'webcam',
        thumbnail
      })
    })

    console.log(`Loaded ${cameras.length} real webcam feeds from Windy API`)
    return cameras
  } catch (error) {
    console.error('Error fetching Windy webcams:', error)
    return []
  }
}

export async function fetchWindyWebcamsByRegion(
  lat: number,
  lng: number,
  radius: number = 250,
  limit: number = 50
): Promise<CameraFeed[]> {
  try {
    const response = await fetch(
      `${WINDY_BASE_URL}/list/nearby=${lat},${lng},${radius}/limit=${limit}?show=webcams:image,location,player`,
      {
        headers: {
          'x-windy-api-key': WINDY_API_KEY
        }
      }
    )

    if (!response.ok) {
      console.error('Windy API error:', response.status)
      return []
    }

    const data: WindyResponse = await response.json()
    const cameras: CameraFeed[] = []

    data.result?.webcams?.forEach(webcam => {
      const thumbnail = webcam.image?.current?.preview || webcam.image?.daylight?.preview
      const streamUrl = webcam.player?.live?.embed || `https://www.windy.com/webcams/${webcam.id}`
      
      const location = webcam.location.city 
        ? `${webcam.location.city}, ${webcam.location.country || ''}`
        : webcam.location.country || 'Unknown Location'

      cameras.push({
        id: `windy-${webcam.id}`,
        name: webcam.title || location,
        lat: webcam.location.latitude,
        lng: webcam.location.longitude,
        streamUrl,
        status: webcam.status === 'active' ? 'online' : 'offline',
        lastFrame: new Date(),
        provider: 'Windy.com Public Webcams',
        type: 'webcam',
        thumbnail
      })
    })

    return cameras
  } catch (error) {
    console.error('Error fetching regional Windy webcams:', error)
    return []
  }
}
