import { useState, useEffect } from 'react'
import { healthMonitor, HealthAlert } from '@/lib/health-monitor'
import { DataSource } from '@/lib/types'

export function useHealthMonitor(dataSources: DataSource[]) {
  const [alerts, setAlerts] = useState<HealthAlert[]>([])
  const [healthStatuses, setHealthStatuses] = useState<Map<string, 'active' | 'warning' | 'critical'>>(new Map())

  useEffect(() => {
    const unsubscribe = healthMonitor.onAlertsChanged(setAlerts)

    dataSources.forEach(ds => {
      healthMonitor.startMonitoring(ds, 30000)
    })

    const statusInterval = setInterval(() => {
      const newStatuses = new Map<string, 'active' | 'warning' | 'critical'>()
      dataSources.forEach(ds => {
        newStatuses.set(ds.id, healthMonitor.getHealthStatus(ds.id))
      })
      setHealthStatuses(newStatuses)
    }, 5000)

    return () => {
      unsubscribe()
      dataSources.forEach(ds => healthMonitor.stopMonitoring(ds.id))
      clearInterval(statusInterval)
    }
  }, [dataSources])

  const acknowledgeAlert = (alertId: string) => {
    healthMonitor.acknowledgeAlert(alertId)
  }

  const acknowledgeAllAlerts = () => {
    healthMonitor.acknowledgeAllAlerts()
  }

  const getMetrics = (dataSourceId: string) => {
    return healthMonitor.getMetrics(dataSourceId)
  }

  const getReconnectionStatus = (dataSourceId: string) => {
    return healthMonitor.getReconnectionStatus(dataSourceId)
  }

  return {
    alerts,
    healthStatuses,
    acknowledgeAlert,
    acknowledgeAllAlerts,
    getMetrics,
    getReconnectionStatus
  }
}
