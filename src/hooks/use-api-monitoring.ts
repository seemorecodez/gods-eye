import { useKV } from '@github/spark/hooks'
import { useEffect } from 'react'

export interface APIMetrics {
  githubRateLimit: {
    remaining: number
    limit: number
    reset: number
    lastChecked: number
  }
  llmUsage: {
    totalTokens: number
    totalCalls: number
    callHistory: Array<{
      timestamp: number
      model: string
      tokensEstimate: number
    }>
  }
}

const INITIAL_METRICS: APIMetrics = {
  githubRateLimit: {
    remaining: 60,
    limit: 60,
    reset: Date.now() + 3600000,
    lastChecked: 0
  },
  llmUsage: {
    totalTokens: 0,
    totalCalls: 0,
    callHistory: []
  }
}

export function useAPIMonitoring() {
  const [metrics, setMetrics] = useKV<APIMetrics>('api-metrics', INITIAL_METRICS)

  const checkGitHubRateLimit = async () => {
    try {
      const response = await fetch('https://api.github.com/rate_limit')
      if (response.ok) {
        const data = await response.json()
        setMetrics((current) => {
          if (!current) return INITIAL_METRICS
          return {
            ...current,
            githubRateLimit: {
              remaining: data.rate.remaining,
              limit: data.rate.limit,
              reset: data.rate.reset * 1000,
              lastChecked: Date.now()
            }
          }
        })
      }
    } catch (error) {
      console.error('Failed to check GitHub rate limit:', error)
    }
  }

  const trackLLMCall = (model: string, promptLength: number, responseLength: number) => {
    const tokensEstimate = Math.ceil((promptLength + responseLength) / 4)
    
    setMetrics((current) => {
      if (!current) return INITIAL_METRICS
      return {
        ...current,
        llmUsage: {
          totalTokens: current.llmUsage.totalTokens + tokensEstimate,
          totalCalls: current.llmUsage.totalCalls + 1,
          callHistory: [
            ...current.llmUsage.callHistory.slice(-99),
            {
              timestamp: Date.now(),
              model,
              tokensEstimate
            }
          ]
        }
      }
    })
  }

  useEffect(() => {
    checkGitHubRateLimit()
    
    const interval = setInterval(() => {
      checkGitHubRateLimit()
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  return {
    metrics,
    checkGitHubRateLimit,
    trackLLMCall
  }
}
