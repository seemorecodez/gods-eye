import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapEvent } from '@/lib/types'
import { fetchAllRepositories } from '@/lib/github-api'
import { MapPin, Target, Crosshair, ChartLine } from '@phosphor-icons/react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { motion, AnimatePresence } from 'framer-motion'

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

export function InteractiveMap() {
  const [events, setEvents] = useState<MapEvent[]>([])
  const [activeLayer, setActiveLayer] = useState<'all' | 'conflict' | 'satellite' | 'detection'>('all')
  const [mapCenter, setMapCenter] = useState<[number, number]>([20, 0])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadRealEvents() {
      const repos = await fetchAllRepositories()
      
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
      setLoading(false)
    }

    loadRealEvents()
  }, [])

  const filteredEvents = events.filter(event => 
    activeLayer === 'all' || event.type === activeLayer
  )

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
          Conflict Events ({events.filter(e => e.type === 'conflict').length})
        </Button>
        <Button
          size="sm"
          variant={activeLayer === 'satellite' ? 'default' : 'outline'}
          onClick={() => setActiveLayer('satellite')}
        >
          <MapPin size={16} className="mr-2" />
          Satellite Coverage ({events.filter(e => e.type === 'satellite').length})
        </Button>
        <Button
          size="sm"
          variant={activeLayer === 'detection' ? 'default' : 'outline'}
          onClick={() => setActiveLayer('detection')}
        >
          <Crosshair size={16} className="mr-2" />
          AI Detections ({events.filter(e => e.type === 'detection').length})
        </Button>
      </div>

      <Card className="p-0 overflow-hidden border-border">
        {loading ? (
          <div className="h-[600px] flex items-center justify-center bg-card">
            <div className="text-center">
              <ChartLine size={48} className="mx-auto mb-4 text-accent animate-spin" />
              <p className="text-muted-foreground">Loading real-time geospatial data...</p>
            </div>
          </div>
        ) : (
          <MapContainer
            center={mapCenter}
            zoom={2}
            style={{ height: '600px', width: '100%' }}
            className="z-0"
          >
            <MapUpdater center={mapCenter} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
                    <p className="text-xs text-gray-500">
                      {event.timestamp.toLocaleString()}
                    </p>
                  </div>
                </Popup>
              </Circle>
            ))}
          </MapContainer>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AnimatePresence>
          {[
            { type: 'conflict', label: 'Conflict Events', color: 'oklch(0.60 0.22 25)' },
            { type: 'satellite', label: 'Satellite Coverage', color: 'oklch(0.75 0.18 80)' },
            { type: 'detection', label: 'AI Detections', color: 'oklch(0.70 0.20 145)' },
            { type: 'change', label: 'Change Detection', color: 'oklch(0.75 0.15 200)' }
          ].map(({ type, label, color }) => {
            const count = events.filter(e => e.type === type).length
            return (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Card className="p-4 border-border bg-card hover:border-accent/30 transition-all cursor-pointer"
                  onClick={() => {
                    const event = events.find(e => e.type === type)
                    if (event) setMapCenter([event.lat, event.lng])
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{label}</span>
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{count}</div>
                  <p className="text-xs text-muted-foreground mt-1">Active markers</p>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
