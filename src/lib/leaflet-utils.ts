/**
 * Shared Leaflet initialization utilities.
 * Import `initLeafletDefaultIcons` once in any component that uses Leaflet markers
 * to apply the correct default icon URLs (the bundler strips the default icon URL
 * resolution function, so it must be patched at runtime).
 */
import L from 'leaflet'

let initialized = false

export function initLeafletDefaultIcons(): void {
  if (initialized) return
  initialized = true

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  })
}
