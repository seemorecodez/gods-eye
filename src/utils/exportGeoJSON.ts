import type { DataSourcePlugin, MapMarker } from '@/lib/plugin-types'

export interface ActiveLayer {
  plugin: DataSourcePlugin
  /** Current cached markers for this layer — provided by the caller. */
  markers: MapMarker[]
}

/**
 * Converts an array of active map layers into a valid RFC 7946 GeoJSON
 * FeatureCollection and downloads it as a .geojson file.
 *
 * Only plugins that implement `toGeoJSONFeatures()` are included; plugins
 * without the method are skipped with a console.warn.  Individual features
 * that are missing `type: "Feature"` or have a null geometry are also
 * skipped with a warning rather than throwing.
 */
export function exportGeoJSON(layers: ActiveLayer[]): void {
  const allFeatures: GeoJSONFeature[] = []

  for (const layer of layers) {
    if (!layer.plugin.toGeoJSONFeatures) {
      console.warn(`exportGeoJSON: plugin "${layer.plugin.name}" does not implement toGeoJSONFeatures — skipping.`)
      continue
    }

    let features: GeoJSONFeature[]
    try {
      features = layer.plugin.toGeoJSONFeatures()
    } catch (err) {
      console.warn(`exportGeoJSON: toGeoJSONFeatures() threw for plugin "${layer.plugin.name}":`, err)
      continue
    }

    for (const feature of features) {
      if (feature.type !== 'Feature') {
        console.warn(`exportGeoJSON: skipping feature from "${layer.plugin.name}" — type is not "Feature"`)
        continue
      }
      if (!feature.geometry) {
        console.warn(`exportGeoJSON: skipping feature from "${layer.plugin.name}" — geometry is null`)
        continue
      }
      allFeatures.push(feature)
    }
  }

  const featureCollection: GeoJSONFeatureCollection = {
    type: 'FeatureCollection',
    features: allFeatures,
  }

  // Timestamp in filename: YYYY-MM-DDTHH-mm-ss (colons replaced for cross-OS safety)
  const now = new Date()
  const ts = now.toISOString().replace(/\.\d{3}Z$/, '').replace(/:/g, '-')
  const filename = `geomap-export-${ts}.geojson`

  const json = JSON.stringify(featureCollection, null, 2)
  const blob = new Blob([json], { type: 'application/geo+json' })
  const url = URL.createObjectURL(blob)

  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()

  // Revoke after a short delay to allow the download to start.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// ---------------------------------------------------------------------------
// Minimal inline GeoJSON types — avoids requiring @types/geojson as a new dep.
// ---------------------------------------------------------------------------

interface GeoJSONGeometry {
  type: string
  coordinates: unknown
}

export interface GeoJSONFeature {
  type: 'Feature'
  geometry: GeoJSONGeometry | null
  properties: Record<string, unknown> | null
}

interface GeoJSONFeatureCollection {
  type: 'FeatureCollection'
  features: GeoJSONFeature[]
}
