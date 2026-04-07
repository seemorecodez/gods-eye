import { fetchAllRepositories } from './github-api'

export interface ForecastPrediction {
  id: string
  category: 'conflict' | 'economic' | 'environmental' | 'technology' | 'social'
  region: string
  prediction: string
  timeframe: string
  probability: number
  confidence: number
  contributingFactors: string[]
  potentialImpacts: string[]
  mitigationStrategies: string[]
  dataSourcesUsed: string[]
  timestamp: Date
}

export interface TimeSeriesDataPoint {
  date: Date
  value: number
  category: string
}

export interface ForecastTrend {
  id: string
  name: string
  currentValue: number
  predictedValues: Array<{ timepoint: string; value: number; confidence: number }>
  trend: 'increasing' | 'decreasing' | 'stable' | 'volatile'
  anomaliesDetected: string[]
  timestamp: Date
}

export interface ModelComparison {
  id: string
  category: ForecastPrediction['category']
  region: string
  models: Array<{
    modelName: string
    prediction: string
    probability: number
    confidence: number
    accuracy: number
    processingTime: number
  }>
  consensus: {
    prediction: string
    averageProbability: number
    modelAgreement: number
  }
  timestamp: Date
}

const REGIONS = [
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

const CATEGORIES: ForecastPrediction['category'][] = [
  'conflict',
  'economic',
  'environmental',
  'technology',
  'social'
]

export async function generateForecast(
  category: ForecastPrediction['category'],
  region?: string
): Promise<ForecastPrediction> {
  const selectedRegion = region || REGIONS[Math.floor(Math.random() * REGIONS.length)]
  
  const repositories = await fetchAllRepositories()
  const relevantRepos = repositories.filter(r => 
    r.category === 'data' || r.category === 'ai'
  ).slice(0, 5)

  const repoContext = relevantRepos.map(r => `${r.name}: ${r.description}`).join('\n')

  const promptText = `You are an AI forecasting analyst specializing in geopolitical and intelligence predictions. Generate a detailed forecast prediction.

Category: ${category}
Region: ${selectedRegion}

Available data sources and capabilities:
${repoContext}

Generate a realistic, detailed prediction for this category and region. Consider:
- Recent patterns and trends
- Historical context
- Current geopolitical situation
- Environmental and economic factors

Return your analysis as a JSON object with this exact structure:
{
  "prediction": "Clear, specific prediction statement (2-3 sentences)",
  "timeframe": "Expected timeframe (e.g., '30-60 days', '3-6 months', '1-2 years')",
  "probability": (number between 0 and 1 indicating likelihood),
  "confidence": (number between 0 and 1 indicating model confidence),
  "contributingFactors": ["factor1", "factor2", "factor3"],
  "potentialImpacts": ["impact1", "impact2", "impact3"],
  "mitigationStrategies": ["strategy1", "strategy2"],
  "dataSourcesUsed": ["source1", "source2", "source3"]
}`

  const response = await window.spark.llm(promptText, 'gpt-4o', true)
  const parsed = JSON.parse(response)

  return {
    id: `forecast-${Date.now()}`,
    category,
    region: selectedRegion,
    prediction: parsed.prediction,
    timeframe: parsed.timeframe,
    probability: parsed.probability,
    confidence: parsed.confidence,
    contributingFactors: parsed.contributingFactors,
    potentialImpacts: parsed.potentialImpacts,
    mitigationStrategies: parsed.mitigationStrategies,
    dataSourcesUsed: parsed.dataSourcesUsed,
    timestamp: new Date()
  }
}

export async function generateTrendForecast(trendName: string, historicalData?: TimeSeriesDataPoint[]): Promise<ForecastTrend> {
  const dataContext = historicalData 
    ? `Historical data points: ${historicalData.length}\nRecent values: ${historicalData.slice(-5).map(d => d.value).join(', ')}`
    : 'No historical data available - generate baseline forecast'

  const promptText = `You are an AI time series forecasting analyst. Generate a trend forecast with future predictions.

Trend Name: ${trendName}
${dataContext}

Generate realistic future predictions for the next 6 timepoints (could be hours, days, or weeks depending on context).

Return your analysis as a JSON object with this exact structure:
{
  "currentValue": (number representing current state),
  "predictedValues": [
    {"timepoint": "t+1", "value": (number), "confidence": (0-1)},
    {"timepoint": "t+2", "value": (number), "confidence": (0-1)},
    {"timepoint": "t+3", "value": (number), "confidence": (0-1)},
    {"timepoint": "t+4", "value": (number), "confidence": (0-1)},
    {"timepoint": "t+5", "value": (number), "confidence": (0-1)},
    {"timepoint": "t+6", "value": (number), "confidence": (0-1)}
  ],
  "trend": "increasing" | "decreasing" | "stable" | "volatile",
  "anomaliesDetected": ["anomaly1", "anomaly2"]
}`

  const response = await window.spark.llm(promptText, 'gpt-4o', true)
  const parsed = JSON.parse(response)

  return {
    id: `trend-${Date.now()}`,
    name: trendName,
    currentValue: parsed.currentValue,
    predictedValues: parsed.predictedValues,
    trend: parsed.trend,
    anomaliesDetected: parsed.anomaliesDetected,
    timestamp: new Date()
  }
}

export async function generateMultiCategoryForecasts(): Promise<ForecastPrediction[]> {
  const forecasts: ForecastPrediction[] = []
  
  for (const category of CATEGORIES) {
    const forecast = await generateForecast(category)
    forecasts.push(forecast)
  }
  
  return forecasts
}

export async function compareModels(
  category: ForecastPrediction['category'],
  region: string
): Promise<ModelComparison> {
  const models = [
    { name: 'GPT-4o Deep Analysis', temp: 0.3, approach: 'conservative' },
    { name: 'GPT-4o Rapid Assessment', temp: 0.7, approach: 'moderate' },
    { name: 'GPT-4o High Variance', temp: 0.9, approach: 'aggressive' }
  ]

  const modelResults = []

  for (const model of models) {
    const startTime = Date.now()
    
    const promptText = `You are an AI forecasting model using ${model.approach} analysis approach. Generate a prediction.

Category: ${category}
Region: ${region}
Analysis Style: ${model.approach}

Return your analysis as a JSON object with this exact structure:
{
  "prediction": "Clear prediction statement",
  "probability": (number between 0 and 1),
  "confidence": (number between 0 and 1),
  "accuracy": (estimated model accuracy between 0 and 1)
}`

    const response = await window.spark.llm(promptText, 'gpt-4o', true)
    const parsed = JSON.parse(response)
    const processingTime = Date.now() - startTime

    modelResults.push({
      modelName: model.name,
      prediction: parsed.prediction,
      probability: parsed.probability,
      confidence: parsed.confidence,
      accuracy: parsed.accuracy,
      processingTime
    })
  }

  const avgProbability = modelResults.reduce((sum, m) => sum + m.probability, 0) / modelResults.length
  const probabilities = modelResults.map(m => m.probability)
  const variance = probabilities.reduce((sum, p) => sum + Math.pow(p - avgProbability, 2), 0) / probabilities.length
  const modelAgreement = 1 - Math.sqrt(variance)

  const consensusPrediction = modelResults
    .sort((a, b) => b.confidence - a.confidence)[0].prediction

  return {
    id: `comparison-${Date.now()}`,
    category,
    region,
    models: modelResults,
    consensus: {
      prediction: consensusPrediction,
      averageProbability: avgProbability,
      modelAgreement
    },
    timestamp: new Date()
  }
}
