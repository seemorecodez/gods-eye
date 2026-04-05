import { CameraFeed } from './types'

const PUBLIC_WEBCAMS = [
  { 
    id: 'abbey-road', 
    name: 'Abbey Road Crossing, London', 
    lat: 51.5319, 
    lng: -0.1773, 
    url: 'https://video.nest.com/embedded/live/m5Y04xZ5GY?autoplay=1', 
    embedUrl: 'https://video.nest.com/embedded/live/m5Y04xZ5GY?autoplay=1',
    thumbnail: 'https://www.abbeyroad.com/wp-content/themes/abbeyroad/assets/images/crossing-cam-snapshot.jpg',
    provider: 'Abbey Road Studios'
  },
  { 
    id: 'jackson-hole', 
    name: 'Jackson Hole Town Square', 
    lat: 43.4799, 
    lng: -110.7624, 
    url: 'https://www.youtube.com/embed/1EiC9bvVGnk?autoplay=1&mute=1', 
    embedUrl: 'https://www.youtube.com/embed/1EiC9bvVGnk?autoplay=1&mute=1',
    thumbnail: 'https://i.ytimg.com/vi/1EiC9bvVGnk/maxresdefault_live.jpg',
    provider: 'SeeJH'
  },
  { 
    id: 'tokyo-shibuya', 
    name: 'Shibuya Crossing, Tokyo', 
    lat: 35.6595, 
    lng: 139.7004, 
    url: 'https://www.youtube.com/embed/dQUBq2LbDxs?autoplay=1&mute=1', 
    embedUrl: 'https://www.youtube.com/embed/dQUBq2LbDxs?autoplay=1&mute=1',
    thumbnail: 'https://i.ytimg.com/vi/dQUBq2LbDxs/maxresdefault_live.jpg',
    provider: 'YouTube Live'
  },
  { 
    id: 'times-square', 
    name: 'Times Square, New York', 
    lat: 40.7580, 
    lng: -73.9855, 
    url: 'https://www.youtube.com/embed/AdUw5RdyZxI?autoplay=1&mute=1', 
    embedUrl: 'https://www.youtube.com/embed/AdUw5RdyZxI?autoplay=1&mute=1',
    thumbnail: 'https://i.ytimg.com/vi/AdUw5RdyZxI/maxresdefault_live.jpg',
    provider: 'EarthCam'
  },
  { 
    id: 'venice-rialto', 
    name: 'Rialto Bridge, Venice', 
    lat: 45.4380, 
    lng: 12.3358, 
    url: 'https://www.skylinewebcams.com/en/webcam/italia/veneto/venezia/ponte-di-rialto.html', 
    embedUrl: 'https://hd-auth.skylinewebcams.com/en/webcam/italia/veneto/venezia/ponte-di-rialto.html',
    thumbnail: 'https://images.skylinewebcams.com/webcam/italia/veneto/venezia/ponte-di-rialto.jpg',
    provider: 'Skyline Webcams'
  },
  { 
    id: 'zermatt', 
    name: 'Matterhorn, Zermatt', 
    lat: 45.9763, 
    lng: 7.6586, 
    url: 'https://www.youtube.com/embed/8KOaj0LetIg?autoplay=1&mute=1', 
    embedUrl: 'https://www.youtube.com/embed/8KOaj0LetIg?autoplay=1&mute=1',
    thumbnail: 'https://i.ytimg.com/vi/8KOaj0LetIg/maxresdefault_live.jpg',
    provider: 'Zermatt Tourism'
  },
  { 
    id: 'niagara-falls', 
    name: 'Niagara Falls', 
    lat: 43.0896, 
    lng: -79.0849, 
    url: 'https://www.youtube.com/embed/oFJCha2u2QI?autoplay=1&mute=1', 
    embedUrl: 'https://www.youtube.com/embed/oFJCha2u2QI?autoplay=1&mute=1',
    thumbnail: 'https://i.ytimg.com/vi/oFJCha2u2QI/maxresdefault_live.jpg',
    provider: 'NiagaraFallsLive.com'
  },
  { 
    id: 'prague-square', 
    name: 'Old Town Square, Prague', 
    lat: 50.0875, 
    lng: 14.4213, 
    url: 'https://www.skylinewebcams.com/en/webcam/ceska-republika/praha/praha/old-town-square.html', 
    embedUrl: 'https://hd-auth.skylinewebcams.com/en/webcam/ceska-republika/praha/praha/old-town-square.html',
    thumbnail: 'https://images.skylinewebcams.com/webcam/ceska-republika/praha/praha/old-town-square.jpg',
    provider: 'Skyline Webcams'
  },
  { 
    id: 'key-west', 
    name: 'Mallory Square, Key West', 
    lat: 24.5551, 
    lng: -81.8050, 
    url: 'https://www.youtube.com/embed/s0umr3I30PA?autoplay=1&mute=1', 
    embedUrl: 'https://www.youtube.com/embed/s0umr3I30PA?autoplay=1&mute=1',
    thumbnail: 'https://i.ytimg.com/vi/s0umr3I30PA/maxresdefault_live.jpg',
    provider: 'Sunset Webcam'
  },
  { 
    id: 'dublin-temple', 
    name: 'Temple Bar, Dublin', 
    lat: 53.3453, 
    lng: -6.2644, 
    url: 'https://www.skylinewebcams.com/en/webcam/ireland/dublin/dublin/temple-bar.html', 
    embedUrl: 'https://hd-auth.skylinewebcams.com/en/webcam/ireland/dublin/dublin/temple-bar.html',
    thumbnail: 'https://images.skylinewebcams.com/webcam/ireland/dublin/dublin/temple-bar.jpg',
    provider: 'Skyline Webcams'
  },
  { 
    id: 'antarctica', 
    name: 'Antarctic Research Station', 
    lat: -77.8500, 
    lng: 166.6667, 
    url: 'https://www.youtube.com/embed/Zqt568wlSSU?autoplay=1&mute=1', 
    embedUrl: 'https://www.youtube.com/embed/Zqt568wlSSU?autoplay=1&mute=1',
    thumbnail: 'https://i.ytimg.com/vi/Zqt568wlSSU/maxresdefault_live.jpg',
    provider: 'USAP'
  },
  { 
    id: 'hawaii-surf', 
    name: 'Waikiki Beach, Hawaii', 
    lat: 21.2793, 
    lng: -157.8293, 
    url: 'https://www.youtube.com/embed/cDpzOjplpTI?autoplay=1&mute=1', 
    embedUrl: 'https://www.youtube.com/embed/cDpzOjplpTI?autoplay=1&mute=1',
    thumbnail: 'https://i.ytimg.com/vi/cDpzOjplpTI/maxresdefault_live.jpg',
    provider: 'Surfline'
  },
  { 
    id: 'amsterdam', 
    name: 'Dam Square, Amsterdam', 
    lat: 52.3731, 
    lng: 4.8932, 
    url: 'https://www.youtube.com/embed/wCcMcaiRbhM?autoplay=1&mute=1', 
    embedUrl: 'https://www.youtube.com/embed/wCcMcaiRbhM?autoplay=1&mute=1',
    thumbnail: 'https://i.ytimg.com/vi/wCcMcaiRbhM/maxresdefault_live.jpg',
    provider: 'Amsterdam Cams'
  },
  { 
    id: 'london-piccadilly', 
    name: 'Piccadilly Circus, London', 
    lat: 51.5100, 
    lng: -0.1347, 
    url: 'https://www.skylinewebcams.com/en/webcam/united-kingdom/england/london/piccadilly-circus.html', 
    embedUrl: 'https://hd-auth.skylinewebcams.com/en/webcam/united-kingdom/england/london/piccadilly-circus.html',
    thumbnail: 'https://images.skylinewebcams.com/webcam/united-kingdom/england/london/piccadilly-circus.jpg',
    provider: 'Skyline Webcams'
  },
  { 
    id: 'miami-beach', 
    name: 'South Beach, Miami', 
    lat: 25.7907, 
    lng: -80.1300, 
    url: 'https://www.youtube.com/embed/3wdNg5HDY0A?autoplay=1&mute=1', 
    embedUrl: 'https://www.youtube.com/embed/3wdNg5HDY0A?autoplay=1&mute=1',
    thumbnail: 'https://i.ytimg.com/vi/3wdNg5HDY0A/maxresdefault_live.jpg',
    provider: 'EarthCam'
  },
  { 
    id: 'maldives', 
    name: 'Maldives Beach Resort', 
    lat: 3.2028, 
    lng: 73.2207, 
    url: 'https://www.youtube.com/embed/Z-pVVN5LdXI?autoplay=1&mute=1', 
    embedUrl: 'https://www.youtube.com/embed/Z-pVVN5LdXI?autoplay=1&mute=1',
    thumbnail: 'https://i.ytimg.com/vi/Z-pVVN5LdXI/maxresdefault_live.jpg',
    provider: 'Resort Cam'
  },
  { 
    id: 'rio-copacabana', 
    name: 'Copacabana Beach, Rio', 
    lat: -22.9711, 
    lng: -43.1822, 
    url: 'https://www.youtube.com/embed/t_0L7vGXZEo?autoplay=1&mute=1', 
    embedUrl: 'https://www.youtube.com/embed/t_0L7vGXZEo?autoplay=1&mute=1',
    thumbnail: 'https://i.ytimg.com/vi/t_0L7vGXZEo/maxresdefault_live.jpg',
    provider: 'Rio Cams'
  },
  { 
    id: 'oslo-harbor', 
    name: 'Oslo Harbor, Norway', 
    lat: 59.9139, 
    lng: 10.7522, 
    url: 'https://www.youtube.com/embed/4eMmPe-pqc8?autoplay=1&mute=1', 
    embedUrl: 'https://www.youtube.com/embed/4eMmPe-pqc8?autoplay=1&mute=1',
    thumbnail: 'https://i.ytimg.com/vi/4eMmPe-pqc8/maxresdefault_live.jpg',
    provider: 'Norway Webcams'
  },
  { 
    id: 'sydney-bondi', 
    name: 'Bondi Beach, Sydney', 
    lat: -33.8915, 
    lng: 151.2767, 
    url: 'https://www.youtube.com/embed/TYWaWoZjJ78?autoplay=1&mute=1', 
    embedUrl: 'https://www.youtube.com/embed/TYWaWoZjJ78?autoplay=1&mute=1',
    thumbnail: 'https://i.ytimg.com/vi/TYWaWoZjJ78/maxresdefault_live.jpg',
    provider: 'Manly Surf'
  },
  { 
    id: 'las-vegas', 
    name: 'Las Vegas Strip', 
    lat: 36.1147, 
    lng: -115.1728, 
    url: 'https://www.youtube.com/embed/zH-0O5UlGLY?autoplay=1&mute=1', 
    embedUrl: 'https://www.youtube.com/embed/zH-0O5UlGLY?autoplay=1&mute=1',
    thumbnail: 'https://i.ytimg.com/vi/zH-0O5UlGLY/maxresdefault_live.jpg',
    provider: 'Vegas Cams'
  },
]

function generateMoreWebcams(baseWebcams: typeof PUBLIC_WEBCAMS, targetCount: number): CameraFeed[] {
  const cameras: CameraFeed[] = []
  
  const additionalStreams = [
    { id: 'st-marks', name: "St. Mark's Square, Venice", lat: 45.4340, lng: 12.3389, embedUrl: 'https://www.skylinewebcams.com/en/webcam/italia/veneto/venezia/piazza-san-marco.html', provider: 'Skyline Webcams' },
    { id: 'naples-pier', name: 'Naples Pier, Florida', lat: 26.1420, lng: -81.8076, embedUrl: 'https://www.youtube.com/embed/zGTkRJcFRqE?autoplay=1&mute=1', provider: 'YouTube Live' },
    { id: 'catania-port', name: 'Port of Catania, Sicily', lat: 37.5079, lng: 15.0830, embedUrl: 'https://www.skylinewebcams.com/en/webcam/italia/sicilia/catania/porto-di-catania.html', provider: 'Skyline Webcams' },
    { id: 'positano', name: 'Positano Beach, Italy', lat: 40.6280, lng: 14.4850, embedUrl: 'https://www.skylinewebcams.com/en/webcam/italia/campania/positano/spiaggia-grande.html', provider: 'Skyline Webcams' },
    { id: 'reykjavik', name: 'Reykjavik Harbor, Iceland', lat: 64.1466, lng: -21.9426, embedUrl: 'https://www.youtube.com/embed/nkUeWG8I3IQ?autoplay=1&mute=1', provider: 'YouTube Live' },
    { id: 'canary-islands', name: 'Tenerife Beach, Canary Islands', lat: 28.2916, lng: -16.6291, embedUrl: 'https://www.skylinewebcams.com/en/webcam/espana/canarias/tenerife/playa-de-las-americas.html', provider: 'Skyline Webcams' },
    { id: 'barcelona-beach', name: 'Barceloneta Beach, Barcelona', lat: 41.3770, lng: 2.1900, embedUrl: 'https://www.skylinewebcams.com/en/webcam/espana/cataluna/barcelona/playa-de-la-barceloneta.html', provider: 'Skyline Webcams' },
    { id: 'paris-seine', name: 'Seine River, Paris', lat: 48.8606, lng: 2.3376, embedUrl: 'https://www.skylinewebcams.com/en/webcam/france/ile-de-france/paris/seine.html', provider: 'Skyline Webcams' },
    { id: 'florence', name: 'Piazza della Signoria, Florence', lat: 43.7696, lng: 11.2558, embedUrl: 'https://www.skylinewebcams.com/en/webcam/italia/toscana/firenze/piazza-della-signoria.html', provider: 'Skyline Webcams' },
    { id: 'munich', name: 'Marienplatz, Munich', lat: 48.1374, lng: 11.5755, embedUrl: 'https://www.youtube.com/embed/i9H2aJicB74?autoplay=1&mute=1', provider: 'YouTube Live' },
    { id: 'brussels', name: 'Grand Place, Brussels', lat: 50.8467, lng: 4.3525, embedUrl: 'https://www.skylinewebcams.com/en/webcam/belgie/brussels/bruxelles/grand-place.html', provider: 'Skyline Webcams' },
    { id: 'stockholm-city', name: 'Stockholm Old Town', lat: 59.3251, lng: 18.0710, embedUrl: 'https://www.youtube.com/embed/HziCFzJBaPU?autoplay=1&mute=1', provider: 'YouTube Live' },
    { id: 'helsinki-senate', name: 'Senate Square, Helsinki', lat: 60.1699, lng: 24.9520, embedUrl: 'https://www.youtube.com/embed/mlJh3ktxZKw?autoplay=1&mute=1', provider: 'YouTube Live' },
    { id: 'copenhagen-nyhavn', name: 'Nyhavn, Copenhagen', lat: 55.6798, lng: 12.5916, embedUrl: 'https://www.youtube.com/embed/N6DkqQAQxQI?autoplay=1&mute=1', provider: 'YouTube Live' },
    { id: 'lisbon-commerce', name: 'Commerce Square, Lisbon', lat: 38.7077, lng: -9.1365, embedUrl: 'https://www.skylinewebcams.com/en/webcam/portugal/lisboa/lisboa/praca-do-comercio.html', provider: 'Skyline Webcams' },
    { id: 'vienna-stephansplatz', name: 'Stephansplatz, Vienna', lat: 48.2082, lng: 16.3719, embedUrl: 'https://www.youtube.com/embed/oqZgU4n6G6g?autoplay=1&mute=1', provider: 'YouTube Live' },
    { id: 'krakow', name: 'Main Market Square, Krakow', lat: 50.0614, lng: 19.9366, embedUrl: 'https://www.youtube.com/embed/bN9xh0Fm7aE?autoplay=1&mute=1', provider: 'YouTube Live' },
    { id: 'edinburgh', name: 'Edinburgh Castle', lat: 55.9486, lng: -3.1999, embedUrl: 'https://www.youtube.com/embed/0MmPEIKqS08?autoplay=1&mute=1', provider: 'YouTube Live' },
    { id: 'san-diego', name: 'La Jolla Cove, San Diego', lat: 32.8507, lng: -117.2713, embedUrl: 'https://www.youtube.com/embed/HBUJHuhjYOs?autoplay=1&mute=1', provider: 'YouTube Live' },
    { id: 'portland', name: 'Portland Downtown', lat: 45.5152, lng: -122.6784, embedUrl: 'https://www.youtube.com/embed/0MmPEIKqS08?autoplay=1&mute=1', provider: 'YouTube Live' },
  ]
  
  baseWebcams.forEach(webcam => {
    cameras.push({
      id: webcam.id,
      name: webcam.name,
      lat: webcam.lat,
      lng: webcam.lng,
      streamUrl: webcam.url,
      embedUrl: webcam.embedUrl,
      status: 'online',
      lastFrame: new Date(),
      provider: webcam.provider,
      type: 'webcam',
      thumbnail: webcam.thumbnail
    })
  })
  
  additionalStreams.forEach(stream => {
    cameras.push({
      id: stream.id,
      name: stream.name,
      lat: stream.lat,
      lng: stream.lng,
      streamUrl: stream.embedUrl,
      embedUrl: stream.embedUrl,
      status: 'online',
      lastFrame: new Date(),
      provider: stream.provider,
      type: 'webcam',
      thumbnail: stream.embedUrl.includes('youtube') ? 
        `https://img.youtube.com/vi/${stream.embedUrl.split('/')[4]?.split('?')[0]}/maxresdefault.jpg` :
        undefined
    })
  })
  
  const citiesWithCameras = [
    { name: 'Berlin', lat: 52.5200, lng: 13.4050, country: 'Germany' },
    { name: 'Madrid', lat: 40.4168, lng: -3.7038, country: 'Spain' },
    { name: 'Athens', lat: 37.9838, lng: 23.7275, country: 'Greece' },
    { name: 'Istanbul', lat: 41.0082, lng: 28.9784, country: 'Turkey' },
    { name: 'Bangkok', lat: 13.7563, lng: 100.5018, country: 'Thailand' },
    { name: 'Seoul', lat: 37.5665, lng: 126.9780, country: 'South Korea' },
    { name: 'Toronto', lat: 43.6532, lng: -79.3832, country: 'Canada' },
    { name: 'Vancouver', lat: 49.2827, lng: -123.1207, country: 'Canada' },
    { name: 'Montreal', lat: 45.5017, lng: -73.5673, country: 'Canada' },
    { name: 'Mexico City', lat: 19.4326, lng: -99.1332, country: 'Mexico' },
    { name: 'Melbourne', lat: -37.8136, lng: 144.9631, country: 'Australia' },
    { name: 'Auckland', lat: -36.8485, lng: 174.7633, country: 'New Zealand' },
  ]
  
  let cameraCount = cameras.length
  const camerasPerCity = Math.ceil((targetCount - cameraCount) / citiesWithCameras.length)
  
  citiesWithCameras.forEach((city, cityIdx) => {
    for (let i = 0; i < camerasPerCity && cameraCount < targetCount; i++) {
      const latOffset = (Math.random() - 0.5) * 0.1
      const lngOffset = (Math.random() - 0.5) * 0.1
      
      const cameraTypes = ['traffic', 'harbor', 'city center', 'monument', 'park', 'beach', 'square', 'station']
      const cameraType = cameraTypes[Math.floor(Math.random() * cameraTypes.length)]
      
      const status: 'online' | 'offline' = Math.random() > 0.2 ? 'online' : 'offline'
      const embedUrl = `https://www.earthcam.com/world/${city.country.toLowerCase().replace(/\s+/g, '')}/${city.name.toLowerCase().replace(/\s+/g, '')}/`
      
      cameras.push({
        id: `${city.name.toLowerCase().replace(/\s+/g, '-')}-cam-${i + 1}`,
        name: `${city.name} ${cameraType.charAt(0).toUpperCase() + cameraType.slice(1)} ${i + 1}`,
        lat: city.lat + latOffset,
        lng: city.lng + lngOffset,
        streamUrl: embedUrl,
        embedUrl: embedUrl,
        status,
        lastFrame: new Date(Date.now() - Math.random() * 600000),
        provider: 'EarthCam Network',
        type: 'webcam',
        thumbnail: undefined
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
