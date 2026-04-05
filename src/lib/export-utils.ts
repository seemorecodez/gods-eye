export interface ExportData {
  type: 'annotations' | 'predictions' | 'threats' | 'patterns'
  data: unknown[]
  metadata: {
    exportedAt: number
    exportedBy: string
    version: string
  }
}

export function exportToCSV(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) {
    throw new Error('No data to export')
  }

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header]
        const stringValue = value === null || value === undefined ? '' : String(value)
        return stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')
          ? `"${stringValue.replace(/"/g, '""')}"`
          : stringValue
      }).join(',')
    )
  ].join('\n')

  downloadFile(csvContent, filename, 'text/csv')
}

export function exportToJSON(data: ExportData, filename: string) {
  const jsonContent = JSON.stringify(data, null, 2)
  downloadFile(jsonContent, filename, 'application/json')
}

export function exportToGeoJSON(features: Array<{
  coordinates: [number, number]
  properties: Record<string, unknown>
}>, filename: string) {
  const geoJSON = {
    type: 'FeatureCollection',
    features: features.map(feature => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: feature.coordinates
      },
      properties: feature.properties
    }))
  }

  const jsonContent = JSON.stringify(geoJSON, null, 2)
  downloadFile(jsonContent, filename, 'application/geo+json')
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
