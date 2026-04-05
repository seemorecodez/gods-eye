import { Repository, DataSource, PipelineStage } from './types'

export const repositories: Repository[] = [
  {
    id: '1',
    name: 'acled',
    fullName: 'blazeiburgess/acled',
    description: 'Armed Conflict Location & Event Data Project - Real-time conflict event tracking',
    url: 'https://github.com/blazeiburgess/acled',
    stars: 156,
    language: 'Python',
    lastUpdated: '2024-01-15',
    category: 'data'
  },
  {
    id: '2',
    name: 'acled_conflict_analysis',
    fullName: 'datapartnership/acled_conflict_analysis',
    description: 'Advanced analytics and visualization for ACLED conflict data',
    url: 'https://github.com/datapartnership/acled_conflict_analysis',
    stars: 89,
    language: 'R',
    lastUpdated: '2024-01-12',
    category: 'data'
  },
  {
    id: '3',
    name: 'geemap',
    fullName: 'giswqs/geemap',
    description: 'Python package for interactive mapping with Google Earth Engine',
    url: 'https://github.com/giswqs/geemap',
    stars: 3421,
    language: 'Python',
    lastUpdated: '2024-01-18',
    category: 'data'
  },
  {
    id: '4',
    name: 'sentinelsat',
    fullName: 'sentinelsat/sentinelsat',
    description: 'Sentinel satellite imagery download and search API',
    url: 'https://github.com/sentinelsat/sentinelsat',
    stars: 987,
    language: 'Python',
    lastUpdated: '2024-01-14',
    category: 'data'
  },
  {
    id: '5',
    name: 'COVID-19',
    fullName: 'CSSEGISandData/COVID-19',
    description: 'Johns Hopkins CSSE COVID-19 Data - Pattern for OSINT data collection',
    url: 'https://github.com/CSSEGISandData/COVID-19',
    stars: 30542,
    language: 'JavaScript',
    lastUpdated: '2024-01-10',
    category: 'data'
  },
  {
    id: '6',
    name: 'ultralytics',
    fullName: 'ultralytics/ultralytics',
    description: 'YOLOv8 object detection for satellite imagery analysis',
    url: 'https://github.com/ultralytics/ultralytics',
    stars: 28934,
    language: 'Python',
    lastUpdated: '2024-01-19',
    category: 'ai'
  },
  {
    id: '7',
    name: 'Satellite-Image-Analysis-Using-YOLO',
    fullName: 'Shakkak/Satellite-Image-Analysis-Using-YOLO',
    description: 'YOLO implementation specifically tuned for satellite imagery',
    url: 'https://github.com/Shakkak/Satellite-Image-Analysis-Using-YOLO',
    stars: 234,
    language: 'Python',
    lastUpdated: '2023-12-28',
    category: 'ai'
  },
  {
    id: '8',
    name: 'awesome-remote-sensing-change-detection',
    fullName: 'wenhwu/awesome-remote-sensing-change-detection',
    description: 'Collection of change detection methods for satellite imagery',
    url: 'https://github.com/wenhwu/awesome-remote-sensing-change-detection',
    stars: 2876,
    language: 'Markdown',
    lastUpdated: '2024-01-08',
    category: 'ai'
  },
  {
    id: '9',
    name: 'techniques',
    fullName: 'satellite-image-deep-learning/techniques',
    description: 'Deep learning techniques for satellite image analysis',
    url: 'https://github.com/satellite-image-deep-learning/techniques',
    stars: 5432,
    language: 'Python',
    lastUpdated: '2024-01-16',
    category: 'ai'
  },
  {
    id: '10',
    name: 'Sentinel2_LULC_YoloV8',
    fullName: 'alexipt90/Sentinel2_LULC_YoloV8',
    description: 'Land Use Land Cover classification using YOLOv8 on Sentinel-2',
    url: 'https://github.com/alexipt90/Sentinel2_LULC_YoloV8',
    stars: 167,
    language: 'Jupyter Notebook',
    lastUpdated: '2024-01-05',
    category: 'ai'
  },
  {
    id: '11',
    name: 'streamlit',
    fullName: 'streamlit/streamlit',
    description: 'Framework for building data science web apps',
    url: 'https://github.com/streamlit/streamlit',
    stars: 34521,
    language: 'Python',
    lastUpdated: '2024-01-19',
    category: 'viz'
  },
  {
    id: '12',
    name: 'folium',
    fullName: 'python-visualization/folium',
    description: 'Python data visualization on interactive maps',
    url: 'https://github.com/python-visualization/folium',
    stars: 6854,
    language: 'Python',
    lastUpdated: '2024-01-17',
    category: 'viz'
  },
  {
    id: '13',
    name: 'kepler.gl',
    fullName: 'keplergl/kepler.gl',
    description: 'High-performance geospatial data visualization',
    url: 'https://github.com/keplergl/kepler.gl',
    stars: 11234,
    language: 'JavaScript',
    lastUpdated: '2024-01-18',
    category: 'viz'
  },
  {
    id: '14',
    name: 'plotly.py',
    fullName: 'plotly/plotly.py',
    description: 'Interactive charting library for Python',
    url: 'https://github.com/plotly/plotly.py',
    stars: 15987,
    language: 'Python',
    lastUpdated: '2024-01-19',
    category: 'viz'
  },
  {
    id: '15',
    name: 'GitHub Actions',
    fullName: 'github/features/actions',
    description: 'CI/CD automation and workflow orchestration',
    url: 'https://github.com/features/actions',
    stars: 0,
    language: 'YAML',
    lastUpdated: '2024-01-19',
    category: 'infra'
  },
  {
    id: '16',
    name: 'GitHub Pages',
    fullName: 'github/pages',
    description: 'Static site hosting directly from repositories',
    url: 'https://github.com/pages',
    stars: 0,
    language: 'HTML',
    lastUpdated: '2024-01-19',
    category: 'infra'
  },
  {
    id: '17',
    name: 'GitHub Codespaces',
    fullName: 'github/codespaces',
    description: 'Cloud-based development environments',
    url: 'https://github.com/codespaces',
    stars: 0,
    language: 'TypeScript',
    lastUpdated: '2024-01-19',
    category: 'infra'
  }
]

export const dataSources: DataSource[] = [
  {
    id: 'ds1',
    name: 'ACLED Conflict Events',
    status: 'active',
    lastSync: '2 minutes ago',
    recordCount: 145782,
    coverageArea: 'Global',
    repository: 'blazeiburgess/acled'
  },
  {
    id: 'ds2',
    name: 'Sentinel-2 Imagery',
    status: 'active',
    lastSync: '5 minutes ago',
    recordCount: 892341,
    coverageArea: 'Europe, Middle East, Africa',
    repository: 'sentinelsat/sentinelsat'
  },
  {
    id: 'ds3',
    name: 'Google Earth Engine',
    status: 'warning',
    lastSync: '45 minutes ago',
    recordCount: 2341890,
    coverageArea: 'Global',
    repository: 'giswqs/geemap'
  },
  {
    id: 'ds4',
    name: 'OSINT COVID-19 Pattern',
    status: 'active',
    lastSync: '1 minute ago',
    recordCount: 98234,
    coverageArea: 'Global',
    repository: 'CSSEGISandData/COVID-19'
  },
  {
    id: 'ds5',
    name: 'Conflict Analysis DB',
    status: 'critical',
    lastSync: '2 hours ago',
    recordCount: 45231,
    coverageArea: 'Sub-Saharan Africa',
    repository: 'datapartnership/acled_conflict_analysis'
  }
]

export const pipelineStages: PipelineStage[] = [
  {
    id: 'stage1',
    name: 'Data Ingestion',
    status: 'complete',
    processingTime: 142,
    accuracy: 99.8,
    throughput: '1.2k events/sec'
  },
  {
    id: 'stage2',
    name: 'YOLOv8 Detection',
    status: 'processing',
    processingTime: 3847,
    accuracy: 94.3,
    throughput: '45 images/sec'
  },
  {
    id: 'stage3',
    name: 'Change Detection',
    status: 'idle',
    processingTime: 0,
    accuracy: 91.7,
    throughput: '120 tiles/sec'
  },
  {
    id: 'stage4',
    name: 'Classification & Tagging',
    status: 'idle',
    processingTime: 0,
    accuracy: 96.1,
    throughput: '2.8k objects/sec'
  },
  {
    id: 'stage5',
    name: 'Output Generation',
    status: 'idle',
    processingTime: 0,
    accuracy: 100,
    throughput: '850 reports/sec'
  }
]
