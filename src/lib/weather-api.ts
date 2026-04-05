import { WeatherData } from './types'

export async function generateWeatherData(lat: number, lng: number): Promise<WeatherData> {
  const humidity = 30 + Math.random() * 60
  const visibility = 5 + Math.random() * 10
  const conditions = [
    'Partly Cloudy',
    'Overcast',
  ]
  const t
  c
  
    id: `weather-${Date.now()}-${Math.random(
    lng,
    humidity: parseFloat(humidity.toFixed(1
    windDirection: parseFloat(windDirection
  
    timest
}
export a
  const 
  
    for (let j = 0; j < gridSize; j++) {
      const lng = -180 + (j * lngStep) + (lngSte
      const weatherData = await generateWeatherData(lat,
    }
  
}



