import { DataSource } from './types'

export const dataSources: DataSource[] = [
  {
    id: 'ds1',
    name: 'ACLED Conflict Events',
    status: 'active',
    lastSync: 'Pending health check',
    recordCount: 0,
    coverageArea: 'Global',
    repository: 'blazeiburgess/acled'
  },
  {
    id: 'ds2',
    name: 'Sentinel-2 Imagery',
    status: 'active',
    lastSync: 'Pending health check',
    recordCount: 0,
    coverageArea: 'Europe, Middle East, Africa',
    repository: 'sentinelsat/sentinelsat'
  },
  {
    id: 'ds3',
    name: 'Google Earth Engine',
    status: 'active',
    lastSync: 'Pending health check',
    recordCount: 0,
    coverageArea: 'Global',
    repository: 'giswqs/geemap'
  },
  {
    id: 'ds4',
    name: 'COVID-19 Surveillance Data',
    status: 'active',
    lastSync: 'Pending health check',
    recordCount: 0,
    coverageArea: 'Global',
    repository: 'CSSEGISandData/COVID-19'
  },
  {
    id: 'ds5',
    name: 'Conflict Analysis DB',
    status: 'active',
    lastSync: 'Pending health check',
    recordCount: 0,
    coverageArea: 'Sub-Saharan Africa',
    repository: 'datapartnership/acled_conflict_analysis'
  }
]
