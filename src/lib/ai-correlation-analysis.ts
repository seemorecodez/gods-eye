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
  { id: 'satellite-activity', name: 'Satellite Surveillance Activity', category: 'imagery', unit: 'passes/day' },
  { id: 'port-congestion', name: 'Port Congestion Index', category: 'economic', unit: 'index' },
  { id: 'social-media-tension', name: 'Social Media Tension Score', category: 'social', unit: 'score' },
  { id: 'military-movements', name: 'Military Movement Frequency', category: 'military', unit: 'events/week' },
  { id: 'cyber-attacks', name: 'Cyber Attack Volume', category: 'cyber', unit: 'incidents/day' },
  { id: 'food-prices', name: 'Food Price Volatility', category: 'economic', unit: 'volatility %' },
  { id: 'drought-severity', name: 'Drought Severity Index', category: 'environmental', unit: 'index' },
  { id: 'refugee-flow', name: 'Refugee Movement Volume', category: 'social', unit: 'persons/day' },
  { id: 'energy-disruption', name: 'Energy Infrastructure Disruption', category: 'economic', unit: 'incidents' },
  { id: 'internet-shutdown', name: 'Internet Shutdown Frequency', category: 'cyber', unit: 'events/month' },
  { id: 'protest-activity', name: 'Protest Activity Level', category: 'social', unit: 'events/week' },
  { id: 'weapons-trade', name: 'Arms Trade Volume', category: 'military', unit: 'transactions' }
]

export async function generateCorrelationNetwork(selectedDimensions?: string[]): Promise<CorrelationNetwork> {
  const dimensionCount = selectedDimensions ? selectedDimensions.length : 6 + Math.floor(Math.random() * 4)
  
  const dimensions: DataDimension[] = (selectedDimensions 
    ? DATA_DIMENSIONS.filter(d => selectedDimensions.includes(d.id))
    : DATA_DIMENSIONS.sort(() => Math.random() - 0.5).slice(0, dimensionCount)
  ).map(d => ({
    ...d,
    currentValue: Math.random() * 100,
    trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable'
  }))

  const dimensionsList = dimensions.map(d => `- ${d.name} (${d.category}): ${d.currentValue.toFixed(1)} ${d.unit}`).join('\n')

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
