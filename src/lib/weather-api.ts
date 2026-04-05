import { WeatherData } from './types'

export async function generateWeatherData(lat: number, lng: number): Promise<WeatherData> {
  const humidity = 30 + Math.random() * 60
  const visibility = 5 + Math.random() * 10
  const conditions = [
    'Partly Cloudy',
    'Overcast',
    'Rain',
    'Fog'
  ]
  
  const temperature = 15 + Math.random() * 20
  const windSpeed = Math.random() * 30
  const windDirection = Math.random() * 360
  const pressure = 980 + Math.random() * 50
  
  return {
    id: `weather-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    lat,
    lng,
    temperature: parseFloat(temperature.toFixed(1)),
    humidity: parseFloat(humidity.toFixed(1)),
    windSpeed: parseFloat(windSpeed.toFixed(1)),
    windDirection: parseFloat(windDirection.toFixed(0)),
    conditions: conditions[Math.floor(Math.random() * conditions.length)],
    visibility: parseFloat(visibility.toFixed(1)),
    pressure: parseFloat(pressure.toFixed(1)),
    timestamp: new Date()
  }
}

export async function fetchGlobalWeatherGrid(gridSize: number): Promise<WeatherData[]> {
  const weatherPoints: WeatherData[] = []
  const latStep = 180 / gridSize
  const lngStep = 360 / gridSize
  
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const lat = -90 + (i * latStep) + (latStep / 2)
      const lng = -180 + (j * lngStep) + (lngStep / 2)
      
      const weatherData = await generateWeatherData(lat, lng)
      weatherPoints.push(weatherData)
    }
  }
  
  return weatherPoints
}
