export interface Flight {
  id: string
  icao24: string
  callsign: string
  origin: {
    code: string
    name: string
    lat: number
    lng: number
    country: string
  } | null
  destination: {
    code: string
    name: string
    lat: number
    lng: number
    country: string
  } | null
  currentPosition: {
    lat: number
    lng: number
    altitude: number
    heading: number
    speed: number
    verticalRate: number
    onGround: boolean
  }
  aircraft: {
    type: string
    registration: string
    airline: string
  }
  status: 'scheduled' | 'departed' | 'en-route' | 'landing' | 'arrived'
  isMilitary: boolean
  squawk: string | null
  lastUpdate: number
  departureTime: Date | null
  arrivalTime: Date | null
  progress: number
}

export interface Airport {
  code: string
  name: string
  lat: number
  lng: number
  country: string
  city: string
  departures: number
  arrivals: number
}

interface OpenSkyState {
  icao24: string
  callsign: string | null
  origin_country: string
  time_position: number | null
  last_contact: number
  longitude: number | null
  latitude: number | null
  baro_altitude: number | null
  on_ground: boolean
  velocity: number | null
  true_track: number | null
  vertical_rate: number | null
  sensors: number[] | null
  geo_altitude: number | null
  squawk: string | null
  spi: boolean
  position_source: number
}

interface OpenSkyResponse {
  time: number
  states: OpenSkyState[] | null
}

const MAJOR_AIRPORTS: Airport[] = [
  { code: 'JFK', name: 'John F. Kennedy International', lat: 40.6413, lng: -73.7781, country: 'USA', city: 'New York', departures: 0, arrivals: 0 },
  { code: 'LAX', name: 'Los Angeles International', lat: 33.9416, lng: -118.4085, country: 'USA', city: 'Los Angeles', departures: 0, arrivals: 0 },
  { code: 'LHR', name: 'London Heathrow', lat: 51.4700, lng: -0.4543, country: 'UK', city: 'London', departures: 0, arrivals: 0 },
  { code: 'CDG', name: 'Charles de Gaulle', lat: 49.0097, lng: 2.5479, country: 'France', city: 'Paris', departures: 0, arrivals: 0 },
  { code: 'DXB', name: 'Dubai International', lat: 25.2532, lng: 55.3657, country: 'UAE', city: 'Dubai', departures: 0, arrivals: 0 },
  { code: 'HND', name: 'Tokyo Haneda', lat: 35.5494, lng: 139.7798, country: 'Japan', city: 'Tokyo', departures: 0, arrivals: 0 },
  { code: 'SIN', name: 'Singapore Changi', lat: 1.3644, lng: 103.9915, country: 'Singapore', city: 'Singapore', departures: 0, arrivals: 0 },
  { code: 'HKG', name: 'Hong Kong International', lat: 22.3080, lng: 113.9185, country: 'Hong Kong', city: 'Hong Kong', departures: 0, arrivals: 0 },
  { code: 'SYD', name: 'Sydney Kingsford Smith', lat: -33.9399, lng: 151.1753, country: 'Australia', city: 'Sydney', departures: 0, arrivals: 0 },
  { code: 'FRA', name: 'Frankfurt Airport', lat: 50.0379, lng: 8.5622, country: 'Germany', city: 'Frankfurt', departures: 0, arrivals: 0 },
  { code: 'AMS', name: 'Amsterdam Schiphol', lat: 52.3105, lng: 4.7683, country: 'Netherlands', city: 'Amsterdam', departures: 0, arrivals: 0 },
  { code: 'ICN', name: 'Incheon International', lat: 37.4602, lng: 126.4407, country: 'South Korea', city: 'Seoul', departures: 0, arrivals: 0 },
  { code: 'ORD', name: "O'Hare International", lat: 41.9742, lng: -87.9073, country: 'USA', city: 'Chicago', departures: 0, arrivals: 0 },
  { code: 'ATL', name: 'Hartsfield-Jackson Atlanta', lat: 33.6407, lng: -84.4277, country: 'USA', city: 'Atlanta', departures: 0, arrivals: 0 },
  { code: 'PEK', name: 'Beijing Capital International', lat: 40.0801, lng: 116.5846, country: 'China', city: 'Beijing', departures: 0, arrivals: 0 },
  { code: 'PVG', name: 'Shanghai Pudong International', lat: 31.1443, lng: 121.8083, country: 'China', city: 'Shanghai', departures: 0, arrivals: 0 },
  { code: 'GRU', name: 'São Paulo-Guarulhos', lat: -23.4356, lng: -46.4731, country: 'Brazil', city: 'São Paulo', departures: 0, arrivals: 0 },
  { code: 'MEX', name: 'Mexico City International', lat: 19.4363, lng: -99.0721, country: 'Mexico', city: 'Mexico City', departures: 0, arrivals: 0 },
  { code: 'IST', name: 'Istanbul Airport', lat: 41.2753, lng: 28.7519, country: 'Turkey', city: 'Istanbul', departures: 0, arrivals: 0 },
  { code: 'DOH', name: 'Hamad International', lat: 25.2731, lng: 51.6080, country: 'Qatar', city: 'Doha', departures: 0, arrivals: 0 },
  { code: 'YYZ', name: 'Toronto Pearson International', lat: 43.6777, lng: -79.6248, country: 'Canada', city: 'Toronto', departures: 0, arrivals: 0 },
  { code: 'DEN', name: 'Denver International', lat: 39.8561, lng: -104.6737, country: 'USA', city: 'Denver', departures: 0, arrivals: 0 },
  { code: 'SFO', name: 'San Francisco International', lat: 37.6213, lng: -122.3790, country: 'USA', city: 'San Francisco', departures: 0, arrivals: 0 },
  { code: 'MIA', name: 'Miami International', lat: 25.7959, lng: -80.2870, country: 'USA', city: 'Miami', departures: 0, arrivals: 0 },
  { code: 'MAD', name: 'Adolfo Suárez Madrid-Barajas', lat: 40.4936, lng: -3.5668, country: 'Spain', city: 'Madrid', departures: 0, arrivals: 0 },
  { code: 'FCO', name: 'Leonardo da Vinci-Fiumicino', lat: 41.8003, lng: 12.2389, country: 'Italy', city: 'Rome', departures: 0, arrivals: 0 },
  { code: 'BKK', name: 'Suvarnabhumi Airport', lat: 13.6900, lng: 100.7501, country: 'Thailand', city: 'Bangkok', departures: 0, arrivals: 0 },
  { code: 'KUL', name: 'Kuala Lumpur International', lat: 2.7456, lng: 101.7099, country: 'Malaysia', city: 'Kuala Lumpur', departures: 0, arrivals: 0 },
  { code: 'JNB', name: 'O.R. Tambo International', lat: -26.1367, lng: 28.2411, country: 'South Africa', city: 'Johannesburg', departures: 0, arrivals: 0 },
  { code: 'CAI', name: 'Cairo International', lat: 30.1219, lng: 31.4056, country: 'Egypt', city: 'Cairo', departures: 0, arrivals: 0 }
]

const MILITARY_SQUAWKS = ['7500', '7600', '7700']
const MILITARY_ICAO_PREFIXES = ['AE', 'AF', 'RCH', 'CNV', 'EVAL', 'EVAC']

function isMilitaryFlight(callsign: string | null, squawk: string | null, icao24: string): boolean {
  if (!callsign) return false
  
  const cleanCallsign = callsign.trim().toUpperCase()
  
  if (MILITARY_ICAO_PREFIXES.some(prefix => cleanCallsign.startsWith(prefix))) {
    return true
  }
  
  if (squawk && MILITARY_SQUAWKS.includes(squawk)) {
    return true
  }
  
  if (icao24.startsWith('ae') || icao24.startsWith('af')) {
    return true
  }
  
  return false
}

function findNearestAirport(lat: number, lng: number): Airport | null {
  let nearest: Airport | null = null
  let minDistance = Infinity
  
  for (const airport of MAJOR_AIRPORTS) {
    const distance = Math.sqrt(
      Math.pow(airport.lat - lat, 2) + Math.pow(airport.lng - lng, 2)
    )
    if (distance < minDistance) {
      minDistance = distance
      nearest = airport
    }
  }
  
  return minDistance < 0.5 ? nearest : null
}

function determineStatus(onGround: boolean, altitude: number | null): Flight['status'] {
  if (onGround) return 'arrived'
  if (!altitude) return 'en-route'
  if (altitude < 5000) return 'landing'
  if (altitude < 10000) return 'departed'
  return 'en-route'
}

export async function fetchRealFlights(limit: number = 500): Promise<Flight[]> {
  try {
    const response = await fetch('https://opensky-network.org/api/states/all')
    
    if (!response.ok) {
      console.warn('OpenSky API rate limit or error, using fallback')
      return generateFlights(limit)
    }
    
    const data: OpenSkyResponse = await response.json()
    
    if (!data.states || data.states.length === 0) {
      console.warn('No flight data available, using fallback')
      return generateFlights(limit)
    }
    
    const flights: Flight[] = []
    
    for (const state of data.states.slice(0, limit)) {
      if (!state.latitude || !state.longitude) continue
      
      const callsign = state.callsign?.trim() || `UNKNOWN_${state.icao24.toUpperCase()}`
      const isMilitary = isMilitaryFlight(state.callsign, state.squawk, state.icao24)
      const altitude = state.baro_altitude || state.geo_altitude || 0
      const status = determineStatus(state.on_ground, altitude)
      
      const nearestAirport = findNearestAirport(state.latitude, state.longitude)
      
      flights.push({
        id: state.icao24.toUpperCase(),
        icao24: state.icao24,
        callsign,
        origin: nearestAirport,
        destination: null,
        currentPosition: {
          lat: state.latitude,
          lng: state.longitude,
          altitude: altitude,
          heading: state.true_track || 0,
          speed: state.velocity || 0,
          verticalRate: state.vertical_rate || 0,
          onGround: state.on_ground
        },
        aircraft: {
          type: isMilitary ? 'Military Aircraft' : 'Commercial Aircraft',
          registration: state.icao24.toUpperCase(),
          airline: state.origin_country
        },
        status,
        isMilitary,
        squawk: state.squawk,
        lastUpdate: state.last_contact,
        departureTime: null,
        arrivalTime: null,
        progress: 0.5
      })
    }
    
    return flights
  } catch (error) {
    console.error('Error fetching real flight data:', error)
    return generateFlights(limit)
  }
}

export function generateFlights(count: number = 500): Flight[] {
  const flights: Flight[] = []
  const now = Date.now()
  
  const AIRCRAFT_TYPES = [
    'Boeing 737', 'Boeing 777', 'Boeing 787',
    'Airbus A320', 'Airbus A330', 'Airbus A350', 'Airbus A380'
  ]
  
  const AIRLINES = [
    'Delta Airlines', 'American Airlines', 'United Airlines',
    'British Airways', 'Emirates', 'Lufthansa', 'Air France'
  ]
  
  for (let i = 0; i < count; i++) {
    const origin = MAJOR_AIRPORTS[Math.floor(Math.random() * MAJOR_AIRPORTS.length)]
    let destination = MAJOR_AIRPORTS[Math.floor(Math.random() * MAJOR_AIRPORTS.length)]
    
    while (destination.code === origin.code) {
      destination = MAJOR_AIRPORTS[Math.floor(Math.random() * MAJOR_AIRPORTS.length)]
    }
    
    const flightDuration = 2 + Math.random() * 14
    const departureOffset = -2 + Math.random() * 4
    const departureTime = new Date(now + departureOffset * 60 * 60 * 1000)
    const arrivalTime = new Date(departureTime.getTime() + flightDuration * 60 * 60 * 1000)
    
    const totalTime = arrivalTime.getTime() - departureTime.getTime()
    const elapsed = Math.max(0, now - departureTime.getTime())
    const progress = Math.min(1, Math.max(0, elapsed / totalTime))
    
    let status: Flight['status']
    if (progress === 0) status = 'scheduled'
    else if (progress < 0.05) status = 'departed'
    else if (progress < 0.95) status = 'en-route'
    else if (progress < 1) status = 'landing'
    else status = 'arrived'
    
    const currentPos = interpolatePosition(origin, destination, progress)
    const heading = calculateHeading(origin, destination)
    const altitude = progress < 0.1 || progress > 0.9 
      ? 5000 + Math.random() * 10000 
      : 30000 + Math.random() * 12000
    const speed = 450 + Math.random() * 150
    
    const aircraft = AIRCRAFT_TYPES[Math.floor(Math.random() * AIRCRAFT_TYPES.length)]
    const airline = AIRLINES[Math.floor(Math.random() * AIRLINES.length)]
    const isMilitary = Math.random() < 0.05
    
    flights.push({
      id: `FL${1000 + i}`,
      icao24: `abc${i.toString(16).padStart(3, '0')}`,
      callsign: `${airline.substring(0, 2).toUpperCase()}${100 + Math.floor(Math.random() * 900)}`,
      origin: { ...origin },
      destination: { ...destination },
      currentPosition: {
        lat: currentPos.lat,
        lng: currentPos.lng,
        altitude,
        heading,
        speed,
        verticalRate: 0,
        onGround: false
      },
      aircraft: {
        type: aircraft,
        registration: `N${10000 + Math.floor(Math.random() * 90000)}`,
        airline
      },
      status,
      isMilitary,
      squawk: null,
      lastUpdate: now / 1000,
      departureTime,
      arrivalTime,
      progress
    })
  }
  
  return flights
}

function interpolatePosition(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  progress: number
): { lat: number; lng: number } {
  const lat = origin.lat + (destination.lat - origin.lat) * progress
  const lng = origin.lng + (destination.lng - origin.lng) * progress
  return { lat, lng }
}

function calculateHeading(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): number {
  const dLng = to.lng - from.lng
  const y = Math.sin(dLng) * Math.cos(to.lat)
  const x = Math.cos(from.lat) * Math.sin(to.lat) - 
            Math.sin(from.lat) * Math.cos(to.lat) * Math.cos(dLng)
  const heading = Math.atan2(y, x) * 180 / Math.PI
  return (heading + 360) % 360
}

export function updateFlights(flights: Flight[]): Flight[] {
  const now = Date.now()
  
  return flights.map(flight => {
    if (flight.status === 'arrived') return flight
    if (!flight.departureTime || !flight.arrivalTime || !flight.origin || !flight.destination) return flight
    
    const totalTime = flight.arrivalTime.getTime() - flight.departureTime.getTime()
    const elapsed = Math.max(0, now - flight.departureTime.getTime())
    const progress = Math.min(1, Math.max(0, elapsed / totalTime))
    
    let status: Flight['status']
    if (progress === 0) status = 'scheduled'
    else if (progress < 0.05) status = 'departed'
    else if (progress < 0.95) status = 'en-route'
    else if (progress < 1) status = 'landing'
    else status = 'arrived'
    
    const currentPos = interpolatePosition(flight.origin, flight.destination, progress)
    const altitude = progress < 0.1 || progress > 0.9 
      ? 5000 + Math.random() * 10000 
      : 30000 + Math.random() * 12000
    
    return {
      ...flight,
      currentPosition: {
        ...flight.currentPosition,
        lat: currentPos.lat,
        lng: currentPos.lng,
        altitude
      },
      progress,
      status
    }
  }).filter(f => f.status !== 'arrived')
}

export function getAirports(): Airport[] {
  return MAJOR_AIRPORTS.map(airport => ({ ...airport }))
}

export function getFlightsByAirport(flights: Flight[], airportCode: string): Flight[] {
  return flights.filter(f => 
    f.origin?.code === airportCode || f.destination?.code === airportCode
  )
}

export function getActiveFlightsCount(flights: Flight[]): number {
  return flights.filter(f => f.status === 'en-route' || f.status === 'departed').length
}

export function getMilitaryFlights(flights: Flight[]): Flight[] {
  return flights.filter(f => f.isMilitary)
}

export function getCivilianFlights(flights: Flight[]): Flight[] {
  return flights.filter(f => !f.isMilitary)
}
