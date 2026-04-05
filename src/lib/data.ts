import { DataSource } from './types'

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
