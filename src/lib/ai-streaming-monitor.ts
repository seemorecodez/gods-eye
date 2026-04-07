import { fetchAllRepositories } from './github-api'
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

class StreamingThreatMonitor {
  private session: ThreatMonitoringSession | null = null
  private intervalId: number | null = null
  private callbacks: Array<(alert: StreamingThreatAlert) => void> = []
  private metricsCallbacks: Array<(metrics: RealTimeMetrics) => void> = []
  private alerts: StreamingThreatAlert[] = []
  private regions = [
    'Middle East',
    'Eastern Europe',
    'North Africa',
    'Central Asia',
    'East Asia',
    'South Asia',
    'Sub-Saharan Africa',
    'Latin America',
    'Southeast Asia'
  ]
  private categories: StreamingThreatAlert['category'][] = [
    'cyber',
    'military',
    'social',
    'environmental',
    'economic'
  ]

  async startMonitoring(
    pollingInterval: number = 15000,
    regionsToMonitor?: string[],
    categoriesToMonitor?: StreamingThreatAlert['category'][]
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
      regionsMonitored: regionsToMonitor || this.regions,
      categoriesMonitored: categoriesToMonitor || this.categories
    }

    this.intervalId = setInterval(async () => {
      await this.performScan()
    }, pollingInterval)

    await this.performScan()

    return sessionId
  }

  private async performScan(): Promise<void> {
    if (!this.session?.isActive) return

    try {
      const repositories = await fetchAllRepositories()
      const repoContext = repositories.slice(0, 5).map(r => 
        `${r.name} (${r.category}): ${r.description}`
      ).join('\n')

      const region = this.session.regionsMonitored[
        Math.floor(Math.random() * this.session.regionsMonitored.length)
      ]
      const categoryIndex = Math.floor(Math.random() * this.session.categoriesMonitored.length)
      const category = this.session.categoriesMonitored[categoryIndex] as StreamingThreatAlert['category']

      const alert = await this.analyzeThreats(region, category, repoContext)
      
      if (alert) {
        this.alerts.push(alert)
        this.session.alertsGenerated++
        
        this.callbacks.forEach(callback => callback(alert))

        if (alert.severity === 'CRITICAL' || alert.severity === 'HIGH') {
          await threatAlertSystem.checkAndCreateAlert(
            'CRITICAL_THREAT',
            alert.severity,
            alert.title,
            alert.description,
            alert.aiConfidence,
            [alert.detectionMethod],
            alert.recommendedAction,
            'ML_PREDICTION',
            [{ source: alert.dataSource, value: `${alert.category} threat detected in ${alert.region}` }],
            { region: alert.region }
          )
        }

        const metrics = this.calculateMetrics()
        this.metricsCallbacks.forEach(callback => callback(metrics))
      }
    } catch (error) {
      console.error('Error during threat scan:', error)
    }
  }

  private async analyzeThreats(
    region: string,
    category: StreamingThreatAlert['category'],
    repoContext: string
  ): Promise<StreamingThreatAlert | null> {
    const promptText = `You are an AI threat monitoring system performing real-time geospatial intelligence analysis.

Region: ${region}
Category: ${category}
Available Intelligence Sources:
${repoContext}

Perform a threat assessment scan for this region and category. Determine if there's a detectable threat worth alerting.

Return your analysis as a JSON object with this exact structure:
{
  "hasThreat": (boolean - true if a threat is detected, false otherwise),
  "severity": "LOW" | "MODERATE" | "HIGH" | "CRITICAL",
  "title": "Brief threat title (if hasT hreat is true)",
  "description": "Detailed threat description 2-3 sentences (if hasThreat is true)",
  "aiConfidence": (number 0-1 representing AI confidence in this assessment),
  "detectionMethod": "Method used to detect this threat",
  "recommendedAction": "Specific recommended action",
  "dataSource": "Primary data source used"
}

Be realistic - not every scan should detect a threat. Only report significant threats.`

    try {
      const response = await window.spark.llm(promptText, 'gpt-4o-mini', true)
      const parsed = JSON.parse(response)

      if (!parsed.hasThreat) {
        return null
      }

      return {
        id: `threat-${Date.now()}`,
        severity: parsed.severity,
        category,
        region,
        title: parsed.title,
        description: parsed.description,
        aiConfidence: parsed.aiConfidence,
        detectionMethod: parsed.detectionMethod,
        recommendedAction: parsed.recommendedAction,
        dataSource: parsed.dataSource,
        timestamp: new Date()
      }
    } catch (error) {
      console.error('Error analyzing threats:', error)
      return null
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
    if (this.session) {
      this.session.alertsGenerated = 0
    }
  }
}

export const streamingThreatMonitor = new StreamingThreatMonitor()
