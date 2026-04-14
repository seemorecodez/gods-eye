/**
 * Saved Locations Hook
 *
 * Persists named geographic locations per user session via `useKV`.
 * Locations can be saved from the map (click → "Save Location") and
 * recalled to fly the camera to that position.
 */
import { useCallback } from 'react'
import { useKV } from '@github/spark/hooks'

export interface SavedLocation {
  id: string
  name: string
  lat: number
  lng: number
  zoom?: number
  note?: string
  createdAt: number
  /** Optional category tag e.g. 'conflict', 'port', 'base' */
  tag?: string
}

export function useSavedLocations() {
  const [locations, setLocations] = useKV<SavedLocation[]>('saved-locations', [])

  const saveLocation = useCallback((
    name: string,
    lat: number,
    lng: number,
    options?: { zoom?: number; note?: string; tag?: string }
  ) => {
    const newLocation: SavedLocation = {
      id: `loc-${Date.now()}`,
      name,
      lat,
      lng,
      zoom: options?.zoom,
      note: options?.note,
      tag: options?.tag,
      createdAt: Date.now(),
    }

    setLocations(prev => [newLocation, ...(prev ?? [])])
    return newLocation.id
  }, [setLocations])

  const removeLocation = useCallback((id: string) => {
    setLocations(prev => (prev ?? []).filter(loc => loc.id !== id))
  }, [setLocations])

  const updateLocation = useCallback((id: string, updates: Partial<Omit<SavedLocation, 'id' | 'createdAt'>>) => {
    setLocations(prev =>
      (prev ?? []).map(loc => loc.id === id ? { ...loc, ...updates } : loc)
    )
  }, [setLocations])

  const clearAll = useCallback(() => {
    setLocations([])
  }, [setLocations])

  return {
    locations: locations ?? [],
    saveLocation,
    removeLocation,
    updateLocation,
    clearAll,
  }
}
