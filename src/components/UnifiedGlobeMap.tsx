import { useEffect, useState, useRef, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MapAnnotation, CameraFeed, WeatherData, ThreatPrediction, MLPrediction } from '@/lib/types'
import { Flight, fetchRealFlights, generateFlights, getMilitaryFlights, getCivilianFlights } from '@/lib/airline-traffic'
import { fetchWindyWebcams } from '@/lib/windy-webcams-api'
import { fetchSatellitePasses, generateSatelliteImageryFeeds, SatellitePass } from '@/lib/satellite-api'
import { generateWeatherGrid } from '@/lib/weather-api'
import { generateThreatPredictions } from '@/lib/threat-analysis'
import { generatePDFReport } from '@/lib/pdf-export'
import { Globe, Airplane, Video, CloudRain, Warning, FilePdf, Spinner, MapPin, ChatCircle, Planet, Eye, Target, ArrowsClockwise, X, Funnel, ShieldCheck } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import * as THREE from 'three'

interface GlobePoint {
  id: string
  lat: number
  lng: number
  type: 'flight' | 'camera' | 'satellite' | 'weather' | 'threat' | 'annotation'
  data: any
}

export function UnifiedGlobeMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const globeRef = useRef<THREE.Mesh | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  
  const [flights, setFlights] = useState<Flight[]>([])
  const [cameras, setCameras] = useState<CameraFeed[]>([])
  const [satellites, setSatellites] = useState<SatellitePass[]>([])
  const [weatherData, setWeatherData] = useState<WeatherData[]>([])
  const [threatPredictions, setThreatPredictions] = useState<ThreatPrediction[]>([])
  const [annotations, setAnnotations] = useKV<MapAnnotation[]>("globe-annotations", [])
  const [mlPredictions, setMLPredictions] = useKV<MLPrediction[]>("ml-predictions", [])
  
  const [loading, setLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [useRealData, setUseRealData] = useState(true)
  const [autoRotate, setAutoRotate] = useState(true)
  
  const [showFlights, setShowFlights] = useState(true)
  const [showCameras, setShowCameras] = useState(true)
  const [showSatellites, setShowSatellites] = useState(false)
  const [showWeather, setShowWeather] = useState(false)
  const [showThreats, setShowThreats] = useState(false)
  const [showAnnotations, setShowAnnotations] = useState(true)
  const [militaryOnly, setMilitaryOnly] = useState(false)
  
  const [selectedItem, setSelectedItem] = useState<GlobePoint | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<GlobePoint | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null)
  
  const [annotationDialogOpen, setAnnotationDialogOpen] = useState(false)
  const [newAnnotation, setNewAnnotation] = useState<{ lat: number; lng: number } | null>(null)
  const [annotationContent, setAnnotationContent] = useState('')
  const [annotationType, setAnnotationType] = useState<'note' | 'alert' | 'observation'>('note')
  
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  const [filterProvider, setFilterProvider] = useState<string>('all')
  const [filterType, setFilterType] = useState<CameraFeed['type'] | 'all'>('all')

  const filteredFlights = useMemo(() => {
    if (militaryOnly) {
      return getMilitaryFlights(flights)
    }
    return flights
  }, [flights, militaryOnly])

  const filteredCameras = useMemo(() => {
    return cameras.filter(cam => {
      if (filterProvider !== 'all' && cam.provider !== filterProvider) return false
      if (filterType !== 'all' && cam.type !== filterType) return false
      return true
    })
  }, [cameras, filterProvider, filterType])

  const uniqueProviders = useMemo(() => {
    const providers = new Set(cameras.map(c => c.provider))
    return Array.from(providers).sort()
  }, [cameras])

  useEffect(() => {
    async function loadAllData() {
      try {
        setLoadingProgress(10)
        
        let flightData: Flight[]
        if (useRealData) {
          toast.info('Fetching live flight data from OpenSky Network...')
          flightData = await fetchRealFlights(500)
          toast.success(`Loaded ${flightData.length} real flights`)
        } else {
          flightData = generateFlights(500)
        }
        setFlights(flightData)
        setLoadingProgress(25)
        
        toast.info('Loading camera feeds...')
        const cameraData = await fetchWindyWebcams(300)
        setCameras(cameraData)
        setLoadingProgress(40)
        
        const satelliteData = fetchSatellitePasses()
        setSatellites(satelliteData)
        setLoadingProgress(55)
        
        if (showWeather) {
          toast.info('Fetching live weather data...')
          const weather = await generateWeatherGrid(10)
          setWeatherData(weather)
        }
        setLoadingProgress(70)
        
        const threats = await generateThreatPredictions([])
        setThreatPredictions(threats)
        setLoadingProgress(85)
        
        setLoadingProgress(100)
        setLoading(false)
        
        toast.success('All data loaded successfully')
      } catch (error) {
        console.error('Error loading data:', error)
        toast.error('Failed to load some data sources')
        setLoading(false)
      }
    }
    
    loadAllData()
  }, [useRealData, showWeather])

  useEffect(() => {
    if (!containerRef.current || loading) return

    const width = containerRef.current.clientWidth
    const height = containerRef.current.clientHeight

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a0f)
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.z = 300
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    rendererRef.current = renderer
    containerRef.current.appendChild(renderer.domElement)

    const ambientLight = new THREE.AmbientLight(0x404040, 2)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5)
    directionalLight.position.set(5, 3, 5)
    scene.add(directionalLight)

    const pointLight = new THREE.PointLight(0x4fc3f7, 1, 400)
    pointLight.position.set(-50, 50, 50)
    scene.add(pointLight)

    const geometry = new THREE.SphereGeometry(100, 64, 64)
    
    const textureLoader = new THREE.TextureLoader()
    const earthTexture = createEarthTexture()
    
    const material = new THREE.MeshPhongMaterial({
      map: earthTexture,
      bumpScale: 0.5,
      specular: new THREE.Color(0x333333),
      shininess: 10,
      transparent: true,
      opacity: 0.95
    })

    const globe = new THREE.Mesh(geometry, material)
    globeRef.current = globe
    scene.add(globe)

    const atmosphereGeometry = new THREE.SphereGeometry(102, 64, 64)
    const atmosphereMaterial = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
        }
      `
    })
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial)
    scene.add(atmosphere)

    addDataPoints(scene)

    let mouseX = 0
    let mouseY = 0
    let targetRotationX = 0
    let targetRotationY = 0

    const handleMouseMove = (event: MouseEvent) => {
      if (!containerRef.current || !cameraRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      mouseX = ((event.clientX - rect.left) / width) * 2 - 1
      mouseY = -((event.clientY - rect.top) / height) * 2 + 1
      
      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current)
      
      const points = scene.children.filter(child => 
        child.userData.type && child.userData.type !== 'globe'
      )
      
      const intersects = raycaster.intersectObjects(points)
      
      if (intersects.length > 0) {
        const hovered = intersects[0].object
        if (hovered.userData.point) {
          setHoveredItem(hovered.userData.point)
          setTooltipPosition({ x: event.clientX, y: event.clientY })
          if (containerRef.current) {
            containerRef.current.style.cursor = 'pointer'
          }
        }
      } else {
        setHoveredItem(null)
        setTooltipPosition(null)
        if (containerRef.current) {
          containerRef.current.style.cursor = autoRotate ? 'default' : 'grab'
        }
      }
    }

    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current || !cameraRef.current) return
      
      const rect = containerRef.current.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / width) * 2 - 1
      const y = -((event.clientY - rect.top) / height) * 2 + 1
      
      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current)
      
      const points = scene.children.filter(child => 
        child.userData.type && child.userData.type !== 'globe'
      )
      
      const intersects = raycaster.intersectObjects(points)
      
      if (intersects.length > 0) {
        const selected = intersects[0].object
        if (selected.userData.point) {
          setSelectedItem(selected.userData.point)
          setDetailsOpen(true)
        }
      }
    }

    containerRef.current.addEventListener('mousemove', handleMouseMove)
    containerRef.current.addEventListener('click', handleClick)

    const animate = () => {
      if (!globe || !renderer || !scene || !camera) return

      if (autoRotate) {
        globe.rotation.y += 0.001
      } else {
        targetRotationY = mouseX * 0.5
        targetRotationX = mouseY * 0.3
        
        globe.rotation.y += (targetRotationY - globe.rotation.y) * 0.05
        globe.rotation.x += (targetRotationX - globe.rotation.x) * 0.05
      }

      renderer.render(scene, camera)
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return
      
      const newWidth = containerRef.current.clientWidth
      const newHeight = containerRef.current.clientHeight
      
      camera.aspect = newWidth / newHeight
      camera.updateProjectionMatrix()
      renderer.setSize(newWidth, newHeight)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (containerRef.current && renderer) {
        containerRef.current.removeChild(renderer.domElement)
      }
      window.removeEventListener('resize', handleResize)
      containerRef.current?.removeEventListener('mousemove', handleMouseMove)
      containerRef.current?.removeEventListener('click', handleClick)
    }
  }, [loading, autoRotate])

  useEffect(() => {
    if (!sceneRef.current || loading) return
    
    sceneRef.current.children = sceneRef.current.children.filter(child => 
      child instanceof THREE.Light || 
      child === globeRef.current ||
      child.type === 'Mesh' && (child as THREE.Mesh).geometry instanceof THREE.SphereGeometry
    )
    
    addDataPoints(sceneRef.current)
  }, [flights, cameras, satellites, weatherData, threatPredictions, annotations, showFlights, showCameras, showSatellites, showWeather, showThreats, showAnnotations, filteredFlights, filteredCameras, loading, militaryOnly])

  function createEarthTexture(): THREE.Texture {
    const canvas = document.createElement('canvas')
    canvas.width = 2048
    canvas.height = 1024
    const ctx = canvas.getContext('2d')!
    
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, '#1a237e')
    gradient.addColorStop(0.5, '#0d47a1')
    gradient.addColorStop(1, '#01579b')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    ctx.fillStyle = '#1b5e20'
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      const size = Math.random() * 200 + 50
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    }
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 1
    for (let lat = -90; lat <= 90; lat += 15) {
      const y = ((90 - lat) / 180) * canvas.height
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }
    for (let lng = -180; lng <= 180; lng += 15) {
      const x = ((lng + 180) / 360) * canvas.width
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }
    
    return new THREE.CanvasTexture(canvas)
  }

  function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lng + 180) * (Math.PI / 180)
    
    const x = -(radius * Math.sin(phi) * Math.cos(theta))
    const y = radius * Math.cos(phi)
    const z = radius * Math.sin(phi) * Math.sin(theta)
    
    return new THREE.Vector3(x, y, z)
  }

  function addDataPoints(scene: THREE.Scene) {
    if (showFlights && filteredFlights.length > 0) {
      filteredFlights.forEach(flight => {
        const position = latLngToVector3(
          flight.currentPosition.lat,
          flight.currentPosition.lng,
          102
        )
        
        const geometry = new THREE.ConeGeometry(0.8, 3, 4)
        const material = new THREE.MeshPhongMaterial({ 
          color: flight.isMilitary ? 0xff0000 : 0x00ff00,
          emissive: flight.isMilitary ? 0x880000 : 0x008800,
          emissiveIntensity: 0.5
        })
        const marker = new THREE.Mesh(geometry, material)
        marker.position.copy(position)
        marker.lookAt(0, 0, 0)
        marker.rotateX(Math.PI / 2)
        
        const point: GlobePoint = {
          id: flight.id,
          lat: flight.currentPosition.lat,
          lng: flight.currentPosition.lng,
          type: 'flight',
          data: flight
        }
        marker.userData = { type: 'flight', point }
        
        scene.add(marker)
      })
    }

    if (showCameras && filteredCameras.length > 0) {
      filteredCameras.forEach(camera => {
        const position = latLngToVector3(camera.lat, camera.lng, 101.5)
        
        const geometry = new THREE.SphereGeometry(0.6, 8, 8)
        const material = new THREE.MeshPhongMaterial({ 
          color: camera.status === 'online' ? 0x00bfff : 0x666666,
          emissive: camera.status === 'online' ? 0x0088cc : 0x333333,
          emissiveIntensity: 0.6
        })
        const marker = new THREE.Mesh(geometry, material)
        marker.position.copy(position)
        
        const point: GlobePoint = {
          id: camera.id,
          lat: camera.lat,
          lng: camera.lng,
          type: 'camera',
          data: camera
        }
        marker.userData = { type: 'camera', point }
        
        scene.add(marker)
      })
    }

    if (showSatellites && satellites.length > 0) {
      satellites.forEach(sat => {
        const position = latLngToVector3(sat.lat, sat.lng, 105 + (sat.altitude / 100))
        
        const geometry = new THREE.OctahedronGeometry(1.2)
        const material = new THREE.MeshPhongMaterial({ 
          color: 0xffff00,
          emissive: 0xaaaa00,
          emissiveIntensity: 0.8,
          wireframe: true
        })
        const marker = new THREE.Mesh(geometry, material)
        marker.position.copy(position)
        
        const point: GlobePoint = {
          id: sat.id,
          lat: sat.lat,
          lng: sat.lng,
          type: 'satellite',
          data: sat
        }
        marker.userData = { type: 'satellite', point }
        
        scene.add(marker)
      })
    }

    if (showWeather && weatherData.length > 0) {
      weatherData.forEach(weather => {
        const position = latLngToVector3(weather.lat, weather.lng, 101)
        
        const tempNormalized = (weather.temperature + 20) / 60
        const color = new THREE.Color()
        color.setHSL(0.6 - tempNormalized * 0.6, 0.8, 0.5)
        
        const geometry = new THREE.SphereGeometry(1.5, 6, 6)
        const material = new THREE.MeshBasicMaterial({ 
          color: color,
          transparent: true,
          opacity: 0.6
        })
        const marker = new THREE.Mesh(geometry, material)
        marker.position.copy(position)
        
        const point: GlobePoint = {
          id: weather.id,
          lat: weather.lat,
          lng: weather.lng,
          type: 'weather',
          data: weather
        }
        marker.userData = { type: 'weather', point }
        
        scene.add(marker)
      })
    }

    if (showThreats && threatPredictions.length > 0) {
      threatPredictions.forEach(threat => {
        const position = latLngToVector3(threat.lat, threat.lng, 101.2)
        
        const color = threat.threatLevel === 'critical' ? 0xff0000 : 
                     threat.threatLevel === 'high' ? 0xff6600 : 0xffaa00
        
        const geometry = new THREE.RingGeometry(1, 2.5, 6)
        const material = new THREE.MeshBasicMaterial({ 
          color: color,
          transparent: true,
          opacity: 0.7,
          side: THREE.DoubleSide
        })
        const marker = new THREE.Mesh(geometry, material)
        marker.position.copy(position)
        marker.lookAt(0, 0, 0)
        
        const point: GlobePoint = {
          id: threat.id,
          lat: threat.lat,
          lng: threat.lng,
          type: 'threat',
          data: threat
        }
        marker.userData = { type: 'threat', point }
        
        scene.add(marker)
      })
    }

    if (showAnnotations && annotations && annotations.length > 0) {
      annotations.forEach(annotation => {
        const position = latLngToVector3(annotation.lat, annotation.lng, 101.3)
        
        const color = annotation.type === 'alert' ? 0xff0000 :
                     annotation.type === 'observation' ? 0x00ff00 : 0x0088ff
        
        const geometry = new THREE.CylinderGeometry(0.3, 0.3, 3, 6)
        const material = new THREE.MeshPhongMaterial({ 
          color: color,
          emissive: color,
          emissiveIntensity: 0.5
        })
        const marker = new THREE.Mesh(geometry, material)
        marker.position.copy(position)
        marker.lookAt(0, 0, 0)
        
        const point: GlobePoint = {
          id: annotation.id,
          lat: annotation.lat,
          lng: annotation.lng,
          type: 'annotation',
          data: annotation
        }
        marker.userData = { type: 'annotation', point }
        
        scene.add(marker)
      })
    }
  }

  function handleRefreshData() {
    setLoading(true)
    setLoadingProgress(0)
    
    setTimeout(async () => {
      try {
        setLoadingProgress(20)
        
        let flightData: Flight[]
        if (useRealData) {
          toast.info('Refreshing live flight data...')
          flightData = await fetchRealFlights(500)
        } else {
          flightData = generateFlights(500)
        }
        setFlights(flightData)
        setLoadingProgress(60)
        
        const cameraData = await fetchWindyWebcams(300)
        setCameras(cameraData)
        setLoadingProgress(100)
        
        setLoading(false)
        toast.success('Data refreshed successfully')
      } catch (error) {
        console.error('Error refreshing data:', error)
        toast.error('Failed to refresh data')
        setLoading(false)
      }
    }, 500)
  }

  function handleAddAnnotation(lat: number, lng: number) {
    setNewAnnotation({ lat, lng })
    setAnnotationDialogOpen(true)
  }

  function handleSaveAnnotation() {
    if (!newAnnotation || !annotationContent.trim()) {
      toast.error('Please enter annotation content')
      return
    }

    const annotation: MapAnnotation = {
      id: `annotation-${Date.now()}`,
      lat: newAnnotation.lat,
      lng: newAnnotation.lng,
      content: annotationContent,
      type: annotationType,
      timestamp: new Date(),
      author: 'Current User'
    }

    setAnnotations(current => [...(current || []), annotation])
    setAnnotationDialogOpen(false)
    setAnnotationContent('')
    setNewAnnotation(null)
    toast.success('Annotation added')
  }

  function handleExportPDF() {
    setExporting(true)
    
    setTimeout(() => {
      const reportData = {
        annotations: showAnnotations && annotations ? annotations : [],
        mlPredictions: mlPredictions || [],
        threatPredictions: showThreats ? threatPredictions : [],
        weatherData: showWeather ? weatherData : []
      }
      
      generatePDFReport(reportData)
      setExporting(false)
      setExportDialogOpen(false)
      toast.success('PDF report generated')
    }, 1000)
  }

  const stats = {
    totalFlights: flights.length,
    militaryFlights: getMilitaryFlights(flights).length,
    civilianFlights: getCivilianFlights(flights).length,
    activeCameras: cameras.filter(c => c.status === 'online').length,
    totalCameras: cameras.length,
    satellites: satellites.length,
    threats: threatPredictions.length,
    annotations: annotations?.length || 0
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Globe size={32} className="text-accent" weight="fill" />
            <div>
              <CardTitle className="text-2xl">Unified Intelligence Globe</CardTitle>
              <CardDescription>
                Interactive 3D visualization with live flight tracking, cameras, and intelligence layers
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshData}
              disabled={loading}
            >
              <ArrowsClockwise size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExportDialogOpen(true)}
            >
              <FilePdf size={16} />
              Export PDF
            </Button>
            
            <div className="flex items-center gap-2">
              <Label htmlFor="real-data" className="text-xs">Real Data</Label>
              <Switch
                id="real-data"
                checked={useRealData}
                onCheckedChange={setUseRealData}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Label htmlFor="auto-rotate" className="text-xs">Auto Rotate</Label>
              <Switch
                id="auto-rotate"
                checked={autoRotate}
                onCheckedChange={setAutoRotate}
              />
            </div>
          </div>
        </div>
        
        {loading && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Spinner size={16} className="animate-spin text-accent" />
              <span className="text-sm text-muted-foreground">Loading data... {loadingProgress}%</span>
            </div>
            <Progress value={loadingProgress} className="h-2" />
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Eye size={16} />
                  Layer Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-flights" className="text-xs flex items-center gap-2">
                    <Airplane size={14} />
                    Flights ({stats.totalFlights})
                  </Label>
                  <Switch
                    id="show-flights"
                    checked={showFlights}
                    onCheckedChange={setShowFlights}
                  />
                </div>
                
                {showFlights && (
                  <div className="ml-6 flex items-center justify-between">
                    <Label htmlFor="military-only" className="text-xs">
                      Military Only ({stats.militaryFlights})
                    </Label>
                    <Switch
                      id="military-only"
                      checked={militaryOnly}
                      onCheckedChange={setMilitaryOnly}
                    />
                  </div>
                )}
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-cameras" className="text-xs flex items-center gap-2">
                    <Video size={14} />
                    Cameras ({stats.activeCameras}/{stats.totalCameras})
                  </Label>
                  <Switch
                    id="show-cameras"
                    checked={showCameras}
                    onCheckedChange={setShowCameras}
                  />
                </div>
                
                {showCameras && (
                  <div className="ml-6 space-y-2">
                    <Select value={filterType} onValueChange={(val) => setFilterType(val as any)}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="webcam">Webcams</SelectItem>
                        <SelectItem value="satellite">Satellites</SelectItem>
                        <SelectItem value="ground">Ground</SelectItem>
                        <SelectItem value="aerial">Aerial</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={filterProvider} onValueChange={setFilterProvider}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Filter by provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Providers</SelectItem>
                        {uniqueProviders.map(provider => (
                          <SelectItem key={provider} value={provider}>{provider}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-satellites" className="text-xs flex items-center gap-2">
                    <Planet size={14} />
                    Satellites ({stats.satellites})
                  </Label>
                  <Switch
                    id="show-satellites"
                    checked={showSatellites}
                    onCheckedChange={setShowSatellites}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-weather" className="text-xs flex items-center gap-2">
                    <CloudRain size={14} />
                    Weather
                  </Label>
                  <Switch
                    id="show-weather"
                    checked={showWeather}
                    onCheckedChange={setShowWeather}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-threats" className="text-xs flex items-center gap-2">
                    <Warning size={14} />
                    Threats ({stats.threats})
                  </Label>
                  <Switch
                    id="show-threats"
                    checked={showThreats}
                    onCheckedChange={setShowThreats}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-annotations" className="text-xs flex items-center gap-2">
                    <MapPin size={14} />
                    Annotations ({stats.annotations})
                  </Label>
                  <Switch
                    id="show-annotations"
                    checked={showAnnotations}
                    onCheckedChange={setShowAnnotations}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Flights:</span>
                  <Badge variant="secondary">{stats.totalFlights}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Military:</span>
                  <Badge variant="destructive">{stats.militaryFlights}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Civilian:</span>
                  <Badge variant="secondary">{stats.civilianFlights}</Badge>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Online Cameras:</span>
                  <Badge variant="default">{stats.activeCameras}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Cameras:</span>
                  <Badge variant="secondary">{stats.totalCameras}</Badge>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Satellites:</span>
                  <Badge variant="secondary">{stats.satellites}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Threat Zones:</span>
                  <Badge variant="destructive">{stats.threats}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Annotations:</span>
                  <Badge variant="default">{stats.annotations}</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Legend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Civilian Flight</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Military Flight</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                  <span>Online Camera</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span>Satellite</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span>Threat Zone</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>Annotation</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-3">
            <div 
              ref={containerRef}
              className="w-full h-[700px] rounded-lg border border-border bg-black/20 relative overflow-hidden"
              style={{ cursor: autoRotate ? 'default' : 'grab' }}
            >
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                  <div className="text-center">
                    <Spinner size={48} className="mx-auto mb-4 text-accent animate-spin" />
                    <p className="text-foreground">Loading 3D Globe...</p>
                  </div>
                </div>
              )}
              
              <div className="absolute top-4 left-4 z-10">
                <Badge variant="default" className="bg-background/80 backdrop-blur">
                  {useRealData ? 'Live Data' : 'Simulated Data'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedItem?.type === 'flight' && 'Flight Details'}
              {selectedItem?.type === 'camera' && 'Camera Feed Details'}
              {selectedItem?.type === 'satellite' && 'Satellite Details'}
              {selectedItem?.type === 'weather' && 'Weather Information'}
              {selectedItem?.type === 'threat' && 'Threat Assessment'}
              {selectedItem?.type === 'annotation' && 'Annotation'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedItem?.type === 'flight' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Callsign</Label>
                  <p className="font-mono">{selectedItem.data.callsign}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">ICAO24</Label>
                  <p className="font-mono">{selectedItem.data.icao24}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Type</Label>
                  <Badge variant={selectedItem.data.isMilitary ? 'destructive' : 'secondary'}>
                    {selectedItem.data.aircraft.type}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Badge>{selectedItem.data.status}</Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Altitude</Label>
                  <p>{selectedItem.data.currentPosition.altitude.toFixed(0)} ft</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Speed</Label>
                  <p>{selectedItem.data.currentPosition.speed.toFixed(0)} kt</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Heading</Label>
                  <p>{selectedItem.data.currentPosition.heading.toFixed(0)}°</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Vertical Rate</Label>
                  <p>{selectedItem.data.currentPosition.verticalRate.toFixed(0)} ft/min</p>
                </div>
              </div>
              
              {selectedItem.data.origin && (
                <div>
                  <Label className="text-xs text-muted-foreground">Origin</Label>
                  <p>{selectedItem.data.origin.name} ({selectedItem.data.origin.code})</p>
                  <p className="text-xs text-muted-foreground">{selectedItem.data.origin.country}</p>
                </div>
              )}
              
              {selectedItem.data.squawk && (
                <div>
                  <Label className="text-xs text-muted-foreground">Squawk Code</Label>
                  <p className="font-mono">{selectedItem.data.squawk}</p>
                </div>
              )}
            </div>
          )}
          
          {selectedItem?.type === 'camera' && (
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Camera Name</Label>
                <p className="font-medium">{selectedItem.data.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Provider</Label>
                  <p>{selectedItem.data.provider}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Type</Label>
                  <Badge>{selectedItem.data.type}</Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Badge variant={selectedItem.data.status === 'online' ? 'default' : 'secondary'}>
                    {selectedItem.data.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Location</Label>
                  <p className="text-xs font-mono">
                    {selectedItem.data.lat.toFixed(4)}, {selectedItem.data.lng.toFixed(4)}
                  </p>
                </div>
              </div>
              
              {selectedItem.data.embedUrl && (
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Live Feed</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(selectedItem.data.embedUrl, '_blank')}
                  >
                    <Eye size={16} />
                    Open Live Stream
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {selectedItem?.type === 'satellite' && (
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Satellite Name</Label>
                <p className="font-medium">{selectedItem.data.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">NORAD ID</Label>
                  <p className="font-mono">{selectedItem.data.noradId}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Altitude</Label>
                  <p>{selectedItem.data.altitude} km</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Velocity</Label>
                  <p>{selectedItem.data.velocity.toFixed(2)} km/s</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Next Pass</Label>
                  <p className="text-xs">{selectedItem.data.nextPass.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
          
          {selectedItem?.type === 'weather' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Temperature</Label>
                  <p className="text-2xl font-bold">{selectedItem.data.temperature.toFixed(1)}°C</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Conditions</Label>
                  <p>{selectedItem.data.conditions}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Humidity</Label>
                  <p>{selectedItem.data.humidity.toFixed(0)}%</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Wind Speed</Label>
                  <p>{selectedItem.data.windSpeed.toFixed(1)} km/h</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Visibility</Label>
                  <p>{selectedItem.data.visibility.toFixed(1)} km</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Pressure</Label>
                  <p>{selectedItem.data.pressure.toFixed(0)} hPa</p>
                </div>
              </div>
            </div>
          )}
          
          {selectedItem?.type === 'threat' && (
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Threat Level</Label>
                <Badge 
                  variant={
                    selectedItem.data.level === 'critical' ? 'destructive' :
                    selectedItem.data.level === 'high' ? 'default' : 'secondary'
                  }
                  className="text-lg"
                >
                  {selectedItem.data.level.toUpperCase()}
                </Badge>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Confidence Score</Label>
                <div className="flex items-center gap-2">
                  <Progress value={selectedItem.data.confidence * 100} className="flex-1" />
                  <span className="text-sm font-medium">{(selectedItem.data.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Contributing Factors</Label>
                <ul className="list-disc list-inside space-y-1 text-sm mt-2">
                  {selectedItem.data.factors.map((factor: string, idx: number) => (
                    <li key={idx}>{factor}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          {selectedItem?.type === 'annotation' && (
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Type</Label>
                <Badge>{selectedItem.data.type}</Badge>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Author</Label>
                <p>{selectedItem.data.author}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Timestamp</Label>
                <p className="text-sm">{new Date(selectedItem.data.timestamp).toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Content</Label>
                <p className="mt-1 p-3 bg-muted rounded-md">{selectedItem.data.content}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={annotationDialogOpen} onOpenChange={setAnnotationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Annotation</DialogTitle>
            <DialogDescription>
              Add a note, alert, or observation at this location
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {newAnnotation && (
              <div>
                <Label className="text-xs text-muted-foreground">Location</Label>
                <p className="font-mono text-sm">
                  {newAnnotation.lat.toFixed(4)}, {newAnnotation.lng.toFixed(4)}
                </p>
              </div>
            )}
            
            <div>
              <Label htmlFor="annotation-type">Type</Label>
              <Select value={annotationType} onValueChange={(val) => setAnnotationType(val as any)}>
                <SelectTrigger id="annotation-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="note">Note</SelectItem>
                  <SelectItem value="alert">Alert</SelectItem>
                  <SelectItem value="observation">Observation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="annotation-content">Content</Label>
              <Textarea
                id="annotation-content"
                value={annotationContent}
                onChange={(e) => setAnnotationContent(e.target.value)}
                placeholder="Enter your annotation..."
                rows={4}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAnnotationDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveAnnotation}>
                Save Annotation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Intelligence Report</DialogTitle>
            <DialogDescription>
              Generate a comprehensive PDF report with selected data layers
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Include in Report:</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="include-annotations" defaultChecked />
                  <Label htmlFor="include-annotations" className="text-sm">
                    Annotations ({annotations?.length || 0})
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="include-predictions" defaultChecked />
                  <Label htmlFor="include-predictions" className="text-sm">
                    ML Predictions ({mlPredictions?.length || 0})
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="include-threats" defaultChecked />
                  <Label htmlFor="include-threats" className="text-sm">
                    Threat Assessments ({threatPredictions.length})
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="include-weather" />
                  <Label htmlFor="include-weather" className="text-sm">
                    Weather Data ({weatherData.length})
                  </Label>
                </div>
              </div>
            </div>
            
            {exporting && (
              <div className="flex items-center gap-2">
                <Spinner size={16} className="animate-spin" />
                <span className="text-sm text-muted-foreground">Generating report...</span>
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setExportDialogOpen(false)} disabled={exporting}>
                Cancel
              </Button>
              <Button onClick={handleExportPDF} disabled={exporting}>
                <FilePdf size={16} />
                Generate PDF
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <AnimatePresence>
        {hoveredItem && tooltipPosition && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="fixed z-50 pointer-events-none"
            style={{
              left: tooltipPosition.x + 15,
              top: tooltipPosition.y + 15,
            }}
          >
            <Card className="w-[320px] shadow-2xl border-2 border-accent/50 bg-card/95 backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  {hoveredItem.type === 'flight' && (
                    <>
                      <Airplane size={16} className="text-accent" weight="fill" />
                      Flight {hoveredItem.data.callsign}
                    </>
                  )}
                  {hoveredItem.type === 'camera' && (
                    <>
                      <Video size={16} className="text-accent" weight="fill" />
                      {hoveredItem.data.name}
                    </>
                  )}
                  {hoveredItem.type === 'satellite' && (
                    <>
                      <Planet size={16} className="text-accent" weight="fill" />
                      {hoveredItem.data.name}
                    </>
                  )}
                  {hoveredItem.type === 'weather' && (
                    <>
                      <CloudRain size={16} className="text-accent" weight="fill" />
                      Weather Data
                    </>
                  )}
                  {hoveredItem.type === 'threat' && (
                    <>
                      <Warning size={16} className="text-accent" weight="fill" />
                      Threat Assessment
                    </>
                  )}
                  {hoveredItem.type === 'annotation' && (
                    <>
                      <MapPin size={16} className="text-accent" weight="fill" />
                      Annotation
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                {hoveredItem.type === 'flight' && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <Badge 
                          variant={hoveredItem.data.isMilitary ? 'destructive' : 'secondary'}
                          className="ml-1 text-xs"
                        >
                          {hoveredItem.data.aircraft.type}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">ICAO24:</span>
                        <span className="ml-1 font-mono">{hoveredItem.data.icao24}</span>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-muted-foreground">Altitude</div>
                        <div className="font-semibold text-base">{hoveredItem.data.currentPosition.altitude.toFixed(0)} ft</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Speed</div>
                        <div className="font-semibold text-base">{hoveredItem.data.currentPosition.speed.toFixed(0)} kt</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Heading</div>
                        <div className="font-semibold">{hoveredItem.data.currentPosition.heading.toFixed(0)}°</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Vert. Rate</div>
                        <div className="font-semibold">{hoveredItem.data.currentPosition.verticalRate.toFixed(0)} ft/min</div>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <div className="text-muted-foreground">Position</div>
                      <div className="font-mono text-xs">
                        {hoveredItem.data.currentPosition.lat.toFixed(4)}°, {hoveredItem.data.currentPosition.lng.toFixed(4)}°
                      </div>
                    </div>
                    {hoveredItem.data.origin && (
                      <>
                        <Separator />
                        <div>
                          <div className="text-muted-foreground">Origin</div>
                          <div className="font-medium">{hoveredItem.data.origin.name} ({hoveredItem.data.origin.code})</div>
                          <div className="text-muted-foreground text-xs">{hoveredItem.data.origin.country}</div>
                        </div>
                      </>
                    )}
                    {hoveredItem.data.destination && (
                      <div>
                        <div className="text-muted-foreground">Destination</div>
                        <div className="font-medium">{hoveredItem.data.destination.name} ({hoveredItem.data.destination.code})</div>
                        <div className="text-muted-foreground text-xs">{hoveredItem.data.destination.country}</div>
                      </div>
                    )}
                    {hoveredItem.data.squawk && (
                      <>
                        <Separator />
                        <div>
                          <div className="text-muted-foreground">Squawk</div>
                          <div className="font-mono font-semibold">{hoveredItem.data.squawk}</div>
                        </div>
                      </>
                    )}
                    <div>
                      <div className="text-muted-foreground">Status</div>
                      <Badge variant="outline" className="text-xs">{hoveredItem.data.status}</Badge>
                    </div>
                  </>
                )}
                
                {hoveredItem.type === 'camera' && (
                  <>
                    <div className="space-y-2">
                      <div>
                        <div className="text-muted-foreground">Provider</div>
                        <div className="font-medium">{hoveredItem.data.provider}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-muted-foreground">Type</div>
                          <Badge variant="outline" className="text-xs">{hoveredItem.data.type}</Badge>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Status</div>
                          <Badge 
                            variant={hoveredItem.data.status === 'online' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {hoveredItem.data.status}
                          </Badge>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <div className="text-muted-foreground">Location</div>
                        <div className="font-mono text-xs">
                          {hoveredItem.data.lat.toFixed(4)}°, {hoveredItem.data.lng.toFixed(4)}°
                        </div>
                      </div>
                      {hoveredItem.data.location && (
                        <div>
                          <div className="text-muted-foreground">Area</div>
                          <div className="font-medium">{hoveredItem.data.location}</div>
                        </div>
                      )}
                      {hoveredItem.data.resolution && (
                        <div>
                          <div className="text-muted-foreground">Resolution</div>
                          <div className="font-medium">{hoveredItem.data.resolution}</div>
                        </div>
                      )}
                      {hoveredItem.data.lastUpdate && (
                        <div>
                          <div className="text-muted-foreground">Last Update</div>
                          <div className="text-xs">{new Date(hoveredItem.data.lastUpdate).toLocaleString()}</div>
                        </div>
                      )}
                    </div>
                    <Separator />
                    <div className="text-muted-foreground text-xs italic">
                      Click for live stream access
                    </div>
                  </>
                )}
                
                {hoveredItem.type === 'satellite' && (
                  <>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-muted-foreground">NORAD ID</div>
                          <div className="font-mono font-semibold">{hoveredItem.data.noradId}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Type</div>
                          <div className="font-medium">{hoveredItem.data.type || 'Satellite'}</div>
                        </div>
                      </div>
                      <Separator />
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-muted-foreground">Altitude</div>
                          <div className="font-semibold text-base">{hoveredItem.data.altitude} km</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Velocity</div>
                          <div className="font-semibold text-base">{hoveredItem.data.velocity.toFixed(2)} km/s</div>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <div className="text-muted-foreground">Position</div>
                        <div className="font-mono text-xs">
                          {hoveredItem.data.lat.toFixed(4)}°, {hoveredItem.data.lng.toFixed(4)}°
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Next Pass</div>
                        <div className="font-medium text-xs">{new Date(hoveredItem.data.nextPass).toLocaleString()}</div>
                      </div>
                      {hoveredItem.data.visibility && (
                        <div>
                          <div className="text-muted-foreground">Visibility</div>
                          <Badge variant="outline" className="text-xs">{hoveredItem.data.visibility}</Badge>
                        </div>
                      )}
                    </div>
                  </>
                )}
                
                {hoveredItem.type === 'weather' && (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-muted-foreground">Temperature</div>
                        <div className="text-2xl font-bold">{hoveredItem.data.temperature.toFixed(1)}°C</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Conditions</div>
                        <div className="font-medium">{hoveredItem.data.conditions}</div>
                      </div>
                      <Separator />
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-muted-foreground">Humidity</div>
                          <div className="font-semibold">{hoveredItem.data.humidity.toFixed(0)}%</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Wind</div>
                          <div className="font-semibold">{hoveredItem.data.windSpeed.toFixed(1)} km/h</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Visibility</div>
                          <div className="font-semibold">{hoveredItem.data.visibility.toFixed(1)} km</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Pressure</div>
                          <div className="font-semibold">{hoveredItem.data.pressure.toFixed(0)} hPa</div>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <div className="text-muted-foreground">Location</div>
                        <div className="font-mono text-xs">
                          {hoveredItem.data.lat.toFixed(4)}°, {hoveredItem.data.lng.toFixed(4)}°
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                {hoveredItem.type === 'threat' && (
                  <>
                    <div className="space-y-2">
                      <div>
                        <div className="text-muted-foreground mb-1">Threat Level</div>
                        <Badge 
                          variant={
                            hoveredItem.data.threatLevel === 'critical' ? 'destructive' :
                            hoveredItem.data.threatLevel === 'high' ? 'default' : 'secondary'
                          }
                          className="text-sm font-bold"
                        >
                          {hoveredItem.data.threatLevel?.toUpperCase() || hoveredItem.data.level?.toUpperCase()}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Confidence</div>
                        <div className="flex items-center gap-2">
                          <Progress value={hoveredItem.data.confidence * 100} className="flex-1 h-2" />
                          <span className="font-semibold">{(hoveredItem.data.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <div className="text-muted-foreground">Location</div>
                        <div className="font-mono text-xs">
                          {hoveredItem.data.lat.toFixed(4)}°, {hoveredItem.data.lng.toFixed(4)}°
                        </div>
                        {hoveredItem.data.region && (
                          <div className="font-medium text-xs mt-1">{hoveredItem.data.region}</div>
                        )}
                      </div>
                      <Separator />
                      <div>
                        <div className="text-muted-foreground mb-1">Contributing Factors</div>
                        <ul className="list-disc list-inside space-y-0.5 text-xs">
                          {hoveredItem.data.factors?.slice(0, 3).map((factor: string, idx: number) => (
                            <li key={idx}>{factor}</li>
                          ))}
                          {hoveredItem.data.factors?.length > 3 && (
                            <li className="text-muted-foreground italic">+{hoveredItem.data.factors.length - 3} more...</li>
                          )}
                        </ul>
                      </div>
                    </div>
                    <Separator />
                    <div className="text-muted-foreground text-xs italic">
                      Click for full assessment details
                    </div>
                  </>
                )}
                
                {hoveredItem.type === 'annotation' && (
                  <>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-muted-foreground">Type</div>
                          <Badge 
                            variant={
                              hoveredItem.data.type === 'alert' ? 'destructive' :
                              hoveredItem.data.type === 'observation' ? 'default' : 'secondary'
                            }
                            className="text-xs"
                          >
                            {hoveredItem.data.type}
                          </Badge>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Author</div>
                          <div className="font-medium text-xs">{hoveredItem.data.author}</div>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <div className="text-muted-foreground">Location</div>
                        <div className="font-mono text-xs">
                          {hoveredItem.data.lat.toFixed(4)}°, {hoveredItem.data.lng.toFixed(4)}°
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Created</div>
                        <div className="text-xs">{new Date(hoveredItem.data.timestamp).toLocaleString()}</div>
                      </div>
                      <Separator />
                      <div>
                        <div className="text-muted-foreground mb-1">Content</div>
                        <div className="text-xs p-2 bg-muted rounded border border-border">
                          {hoveredItem.data.content.length > 100 
                            ? hoveredItem.data.content.substring(0, 100) + '...'
                            : hoveredItem.data.content
                          }
                        </div>
                      </div>
                    </div>
                    {hoveredItem.data.content.length > 100 && (
                      <>
                        <Separator />
                        <div className="text-muted-foreground text-xs italic">
                          Click to view full content
                        </div>
                      </>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}
