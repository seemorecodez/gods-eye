import { useEffect, useRef, useState, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { useUrlState } from '@/hooks/useUrlState'
import { exportGeoJSON } from '@/utils/exportGeoJSON'
import type { ActiveLayer } from '@/utils/exportGeoJSON'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents, Rectangle } from 'react-leaflet'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { MapEvent, MapAnnotation, CameraFeed, WeatherData, ThreatPrediction, MLPrediction } from '@/lib/types'
import { fetchAllRepositories } from '@/lib/github-api'
import { fetchWindyWebcams } from '@/lib/windy-webcams-api'
import { fetchTrafficCameras } from '@/lib/traffic-camera-api'
import { fetchSatellitePasses, generateSatelliteImageryFeeds, SatellitePass, getISSData, ISSData } from '@/lib/satellite-api'
import { generateWeatherGrid } from '@/lib/weather-api'
import { generateThreatPredictions } from '@/lib/threat-analysis'
import { generatePDFReport } from '@/lib/pdf-export'
import { MapPin, Target, Crosshair, ChartLine, ChatCircle, Video, Eye, PushPin, X, CloudRain, Warning, FilePdf, Spinner, Funnel, Planet, Car, Rocket, Download } from '@phosphor-icons/react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
})

interface RepoActivity {
  repo: string
  lat: number
  lng: number
  activity: number
}

/**
 * Applies programmatic center/zoom changes coming from URL state, and emits
 * user-initiated pan/zoom events back to the URL — guarded by a ref flag to
 * prevent circular updates.
 */
function MapCenterSync({
  center,
  zoom,
  onUserChange,
}: {
  center: [number, number]
  zoom: number
  onUserChange: (lat: number, lng: number, zoom: number) => void
}) {
  const programmaticRef = useRef(false)
  const map = useMapEvents({
    zoomend() {
      if (programmaticRef.current) return
      const c = map.getCenter()
      onUserChange(
        parseFloat(c.lat.toFixed(4)),
        parseFloat(c.lng.toFixed(4)),
        map.getZoom(),
      )
    },
    moveend() {
      if (programmaticRef.current) {
        // clear flag after the programmatic move settles
        programmaticRef.current = false
        return
      }
      const c = map.getCenter()
      onUserChange(
        parseFloat(c.lat.toFixed(4)),
        parseFloat(c.lng.toFixed(4)),
        map.getZoom(),
      )
    },
  })

  useEffect(() => {
    const c = map.getCenter()
    const movedFar =
      Math.abs(c.lat - center[0]) > 0.0001 ||
      Math.abs(c.lng - center[1]) > 0.0001 ||
      map.getZoom() !== zoom
    if (movedFar) {
      programmaticRef.current = true
      map.setView(center, zoom, { animate: false })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center[0], center[1], zoom])

  return null
}

function AddAnnotationHandler({ onAddAnnotation }: { onAddAnnotation: (lat: number, lng: number) => void }) {
  useMapEvents({
    dblclick(e) {
      onAddAnnotation(e.latlng.lat, e.latlng.lng)
    }
  })
  return null
}

export function CollaborativeMapEnhanced() {
  const [events, setEvents] = useState<MapEvent[]>([])
  const [annotations, setAnnotations] = useKV<MapAnnotation[]>("map-annotations", [])
  const [allCameras, setAllCameras] = useState<CameraFeed[]>([])
  const [satellitePasses, setSatellitePasses] = useState<SatellitePass[]>([])
  const [issData, setIssData] = useState<ISSData | null>(null)
  const [weatherData, setWeatherData] = useState<WeatherData[]>([])
  const [threatPredictions, setThreatPredictions] = useState<ThreatPrediction[]>([])
  const [mlPredictions, setMLPredictions] = useKV<MLPrediction[]>("ml-predictions", [])
  
  // ---- URL-backed state (layers, lat, lng, zoom, panel) -----------------
  const [urlState, setUrlState] = useUrlState({
    layers: [],
    lat: 20,
    lng: 0,
    zoom: 2,
    panel: 'all',
  })

  // Derived viewport values
  const mapCenter: [number, number] = [urlState.lat, urlState.lng]
  const activeLayer = (urlState.panel || 'all') as 'all' | 'conflict' | 'satellite' | 'detection' | 'cameras' | 'traffic'

  // Derived visibility flags — driven by the 'layers' URL param so that
  // /?layers=cameras,weather,satellites reflects the correct toggles on load.
  const activeLayers = new Set(urlState.layers)
  const showAnnotations = activeLayers.has('annotations')
  const showCameras = activeLayers.has('cameras')
  const showSatellites = activeLayers.has('satellites')
  const showWeather = activeLayers.has('weather')
  const showThreats = activeLayers.has('threats')

  const toggleLayer = (id: string) =>
    setUrlState({
      layers: activeLayers.has(id)
        ? urlState.layers.filter(l => l !== id)
        : [...urlState.layers, id],
    })
  // -----------------------------------------------------------------------

  const [loading, setLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  
  const [filterRegion, setFilterRegion] = useState<string>('')
  const [filterProvider, setFilterProvider] = useState<string>('all')
  const [filterType, setFilterType] = useState<CameraFeed['type'] | 'all'>('all')
  
  const [annotationDialogOpen, setAnnotationDialogOpen] = useState(false)
  const [newAnnotation, setNewAnnotation] = useState<{ lat: number; lng: number } | null>(null)
  const [annotationContent, setAnnotationContent] = useState('')
  const [annotationType, setAnnotationType] = useState<'note' | 'alert' | 'observation'>('note')
  
  const [selectedCamera, setSelectedCamera] = useState<CameraFeed | null>(null)
  const [cameraDialogOpen, setCameraDialogOpen] = useState(false)
  
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    async function loadRealData() {
      try {
        setLoadingProgress(5)
        const repos = await fetchAllRepositories()
        setLoadingProgress(10)
        
        const activityData: RepoActivity[] = [
          { repo: 'acled', lat: 8.7832, lng: 34.5085, activity: 0 },
          { repo: 'COVID-19', lat: 39.9042, lng: 116.4074, activity: 0 },
          { repo: 'geemap', lat: 37.7749, lng: -122.4194, activity: 0 },
          { repo: 'sentinelsat', lat: 52.5200, lng: 13.4050, activity: 0 },
          { repo: 'ultralytics', lat: 40.7128, lng: -74.0060, activity: 0 },
          { repo: 'kepler.gl', lat: 37.7749, lng: -122.4194, activity: 0 },
          { repo: 'folium', lat: 48.8566, lng: 2.3522, activity: 0 },
          { repo: 'streamlit', lat: 37.7749, lng: -122.4194, activity: 0 }
        ]

        repos.forEach(repo => {
          const activity = activityData.find(a => repo.name.includes(a.repo))
          if (activity) {
            activity.activity = repo.stars || 0
          }
        })

        const generatedEvents: MapEvent[] = []
        
        activityData.forEach((activity, idx) => {
          const repo = repos.find(r => r.name.includes(activity.repo))
          if (!repo) return

          const types: MapEvent['type'][] = ['conflict', 'satellite', 'detection', 'change']
          const severities: MapEvent['severity'][] = ['low', 'medium', 'high', 'critical']
          
          const eventCount = Math.min(Math.floor(activity.activity / 5000) + 1, 5)
          
          for (let i = 0; i < eventCount; i++) {
            const latOffset = (Math.random() - 0.5) * 20
            const lngOffset = (Math.random() - 0.5) * 20
            
            generatedEvents.push({
              id: `${activity.repo}-${idx}-${i}`,
              type: types[Math.floor(Math.random() * types.length)],
              lat: activity.lat + latOffset,
              lng: activity.lng + lngOffset,
              title: `${repo.name} Data Point ${i + 1}`,
              description: repo.description,
              severity: severities[Math.min(Math.floor(activity.activity / 10000), 3)],
              timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
              repository: repo.fullName
            })
          }
        })

        setEvents(generatedEvents)
        setLoadingProgress(20)

        const [webcams, trafficCams, satellites, satelliteFeeds] = await Promise.all([
          fetchWindyWebcams(150),
          fetchTrafficCameras(),
          fetchSatellitePasses(),
          generateSatelliteImageryFeeds()
        ])
        
        const combinedCameras = [...webcams, ...trafficCams, ...satelliteFeeds]
        setAllCameras(combinedCameras)
        setSatellitePasses(satellites)
        setLoadingProgress(50)

        const iss = getISSData()
        setIssData(iss)
        setLoadingProgress(55)

        const weather = await generateWeatherGrid(40)
        setWeatherData(weather)
        setLoadingProgress(70)

        const threats = await generateThreatPredictions(generatedEvents, 40)
        setThreatPredictions(threats)
        setLoadingProgress(100)

        setLoading(false)
        const webcamCount = webcams.length
        const trafficCount = trafficCams.length
        const satCount = satelliteFeeds.length
        toast.success(`Loaded ${webcamCount} webcams, ${trafficCount} traffic cameras, ${satCount} satellite feeds, and ${satellites.length} orbital satellites`)
      } catch (error) {
        console.error('Error loading data:', error)
        setLoading(false)
        toast.error('Failed to load some data')
      }
    }

    loadRealData()
  }, [])

  const filteredCameras = useMemo(() => {
    return allCameras.filter(cam => {
      if (filterType !== 'all' && cam.type !== filterType) return false
      if (filterProvider !== 'all' && cam.provider !== filterProvider) return false
      if (filterRegion && !cam.name.toLowerCase().includes(filterRegion.toLowerCase())) return false
      return true
    })
  }, [allCameras, filterType, filterProvider, filterRegion])

  const providers = useMemo(() => {
    const uniqueProviders = new Set(allCameras.map(c => c.provider))
    return Array.from(uniqueProviders).sort()
  }, [allCameras])

  const handleAddAnnotation = (lat: number, lng: number) => {
    setNewAnnotation({ lat, lng })
    setAnnotationDialogOpen(true)
  }

  const saveAnnotation = async () => {
    if (!newAnnotation || !annotationContent.trim()) {
      toast.error('Please enter annotation content')
      return
    }

    const user = await window.spark.user()
    if (!user) {
      toast.error('Unable to get user information')
      return
    }
    
    const annotation: MapAnnotation = {
      id: `ann-${Date.now()}`,
      lat: newAnnotation.lat,
      lng: newAnnotation.lng,
      author: user.login || 'Anonymous',
      content: annotationContent,
      timestamp: new Date(),
      type: annotationType
    }

    setAnnotations((current) => [...(current || []), annotation])
    toast.success('Annotation added successfully')
    
    setAnnotationContent('')
    setAnnotationDialogOpen(false)
    setNewAnnotation(null)
  }

  const deleteAnnotation = (id: string) => {
    setAnnotations((current) => (current || []).filter(a => a.id !== id))
    toast.success('Annotation deleted')
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      await generatePDFReport({
        annotations: annotations || [],
        predictions: mlPredictions || [],
        threatAnalysis: threatPredictions,
        weatherData: showWeather ? weatherData : undefined
      })
      toast.success('PDF report generated successfully')
      setExportDialogOpen(false)
    } catch (error) {
      toast.error('Failed to generate PDF report')
      console.error(error)
    } finally {
      setExporting(false)
    }
  }

  const handleGeoJSONExport = () => {
    const layers: ActiveLayer[] = []

    if (showSatellites && satellitePasses.length > 0) {
      const passes = satellitePasses
      layers.push({
        plugin: {
          id: 'satellites',
          name: 'Satellite Passes',
          icon: 'planet',
          category: 'space',
          fetch: async () => [],
          refreshInterval: 600,
          toGeoJSONFeatures: () =>
            passes.map(sat => ({
              type: 'Feature' as const,
              geometry: {
                type: 'Point',
                coordinates: [sat.lng, sat.lat, sat.altitude],
              },
              properties: {
                name: sat.name,
                id: sat.noradId || sat.id,
                altitude: sat.altitude,
                velocity: sat.velocity,
              },
            })),
        },
        markers: [],
      })
    }

    if (showWeather && weatherData.length > 0) {
      const wx = weatherData
      layers.push({
        plugin: {
          id: 'weather',
          name: 'Weather Data',
          icon: 'cloud-rain',
          category: 'other',
          fetch: async () => [],
          refreshInterval: 1800,
          toGeoJSONFeatures: () =>
            wx.map(w => ({
              type: 'Feature' as const,
              geometry: {
                type: 'Point',
                coordinates: [w.lng, w.lat],
              },
              properties: {
                temperature: w.temperature,
                precipitation: w.humidity,
                windspeed: w.windSpeed,
                timestamp: (w.timestamp instanceof Date
                  ? w.timestamp
                  : new Date(w.timestamp)
                ).toISOString(),
              },
            })),
        },
        markers: [],
      })
    }

    if (layers.length === 0) {
      toast.info('Enable Satellite Orbits or Weather Overlay to export GeoJSON data.')
      return
    }

    exportGeoJSON(layers)
    toast.success('GeoJSON download started')
  }

  const filteredEvents = events.filter(event => 
    activeLayer === 'all' || activeLayer === 'cameras' || activeLayer === 'traffic' || event.type === activeLayer
  )

  const filteredThreats = threatPredictions.filter(t => 
    t.threatLevel === 'high' || t.threatLevel === 'critical'
  )

  const annotationCount = annotations?.length || 0

  const getSeverityColor = (severity: MapEvent['severity']) => {
    switch (severity) {
      case 'low': return 'oklch(0.70 0.20 145)'
      case 'medium': return 'oklch(0.75 0.18 80)'
      case 'high': return 'oklch(0.75 0.15 40)'
      case 'critical': return 'oklch(0.60 0.22 25)'
    }
  }

  const getTypeIcon = (type: MapEvent['type']) => {
    switch (type) {
      case 'conflict': return <Target size={16} />
      case 'satellite': return <MapPin size={16} />
      case 'detection': return <Crosshair size={16} />
      case 'change': return <ChartLine size={16} />
    }
  }

  const getAnnotationColor = (type: MapAnnotation['type']) => {
    switch (type) {
      case 'note': return 'oklch(0.75 0.15 200)'
      case 'alert': return 'oklch(0.60 0.22 25)'
      case 'observation': return 'oklch(0.75 0.18 80)'
    }
  }

  const getCameraStatusColor = (status: CameraFeed['status']) => {
    switch (status) {
      case 'online': return 'oklch(0.70 0.20 145)'
      case 'offline': return 'oklch(0.60 0.22 25)'
      case 'error': return 'oklch(0.75 0.18 80)'
    }
  }

  const getThreatLevelColor = (level: ThreatPrediction['threatLevel']) => {
    switch (level) {
      case 'low': return 'oklch(0.70 0.20 145)'
      case 'moderate': return 'oklch(0.75 0.18 80)'
      case 'high': return 'oklch(0.75 0.15 40)'
      case 'critical': return 'oklch(0.60 0.22 25)'
    }
  }

  const getWeatherColor = (temp: number) => {
    if (temp < 0) return 'oklch(0.65 0.18 240)'
    if (temp < 10) return 'oklch(0.70 0.15 210)'
    if (temp < 20) return 'oklch(0.75 0.12 180)'
    if (temp < 30) return 'oklch(0.80 0.15 80)'
    return 'oklch(0.70 0.20 40)'
  }

  const onlineCameras = filteredCameras.filter(c => c.status === 'online').length
  const webcamCount = filteredCameras.filter(c => c.type === 'webcam').length
  const trafficCount = filteredCameras.filter(c => c.type === 'traffic' || c.type === 'ground').length
  const satelliteCount = filteredCameras.filter(c => c.type === 'satellite').length

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          size="sm"
          variant={activeLayer === 'all' ? 'default' : 'outline'}
          onClick={() => setUrlState({ panel: 'all' })}
        >
          All Layers ({events.length})
        </Button>
        <Button
          size="sm"
          variant={activeLayer === 'conflict' ? 'default' : 'outline'}
          onClick={() => setUrlState({ panel: 'conflict' })}
        >
          <Target size={16} className="mr-2" />
          Conflict ({events.filter(e => e.type === 'conflict').length})
        </Button>
        <Button
          size="sm"
          variant={activeLayer === 'satellite' ? 'default' : 'outline'}
          onClick={() => setUrlState({ panel: 'satellite' })}
        >
          <MapPin size={16} className="mr-2" />
          Satellite ({events.filter(e => e.type === 'satellite').length})
        </Button>
        <Button
          size="sm"
          variant={activeLayer === 'detection' ? 'default' : 'outline'}
          onClick={() => setUrlState({ panel: 'detection' })}
        >
          <Crosshair size={16} className="mr-2" />
          AI ({events.filter(e => e.type === 'detection').length})
        </Button>
        <Button
          size="sm"
          variant={activeLayer === 'cameras' ? 'default' : 'outline'}
          onClick={() => setUrlState({ panel: 'cameras' })}
        >
          <Video size={16} className="mr-2" />
          Webcams ({webcamCount})
        </Button>
        <Button
          size="sm"
          variant={activeLayer === 'traffic' ? 'default' : 'outline'}
          onClick={() => setUrlState({ panel: 'traffic' })}
        >
          <Car size={16} className="mr-2" />
          Traffic ({trafficCount})
        </Button>
        <div className="flex items-center gap-2 ml-auto">
          <Button
            size="sm"
            variant="outline"
            title="Export visible layers as GeoJSON"
            onClick={handleGeoJSONExport}
          >
            <Download size={16} />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setExportDialogOpen(true)}
          >
            <FilePdf size={16} className="mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <Card className="p-4 border-border bg-card/50">
        <div className="flex items-center gap-2 mb-3">
          <Funnel size={18} className="text-accent" weight="fill" />
          <h3 className="font-semibold text-sm">Camera Feed Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Camera Type</label>
            <Select value={filterType} onValueChange={(v) => setFilterType(v as CameraFeed['type'] | 'all')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types ({allCameras.length})</SelectItem>
                <SelectItem value="webcam">Webcams ({allCameras.filter(c => c.type === 'webcam').length})</SelectItem>
                <SelectItem value="traffic">Traffic ({allCameras.filter(c => c.type === 'traffic' || c.type === 'ground').length})</SelectItem>
                <SelectItem value="satellite">Satellites ({allCameras.filter(c => c.type === 'satellite').length})</SelectItem>
                <SelectItem value="aerial">Aerial ({allCameras.filter(c => c.type === 'aerial').length})</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Provider</label>
            <Select value={filterProvider} onValueChange={setFilterProvider}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="all">All Providers</SelectItem>
                {providers.map(provider => (
                  <SelectItem key={provider} value={provider}>
                    {provider} ({allCameras.filter(c => c.provider === provider).length})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Region/City Search</label>
            <Input
              placeholder="e.g. Tokyo, London, New York..."
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-3 text-xs text-muted-foreground">
          Showing {filteredCameras.length} of {allCameras.length} camera feeds ({onlineCameras} online)
        </div>
      </Card>

      <div className="flex items-center gap-6 flex-wrap bg-card/50 p-3 rounded border border-border">
        <div className="flex items-center gap-2">
          <Switch checked={showAnnotations} onCheckedChange={() => toggleLayer('annotations')} />
          <label className="text-sm flex items-center gap-1">
            <ChatCircle size={16} />
            Annotations ({annotationCount})
          </label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={showCameras} onCheckedChange={() => toggleLayer('cameras')} />
          <label className="text-sm flex items-center gap-1">
            <Eye size={16} />
            Camera Feeds ({filteredCameras.length})
          </label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={showSatellites} onCheckedChange={() => toggleLayer('satellites')} />
          <label className="text-sm flex items-center gap-1">
            <Planet size={16} />
            Satellite Orbits ({satellitePasses.length + (issData ? 1 : 0)})
          </label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={showWeather} onCheckedChange={() => toggleLayer('weather')} />
          <label className="text-sm flex items-center gap-1">
            <CloudRain size={16} />
            Weather Overlay ({weatherData.length} points)
          </label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={showThreats} onCheckedChange={() => toggleLayer('threats')} />
          <label className="text-sm flex items-center gap-1">
            <Warning size={16} />
            Threat Analysis ({filteredThreats.length} zones)
          </label>
        </div>
      </div>

      <Card className="p-0 overflow-hidden border-border">
        {loading ? (
          <div className="h-[600px] flex flex-col items-center justify-center bg-card">
            <div className="text-center w-full max-w-md px-8">
              <Spinner size={48} className="mx-auto mb-4 text-accent animate-spin" />
              <p className="text-muted-foreground mb-4">Loading geospatial intelligence data...</p>
              <Progress value={loadingProgress} className="w-full" />
              <p className="text-xs text-muted-foreground mt-2">{loadingProgress}% complete</p>
            </div>
          </div>
        ) : (
          <MapContainer
            center={mapCenter}
            zoom={urlState.zoom}
            style={{ height: '600px', width: '100%' }}
            className="z-0"
            doubleClickZoom={false}
          >
            <MapCenterSync
              center={mapCenter}
              zoom={urlState.zoom}
              onUserChange={(lat, lng, zoom) => setUrlState({ lat, lng, zoom })}
            />
            <AddAnnotationHandler onAddAnnotation={handleAddAnnotation} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            
            {filteredEvents.map(event => (
              <Circle
                key={event.id}
                center={[event.lat, event.lng]}
                radius={50000}
                pathOptions={{
                  fillColor: getSeverityColor(event.severity),
                  fillOpacity: 0.4,
                  color: getSeverityColor(event.severity),
                  weight: 2,
                  opacity: 0.8
                }}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                      {getTypeIcon(event.type)}
                      <h3 className="font-semibold text-sm">{event.title}</h3>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{event.description}</p>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        className="text-xs"
                        style={{ 
                          backgroundColor: getSeverityColor(event.severity),
                          color: 'white'
                        }}
                      >
                        {event.severity.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-gray-500">{event.type}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Source: {event.repository}
                    </p>
                  </div>
                </Popup>
              </Circle>
            ))}

            {showSatellites && satellitePasses.map(sat => (
              <Marker
                key={sat.id}
                position={[sat.lat, sat.lng]}
                icon={L.divIcon({
                  className: 'custom-icon',
                  html: `<div style="background-color: oklch(0.75 0.15 200); width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-center; border: 2px solid oklch(0.85 0.10 200); box-shadow: 0 0 12px oklch(0.75 0.15 200 / 0.6);">
                    <svg width="14" height="14" viewBox="0 0 256 256" fill="white"><path d="M245.66,77.66l-29.9,29.9C209.72,177.43,150.67,232,80,232c-14.52,0-26.49-2.3-35.58-6.84-7.33-3.67-10.33-7.5-11.08-8.72a8,8,0,0,1,3.85-11.93c.26-.1,24.24-9.31,39.47-26.84a110.93,110.93,0,0,1-21.88-24.2c-12.4-18.41-26.28-50.39-22-98.18a8,8,0,0,1,13.65-4.92c.35.35,33.28,33.1,73.54,43.72V88a47.87,47.87,0,0,1,14.36-34.3L167.67,20.34a8,8,0,0,1,11.31,0l60.94,60.61A8,8,0,0,1,245.66,77.66Z"></path></svg>
                  </div>`,
                  iconSize: [24, 24],
                  iconAnchor: [12, 12]
                })}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                      <Planet size={16} weight="fill" />
                      <h3 className="font-semibold text-sm">{sat.name}</h3>
                    </div>
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-mono">{sat.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Altitude:</span>
                        <span className="font-mono">{sat.altitude} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Velocity:</span>
                        <span className="font-mono">{sat.velocity.toFixed(2)} km/s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Next Pass:</span>
                        <span className="font-mono text-xs">{sat.nextPass.toLocaleTimeString()}</span>
                      </div>
                      {sat.noradId && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">NORAD ID:</span>
                          <span className="font-mono">{sat.noradId}</span>
                        </div>
                      )}
                    </div>
                    <Badge className="mt-2 w-full justify-center" style={{ backgroundColor: 'oklch(0.70 0.20 145)', color: 'white' }}>
                      {sat.status.toUpperCase()}
                    </Badge>
                  </div>
                </Popup>
              </Marker>
            ))}

            {showSatellites && issData && (
              <Marker
                position={[issData.position.lat, issData.position.lng]}
                icon={L.divIcon({
                  className: 'custom-icon',
                  html: `<div style="background-color: oklch(0.70 0.22 25); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-center; border: 3px solid oklch(0.95 0 0); box-shadow: 0 0 20px oklch(0.70 0.22 25 / 0.8); animation: pulse-glow 2s ease-in-out infinite;">
                    <svg width="18" height="18" viewBox="0 0 256 256" fill="white"><path d="M230.91,124A102.38,102.38,0,0,1,232,138.17a8,8,0,0,1-8,8H32a8,8,0,0,1-8-8A102.38,102.38,0,0,1,25.09,124,8,8,0,0,1,24,119.92C24,76.7,61.85,41.64,108.51,40A8,8,0,0,1,116,47.9v56L77.24,137.07a8,8,0,0,0,5.21,14.61L128,144l45.55,7.72a8,8,0,0,0,5.21-14.61L140,104V47.9a8,8,0,0,1,7.49-7.92C194.15,41.64,232,76.7,232,119.92A8,8,0,0,1,230.91,124Z"></path></svg>
                  </div>`,
                  iconSize: [32, 32],
                  iconAnchor: [16, 16]
                })}
              >
                <Popup className="iss-popup" maxWidth={400}>
                  <div className="p-2 min-w-[300px]">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Rocket size={20} weight="fill" className="text-red-500" />
                        <h3 className="font-semibold text-base">International Space Station</h3>
                      </div>
                      <div className="flex items-center gap-1 bg-red-500/20 px-2 py-1 rounded">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-xs font-mono text-red-500">LIVE</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Altitude:</span>
                        <span className="font-mono font-bold">{issData.altitude} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Velocity:</span>
                        <span className="font-mono font-bold">{issData.velocity} km/s</span>
                      </div>
                      <div className="flex justify-between col-span-2">
                        <span className="text-gray-600">Orbital Period:</span>
                        <span className="font-mono">92.9 minutes</span>
                      </div>
                    </div>

                    <div className="mb-2">
                      <p className="text-xs font-semibold text-gray-700 mb-1">Current Crew:</p>
                      <div className="text-xs space-y-0.5">
                        {issData.crew.map((member, idx) => (
                          <div key={idx} className="text-gray-600 pl-2">• {member}</div>
                        ))}
                      </div>
                    </div>

                    <div className="aspect-video bg-black rounded overflow-hidden mb-2">
                      <iframe
                        src={issData.liveStreamUrl}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="ISS Live Stream"
                      />
                    </div>
                    
                    <p className="text-xs text-gray-500 text-center">NASA TV - Live Earth Views from ISS</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {showWeather && weatherData.map(weather => (
              <Circle
                key={weather.id}
                center={[weather.lat, weather.lng]}
                radius={200000}
                pathOptions={{
                  fillColor: getWeatherColor(weather.temperature),
                  fillOpacity: 0.2,
                  color: getWeatherColor(weather.temperature),
                  weight: 1,
                  opacity: 0.4
                }}
              >
                <Popup>
                  <div className="p-2 min-w-[180px]">
                    <div className="flex items-center gap-2 mb-2">
                      <CloudRain size={16} />
                      <h3 className="font-semibold text-sm">Weather Data</h3>
                    </div>
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Temperature:</span>
                        <span className="font-mono">{weather.temperature}°C</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Conditions:</span>
                        <span>{weather.conditions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Wind:</span>
                        <span className="font-mono">{weather.windSpeed} km/h @ {weather.windDirection}°</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Humidity:</span>
                        <span className="font-mono">{weather.humidity}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Visibility:</span>
                        <span className="font-mono">{weather.visibility} km</span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Circle>
            ))}

            {showThreats && filteredThreats.map(threat => (
              <Rectangle
                key={threat.id}
                bounds={[
                  [threat.lat - 1, threat.lng - 1],
                  [threat.lat + 1, threat.lng + 1]
                ]}
                pathOptions={{
                  fillColor: getThreatLevelColor(threat.threatLevel),
                  fillOpacity: 0.3,
                  color: getThreatLevelColor(threat.threatLevel),
                  weight: 3,
                  opacity: 0.8,
                  dashArray: '10, 5'
                }}
              >
                <Popup>
                  <div className="p-2 min-w-[250px]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Warning size={16} weight="fill" />
                        <h3 className="font-semibold text-sm">Threat Analysis</h3>
                      </div>
                      <Badge 
                        style={{ 
                          backgroundColor: getThreatLevelColor(threat.threatLevel),
                          color: 'white'
                        }}
                      >
                        {threat.threatLevel.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs mb-2">{threat.prediction}</p>
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Confidence:</span>
                        <span className="font-mono">{(threat.confidence * 100).toFixed(1)}%</span>
                      </div>
                      {threat.factors.length > 0 && (
                        <div className="mt-2">
                          <span className="text-gray-600">Factors:</span>
                          <ul className="list-disc list-inside ml-2 mt-1">
                            {threat.factors.slice(0, 3).map((factor, idx) => (
                              <li key={idx} className="text-xs">{factor}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Rectangle>
            ))}

            {showAnnotations && (annotations || []).map(annotation => (
              <Marker
                key={annotation.id}
                position={[annotation.lat, annotation.lng]}
                icon={L.divIcon({
                  className: 'custom-icon',
                  html: `<div style="background-color: ${getAnnotationColor(annotation.type)}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-center; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
                    <svg width="16" height="16" viewBox="0 0 256 256" fill="white"><path d="M128,24A104,104,0,0,0,36.18,176.88L24.83,210.93a16,16,0,0,0,20.24,20.24l34.05-11.35A104,104,0,1,0,128,24Zm0,192a87.87,87.87,0,0,1-44.06-11.81,8,8,0,0,0-6.54-.67L40,216,52.47,178.6a8,8,0,0,0-.66-6.54A88,88,0,1,1,128,216Z"></path></svg>
                  </div>`,
                  iconSize: [30, 30],
                  iconAnchor: [15, 15]
                })}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <div className="flex items-center justify-between mb-2">
                      <Badge 
                        variant="outline"
                        style={{ borderColor: getAnnotationColor(annotation.type), color: getAnnotationColor(annotation.type) }}
                      >
                        {annotation.type.toUpperCase()}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-6 w-6 p-0"
                        onClick={() => deleteAnnotation(annotation.id)}
                      >
                        <X size={14} />
                      </Button>
                    </div>
                    <p className="text-sm mb-2">{annotation.content}</p>
                    <p className="text-xs text-gray-500">By: {annotation.author}</p>
                    <p className="text-xs text-gray-500">{annotation.timestamp.toLocaleString()}</p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {showCameras && filteredCameras.map(camera => {
              const iconColor = getCameraStatusColor(camera.status)
              const cameraIcon = camera.type === 'traffic' || camera.type === 'ground' ? 
                '<svg width="16" height="16" viewBox="0 0 256 256" fill="white"><path d="M240,112H229.2L201.42,49.5A16,16,0,0,0,186.8,40H69.2a16,16,0,0,0-14.62,9.5L26.8,112H16a8,8,0,0,0,0,16h8v80a16,16,0,0,0,16,16H64a16,16,0,0,0,16-16V192h96v16a16,16,0,0,0,16,16h24a16,16,0,0,0,16-16V128h8a8,8,0,0,0,0-16ZM69.2,56H186.8l24.89,56H44.31ZM64,208H40V192H64Zm128,0V192h24v16Zm24-32H40V128H216ZM56,152a8,8,0,0,1,8-8H80a8,8,0,0,1,0,16H64A8,8,0,0,1,56,152Zm112,0a8,8,0,0,1,8-8h16a8,8,0,0,1,0,16H176A8,8,0,0,1,168,152Z"></path></svg>' :
                '<svg width="16" height="16" viewBox="0 0 256 256" fill="white"><path d="M251.77,73a8,8,0,0,0-8.21.39L208,97.05V72a16,16,0,0,0-16-16H32A16,16,0,0,0,16,72V184a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V159l35.56,23.71A8,8,0,0,0,248,184a8,8,0,0,0,8-8V80A8,8,0,0,0,251.77,73ZM192,184H32V72H192V184Zm48-22.95-32-21.33V116.28L240,95Z"></path></svg>'
              
              return (
                <Marker
                  key={camera.id}
                  position={[camera.lat, camera.lng]}
                  icon={L.divIcon({
                    className: 'custom-icon',
                    html: `<div style="background-color: ${iconColor}; width: 28px; height: 28px; border-radius: 4px; display: flex; align-items: center; justify-center; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
                      ${cameraIcon}
                    </div>`,
                    iconSize: [28, 28],
                    iconAnchor: [14, 14]
                  })}
                  eventHandlers={{
                    click: () => {
                      setSelectedCamera(camera)
                      setCameraDialogOpen(true)
                    }
                  }}
                >
                  <Popup>
                    <div className="p-2 min-w-[200px]">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-sm">{camera.name}</h3>
                        <Badge 
                          style={{ 
                            backgroundColor: getCameraStatusColor(camera.status),
                            color: 'white'
                          }}
                        >
                          {camera.status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">Type: {camera.type}</p>
                      <p className="text-xs text-gray-600 mb-1">Provider: {camera.provider}</p>
                      <p className="text-xs text-gray-500 font-mono">ID: {camera.id}</p>
                      <Button 
                        size="sm" 
                        className="w-full mt-2"
                        onClick={() => {
                          setSelectedCamera(camera)
                          setCameraDialogOpen(true)
                        }}
                      >
                        View Feed
                      </Button>
                    </div>
                  </Popup>
                </Marker>
              )
            })}
          </MapContainer>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <AnimatePresence>
          {[
            { key: 'events', label: 'Total Events', value: events.length, color: 'oklch(0.75 0.15 200)' },
            { key: 'webcams', label: 'Webcams', value: webcamCount, color: 'oklch(0.70 0.20 145)' },
            { key: 'traffic', label: 'Traffic Cameras', value: trafficCount, color: 'oklch(0.75 0.18 80)' },
            { key: 'satellites', label: 'Satellites', value: satelliteCount + satellitePasses.length + (issData ? 1 : 0), color: 'oklch(0.75 0.15 40)' },
            { key: 'threats', label: 'High Threat Zones', value: filteredThreats.length, color: 'oklch(0.60 0.22 25)' }
          ].map(({ key, label, value, color }) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Card className="p-4 border-border bg-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{label}</span>
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                </div>
                <div className="text-2xl font-bold text-foreground">{value}</div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Dialog open={annotationDialogOpen} onOpenChange={setAnnotationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Map Annotation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={annotationType === 'note' ? 'default' : 'outline'}
                  onClick={() => setAnnotationType('note')}
                >
                  Note
                </Button>
                <Button
                  size="sm"
                  variant={annotationType === 'alert' ? 'default' : 'outline'}
                  onClick={() => setAnnotationType('alert')}
                >
                  Alert
                </Button>
                <Button
                  size="sm"
                  variant={annotationType === 'observation' ? 'default' : 'outline'}
                  onClick={() => setAnnotationType('observation')}
                >
                  Observation
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Content</label>
              <Textarea
                placeholder="Enter annotation details..."
                value={annotationContent}
                onChange={(e) => setAnnotationContent(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAnnotationDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveAnnotation}>
                Save Annotation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={cameraDialogOpen} onOpenChange={setCameraDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedCamera?.name}</DialogTitle>
          </DialogHeader>
          {selectedCamera && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <Badge 
                    className="ml-2"
                    style={{ 
                      backgroundColor: getCameraStatusColor(selectedCamera.status),
                      color: 'white'
                    }}
                  >
                    {selectedCamera.status.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <span className="ml-2 font-medium">{selectedCamera.type}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Provider:</span>
                  <span className="ml-2 font-medium">{selectedCamera.provider}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Camera ID:</span>
                  <span className="ml-2 font-mono text-xs">{selectedCamera.id}</span>
                </div>
              </div>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                {selectedCamera.status === 'online' ? (
                  <div className="text-center w-full h-full relative">
                    {selectedCamera.embedUrl && selectedCamera.type === 'webcam' ? (
                      <div className="w-full h-full relative">
                        <iframe
                          src={selectedCamera.embedUrl}
                          className="w-full h-full border-0 rounded"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title={selectedCamera.name}
                        />
                        <div className="absolute top-2 right-2 flex items-center gap-2 bg-background/90 px-2 py-1 rounded z-10">
                          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                          <span className="text-xs font-mono">LIVE</span>
                        </div>
                      </div>
                    ) : selectedCamera.thumbnail ? (
                      <div className="w-full h-full relative">
                        <img 
                          src={selectedCamera.thumbnail} 
                          alt={selectedCamera.name}
                          className="w-full h-full object-cover rounded"
                        />
                        <div className="absolute top-2 right-2 flex items-center gap-2 bg-background/90 px-2 py-1 rounded">
                          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                          <span className="text-xs font-mono">LIVE</span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4">
                        <Video size={64} className="mx-auto mb-4 text-accent" weight="fill" />
                        <p className="text-sm text-muted-foreground">Live feed from {selectedCamera.name}</p>
                        <p className="text-xs text-muted-foreground mt-1 font-mono break-all px-4">{selectedCamera.streamUrl}</p>
                        <div className="mt-4 flex items-center justify-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                          <span className="text-xs font-mono">LIVE</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <Video size={64} className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Camera {selectedCamera.status}</p>
                    <p className="text-xs text-muted-foreground mt-1">Last frame: {selectedCamera.lastFrame.toLocaleString()}</p>
                  </div>
                )}
              </div>
              {selectedCamera.type === 'webcam' && selectedCamera.status === 'online' && selectedCamera.embedUrl && (
                <Button 
                  className="w-full" 
                  onClick={() => window.open(selectedCamera.embedUrl || selectedCamera.streamUrl, '_blank')}
                >
                  <Video size={16} className="mr-2" />
                  Open Full Screen
                </Button>
              )}
              <p className="text-xs text-muted-foreground">
                Coordinates: {selectedCamera.lat.toFixed(4)}, {selectedCamera.lng.toFixed(4)}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Intelligence Report</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Generate a comprehensive PDF report including:
            </p>
            <ul className="text-sm space-y-2 ml-4">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" />
                Team Annotations ({annotationCount})
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" />
                ML Predictions ({(mlPredictions || []).length})
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" />
                Threat Analysis ({threatPredictions.length} zones)
              </li>
              {showWeather && (
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  Weather Data ({weatherData.length} points)
                </li>
              )}
            </ul>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setExportDialogOpen(false)} disabled={exporting}>
                Cancel
              </Button>
              <Button onClick={handleExport} disabled={exporting}>
                {exporting ? (
                  <>
                    <Spinner size={16} className="mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FilePdf size={16} className="mr-2" />
                    Generate PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="p-4 border-border bg-card/50">
        <div className="flex items-start gap-3">
          <PushPin size={20} className="text-accent mt-1" weight="fill" />
          <div>
            <h3 className="font-semibold text-sm mb-1">Advanced Intelligence Features</h3>
            <p className="text-xs text-muted-foreground">
              This platform integrates {allCameras.length}+ camera feeds including {webcamCount} live webcams, {trafficCount} traffic cameras from major cities worldwide, and {satelliteCount} satellite imagery feeds with real orbital data from {satellitePasses.length + (issData ? 1 : 0)} earth observation satellites including the <strong>International Space Station with live NASA TV feed</strong>. Filter cameras by region, provider, or type. <strong>Double-click the map to add collaborative team annotations</strong> that sync in real-time across all users. Toggle satellite orbits to track real-time positions including ISS, Hubble, Sentinel-2, Landsat 8/9, and NOAA weather satellites. Enable <strong>live weather overlay</strong> powered by Open-Meteo API showing real-time temperature, wind, humidity, and conditions globally. Enable threat predictions to visualize high-risk zones based on historical data patterns. Use the Export PDF button to generate comprehensive intelligence reports including all annotations, ML predictions, threat assessments, and weather data.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
