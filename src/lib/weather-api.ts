import { WeatherData } from './types'

export async function fetchWeatherData(lat: number, lng: number): Promise<WeatherData> {
  const id = `weather-${lat.toFixed(2)}-${lng.toFixed(2)}`
  
  const temp = 15 + Math.random() * 20
  const humidity = 30 + Math.random() * 60
  const windSpeed = Math.random() * 25
  const windDirection = Math.random() * 360
  const pressure = 980 + Math.random() * 40
  const visibility = 5 + Math.random() * 10
  
  const conditions = [
    'Clear',
    'Partly Cloudy',
    'Cloudy',
    'Overcast',
    'Light Rain',
    'Rain',
    'Mist',
    'Fog'
  ]
  
  return {
    id,
    lat,
    lng,
    temperature: parseFloat(temp.toFixed(1)),
    humidity: parseFloat(humidity.toFixed(1)),
    windSpeed: parseFloat(windSpeed.toFixed(1)),
    windDirection: parseFloat(windDirection.toFixed(0)),
    conditions: conditions[Math.floor(Math.random() * conditions.length)],
    visibility: parseFloat(visibility.toFixed(1)),
    pressure: parseFloat(pressure.toFixed(1)),
    timestamp: new Date()
  }
}

export async function fetchGlobalWeatherGrid(resolution: number = 20): Promise<WeatherData[]> {
  const weatherPoints: WeatherData[] = []
  
  for (let lat = -80; lat <= 80; lat += resolution) {
    for (let lng = -180; lng <= 180; lng += resolution) {
      weatherPoints.push(await fetchWeatherData(lat, lng))
    }
  }
  
  return weatherPoints
}
