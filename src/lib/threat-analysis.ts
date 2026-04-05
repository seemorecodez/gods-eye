import { ThreatPrediction, MapEvent } from './types'

export async function analyzeThreatLevel(
  lat: number,
  lng: number,
  historicalEvents: MapEvent[]
): Promise<ThreatPrediction> {
  const nearbyEvents = historicalEvents.filter(event => {
    const distance = Math.sqrt(
      Math.pow(event.lat - lat, 2) + Math.pow(event.lng - lng, 2)
    )
    return distance < 10
  })

  const recentEvents = nearbyEvents.filter(
    event => new Date().getTime() - event.timestamp.getTime() < 30 * 24 * 60 * 60 * 1000
  )

  const severityScore = nearbyEvents.reduce((sum, event) => {
    const scores = { low: 1, medium: 2, high: 3, critical: 4 }
    return sum + (scores[event.severity] || 0)
  }, 0)

  const avgSeverity = nearbyEvents.length > 0 ? severityScore / nearbyEvents.length : 0

  let threatLevel: ThreatPrediction['threatLevel'] = 'low'
  if (avgSeverity > 3) threatLevel = 'critical'
  else if (avgSeverity > 2) threatLevel = 'high'
  else if (avgSeverity > 1) threatLevel = 'moderate'

  const confidence = Math.min(0.5 + (nearbyEvents.length * 0.05), 0.95)

  const factors: string[] = []
  if (recentEvents.length > 5) factors.push('High recent activity')
  if (nearbyEvents.some(e => e.severity === 'critical')) factors.push('Critical events in vicinity')
  if (nearbyEvents.some(e => e.type === 'conflict')) factors.push('Conflict zone proximity')
  if (nearbyEvents.length > 10) factors.push('Historical pattern of incidents')

  const historicalData = generateHistoricalData(nearbyEvents)

  const predictions: Record<ThreatPrediction['threatLevel'], string> = {
    low: 'Region shows minimal threat indicators. Continue routine monitoring.',
    moderate: 'Elevated activity detected. Increased surveillance recommended.',
    high: 'Significant threat patterns identified. Enhanced security protocols advised.',
    critical: 'Critical threat level. Immediate response and evacuation protocols may be required.'
  }

  return {
    id: `threat-${lat.toFixed(2)}-${lng.toFixed(2)}`,
    lat,
    lng,
    threatLevel,
    confidence,
    factors,
    historicalData,
    prediction: predictions[threatLevel],
    timestamp: new Date()
  }
}

function generateHistoricalData(events: MapEvent[]) {
  const dataPoints: { date: Date; eventCount: number; severity: number }[] = []
  const now = new Date()

  for (let i = 90; i >= 0; i -= 7) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const weekStart = new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000)

    const weekEvents = events.filter(
      e => e.timestamp >= weekStart && e.timestamp <= date
    )

    const severityScores = { low: 1, medium: 2, high: 3, critical: 4 }
    const avgSeverity = weekEvents.length > 0
      ? weekEvents.reduce((sum, e) => sum + (severityScores[e.severity] || 0), 0) / weekEvents.length
      : 0

    dataPoints.push({
      date,
      eventCount: weekEvents.length,
      severity: parseFloat(avgSeverity.toFixed(2))
    })
  }

  return dataPoints
}

export async function generateThreatPredictions(
  events: MapEvent[],
  gridResolution: number = 30
): Promise<ThreatPrediction[]> {
  const predictions: ThreatPrediction[] = []

  for (let lat = -60; lat <= 60; lat += gridResolution) {
    for (let lng = -180; lng <= 180; lng += gridResolution) {
      const prediction = await analyzeThreatLevel(lat, lng, events)
      if (prediction.threatLevel !== 'low' || prediction.confidence > 0.6) {
        predictions.push(prediction)
      }
    }
  }

  return predictions
}
