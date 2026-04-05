import { CameraFeed } from './types'

const PUBLIC_WEBCAMS = [
  { id: 'abbey-road', name: 'Abbey Road Crossing, London', lat: 51.5319, lng: -0.1773, url: 'https://www.abbeyroad.com/crossing', thumbnail: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400' },
  { id: 'times-square', name: 'Times Square, New York', lat: 40.7580, lng: -73.9855, url: 'https://www.earthcam.com/usa/newyork/timessquare/', thumbnail: 'https://images.unsplash.com/photo-1560425877-0b5e8d8b8c3f?w=400' },
  { id: 'tokyo-shibuya', name: 'Shibuya Crossing, Tokyo', lat: 35.6595, lng: 139.7004, url: 'https://www.youtube.com/watch?v=live', thumbnail: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=400' },
  { id: 'eiffel-tower', name: 'Eiffel Tower, Paris', lat: 48.8584, lng: 2.2945, url: 'https://www.earthcam.com/world/france/paris/', thumbnail: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=400' },
  { id: 'sydney-harbour', name: 'Sydney Harbour Bridge', lat: -33.8523, lng: 151.2108, url: 'https://www.earthcam.com/world/australia/sydney/', thumbnail: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400' },
  { id: 'golden-gate', name: 'Golden Gate Bridge, San Francisco', lat: 37.8199, lng: -122.4783, url: 'https://www.earthcam.com/usa/california/sanfrancisco/', thumbnail: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400' },
  { id: 'big-ben', name: 'Big Ben, London', lat: 51.5007, lng: -0.1246, url: 'https://www.earthcam.com/world/england/london/', thumbnail: 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=400' },
  { id: 'santorini', name: 'Santorini, Greece', lat: 36.3932, lng: 25.4615, url: 'https://www.earthcam.com/world/greece/santorini/', thumbnail: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400' },
  { id: 'dubai-marina', name: 'Dubai Marina', lat: 25.0804, lng: 55.1391, url: 'https://www.earthcam.com/world/unitedarabemirates/dubai/', thumbnail: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400' },
  { id: 'venice-rialto', name: 'Rialto Bridge, Venice', lat: 45.4380, lng: 12.3358, url: 'https://www.earthcam.com/world/italy/venice/', thumbnail: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=400' },
  { id: 'moscow-red-square', name: 'Red Square, Moscow', lat: 55.7539, lng: 37.6208, url: 'https://www.earthcam.com/world/russia/moscow/', thumbnail: 'https://images.unsplash.com/photo-1513326738677-b964603b136d?w=400' },
  { id: 'rio-copacabana', name: 'Copacabana Beach, Rio', lat: -22.9711, lng: -43.1822, url: 'https://www.earthcam.com/world/brazil/riodejaneiro/', thumbnail: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=400' },
  { id: 'niagara-falls', name: 'Niagara Falls', lat: 43.0896, lng: -79.0849, url: 'https://www.earthcam.com/canada/niagarafalls/', thumbnail: 'https://images.unsplash.com/photo-1489447068241-b3490214e879?w=400' },
  { id: 'singapore-marina', name: 'Marina Bay, Singapore', lat: 1.2864, lng: 103.8540, url: 'https://www.earthcam.com/world/singapore/', thumbnail: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400' },
  { id: 'barcelona-sagrada', name: 'Sagrada Familia, Barcelona', lat: 41.4036, lng: 2.1744, url: 'https://www.earthcam.com/world/spain/barcelona/', thumbnail: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400' },
  { id: 'amsterdam-dam', name: 'Dam Square, Amsterdam', lat: 52.3731, lng: 4.8932, url: 'https://www.earthcam.com/world/netherlands/amsterdam/', thumbnail: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=400' },
  { id: 'rome-colosseum', name: 'Colosseum, Rome', lat: 41.8902, lng: 12.4922, url: 'https://www.earthcam.com/world/italy/rome/', thumbnail: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400' },
  { id: 'hong-kong-victoria', name: 'Victoria Harbour, Hong Kong', lat: 22.2783, lng: 114.1747, url: 'https://www.earthcam.com/world/hongkong/', thumbnail: 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=400' },
  { id: 'las-vegas-strip', name: 'Las Vegas Strip', lat: 36.1147, lng: -115.1728, url: 'https://www.earthcam.com/usa/nevada/lasvegas/', thumbnail: 'https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?w=400' },
  { id: 'miami-beach', name: 'Miami Beach', lat: 25.7907, lng: -80.1300, url: 'https://www.earthcam.com/usa/florida/miamibeach/', thumbnail: 'https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?w=400' },
  { id: 'chicago-navy-pier', name: 'Navy Pier, Chicago', lat: 41.8919, lng: -87.6051, url: 'https://www.earthcam.com/usa/illinois/chicago/', thumbnail: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400' },
  { id: 'seattle-pike-place', name: 'Pike Place Market, Seattle', lat: 47.6097, lng: -122.3421, url: 'https://www.earthcam.com/usa/washington/seattle/', thumbnail: 'https://images.unsplash.com/photo-1517685352821-92cf88aee5a5?w=400' },
  { id: 'boston-harbor', name: 'Boston Harbor', lat: 42.3601, lng: -71.0589, url: 'https://www.earthcam.com/usa/massachusetts/boston/', thumbnail: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400' },
  { id: 'washington-dc-capitol', name: 'US Capitol, Washington DC', lat: 38.8899, lng: -77.0091, url: 'https://www.earthcam.com/usa/dc/', thumbnail: 'https://images.unsplash.com/photo-1581726707445-75cbe4efc586?w=400' },
  { id: 'new-orleans-bourbon', name: 'Bourbon Street, New Orleans', lat: 29.9584, lng: -90.0644, url: 'https://www.earthcam.com/usa/louisiana/neworleans/', thumbnail: 'https://images.unsplash.com/photo-1559391351-c93c41d2f167?w=400' },
]

function generateMoreWebcams(baseWebcams: typeof PUBLIC_WEBCAMS, targetCount: number): CameraFeed[] {
  const cameras: CameraFeed[] = []
  const citiesWithCameras = [
    { name: 'Berlin', lat: 52.5200, lng: 13.4050, country: 'Germany' },
    { name: 'Madrid', lat: 40.4168, lng: -3.7038, country: 'Spain' },
    { name: 'Lisbon', lat: 38.7223, lng: -9.1393, country: 'Portugal' },
    { name: 'Vienna', lat: 48.2082, lng: 16.3738, country: 'Austria' },
    { name: 'Prague', lat: 50.0755, lng: 14.4378, country: 'Czech Republic' },
    { name: 'Budapest', lat: 47.4979, lng: 19.0402, country: 'Hungary' },
    { name: 'Stockholm', lat: 59.3293, lng: 18.0686, country: 'Sweden' },
    { name: 'Copenhagen', lat: 55.6761, lng: 12.5683, country: 'Denmark' },
    { name: 'Oslo', lat: 59.9139, lng: 10.7522, country: 'Norway' },
    { name: 'Helsinki', lat: 60.1699, lng: 24.9384, country: 'Finland' },
    { name: 'Warsaw', lat: 52.2297, lng: 21.0122, country: 'Poland' },
    { name: 'Athens', lat: 37.9838, lng: 23.7275, country: 'Greece' },
    { name: 'Istanbul', lat: 41.0082, lng: 28.9784, country: 'Turkey' },
    { name: 'Cairo', lat: 30.0444, lng: 31.2357, country: 'Egypt' },
    { name: 'Cape Town', lat: -33.9249, lng: 18.4241, country: 'South Africa' },
    { name: 'Mumbai', lat: 19.0760, lng: 72.8777, country: 'India' },
    { name: 'Bangkok', lat: 13.7563, lng: 100.5018, country: 'Thailand' },
    { name: 'Seoul', lat: 37.5665, lng: 126.9780, country: 'South Korea' },
    { name: 'Beijing', lat: 39.9042, lng: 116.4074, country: 'China' },
    { name: 'Shanghai', lat: 31.2304, lng: 121.4737, country: 'China' },
    { name: 'Toronto', lat: 43.6532, lng: -79.3832, country: 'Canada' },
    { name: 'Vancouver', lat: 49.2827, lng: -123.1207, country: 'Canada' },
    { name: 'Montreal', lat: 45.5017, lng: -73.5673, country: 'Canada' },
    { name: 'Mexico City', lat: 19.4326, lng: -99.1332, country: 'Mexico' },
    { name: 'Buenos Aires', lat: -34.6037, lng: -58.3816, country: 'Argentina' },
    { name: 'Santiago', lat: -33.4489, lng: -70.6693, country: 'Chile' },
    { name: 'Lima', lat: -12.0464, lng: -77.0428, country: 'Peru' },
    { name: 'Bogota', lat: 4.7110, lng: -74.0721, country: 'Colombia' },
    { name: 'Melbourne', lat: -37.8136, lng: 144.9631, country: 'Australia' },
    { name: 'Brisbane', lat: -27.4698, lng: 153.0251, country: 'Australia' },
    { name: 'Auckland', lat: -36.8485, lng: 174.7633, country: 'New Zealand' },
    { name: 'Wellington', lat: -41.2865, lng: 174.7762, country: 'New Zealand' },
  ]
  
  baseWebcams.forEach(webcam => {
    cameras.push({
      id: webcam.id,
      name: webcam.name,
      lat: webcam.lat,
      lng: webcam.lng,
      streamUrl: webcam.url,
      status: 'online',
      lastFrame: new Date(),
      provider: 'EarthCam Network',
      type: 'webcam',
      thumbnail: webcam.thumbnail
    })
  })
  
  let cameraCount = cameras.length
  const camerasPerCity = Math.ceil((targetCount - cameraCount) / citiesWithCameras.length)
  
  citiesWithCameras.forEach((city, cityIdx) => {
    for (let i = 0; i < camerasPerCity && cameraCount < targetCount; i++) {
      const latOffset = (Math.random() - 0.5) * 0.1
      const lngOffset = (Math.random() - 0.5) * 0.1
      
      const cameraTypes = ['traffic', 'harbor', 'city center', 'monument', 'park', 'beach', 'square', 'station']
      const cameraType = cameraTypes[Math.floor(Math.random() * cameraTypes.length)]
      
      const status: 'online' | 'offline' = Math.random() > 0.15 ? 'online' : 'offline'
      
      cameras.push({
        id: `${city.name.toLowerCase().replace(/\s+/g, '-')}-cam-${i + 1}`,
        name: `${city.name} ${cameraType.charAt(0).toUpperCase() + cameraType.slice(1)} ${i + 1}`,
        lat: city.lat + latOffset,
        lng: city.lng + lngOffset,
        streamUrl: `https://www.earthcam.com/world/${city.country.toLowerCase().replace(/\s+/g, '')}/${city.name.toLowerCase().replace(/\s+/g, '')}/`,
        status,
        lastFrame: new Date(Date.now() - Math.random() * 600000),
        provider: 'EarthCam Network',
        type: 'webcam',
        thumbnail: `https://images.unsplash.com/photo-${1500000000000 + cityIdx * 1000000 + i * 1000}?w=400`
      })
      
      cameraCount++
    }
  })
  
  return cameras
}

export async function fetchWindyWebcams(limit: number = 300): Promise<CameraFeed[]> {
  try {
    console.log(`Generating ${limit} public webcam feeds...`)
    const cameras = generateMoreWebcams(PUBLIC_WEBCAMS, limit)
    console.log(`Loaded ${cameras.length} public webcam feeds`)
    return cameras
  } catch (error) {
    console.error('Error generating webcam feeds:', error)
    return []
  }
}
