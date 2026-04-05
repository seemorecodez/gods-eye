import { DataSource } from './types'

export interface HealthCheck {
  id: string
  timestamp: Date
  status: 'success' | 'failure'
  responseTime: number
  error?: string
}

export interface ReconnectionAttempt {
  attempt: number
  timestamp: Date
  nextRetry: Date
  backoffMs: number
}

export interface HealthAlert {
  id: string
  dataSourceId: string
  dataSourceName: string
  alertType: 'offline' | 'degraded' | 'slow_sync' | 'reconnected'
  message: string
  timestamp: Date
  acknowledged: boolean
}

const SYNC_THRESHOLD_MS = 5 * 60 * 1000
const MAX_RETRY_ATTEMPTS = 10
const INITIAL_BACKOFF_MS = 1000
const MAX_BACKOFF_MS = 5 * 60 * 1000

class HealthMonitor {
  private healthChecks: Map<string, HealthCheck[]> = new Map()
  private reconnectionAttempts: Map<string, ReconnectionAttempt> = new Map()
  private alerts: HealthAlert[] = []
  private monitoringIntervals: Map<string, number> = new Map()
  private listeners: Set<(alerts: HealthAlert[]) => void> = new Set()

  async checkDataSourceHealth(dataSource: DataSource): Promise<HealthCheck> {
    const startTime = Date.now()
    const checkId = `${dataSource.id}-${Date.now()}`

    try {
      const isHealthy = await this.performHealthCheck(dataSource)
      const responseTime = Date.now() - startTime

      const check: HealthCheck = {
        id: checkId,
        timestamp: new Date(),
        status: isHealthy ? 'success' : 'failure',
        responseTime,
        error: isHealthy ? undefined : 'Health check failed'
      }

      this.recordHealthCheck(dataSource.id, check)

      if (!isHealthy) {
        await this.handleFailedCheck(dataSource, check)
      } else {
        this.handleSuccessfulCheck(dataSource)
      }

      return check
    } catch (error) {
      const check: HealthCheck = {
        id: checkId,
        timestamp: new Date(),
        status: 'failure',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      }

      this.recordHealthCheck(dataSource.id, check)
      await this.handleFailedCheck(dataSource, check)

      return check
    }
  }

  private async performHealthCheck(dataSource: DataSource): Promise<boolean> {
    const repoUrl = `https://api.github.com/repos/${dataSource.repository}`
    
    try {
      const response = await fetch(repoUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        }
      })

      if (!response.ok) {
        return false
      }

      const data = await response.json()
      return data.id !== undefined
    } catch (error) {
      console.error(`Health check failed for ${dataSource.name}:`, error)
      return false
    }
  }

  private recordHealthCheck(dataSourceId: string, check: HealthCheck) {
    if (!this.healthChecks.has(dataSourceId)) {
      this.healthChecks.set(dataSourceId, [])
    }

    const checks = this.healthChecks.get(dataSourceId)!
    checks.push(check)

    if (checks.length > 100) {
      checks.shift()
    }
  }

  private async handleFailedCheck(dataSource: DataSource, check: HealthCheck) {
    const existingAttempt = this.reconnectionAttempts.get(dataSource.id)

    if (existingAttempt) {
      const newAttempt = existingAttempt.attempt + 1
      const backoffMs = Math.min(
        INITIAL_BACKOFF_MS * Math.pow(2, newAttempt - 1),
        MAX_BACKOFF_MS
      )

      const reconnection: ReconnectionAttempt = {
        attempt: newAttempt,
        timestamp: new Date(),
        nextRetry: new Date(Date.now() + backoffMs),
        backoffMs
      }

      this.reconnectionAttempts.set(dataSource.id, reconnection)

      if (newAttempt <= MAX_RETRY_ATTEMPTS) {
        setTimeout(() => {
          this.checkDataSourceHealth(dataSource)
        }, backoffMs)
      } else {
        this.createAlert({
          id: `alert-${dataSource.id}-${Date.now()}`,
          dataSourceId: dataSource.id,
          dataSourceName: dataSource.name,
          alertType: 'offline',
          message: `${dataSource.name} is offline after ${MAX_RETRY_ATTEMPTS} reconnection attempts`,
          timestamp: new Date(),
          acknowledged: false
        })
      }
    } else {
      const reconnection: ReconnectionAttempt = {
        attempt: 1,
        timestamp: new Date(),
        nextRetry: new Date(Date.now() + INITIAL_BACKOFF_MS),
        backoffMs: INITIAL_BACKOFF_MS
      }

      this.reconnectionAttempts.set(dataSource.id, reconnection)

      this.createAlert({
        id: `alert-${dataSource.id}-${Date.now()}`,
        dataSourceId: dataSource.id,
        dataSourceName: dataSource.name,
        alertType: 'offline',
        message: `${dataSource.name} is offline. Attempting reconnection...`,
        timestamp: new Date(),
        acknowledged: false
      })

      setTimeout(() => {
        this.checkDataSourceHealth(dataSource)
      }, INITIAL_BACKOFF_MS)
    }
  }

  private handleSuccessfulCheck(dataSource: DataSource) {
    const wasReconnecting = this.reconnectionAttempts.has(dataSource.id)

    if (wasReconnecting) {
      this.reconnectionAttempts.delete(dataSource.id)

      this.createAlert({
        id: `alert-${dataSource.id}-${Date.now()}`,
        dataSourceId: dataSource.id,
        dataSourceName: dataSource.name,
        alertType: 'reconnected',
        message: `${dataSource.name} has been reconnected successfully`,
        timestamp: new Date(),
        acknowledged: false
      })
    }
  }

  checkSyncThreshold(dataSource: DataSource, lastSyncTimestamp: Date): boolean {
    const timeSinceSync = Date.now() - lastSyncTimestamp.getTime()

    if (timeSinceSync > SYNC_THRESHOLD_MS) {
      this.createAlert({
        id: `alert-${dataSource.id}-${Date.now()}`,
        dataSourceId: dataSource.id,
        dataSourceName: dataSource.name,
        alertType: 'slow_sync',
        message: `${dataSource.name} has not synced for ${Math.floor(timeSinceSync / 60000)} minutes`,
        timestamp: new Date(),
        acknowledged: false
      })
      return false
    }

    return true
  }

  getRecentHealthChecks(dataSourceId: string, limit: number = 10): HealthCheck[] {
    const checks = this.healthChecks.get(dataSourceId) || []
    return checks.slice(-limit)
  }

  getHealthStatus(dataSourceId: string): 'active' | 'warning' | 'critical' {
    const recentChecks = this.getRecentHealthChecks(dataSourceId, 5)

    if (recentChecks.length === 0) {
      return 'warning'
    }

    const failureCount = recentChecks.filter(c => c.status === 'failure').length
    const failureRate = failureCount / recentChecks.length

    if (failureRate >= 0.8) {
      return 'critical'
    } else if (failureRate >= 0.4) {
      return 'warning'
    } else {
      return 'active'
    }
  }

  getReconnectionStatus(dataSourceId: string): ReconnectionAttempt | undefined {
    return this.reconnectionAttempts.get(dataSourceId)
  }

  private createAlert(alert: HealthAlert) {
    this.alerts.push(alert)

    if (this.alerts.length > 100) {
      this.alerts.shift()
    }

    this.notifyListeners()
  }

  getAlerts(includeAcknowledged: boolean = false): HealthAlert[] {
    if (includeAcknowledged) {
      return [...this.alerts]
    }
    return this.alerts.filter(a => !a.acknowledged)
  }

  acknowledgeAlert(alertId: string) {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert) {
      alert.acknowledged = true
      this.notifyListeners()
    }
  }

  acknowledgeAllAlerts() {
    this.alerts.forEach(a => a.acknowledged = true)
    this.notifyListeners()
  }

  clearAcknowledgedAlerts() {
    this.alerts = this.alerts.filter(a => !a.acknowledged)
    this.notifyListeners()
  }

  startMonitoring(dataSource: DataSource, intervalMs: number = 30000) {
    if (this.monitoringIntervals.has(dataSource.id)) {
      return
    }

    this.checkDataSourceHealth(dataSource)

    const interval = setInterval(() => {
      this.checkDataSourceHealth(dataSource)
    }, intervalMs)

    this.monitoringIntervals.set(dataSource.id, interval)
  }

  stopMonitoring(dataSourceId: string) {
    const interval = this.monitoringIntervals.get(dataSourceId)
    if (interval) {
      clearInterval(interval)
      this.monitoringIntervals.delete(dataSourceId)
    }
  }

  stopAllMonitoring() {
    this.monitoringIntervals.forEach(interval => clearInterval(interval))
    this.monitoringIntervals.clear()
  }

  onAlertsChanged(callback: (alerts: HealthAlert[]) => void) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  private notifyListeners() {
    const alerts = this.getAlerts(false)
    this.listeners.forEach(listener => listener(alerts))
  }

  getMetrics(dataSourceId: string) {
    const checks = this.healthChecks.get(dataSourceId) || []
    const recentChecks = checks.slice(-50)

    if (recentChecks.length === 0) {
      return {
        avgResponseTime: 0,
        successRate: 0,
        totalChecks: 0,
        uptime: 0
      }
    }

    const successCount = recentChecks.filter(c => c.status === 'success').length
    const avgResponseTime = recentChecks.reduce((sum, c) => sum + c.responseTime, 0) / recentChecks.length

    return {
      avgResponseTime: Math.round(avgResponseTime),
      successRate: (successCount / recentChecks.length) * 100,
      totalChecks: checks.length,
      uptime: (successCount / recentChecks.length) * 100
    }
  }
}

export const healthMonitor = new HealthMonitor()
