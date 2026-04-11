export interface DataDimension {
  id: string
  name: string
  category: 'environmental' | 'economic' | 'social' | 'military' | 'cyber' | 'imagery'
  currentValue: number
  unit: string
  trend: 'up' | 'down' | 'stable'
}

export interface CorrelationLink {
  source: string
  target: string
  strength: number
  type: 'positive' | 'negative' | 'causal'
  confidence: number
  description: string
}

export interface PatternCluster {
  id: string
  name: string
  dimensions: string[]
  centralTheme: string
  significance: number
  emergentInsights: string[]
}

export interface CorrelationNetwork {
  id: string
  dimensions: DataDimension[]
  correlations: CorrelationLink[]
  clusters: PatternCluster[]
  overallComplexity: number
  keyFindings: string[]
  timestamp: Date
}

const DATA_DIMENSIONS: Omit<DataDimension, 'currentValue' | 'trend'>[] = [
  { id: 'seismic-event-count', name: 'Seismic Event Count', category: 'environmental', unit: 'events/week' },
  { id: 'seismic-mean-magnitude', name: 'Seismic Mean Magnitude', category: 'environmental', unit: 'magnitude' },
  { id: 'tsunami-threat-index', name: 'Tsunami Threat Index', category: 'environmental', unit: '% events with tsunami flag' },
  { id: 'temperature-anomaly', name: 'Temperature Anomaly Score', category: 'environmental', unit: '°C σ' },
  { id: 'flight-density', name: 'Global Flight Density', category: 'economic', unit: 'flights tracked' },
]

async function fetchRealDimensionValues(): Promise<Map<string, { value: number; trend: 'up' | 'down' | 'stable' }>> {
  const results = new Map<string, { value: number; trend: 'up' | 'down' | 'stable' }>()

  // Fetch earthquake data from USGS
  try {
    const eqResp = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson')
    if (!eqResp.ok) throw new Error(`USGS responded ${eqResp.status}`)
    const eqData = await eqResp.json()
    const features: any[] = eqData.features || []
    const count = features.length
    const mags = features.map((f: any) => f.properties?.mag ?? 0).filter((m: number) => m > 0)
    const meanMag = mags.length > 0 ? mags.reduce((a: number, b: number) => a + b, 0) / mags.length : 0
    const tsunamiRate = features.length > 0
      ? (features.filter((f: any) => f.properties?.tsunami === 1).length / features.length) * 100
      : 0
    results.set('seismic-event-count', { value: count, trend: count > 500 ? 'up' : count < 200 ? 'down' : 'stable' })
    results.set('seismic-mean-magnitude', { value: parseFloat(meanMag.toFixed(2)), trend: meanMag > 3.5 ? 'up' : meanMag < 2.5 ? 'down' : 'stable' })
    results.set('tsunami-threat-index', { value: parseFloat(tsunamiRate.toFixed(3)), trend: tsunamiRate > 1 ? 'up' : 'stable' })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    results.set('seismic-event-count', { value: -1, trend: 'stable' })
    results.set('seismic-mean-magnitude', { value: -1, trend: 'stable' })
    results.set('tsunami-threat-index', { value: -1, trend: 'stable' })
    console.error('fetch_error: USGS week feed:', msg)
  }

  // Fetch weather anomaly from Open-Meteo (equatorial sample point)
  try {
    const wxResp = await fetch('https://api.open-meteo.com/v1/forecast?latitude=0&longitude=0&hourly=temperature_2m&forecast_days=1')
    if (!wxResp.ok) throw new Error(`Open-Meteo responded ${wxResp.status}`)
    const wxData = await wxResp.json()
    const temps: number[] = wxData.hourly?.temperature_2m ?? []
    if (temps.length === 0) throw new Error('No temperature data returned')
    const mean = temps.reduce((a, b) => a + b, 0) / temps.length
    const variance = temps.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / temps.length
    const stddev = parseFloat(Math.sqrt(variance).toFixed(2))
    results.set('temperature-anomaly', { value: stddev, trend: stddev > 4 ? 'up' : stddev < 1.5 ? 'down' : 'stable' })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    results.set('temperature-anomaly', { value: -1, trend: 'stable' })
    console.error('fetch_error: Open-Meteo:', msg)
  }

  // Flight density from OpenSky (best-effort, no auth required for rough counts)
  try {
    const flightResp = await fetch('https://opensky-network.org/api/states/all?lamin=-10&lomin=-10&lamax=10&lomax=10')
    if (!flightResp.ok) throw new Error(`OpenSky responded ${flightResp.status}`)
    const flightData = await flightResp.json()
    const flightCount: number = (flightData.states ?? []).length
    results.set('flight-density', { value: flightCount, trend: 'stable' })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    results.set('flight-density', { value: -1, trend: 'stable' })
    console.error('fetch_error: OpenSky flight density:', msg)
  }

  return results
}

export async function generateCorrelationNetwork(selectedDimensions?: string[]): Promise<CorrelationNetwork> {
  const realValues = await fetchRealDimensionValues()

  const dimensionPool = selectedDimensions
    ? DATA_DIMENSIONS.filter(d => selectedDimensions.includes(d.id))
    : DATA_DIMENSIONS

  const dimensions: DataDimension[] = dimensionPool.map(d => {
    const real = realValues.get(d.id)
    const value = real?.value ?? -1
    const trend = real?.trend ?? 'stable'
    return { ...d, currentValue: value, trend }
  })

  const dimensionCount = dimensions.length

  const dimensionsList = dimensions.map(d =>
    d.currentValue === -1
      ? `- ${d.name} (${d.category}): unavailable`
      : `- ${d.name} (${d.category}): ${d.currentValue} ${d.unit}`
  ).join('\n')

  const promptText = `You are an AI correlation analyst detecting patterns across multiple intelligence dimensions. Analyze the relationships between these data dimensions:

${dimensionsList}

Identify:
1. Strong correlations between dimensions (positive, negative, or causal)
2. Pattern clusters where multiple dimensions interact
3. Emergent insights that aren't obvious from individual dimensions

Return your analysis as a JSON object with this exact structure:
{
  "correlations": [
    {
      "source": "dimension-id",
      "target": "dimension-id",
      "strength": (number 0-1, where 1 is perfect correlation),
      "type": "positive" | "negative" | "causal",
      "confidence": (number 0-1),
      "description": "Brief explanation of this correlation"
    }
  ],
  "clusters": [
    {
      "name": "Cluster name",
      "dimensions": ["dim-id-1", "dim-id-2", "dim-id-3"],
      "centralTheme": "What this cluster represents",
      "significance": (number 0-1),
      "emergentInsights": ["insight1", "insight2"]
    }
  ],
  "keyFindings": ["finding1", "finding2", "finding3"]
}

Generate at least ${Math.floor(dimensionCount * 0.4)} correlations and 1-2 clusters.`

  const response = await window.spark.llm(promptText, 'gpt-4o', true)
  const parsed = JSON.parse(response)

  const clustersWithIds: PatternCluster[] = parsed.clusters.map((cluster: any, idx: number) => ({
    id: `cluster-${Date.now()}-${idx}`,
    name: cluster.name,
    dimensions: cluster.dimensions,
    centralTheme: cluster.centralTheme,
    significance: cluster.significance,
    emergentInsights: cluster.emergentInsights
  }))

  return {
    id: `correlation-${Date.now()}`,
    dimensions,
    correlations: parsed.correlations,
    clusters: clustersWithIds,
    overallComplexity: calculateComplexity(parsed.correlations, clustersWithIds),
    keyFindings: parsed.keyFindings,
    timestamp: new Date()
  }
}

function calculateComplexity(correlations: CorrelationLink[], clusters: PatternCluster[]): number {
  const correlationComplexity = correlations.length * 0.1
  const clusterComplexity = clusters.reduce((sum, c) => sum + c.significance, 0) / clusters.length
  return Math.min((correlationComplexity + clusterComplexity) / 2, 1)
}

export async function analyzeSpecificCorrelation(
  dimension1: string,
  dimension2: string
): Promise<{ analysis: string; strength: number; type: 'positive' | 'negative' | 'causal' }> {
  const dim1 = DATA_DIMENSIONS.find(d => d.id === dimension1)
  const dim2 = DATA_DIMENSIONS.find(d => d.id === dimension2)

  if (!dim1 || !dim2) {
    throw new Error('Invalid dimension IDs')
  }

  const promptText = `You are an AI correlation analyst. Analyze the relationship between these two intelligence dimensions:

Dimension 1: ${dim1.name} (${dim1.category})
Dimension 2: ${dim2.name} (${dim2.category})

Provide a detailed analysis of how these dimensions might correlate and influence each other.

Return your analysis as a JSON object with this exact structure:
{
  "analysis": "Detailed 3-4 sentence analysis of the correlation",
  "strength": (number 0-1 representing correlation strength),
  "type": "positive" | "negative" | "causal"
}`

  const response = await window.spark.llm(promptText, 'gpt-4o', true)
  return JSON.parse(response)
}

export function getAvailableDimensions(): Omit<DataDimension, 'currentValue' | 'trend'>[] {
  return DATA_DIMENSIONS
}
