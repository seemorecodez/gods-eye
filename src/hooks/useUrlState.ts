import { useState, useEffect, useCallback, useRef } from 'react'

export interface UrlState {
  layers: string[]
  lat: number
  lng: number
  zoom: number
  panel: string
}

function parseUrlState(defaults: UrlState): UrlState {
  const params = new URLSearchParams(window.location.search)

  const layers = params.has('layers')
    ? params.get('layers')!.split(',').filter(Boolean)
    : defaults.layers

  const latRaw = params.has('lat') ? parseFloat(params.get('lat')!) : NaN
  const lngRaw = params.has('lng') ? parseFloat(params.get('lng')!) : NaN
  const zoomRaw = params.has('zoom') ? parseInt(params.get('zoom')!, 10) : NaN

  return {
    layers,
    lat: isNaN(latRaw) ? defaults.lat : latRaw,
    lng: isNaN(lngRaw) ? defaults.lng : lngRaw,
    zoom: isNaN(zoomRaw) ? defaults.zoom : zoomRaw,
    panel: params.has('panel') ? params.get('panel')! : defaults.panel,
  }
}

function serializeUrlState(state: UrlState): string {
  const params = new URLSearchParams()
  if (state.layers.length > 0) params.set('layers', state.layers.join(','))
  params.set('lat', state.lat.toFixed(4))
  params.set('lng', state.lng.toFixed(4))
  params.set('zoom', String(state.zoom))
  if (state.panel) params.set('panel', state.panel)
  return params.toString()
}

/**
 * Synchronises a set of map-viewport parameters (layers, lat, lng, zoom, panel)
 * with the browser URL via window.history.pushState — no router library required.
 *
 * URL params take precedence over defaults on mount.
 * Every setUrlState call is debounced 300 ms before a new history entry is pushed.
 * Pressing Back/Forward re-reads the URL and syncs state.
 */
export function useUrlState(defaults: UrlState): [UrlState, (update: Partial<UrlState>) => void] {
  // Initialise from URL on first render; fall back to defaults for missing params.
  const [state, setState] = useState<UrlState>(() => parseUrlState(defaults))
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Keep a stable reference to the latest state so the popstate handler never stales.
  const stateRef = useRef<UrlState>(state)
  stateRef.current = state

  const setUrlState = useCallback((update: Partial<UrlState>) => {
    setState(prev => {
      const next = { ...prev, ...update }
      // Cancel any pending write and schedule a fresh one.
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        const qs = serializeUrlState(next)
        window.history.pushState({ urlState: next }, '', qs ? `?${qs}` : window.location.pathname)
      }, 300)
      return next
    })
  }, [])

  useEffect(() => {
    const handlePopState = () => {
      // Re-parse from the URL the browser just restored.
      setState(parseUrlState(defaults))
    }
    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return [state, setUrlState]
}
