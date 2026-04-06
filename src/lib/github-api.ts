import { Repository } from './types'

const GITHUB_API_BASE = 'https://api.github.com'

const repositoryNames = [
  'blazeiburgess/acled',
  'datapartnership/acled_conflict_analysis',
  'giswqs/geemap',
  'sentinelsat/sentinelsat',
  'CSSEGISandData/COVID-19',
  'ultralytics/ultralytics',
  'Shakkak/Satellite-Image-Analysis-Using-YOLO',
  'wenhwu/awesome-remote-sensing-change-detection',
  'satellite-image-deep-learning/techniques',
  'alexipt90/Sentinel2_LULC_YoloV8',
  'streamlit/streamlit',
  'python-visualization/folium',
  'keplergl/kepler.gl',
  'plotly/plotly.py'
]

interface GitHubRepoData {
  id: number
  name: string
  full_name: string
  description: string
  html_url: string
  stargazers_count: number
  language: string
  updated_at: string
  watchers_count: number
  forks_count: number
  open_issues_count: number
  size: number
  pushed_at: string
}

const categoryMap: Record<string, Repository['category']> = {
  'blazeiburgess/acled': 'data',
  'datapartnership/acled_conflict_analysis': 'data',
  'giswqs/geemap': 'data',
  'sentinelsat/sentinelsat': 'data',
  'CSSEGISandData/COVID-19': 'data',
  'ultralytics/ultralytics': 'ai',
  'Shakkak/Satellite-Image-Analysis-Using-YOLO': 'ai',
  'wenhwu/awesome-remote-sensing-change-detection': 'ai',
  'satellite-image-deep-learning/techniques': 'ai',
  'alexipt90/Sentinel2_LULC_YoloV8': 'ai',
  'streamlit/streamlit': 'viz',
  'python-visualization/folium': 'viz',
  'keplergl/kepler.gl': 'viz',
  'plotly/plotly.py': 'viz'
}

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        }
      })
      
      if (response.status === 403) {
        const resetTime = response.headers.get('X-RateLimit-Reset')
        console.warn('GitHub API rate limit hit', { resetTime })
      }
      
      return response
    } catch (error) {
      if (i === retries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
  throw new Error('Failed to fetch after retries')
}

export async function fetchRepositoryData(fullName: string): Promise<Repository | null> {
  try {
    const response = await fetchWithRetry(`${GITHUB_API_BASE}/repos/${fullName}`)
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error(`Failed to fetch repository ${fullName}: (${response.status}) ${errorText}`)
      return null
    }
    
    const data: GitHubRepoData = await response.json()
    
    const lastUpdated = new Date(data.updated_at)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24))
    
    let lastUpdatedText = ''
    if (diffDays === 0) {
      lastUpdatedText = 'today'
    } else if (diffDays === 1) {
      lastUpdatedText = 'yesterday'
    } else if (diffDays < 30) {
      lastUpdatedText = `${diffDays} days ago`
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      lastUpdatedText = `${months} month${months > 1 ? 's' : ''} ago`
    } else {
      const years = Math.floor(diffDays / 365)
      lastUpdatedText = `${years} year${years > 1 ? 's' : ''} ago`
    }
    
    return {
      id: data.id.toString(),
      name: data.name,
      fullName: data.full_name,
      description: data.description || 'No description available',
      url: data.html_url,
      stars: data.stargazers_count,
      language: data.language || 'Unknown',
      lastUpdated: lastUpdatedText,
      category: categoryMap[fullName] || 'infra',
      watchers: data.watchers_count,
      forks: data.forks_count,
      openIssues: data.open_issues_count,
      size: data.size,
      pushedAt: data.pushed_at
    }
  } catch (error) {
    console.error(`Error fetching ${fullName}:`, error)
    return null
  }
}

export async function fetchAllRepositories(): Promise<Repository[]> {
  const results = await Promise.allSettled(
    repositoryNames.map(name => fetchRepositoryData(name))
  )
  
  return results
    .filter((result): result is PromiseFulfilledResult<Repository> => 
      result.status === 'fulfilled' && result.value !== null
    )
    .map(result => result.value)
}

export async function fetchRepositoryStats(fullName: string) {
  try {
    const [repoResponse, commitsResponse] = await Promise.all([
      fetchWithRetry(`${GITHUB_API_BASE}/repos/${fullName}`),
      fetchWithRetry(`${GITHUB_API_BASE}/repos/${fullName}/commits?per_page=1`)
    ])
    
    const repoData = await repoResponse.json()
    
    const linkHeader = commitsResponse.headers.get('Link')
    let totalCommits = 0
    if (linkHeader) {
      const match = linkHeader.match(/page=(\d+)>; rel="last"/)
      if (match) {
        totalCommits = parseInt(match[1])
      }
    }
    
    return {
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      watchers: repoData.watchers_count,
      openIssues: repoData.open_issues_count,
      commits: totalCommits,
      size: repoData.size,
      language: repoData.language,
      updatedAt: repoData.updated_at,
      pushedAt: repoData.pushed_at
    }
  } catch (error) {
    console.error(`Error fetching stats for ${fullName}:`, error)
    return null
  }
}

interface GitHubCommit {
  sha: string
  commit: {
    message: string
    author: {
      name: string
      date: string
    }
  }
  stats?: {
    total: number
    additions: number
    deletions: number
  }
  files?: Array<{ filename: string }>
}

export async function fetchRecentCommits(repositories: string[], limit = 20) {
  try {
    const allCommits = await Promise.all(
      repositories.map(async (fullName) => {
        try {
          const response = await fetchWithRetry(
            `${GITHUB_API_BASE}/repos/${fullName}/commits?per_page=5`
          )
          
          if (!response.ok) return []
          
          const commits: GitHubCommit[] = await response.json()
          
          const detailedCommits = await Promise.all(
            commits.map(async (commit) => {
              try {
                const detailResponse = await fetchWithRetry(
                  `${GITHUB_API_BASE}/repos/${fullName}/commits/${commit.sha}`
                )
                
                if (!detailResponse.ok) {
                  return {
                    id: commit.sha,
                    repository: fullName,
                    sha: commit.sha.substring(0, 7),
                    message: commit.commit.message.split('\n')[0],
                    author: commit.commit.author.name,
                    timestamp: new Date(commit.commit.author.date),
                    filesChanged: 0,
                    additions: 0,
                    deletions: 0
                  }
                }
                
                const detailData: GitHubCommit = await detailResponse.json()
                
                return {
                  id: commit.sha,
                  repository: fullName,
                  sha: commit.sha.substring(0, 7),
                  message: commit.commit.message.split('\n')[0],
                  author: commit.commit.author.name,
                  timestamp: new Date(commit.commit.author.date),
                  filesChanged: detailData.files?.length || 0,
                  additions: detailData.stats?.additions || 0,
                  deletions: detailData.stats?.deletions || 0
                }
              } catch {
                return {
                  id: commit.sha,
                  repository: fullName,
                  sha: commit.sha.substring(0, 7),
                  message: commit.commit.message.split('\n')[0],
                  author: commit.commit.author.name,
                  timestamp: new Date(commit.commit.author.date),
                  filesChanged: 0,
                  additions: 0,
                  deletions: 0
                }
              }
            })
          )
          
          return detailedCommits
        } catch {
          return []
        }
      })
    )
    
    return allCommits
      .flat()
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  } catch (error) {
    console.error('Error fetching recent commits:', error)
    return []
  }
}
