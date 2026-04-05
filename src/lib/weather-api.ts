import { WeatherData } from './types'

const WEATHER_CODE_MAP: Record<number, string> = {
  0: 'Clear Sky',
  1: 'Mainly Clear',
  2: 'Partly Cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing Rime Fog',
  51: 'Light Drizzle',
  53: 'Moderate Drizzle',
  55: 'Dense Drizzle',
  61: 'Slight Rain',
  63: 'Moderate Rain',
  65: 'Heavy Rain',
  71: 'Slight Snow',
  73: 'Moderate Snow',
  75: 'Heavy Snow',
  77: 'Snow Grains',
  80: 'Slight Rain Showers',
  81: 'Moderate Rain Showers',
  82: 'Violent Rain Showers',
  85: 'Slight Snow Showers',
  86: 'Heavy Snow Showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with Hail',
  99: 'Thunderstorm with Heavy Hail'
}

export async function fetchLiveWeatherData(lat: number, lng: number): Promise<WeatherData> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(2)}&longitude=${lng.toFixed(2)}&current=temperature_2m,relative_humidity_2m,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,visibility`
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`)
    }
    
    const data = await response.json()
    const current = data.current
    
    const weatherCode = current.weather_code || 0
    const conditions = WEATHER_CODE_MAP[weatherCode] || 'Unknown'
    
    return {
      id: `weather-${lat.toFixed(2)}-${lng.toFixed(2)}`,
      lat,
      lng,
      temperature: parseFloat((current.temperature_2m || 15).toFixed(1)),
      humidity: parseFloat((current.relative_humidity_2m || 50).toFixed(1)),
      windSpeed: parseFloat((current.wind_speed_10m || 0).toFixed(1)),
      windDirection: parseFloat((current.wind_direction_10m || 0).toFixed(0)),
      conditions,
      visibility: parseFloat(((current.visibility || 10000) / 1000).toFixed(1)),
      pressure: parseFloat((current.surface_pressure || 1013).toFixed(1)),
      timestamp: new Date(),
    }
  } catch (error) {
    console.warn(`Failed to fetch weather for ${lat}, ${lng}:`, error)
    
    return {
      id: `weather-${lat.toFixed(2)}-${lng.toFixed(2)}`,
      lat,
      lng,
      temperature: 15 + Math.random() * 20,
      humidity: 50,
      windSpeed: 10,
      windDirection: 0,
      conditions: 'Data Unavailable',
      visibility: 10,
      pressure: 1013,
      timestamp: new Date(),
    }
  }
}

export async function generateWeatherGrid(gridSize: number = 10): Promise<WeatherData[]> {
  const weatherGrid: WeatherData[] = []
  const latStep = 180 / gridSize
  const lngStep = 360 / gridSize
  
  const promises: Promise<WeatherData>[] = []

  for (let i = 0; i < gridSize; i++) {
    const lat = -90 + (i * latStep) + (latStep / 2)
    for (let j = 0; j < gridSize; j++) {
      const lng = -180 + (j * lngStep) + (lngStep / 2)
      promises.push(fetchLiveWeatherData(lat, lng))
    }
  }

  const results = await Promise.allSettled(promises)
  
  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      weatherGrid.push(result.value)
    }
  })

  return weatherGrid
}
