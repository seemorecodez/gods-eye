import { useEffect, useRef, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'

export interface RefreshConfig {
  enabled: boolean
  interval: number
  lastRefresh?: number
}

export interface RefreshSettings {
  repositories: RefreshConfig
  dataSourceStatus: RefreshConfig
  commitActivity: RefreshConfig
  mlPredictions: RefreshConfig
  cameraFeeds: RefreshConfig
  weatherData: RefreshConfig
  threatAlerts: RefreshConfig
  emergentPatterns: RefreshConfig
  apiMetrics: RefreshConfig
}

export const DEFAULT_REFRESH_SETTINGS: RefreshSettings = {
  repositories: { enabled: true, interval: 300000 },
  dataSourceStatus: { enabled: true, interval: 30000 },
  commitActivity: { enabled: true, interval: 60000 },
  mlPredictions: { enabled: true, interval: 120000 },
  cameraFeeds: { enabled: true, interval: 90000 },
  weatherData: { enabled: true, interval: 180000 },
  threatAlerts: { enabled: true, interval: 60000 },
  emergentPatterns: { enabled: true, interval: 240000 },
  apiMetrics: { enabled: true, interval: 15000 }
}

export function useAutoRefresh(
  key: keyof RefreshSettings,
  callback: () => void | Promise<void>,
  dependencies: unknown[] = []
) {
  const [settings] = useKV<RefreshSettings>('refresh-settings', DEFAULT_REFRESH_SETTINGS)
  const intervalRef = useRef<number | null>(null)
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const config = settings?.[key] || DEFAULT_REFRESH_SETTINGS[key]

  useEffect(() => {
    if (!config.enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    const executeCallback = async () => {
      try {
        await callbackRef.current()
      } catch (error) {
        console.error(`Auto-refresh error for ${key}:`, error)
      }
    }

    executeCallback()

    intervalRef.current = setInterval(executeCallback, config.interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [config.enabled, config.interval, key, ...dependencies])

  const manualRefresh = useCallback(async () => {
    try {
      await callbackRef.current()
    } catch (error) {
      console.error(`Manual refresh error for ${key}:`, error)
    }
  }, [key])

  return {
    isEnabled: config.enabled,
    interval: config.interval,
    lastRefresh: config.lastRefresh,
    manualRefresh
  }
}

export function useRefreshSettings() {
  const [settings, setSettings] = useKV<RefreshSettings>('refresh-settings', DEFAULT_REFRESH_SETTINGS)

  const updateRefreshConfig = useCallback((key: keyof RefreshSettings, config: Partial<RefreshConfig>) => {
    setSettings((current) => {
      const base = current || DEFAULT_REFRESH_SETTINGS
      const existing = base[key]
      return {
        ...base,
        [key]: {
          enabled: config.enabled !== undefined ? config.enabled : existing.enabled,
          interval: config.interval !== undefined ? config.interval : existing.interval,
          lastRefresh: Date.now()
        }
      }
    })
  }, [setSettings])

  const toggleRefresh = useCallback((key: keyof RefreshSettings, enabled: boolean) => {
    updateRefreshConfig(key, { enabled })
  }, [updateRefreshConfig])

  const setRefreshInterval = useCallback((key: keyof RefreshSettings, interval: number) => {
    updateRefreshConfig(key, { interval })
  }, [updateRefreshConfig])

  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULT_REFRESH_SETTINGS)
  }, [setSettings])

  const pauseAll = useCallback(() => {
    setSettings((current) => {
      if (!current) return DEFAULT_REFRESH_SETTINGS
      const updated = { ...current }
      Object.keys(updated).forEach(key => {
        const k = key as keyof RefreshSettings
        updated[k] = {
          ...updated[k],
          enabled: false
        }
      })
      return updated
    })
  }, [setSettings])

  const resumeAll = useCallback(() => {
    setSettings((current) => {
      if (!current) return DEFAULT_REFRESH_SETTINGS
      const updated = { ...current }
      Object.keys(updated).forEach(key => {
        const k = key as keyof RefreshSettings
        updated[k] = {
          ...updated[k],
          enabled: true
        }
      })
      return updated
    })
  }, [setSettings])

  return {
    settings,
    updateRefreshConfig,
    toggleRefresh,
    setRefreshInterval,
    resetToDefaults,
    pauseAll,
    resumeAll
  }
}
