import { fetchAllRepositories } from './github-api'

export interface SentimentAnalysis {
  id: string
  sourceType: 'github' | 'global' | 'region'
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

export async function analyzeGitHubSentiment(): Promise<SentimentAnalysis> {
  const repositories = await fetchAllRepositories()
  
  const repoSummary = repositories.slice(0, 10).map(repo => ({
    name: repo.name,
    description: repo.description,
    stars: repo.stars,
    language: repo.language,
    lastUpdate: repo.lastUpdated
  }))

  const promptText = `You are an AI sentiment analyst for a geospatial intelligence platform. Analyze the following GitHub repository data and provide sentiment analysis.

Repository Data:
${JSON.stringify(repoSummary, null, 2)}

Analyze the overall sentiment, emotional tone, key themes, and any areas of concern. Return your analysis as a JSON object with this exact structure:
{
  "overallSentiment": "positive" | "neutral" | "negative",
  "sentimentScore": (number between -100 and 100, where -100 is extremely negative, 0 is neutral, 100 is extremely positive),
  "emotionalTone": ["tone1", "tone2", "tone3"],
  "keyThemes": ["theme1", "theme2", "theme3"],
  "concernAreas": ["concern1", "concern2"],
  "confidenceLevel": (number between 0 and 100),
  "analysisText": "A detailed 2-3 sentence analysis of the sentiment and patterns observed"
}`

  const response = await window.spark.llm(promptText, 'gpt-4o', true)
  const parsed = JSON.parse(response)

  return {
    id: `sentiment-${Date.now()}`,
    sourceType: 'github',
    sourceName: 'GitHub Repositories',
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

export async function analyzeRegionalSentiment(region: string, contextData: string): Promise<SentimentAnalysis> {
  const promptText = `You are an AI geopolitical sentiment analyst. Analyze the sentiment and emotional climate for the following region and context.

Region: ${region}
Context Data: ${contextData}

Provide a comprehensive sentiment analysis focusing on:
- Political climate and stability
- Social tensions or cohesion
- Economic sentiment
- Security concerns

Return your analysis as a JSON object with this exact structure:
{
  "overallSentiment": "positive" | "neutral" | "negative",
  "sentimentScore": (number between -100 and 100),
  "emotionalTone": ["tone1", "tone2", "tone3"],
  "keyThemes": ["theme1", "theme2", "theme3"],
  "concernAreas": ["concern1", "concern2"],
  "confidenceLevel": (number between 0 and 100),
  "analysisText": "A detailed 2-3 sentence analysis"
}`

  const response = await window.spark.llm(promptText, 'gpt-4o', true)
  const parsed = JSON.parse(response)

  return {
    id: `sentiment-${Date.now()}`,
    sourceType: 'region',
    sourceName: region,
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

export async function analyzeGlobalSentiment(): Promise<SentimentAnalysis> {
  const promptText = `You are an AI global intelligence analyst. Analyze current global geopolitical sentiment based on:
- Active conflict zones
- Major international tensions
- Economic indicators
- Humanitarian concerns
- Technology and defense developments

Provide a comprehensive global sentiment analysis.

Return your analysis as a JSON object with this exact structure:
{
  "overallSentiment": "positive" | "neutral" | "negative",
  "sentimentScore": (number between -100 and 100),
  "emotionalTone": ["tone1", "tone2", "tone3"],
  "keyThemes": ["theme1", "theme2", "theme3"],
  "concernAreas": ["concern1", "concern2"],
  "confidenceLevel": (number between 0 and 100),
  "analysisText": "A detailed 2-3 sentence analysis of current global sentiment"
}`

  const response = await window.spark.llm(promptText, 'gpt-4o', true)
  const parsed = JSON.parse(response)

  return {
    id: `sentiment-${Date.now()}`,
    sourceType: 'global',
    sourceName: 'Global Analysis',
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
