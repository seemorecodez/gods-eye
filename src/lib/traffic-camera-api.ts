import { CameraFeed } from './types'

interface TrafficCameraLocation {
  city: string
  country: string
  lat: number
  lng: number
  highwayCount: number
  intersectionCount: number
}

const MAJOR_CITIES_TRAFFIC: TrafficCameraLocation[] = [
  { city: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060, highwayCount: 15, intersectionCount: 25 },
  { city: 'Los Angeles', country: 'USA', lat: 34.0522, lng: -118.2437, highwayCount: 20, intersectionCount: 30 },
  { city: 'Chicago', country: 'USA', lat: 41.8781, lng: -87.6298, highwayCount: 12, intersectionCount: 20 },
  { city: 'Houston', country: 'USA', lat: 29.7604, lng: -95.3698, highwayCount: 14, intersectionCount: 18 },
  { city: 'Phoenix', country: 'USA', lat: 33.4484, lng: -112.0740, highwayCount: 10, intersectionCount: 15 },
  { city: 'Philadelphia', country: 'USA', lat: 39.9526, lng: -75.1652, highwayCount: 11, intersectionCount: 17 },
  { city: 'San Antonio', country: 'USA', lat: 29.4241, lng: -98.4936, highwayCount: 9, intersectionCount: 14 },
  { city: 'San Diego', country: 'USA', lat: 32.7157, lng: -117.1611, highwayCount: 11, intersectionCount: 16 },
  { city: 'Dallas', country: 'USA', lat: 32.7767, lng: -96.7970, highwayCount: 13, intersectionCount: 19 },
  { city: 'San Jose', country: 'USA', lat: 37.3382, lng: -121.8863, highwayCount: 10, intersectionCount: 14 },
  { city: 'Austin', country: 'USA', lat: 30.2672, lng: -97.7431, highwayCount: 8, intersectionCount: 13 },
  { city: 'Seattle', country: 'USA', lat: 47.6062, lng: -122.3321, highwayCount: 10, intersectionCount: 15 },
  { city: 'Denver', country: 'USA', lat: 39.7392, lng: -104.9903, highwayCount: 9, intersectionCount: 14 },
  { city: 'Washington DC', country: 'USA', lat: 38.9072, lng: -77.0369, highwayCount: 12, intersectionCount: 20 },
  { city: 'Boston', country: 'USA', lat: 42.3601, lng: -71.0589, highwayCount: 10, intersectionCount: 16 },
  
  { city: 'London', country: 'UK', lat: 51.5074, lng: -0.1278, highwayCount: 18, intersectionCount: 35 },
  { city: 'Manchester', country: 'UK', lat: 53.4808, lng: -2.2426, highwayCount: 8, intersectionCount: 14 },
  { city: 'Birmingham', country: 'UK', lat: 52.4862, lng: -1.8904, highwayCount: 7, intersectionCount: 12 },
  
  { city: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, highwayCount: 16, intersectionCount: 28 },
  { city: 'Marseille', country: 'France', lat: 43.2965, lng: 5.3698, highwayCount: 6, intersectionCount: 10 },
  { city: 'Lyon', country: 'France', lat: 45.7640, lng: 4.8357, highwayCount: 7, intersectionCount: 11 },
  
  { city: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050, highwayCount: 12, intersectionCount: 22 },
  { city: 'Munich', country: 'Germany', lat: 48.1351, lng: 11.5820, highwayCount: 9, intersectionCount: 15 },
  { city: 'Hamburg', country: 'Germany', lat: 53.5511, lng: 9.9937, highwayCount: 8, intersectionCount: 13 },
  { city: 'Frankfurt', country: 'Germany', lat: 50.1109, lng: 8.6821, highwayCount: 10, intersectionCount: 16 },
  
  { city: 'Madrid', country: 'Spain', lat: 40.4168, lng: -3.7038, highwayCount: 11, intersectionCount: 19 },
  { city: 'Barcelona', country: 'Spain', lat: 41.3851, lng: 2.1734, highwayCount: 10, intersectionCount: 17 },
  
  { city: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964, highwayCount: 9, intersectionCount: 16 },
  { city: 'Milan', country: 'Italy', lat: 45.4642, lng: 9.1900, highwayCount: 10, intersectionCount: 18 },
  
  { city: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, highwayCount: 22, intersectionCount: 40 },
  { city: 'Osaka', country: 'Japan', lat: 34.6937, lng: 135.5023, highwayCount: 14, intersectionCount: 24 },
  { city: 'Yokohama', country: 'Japan', lat: 35.4437, lng: 139.6380, highwayCount: 11, intersectionCount: 18 },
  
  { city: 'Seoul', country: 'South Korea', lat: 37.5665, lng: 126.9780, highwayCount: 18, intersectionCount: 32 },
  { city: 'Busan', country: 'South Korea', lat: 35.1796, lng: 129.0756, highwayCount: 10, intersectionCount: 16 },
  
  { city: 'Beijing', country: 'China', lat: 39.9042, lng: 116.4074, highwayCount: 20, intersectionCount: 35 },
  { city: 'Shanghai', country: 'China', lat: 31.2304, lng: 121.4737, highwayCount: 19, intersectionCount: 33 },
  { city: 'Guangzhou', country: 'China', lat: 23.1291, lng: 113.2644, highwayCount: 15, intersectionCount: 25 },
  { city: 'Shenzhen', country: 'China', lat: 22.5431, lng: 114.0579, highwayCount: 14, intersectionCount: 23 },
  
  { city: 'Hong Kong', country: 'China', lat: 22.3193, lng: 114.1694, highwayCount: 12, intersectionCount: 20 },
  { city: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198, highwayCount: 13, intersectionCount: 22 },
  
  { city: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708, highwayCount: 15, intersectionCount: 24 },
  { city: 'Abu Dhabi', country: 'UAE', lat: 24.4539, lng: 54.3773, highwayCount: 10, intersectionCount: 16 },
  
  { city: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093, highwayCount: 12, intersectionCount: 19 },
  { city: 'Melbourne', country: 'Australia', lat: -37.8136, lng: 144.9631, highwayCount: 11, intersectionCount: 17 },
  
  { city: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832, highwayCount: 13, intersectionCount: 21 },
  { city: 'Vancouver', country: 'Canada', lat: 49.2827, lng: -123.1207, highwayCount: 9, intersectionCount: 14 },
  { city: 'Montreal', country: 'Canada', lat: 45.5017, lng: -73.5673, highwayCount: 10, intersectionCount: 16 },
  
  { city: 'Mexico City', country: 'Mexico', lat: 19.4326, lng: -99.1332, highwayCount: 16, intersectionCount: 27 },
  
  { city: 'São Paulo', country: 'Brazil', lat: -23.5505, lng: -46.6333, highwayCount: 17, intersectionCount: 29 },
  { city: 'Rio de Janeiro', country: 'Brazil', lat: -22.9068, lng: -43.1729, highwayCount: 12, intersectionCount: 20 },
  
  { city: 'Buenos Aires', country: 'Argentina', lat: -34.6037, lng: -58.3816, highwayCount: 13, intersectionCount: 21 },
  
  { city: 'Istanbul', country: 'Turkey', lat: 41.0082, lng: 28.9784, highwayCount: 14, intersectionCount: 23 },
  
  { city: 'Moscow', country: 'Russia', lat: 55.7558, lng: 37.6173, highwayCount: 15, intersectionCount: 25 },
  { city: 'St Petersburg', country: 'Russia', lat: 59.9343, lng: 30.3351, highwayCount: 9, intersectionCount: 14 },
  
  { city: 'Bangkok', country: 'Thailand', lat: 13.7563, lng: 100.5018, highwayCount: 14, intersectionCount: 24 },
  
  { city: 'Mumbai', country: 'India', lat: 19.0760, lng: 72.8777, highwayCount: 13, intersectionCount: 22 },
  { city: 'Delhi', country: 'India', lat: 28.7041, lng: 77.1025, highwayCount: 15, intersectionCount: 26 },
  { city: 'Bangalore', country: 'India', lat: 12.9716, lng: 77.5946, highwayCount: 11, intersectionCount: 18 },
]

const HIGHWAY_NAMES = ['I-', 'A-', 'M-', 'Route ', 'Highway ', 'Freeway ']
const INTERSECTION_TYPES = ['Main St', 'Park Ave', 'Broadway', 'Central Blvd', 'River Rd', 'Market St', 'King St', 'Queen St']

export async function fetchTrafficCameras(): Promise<CameraFeed[]> {
  const cameras: CameraFeed[] = []
  let cameraId = 1
  
  for (const location of MAJOR_CITIES_TRAFFIC) {
    for (let i = 0; i < location.highwayCount; i++) {
      const latOffset = (Math.random() - 0.5) * 0.15
      const lngOffset = (Math.random() - 0.5) * 0.15
      
      const highwayNum = Math.floor(Math.random() * 999) + 1
      const highwayPrefix = HIGHWAY_NAMES[Math.floor(Math.random() * HIGHWAY_NAMES.length)]
      const direction = ['N', 'S', 'E', 'W'][Math.floor(Math.random() * 4)]
      const mileMarker = (Math.random() * 50).toFixed(1)
      
      const status: 'online' | 'offline' = Math.random() > 0.15 ? 'online' : 'offline'
      
      cameras.push({
        id: `traffic-${location.city.toLowerCase().replace(/\s+/g, '-')}-hw-${cameraId}`,
        name: `${location.city} - ${highwayPrefix}${highwayNum} ${direction} @ Mile ${mileMarker}`,
        lat: location.lat + latOffset,
        lng: location.lng + lngOffset,
        streamUrl: `https://traffic.${location.country.toLowerCase()}/stream/highway-${cameraId}`,
        status,
        lastFrame: new Date(Date.now() - Math.random() * 300000),
        provider: `${location.city} DOT`,
        type: 'ground',
        thumbnail: status === 'online' ? 
          `https://cdn.511.org/cameras/hw${highwayNum}_mm${mileMarker.replace('.', '')}.jpg` :
          undefined
      })
      
      cameraId++
    }
    
    for (let i = 0; i < location.intersectionCount; i++) {
      const latOffset = (Math.random() - 0.5) * 0.12
      const lngOffset = (Math.random() - 0.5) * 0.12
      
      const street1 = INTERSECTION_TYPES[Math.floor(Math.random() * INTERSECTION_TYPES.length)]
      const street2 = INTERSECTION_TYPES[Math.floor(Math.random() * INTERSECTION_TYPES.length)]
      const direction = ['NB', 'SB', 'EB', 'WB'][Math.floor(Math.random() * 4)]
      
      const status: 'online' | 'offline' = Math.random() > 0.12 ? 'online' : 'offline'
      
      cameras.push({
        id: `traffic-${location.city.toLowerCase().replace(/\s+/g, '-')}-int-${cameraId}`,
        name: `${location.city} - ${street1} & ${street2} (${direction})`,
        lat: location.lat + latOffset,
        lng: location.lng + lngOffset,
        streamUrl: `https://traffic.${location.country.toLowerCase()}/stream/intersection-${cameraId}`,
        status,
        lastFrame: new Date(Date.now() - Math.random() * 300000),
        provider: `${location.city} Traffic Control`,
        type: 'ground',
        thumbnail: status === 'online' ?
          `https://cdn.trafficcam.net/${location.city.toLowerCase()}/${cameraId}.jpg` :
          undefined
      })
      
      cameraId++
    }
  }
  
  console.log(`Generated ${cameras.length} traffic cameras across ${MAJOR_CITIES_TRAFFIC.length} major cities`)
  return cameras
}

export function getTrafficCamerasByRegion(region: string, allCameras: CameraFeed[]): CameraFeed[] {
  const regionLower = region.toLowerCase()
  return allCameras.filter(cam => 
    cam.name.toLowerCase().includes(regionLower) ||
    cam.provider.toLowerCase().includes(regionLower)
  )
}

export function getTrafficCamerasByProvider(provider: string, allCameras: CameraFeed[]): CameraFeed[] {
  return allCameras.filter(cam => cam.provider === provider)
}
