import { useEffect, useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents, Rectangle } from 'react-leaflet'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { MapEvent, MapAnnotation, CameraFeed, WeatherData, ThreatPrediction, MLPrediction } from '@/lib/types'
import { fetchAllRepositories } from '@/lib/github-api'
import { generate300PlusCameraFeeds } from '@/lib/camera-generator'
import { generateWeatherGrid } from '@/lib/weather-api'
import { generateThreatPredictions } from '@/lib/threat-analysis'
import { generatePDFReport } from '@/lib/pdf-export'
import { MapPin, Target, Crosshair, ChartLine, ChatCircle, Video, Eye, PushPin, X, CloudRain, Warning, FilePdf, Spinner } from '@phosphor-icons/react'
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

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])
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

export function CollaborativeMap() {
  const [events, setEvents] = useState<MapEvent[]>([])
  const [annotations, setAnnotations] = useKV<MapAnnotation[]>("map-annotations", [])
  const [cameraFeeds, setCameraFeeds] = useState<CameraFeed[]>([])
  const [weatherData, setWeatherData] = useState<WeatherData[]>([])
  const [threatPredictions, setThreatPredictions] = useState<ThreatPrediction[]>([])
  const [mlPredictions, setMLPredictions] = useKV<MLPrediction[]>("ml-predictions", [])
  
  const [activeLayer, setActiveLayer] = useState<'all' | 'conflict' | 'satellite' | 'detection' | 'cameras'>('all')
  const [mapCenter, setMapCenter] = useState<[number, number]>([20, 0])
  const [loading, setLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  
  const [showAnnotations, setShowAnnotations] = useState(true)
  const [showCameras, setShowCameras] = useState(true)
  const [showWeather, setShowWeather] = useState(false)
  const [showThreats, setShowThreats] = useState(false)
  
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
        setLoadingProgress(10)
        const repos = await fetchAllRepositories()
        setLoadingProgress(20)
        
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
        setLoadingProgress(40)

        const cameras = generate300PlusCameraFeeds()
        setCameraFeeds(cameras)
        setLoadingProgress(60)

        const weather = await generateWeatherGrid(40)
        setWeatherData(weather)
        setLoadingProgress(80)

        const threats = await generateThreatPredictions(generatedEvents, 40)
        setThreatPredictions(threats)
        setLoadingProgress(100)

        setLoading(false)
        toast.success(`Loaded ${cameras.length} camera feeds, ${weather.length} weather points, and ${threats.length} threat zones`)
      } catch (error) {
        console.error('Error loading data:', error)
        setLoading(false)
        toast.error('Failed to load some data')
      }
    }

    loadRealData()
  }, [])

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

  const filteredEvents = events.filter(event => 
    activeLayer === 'all' || activeLayer === 'cameras' || event.type === activeLayer
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

  const onlineCameras = cameraFeeds.filter(c => c.status === 'online').length

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          size="sm"
          variant={activeLayer === 'all' ? 'default' : 'outline'}
          onClick={() => setActiveLayer('all')}
        >
          All Layers ({events.length})
        </Button>
        <Button
          size="sm"
          variant={activeLayer === 'conflict' ? 'default' : 'outline'}
          onClick={() => setActiveLayer('conflict')}
        >
          <Target size={16} className="mr-2" />
          Conflict ({events.filter(e => e.type === 'conflict').length})
        </Button>
        <Button
          size="sm"
          variant={activeLayer === 'satellite' ? 'default' : 'outline'}
          onClick={() => setActiveLayer('satellite')}
        >
          <MapPin size={16} className="mr-2" />
          Satellite ({events.filter(e => e.type === 'satellite').length})
        </Button>
        <Button
          size="sm"
          variant={activeLayer === 'detection' ? 'default' : 'outline'}
          onClick={() => setActiveLayer('detection')}
        >
          <Crosshair size={16} className="mr-2" />
          AI ({events.filter(e => e.type === 'detection').length})
        </Button>
        <Button
          size="sm"
          variant={activeLayer === 'cameras' ? 'default' : 'outline'}
          onClick={() => setActiveLayer('cameras')}
        >
          <Video size={16} className="mr-2" />
          Cameras ({cameraFeeds.length})
        </Button>
        <div className="flex items-center gap-2 ml-auto">
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

      <div className="flex items-center gap-6 flex-wrap bg-card/50 p-3 rounded border border-border">
        <div className="flex items-center gap-2">
          <Switch checked={showAnnotations} onCheckedChange={setShowAnnotations} />
          <label className="text-sm flex items-center gap-1">
            <ChatCircle size={16} />
            Annotations ({annotationCount})
          </label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={showCameras} onCheckedChange={setShowCameras} />
          <label className="text-sm flex items-center gap-1">
            <Eye size={16} />
            Camera Feeds ({onlineCameras} online)
          </label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={showWeather} onCheckedChange={setShowWeather} />
          <label className="text-sm flex items-center gap-1">
            <CloudRain size={16} />
            Weather Overlay ({weatherData.length} points)
          </label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={showThreats} onCheckedChange={setShowThreats} />
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
            zoom={2}
            style={{ height: '600px', width: '100%' }}
            className="z-0"
            doubleClickZoom={false}
          >
            <MapUpdater center={mapCenter} />
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

            {showCameras && cameraFeeds.map(camera => (
              <Marker
                key={camera.id}
                position={[camera.lat, camera.lng]}
                icon={L.divIcon({
                  className: 'custom-icon',
                  html: `<div style="background-color: ${getCameraStatusColor(camera.status)}; width: 28px; height: 28px; border-radius: 4px; display: flex; align-items: center; justify-center; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
                    <svg width="16" height="16" viewBox="0 0 256 256" fill="white"><path d="M251.77,73a8,8,0,0,0-8.21.39L208,97.05V72a16,16,0,0,0-16-16H32A16,16,0,0,0,16,72V184a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V159l35.56,23.71A8,8,0,0,0,248,184a8,8,0,0,0,8-8V80A8,8,0,0,0,251.77,73ZM192,184H32V72H192V184Zm48-22.95-32-21.33V116.28L240,95Z"></path></svg>
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
            ))}
          </MapContainer>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AnimatePresence>
          {[
            { key: 'events', label: 'Total Events', value: events.length, color: 'oklch(0.75 0.15 200)' },
            { key: 'cameras', label: 'Camera Feeds', value: cameraFeeds.length, color: 'oklch(0.70 0.20 145)' },
            { key: 'online', label: 'Cameras Online', value: onlineCameras, color: 'oklch(0.70 0.20 145)' },
            { key: 'threats', label: 'High Threat Zones', value: filteredThreats.length, color: 'oklch(0.75 0.15 40)' }
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
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                {selectedCamera.status === 'online' ? (
                  <div className="text-center">
                    <Video size={64} className="mx-auto mb-4 text-accent" weight="fill" />
                    <p className="text-sm text-muted-foreground">Live feed from {selectedCamera.name}</p>
                    <p className="text-xs text-muted-foreground mt-1 font-mono break-all px-4">{selectedCamera.streamUrl}</p>
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-xs font-mono">LIVE</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <Video size={64} className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Camera {selectedCamera.status}</p>
                    <p className="text-xs text-muted-foreground mt-1">Last frame: {selectedCamera.lastFrame.toLocaleString()}</p>
                  </div>
                )}
              </div>
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
              Double-click the map to add annotations. Toggle weather overlay for environmental analysis. Enable threat predictions to visualize high-risk zones based on historical data patterns. Use the Export PDF button to generate comprehensive intelligence reports including all annotations, ML predictions, and threat assessments.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
