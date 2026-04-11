export interface SeismicPatternAnalysis {
  id: string
  sourceType: 'usgs_week'
  sourceName: string
  overallSentiment: 'positive' | 'neutral' | 'negative'
  sentimentScore: number
  emotionalTone: string[]
  keyThemes: string[]
  concernAreas: string[]
  confidenceLevel: number
  analysisText: string
  timestamp: Date
  region?: string
}

export interface SentimentAnalysis extends SeismicPatternAnalysis {}

export interface SentimentTrend {
  sourceName: string
  sourceType: string
  dataPoints: Array<{
    timestamp: Date
    score: number
    sentiment: string
  }>
}

export interface ScheduledAnalysisConfig {
  id: string
  analysisType: 'github' | 'global' | 'region'
  region?: string
  intervalMinutes: number
  enabled: boolean
  lastRun?: Date
  nextRun?: Date
}

export function calculateSentimentTrends(analyses: SeismicPatternAnalysis[]): SentimentTrend[] {
  const grouped = new Map<string, SeismicPatternAnalysis[]>()
  
  analyses.forEach(analysis => {
    const key = `${analysis.sourceType}-${analysis.sourceName}`
    if (!grouped.has(key)) {
      grouped.set(key, [])
    }
    grouped.get(key)!.push(analysis)
  })
  
  const trends: SentimentTrend[] = []
  
  grouped.forEach((items) => {
    const sorted = items.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
    
    trends.push({
      sourceName: sorted[0].sourceName,
      sourceType: sorted[0].sourceType,
      dataPoints: sorted.map(item => ({
        timestamp: item.timestamp,
        score: item.sentimentScore,
        sentiment: item.overallSentiment
      }))
    })
  })
  
  return trends
}

export async function analyzeGitHubSentiment(): Promise<SeismicPatternAnalysis> {
  return analyzeSeismicPatterns()
}

export async function analyzeRegionalSentiment(region: string, _contextData: string): Promise<SeismicPatternAnalysis> {
  return analyzeSeismicPatterns(region)
}

export async function analyzeGlobalSentiment(): Promise<SeismicPatternAnalysis> {
  return analyzeSeismicPatterns()
}

export async function analyzeSeismicPatterns(region?: string): Promise<SeismicPatternAnalysis> {
  let features: any[] = []
  let fetchError: string | null = null

  try {
    const resp = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson')
    if (!resp.ok) throw new Error(`USGS responded ${resp.status}`)
    const data = await resp.json()
    features = data.features ?? []
  } catch (err) {
    fetchError = err instanceof Error ? err.message : String(err)
  }

  let aggregatedStats: string

  if (fetchError) {
    aggregatedStats = `fetch_error: ${fetchError}`
  } else {
    const totalFelt = features.reduce((sum: number, f: any) => sum + (f.properties?.felt ?? 0), 0)
    const alertLevels = features.reduce((acc: Record<string, number>, f: any) => {
      const level = f.properties?.alert ?? 'none'
      acc[level] = (acc[level] || 0) + 1
      return acc
    }, {})
    const tsunamiCount = features.filter((f: any) => f.properties?.tsunami === 1).length
    const magBins: Record<string, number> = {}
    for (const f of features) {
      const mag: number = f.properties?.mag ?? 0
      const bin = `M${Math.floor(mag)}-${Math.floor(mag) + 1}`
      magBins[bin] = (magBins[bin] || 0) + 1
    }
    const topPlaces = features
      .filter((f: any) => f.properties?.mag >= 4.5)
      .map((f: any) => f.properties?.place ?? 'Unknown')
      .slice(0, 10)

    aggregatedStats = JSON.stringify({
      total_events: features.length,
      total_felt_reports: totalFelt,
      alert_level_distribution: alertLevels,
      tsunami_flagged_count: tsunamiCount,
      magnitude_histogram: magBins,
      notable_locations: topPlaces
    }, null, 2)
  }

  const promptText = `You are analyzing a week of global seismic activity. Data: ${aggregatedStats}. Identify: dominant activity regions, unusual patterns, escalating trends, and any correlations between magnitude and felt reports. Return structured analysis with confidence levels.

Return your analysis as a JSON object with this exact structure:
{
  "overallSentiment": "positive" | "neutral" | "negative",
  "sentimentScore": (number between -100 and 100, where -100 is extremely concerning, 0 is baseline, 100 is unusually calm),
  "emotionalTone": ["tone1", "tone2", "tone3"],
  "keyThemes": ["theme1", "theme2", "theme3"],
  "concernAreas": ["concern1", "concern2"],
  "confidenceLevel": (number between 0 and 100),
  "analysisText": "A detailed 2-3 sentence analysis of the seismic patterns and anomalies observed"
}`

  const response = await window.spark.llm(promptText, 'gpt-4o', true)
  const parsed = JSON.parse(response)

  return {
    id: `seismic-${Date.now()}`,
    sourceType: 'usgs_week',
    sourceName: region ? `USGS Week — ${region}` : 'USGS Week — Global',
    region,
    overallSentiment: parsed.overallSentiment,
    sentimentScore: parsed.sentimentScore,
    emotionalTone: parsed.emotionalTone,
    keyThemes: parsed.keyThemes,
    concernAreas: parsed.concernAreas,
    confidenceLevel: parsed.confidenceLevel,
    analysisText: parsed.analysisText,
    timestamp: new Date()
  }
}
