import { threatAlertSystem } from './threat-alert-system'

export interface StreamingThreatAlert {
  id: string
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'
  category: 'cyber' | 'military' | 'social' | 'environmental' | 'economic'
  region: string
  title: string
  description: string
  aiConfidence: number
  detectionMethod: string
  recommendedAction: string
  dataSource: string
  timestamp: Date
}

export interface ThreatMonitoringSession {
  id: string
  startTime: Date
  isActive: boolean
  alertsGenerated: number
  regionsMonitored: string[]
  categoriesMonitored: string[]
}

export interface RealTimeMetrics {
  threatsDetected: number
  averageSeverity: number
  mostActiveRegion: string
  mostActiveCategory: string
  processingRate: number
  uptime: number
}

const USGS_SIGNIFICANT_HOUR_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_hour.geojson'

class StreamingThreatMonitor {
  private session: ThreatMonitoringSession | null = null
  private intervalId: number | null = null
  private callbacks: Array<(alert: StreamingThreatAlert) => void> = []
  private metricsCallbacks: Array<(metrics: RealTimeMetrics) => void> = []
  private alerts: StreamingThreatAlert[] = []
  private seenEventIds = new Set<string>()

  async startMonitoring(
    pollingInterval: number = 60000,
  ): Promise<string> {
    if (this.session?.isActive) {
      throw new Error('Monitoring session already active')
    }

    const sessionId = `session-${Date.now()}`
    this.session = {
      id: sessionId,
      startTime: new Date(),
      isActive: true,
      alertsGenerated: 0,
      regionsMonitored: ['Global'],
      categoriesMonitored: ['environmental']
    }

    this.intervalId = setInterval(async () => {
      await this.performScan()
    }, pollingInterval)

    await this.performScan()

    return sessionId
  }

  private async performScan(): Promise<void> {
    if (!this.session?.isActive) return

    let features: any[] = []
    try {
      const resp = await fetch(USGS_SIGNIFICANT_HOUR_URL)
      if (!resp.ok) throw new Error(`USGS responded ${resp.status}`)
      const data = await resp.json()
      features = data.features ?? []
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('fetch_error: USGS significant_hour:', msg)
      return
    }

    const newEvents = features.filter((f: any) => !this.seenEventIds.has(f.id))

    if (newEvents.length === 0) {
      return
    }

    for (const feature of newEvents) {
      this.seenEventIds.add(feature.id)
      const props = feature.properties ?? {}
      const eventData = {
        id: feature.id,
        place: props.place ?? 'Unknown location',
        mag: props.mag ?? 0,
        depth: feature.geometry?.coordinates?.[2] ?? 0,
        tsunami: props.tsunami ?? 0,
        time: props.time ?? Date.now()
      }

      try {
        const promptText = `Classify this seismic event. Fields: ${JSON.stringify(eventData)}. Return: threat_level (low/medium/high/critical), rationale (1 sentence), recommended_action (1 sentence). JSON only.`
        const response = await window.spark.llm(promptText, 'gpt-4o-mini', true)
        const parsed = JSON.parse(response)

        const severityMap: Record<string, StreamingThreatAlert['severity']> = {
          low: 'LOW',
          medium: 'MODERATE',
          high: 'HIGH',
          critical: 'CRITICAL'
        }
        const severity = severityMap[(parsed.threat_level ?? 'low').toLowerCase()] ?? 'LOW'

        const alert: StreamingThreatAlert = {
          id: `threat-${feature.id}`,
          severity,
          category: 'environmental',
          region: eventData.place,
          title: `M${eventData.mag.toFixed(1)} Earthquake — ${eventData.place}`,
          description: parsed.rationale ?? '',
          aiConfidence: 0.9,
          detectionMethod: 'USGS Significant Hour Feed + LLM Classification',
          recommendedAction: parsed.recommended_action ?? '',
          dataSource: 'USGS Earthquake Hazards Program',
          timestamp: new Date(eventData.time)
        }

        this.alerts.push(alert)
        this.session!.alertsGenerated++
        this.callbacks.forEach(callback => callback(alert))

        if (severity === 'CRITICAL' || severity === 'HIGH') {
          await threatAlertSystem.checkAndCreateAlert(
            'CRITICAL_THREAT',
            severity,
            alert.title,
            alert.description,
            alert.aiConfidence,
            [alert.detectionMethod],
            alert.recommendedAction,
            'ML_PREDICTION',
            [{ source: alert.dataSource, value: `environmental threat detected in ${alert.region}` }],
            { region: alert.region }
          )
        }

        const metrics = this.calculateMetrics()
        this.metricsCallbacks.forEach(callback => callback(metrics))
      } catch (err) {
        console.error('Error classifying seismic event:', feature.id, err)
      }
    }
  }

  private calculateMetrics(): RealTimeMetrics {
    if (!this.session || this.alerts.length === 0) {
      return {
        threatsDetected: 0,
        averageSeverity: 0,
        mostActiveRegion: 'N/A',
        mostActiveCategory: 'N/A',
        processingRate: 0,
        uptime: 0
      }
    }

    const severityValues = {
      'LOW': 1,
      'MODERATE': 2,
      'HIGH': 3,
      'CRITICAL': 4
    }

    const avgSeverity = this.alerts.reduce((sum, alert) => 
      sum + severityValues[alert.severity], 0
    ) / this.alerts.length

    const regionCounts = this.alerts.reduce((acc, alert) => {
      acc[alert.region] = (acc[alert.region] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const categoryCounts = this.alerts.reduce((acc, alert) => {
      acc[alert.category] = (acc[alert.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const mostActiveRegion = Object.entries(regionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
    const mostActiveCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'

    const uptime = this.session.startTime 
      ? (Date.now() - this.session.startTime.getTime()) / 1000
      : 0

    const processingRate = this.alerts.length / Math.max(uptime / 60, 1)

    return {
      threatsDetected: this.alerts.length,
      averageSeverity: avgSeverity,
      mostActiveRegion,
      mostActiveCategory,
      processingRate,
      uptime
    }
  }

  stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }

    if (this.session) {
      this.session.isActive = false
    }
  }

  onAlert(callback: (alert: StreamingThreatAlert) => void): () => void {
    this.callbacks.push(callback)
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback)
    }
  }

  onMetricsUpdate(callback: (metrics: RealTimeMetrics) => void): () => void {
    this.metricsCallbacks.push(callback)
    return () => {
      this.metricsCallbacks = this.metricsCallbacks.filter(cb => cb !== callback)
    }
  }

  getSession(): ThreatMonitoringSession | null {
    return this.session
  }

  getAlerts(): StreamingThreatAlert[] {
    return [...this.alerts]
  }

  getMetrics(): RealTimeMetrics {
    return this.calculateMetrics()
  }

  clearAlerts(): void {
    this.alerts = []
    this.seenEventIds.clear()
    if (this.session) {
      this.session.alertsGenerated = 0
    }
  }
}

export const streamingThreatMonitor = new StreamingThreatMonitor()
