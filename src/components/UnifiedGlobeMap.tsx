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
import { Slider } from '@/components/ui/slider'
import { MapAnnotation, CameraFeed, WeatherData, ThreatPrediction, MLPrediction } from '@/lib/types'
import { Flight, fetchRealFlights, generateFlights, getMilitaryFlights, getCivilianFlights } from '@/lib/airline-traffic'
import { fetchWindyWebcams } from '@/lib/windy-webcams-api'
import { fetchSatellitePasses, generateSatelliteImageryFeeds, SatellitePass } from '@/lib/satellite-api'
import { generateWeatherGrid } from '@/lib/weather-api'
import { generateThreatPredictions } from '@/lib/threat-analysis'
import { generatePDFReport } from '@/lib/pdf-export'
import { Globe, Airplane, Video, CloudRain, Warning, FilePdf, Spinner, MapPin, ChatCircle, Planet, Eye, Target, ArrowsClockwise, X, Funnel, ShieldCheck, Gear, ChartBar, Plus, Minus, Play, Pause, Path } from '@phosphor-icons/react'
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

interface CameraAnimation {
  type: 'orbit' | 'flyTo' | 'circle'
  duration: number
  targetPosition?: { lat: number; lng: number }
  radius?: number
  height?: number
  speed?: number
}

export function UnifiedGlobeMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const globeRef = useRef<THREE.Mesh | null>(null)
  const cloudsRef = useRef<THREE.Mesh | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const connectionLinesRef = useRef<THREE.Group | null>(null)
  const markersGroupRef = useRef<THREE.Group | null>(null)
  
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
  const [cameraDistance, setCameraDistance] = useState(300)
  const [showConnectionLines, setShowConnectionLines] = useState(true)
  const [animationPlaying, setAnimationPlaying] = useState(false)
  const [currentAnimation, setCurrentAnimation] = useState<CameraAnimation | null>(null)
  const animationTimeRef = useRef(0)
  
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
  
  const isDraggingRef = useRef(false)
  const previousMousePositionRef = useRef({ x: 0, y: 0 })
  const targetRotationRef = useRef({ x: 0, y: 0 })
  const currentRotationRef = useRef({ x: 0, y: 0 })

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
    scene.background = new THREE.Color(0x050a14)
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.z = cameraDistance
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    rendererRef.current = renderer
    containerRef.current.appendChild(renderer.domElement)

    const ambientLight = new THREE.AmbientLight(0x5588bb, 0.4)
    scene.add(ambientLight)

    const sunLight = new THREE.DirectionalLight(0xffffee, 2.5)
    sunLight.position.set(150, 100, 100)
    scene.add(sunLight)

    const fillLight = new THREE.DirectionalLight(0x8899cc, 0.8)
    fillLight.position.set(-100, -50, -100)
    scene.add(fillLight)

    const accentLight = new THREE.PointLight(0x4fc3f7, 1.5, 500)
    accentLight.position.set(0, 150, 150)
    scene.add(accentLight)

    const geometry = new THREE.SphereGeometry(100, 128, 128)
    
    const textureLoader = new THREE.TextureLoader()
    const earthTexture = createEarthTexture()
    
    const material = new THREE.MeshPhongMaterial({
      map: earthTexture,
      bumpScale: 1.2,
      specular: new THREE.Color(0x1a4d7a),
      shininess: 25,
      transparent: false,
      opacity: 1.0,
      emissive: new THREE.Color(0x0a1520),
      emissiveIntensity: 0.1
    })

    const globe = new THREE.Mesh(geometry, material)
    globeRef.current = globe
    scene.add(globe)

    const markersGroup = new THREE.Group()
    markersGroupRef.current = markersGroup
    globe.add(markersGroup)

    const atmosphereGeometry = new THREE.SphereGeometry(103, 128, 128)
    const atmosphereMaterial = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
          vec3 atmosphere = vec3(0.2, 0.5, 0.9) * intensity;
          float alpha = intensity * 0.8;
          gl_FragColor = vec4(atmosphere, alpha);
        }
      `
    })
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial)
    scene.add(atmosphere)

    let mouseX = 0
    let mouseY = 0
    let targetRotationX = 0
    let targetRotationY = 0

    const handleMouseMove = (event: MouseEvent) => {
      if (!containerRef.current || !cameraRef.current || !markersGroupRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      mouseX = ((event.clientX - rect.left) / width) * 2 - 1
      mouseY = -((event.clientY - rect.top) / height) * 2 + 1
      
      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current)
      
      const intersects = raycaster.intersectObjects(markersGroupRef.current.children, true)
      
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
      if (!containerRef.current || !cameraRef.current || !markersGroupRef.current) return
      
      const rect = containerRef.current.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / width) * 2 - 1
      const y = -((event.clientY - rect.top) / height) * 2 + 1
      
      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current)
      
      const intersects = raycaster.intersectObjects(markersGroupRef.current.children, true)
      
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
    if (cameraRef.current) {
      cameraRef.current.position.z = cameraDistance
    }
  }, [cameraDistance])

  useEffect(() => {
    if (!markersGroupRef.current || loading) return
    
    while(markersGroupRef.current.children.length > 0) {
      markersGroupRef.current.remove(markersGroupRef.current.children[0])
    }
    
    addDataPoints()
  }, [flights, cameras, satellites, weatherData, threatPredictions, annotations, showFlights, showCameras, showSatellites, showWeather, showThreats, showAnnotations, filteredFlights, filteredCameras, loading, militaryOnly])

  function createEarthTexture(): THREE.Texture {
    const canvas = document.createElement('canvas')
    canvas.width = 4096
    canvas.height = 2048
    const ctx = canvas.getContext('2d')!
    
    const oceanGradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    oceanGradient.addColorStop(0, '#0a1929')
    oceanGradient.addColorStop(0.3, '#0d3a5c')
    oceanGradient.addColorStop(0.5, '#0f4c75')
    oceanGradient.addColorStop(0.7, '#0d3a5c')
    oceanGradient.addColorStop(1, '#0a1929')
    ctx.fillStyle = oceanGradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    const continents = [
      { x: 0.15, y: 0.35, w: 0.08, h: 0.25 },
      { x: 0.25, y: 0.25, w: 0.15, h: 0.3 },
      { x: 0.45, y: 0.15, w: 0.18, h: 0.35 },
      { x: 0.68, y: 0.25, w: 0.12, h: 0.28 },
      { x: 0.75, y: 0.45, w: 0.08, h: 0.12 },
      { x: 0.55, y: 0.65, w: 0.1, h: 0.15 },
      { x: 0.12, y: 0.62, w: 0.08, h: 0.12 },
    ]
    
    continents.forEach(continent => {
      const landGradient = ctx.createRadialGradient(
        canvas.width * (continent.x + continent.w / 2),
        canvas.height * (continent.y + continent.h / 2),
        0,
        canvas.width * (continent.x + continent.w / 2),
        canvas.height * (continent.y + continent.h / 2),
        canvas.width * Math.max(continent.w, continent.h) * 0.8
      )
      landGradient.addColorStop(0, '#2d5016')
      landGradient.addColorStop(0.5, '#1e3a0f')
      landGradient.addColorStop(1, '#152a0a')
      ctx.fillStyle = landGradient
      
      for (let i = 0; i < 50; i++) {
        const offsetX = (Math.random() - 0.5) * canvas.width * continent.w * 0.3
        const offsetY = (Math.random() - 0.5) * canvas.height * continent.h * 0.3
        const size = Math.random() * canvas.width * continent.w * 0.8 + canvas.width * continent.w * 0.2
        const x = canvas.width * (continent.x + continent.w / 2) + offsetX
        const y = canvas.height * (continent.y + continent.h / 2) + offsetY
        
        ctx.beginPath()
        ctx.ellipse(x, y, size, size * 0.7, Math.random() * Math.PI, 0, Math.PI * 2)
        ctx.fill()
      }
    })
    
    ctx.strokeStyle = 'rgba(79, 195, 247, 0.15)'
    ctx.lineWidth = 2
    for (let lat = -90; lat <= 90; lat += 15) {
      const y = ((90 - lat) / 180) * canvas.height
      ctx.globalAlpha = lat === 0 ? 0.3 : 0.15
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
    
    ctx.strokeStyle = 'rgba(79, 195, 247, 0.15)'
    ctx.lineWidth = 2
    for (let lng = -180; lng <= 180; lng += 15) {
      const x = ((lng + 180) / 360) * canvas.width
      ctx.globalAlpha = lng === 0 ? 0.3 : 0.15
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    for (let i = 0; i < 500; i++) {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      const size = Math.random() * 3 + 1
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
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

  function addDataPoints() {
    if (!markersGroupRef.current || !sceneRef.current) return
    
    const markersGroup = markersGroupRef.current
    const scene = sceneRef.current
    
    if (connectionLinesRef.current) {
      scene.remove(connectionLinesRef.current)
      connectionLinesRef.current = null
    }
    
    const allPoints: GlobePoint[] = []
    
    if (showFlights && filteredFlights.length > 0) {
      filteredFlights.forEach(flight => {
        const position = latLngToVector3(
          flight.currentPosition.lat,
          flight.currentPosition.lng,
          2.5
        )
        
        const geometry = new THREE.ConeGeometry(0.012, 0.04, 4)
        const material = new THREE.MeshPhongMaterial({ 
          color: flight.isMilitary ? 0xff3333 : 0x33ff33,
          emissive: flight.isMilitary ? 0xcc0000 : 0x00cc00,
          emissiveIntensity: 0.8,
          shininess: 100
        })
        const marker = new THREE.Mesh(geometry, material)
        marker.position.copy(position)
        marker.lookAt(0, 0, 0)
        marker.rotateX(Math.PI / 2)
        
        const glowGeometry = new THREE.SphereGeometry(0.02, 16, 16)
        const glowMaterial = new THREE.MeshBasicMaterial({
          color: flight.isMilitary ? 0xff0000 : 0x00ff00,
          transparent: true,
          opacity: 0.2
        })
        const glow = new THREE.Mesh(glowGeometry, glowMaterial)
        glow.position.copy(position)
        markersGroup.add(glow)
        
        const point: GlobePoint = {
          id: flight.id,
          lat: flight.currentPosition.lat,
          lng: flight.currentPosition.lng,
          type: 'flight',
          data: flight
        }
        marker.userData = { type: 'flight', point }
        allPoints.push(point)
        
        markersGroup.add(marker)
      })
    }

    if (showCameras && filteredCameras.length > 0) {
      filteredCameras.forEach(camera => {
        const position = latLngToVector3(camera.lat, camera.lng, 2)
        
        const geometry = new THREE.SphereGeometry(0.008, 16, 16)
        const material = new THREE.MeshPhongMaterial({ 
          color: camera.status === 'online' ? 0x00ddff : 0x666666,
          emissive: camera.status === 'online' ? 0x00aacc : 0x333333,
          emissiveIntensity: camera.status === 'online' ? 1.0 : 0.3,
          shininess: 100
        })
        const marker = new THREE.Mesh(geometry, material)
        marker.position.copy(position)
        
        if (camera.status === 'online') {
          const pulseGeometry = new THREE.SphereGeometry(0.015, 16, 16)
          const pulseMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ddff,
            transparent: true,
            opacity: 0.15
          })
          const pulse = new THREE.Mesh(pulseGeometry, pulseMaterial)
          pulse.position.copy(position)
          markersGroup.add(pulse)
        }
        
        const point: GlobePoint = {
          id: camera.id,
          lat: camera.lat,
          lng: camera.lng,
          type: 'camera',
          data: camera
        }
        marker.userData = { type: 'camera', point }
        allPoints.push(point)
        
        markersGroup.add(marker)
      })
    }

    if (showSatellites && satellites.length > 0) {
      satellites.forEach(sat => {
        const altitudeScale = sat.altitude / 80
        const position = latLngToVector3(sat.lat, sat.lng, 8 + altitudeScale)
        
        const geometry = new THREE.OctahedronGeometry(0.018)
        const material = new THREE.MeshPhongMaterial({ 
          color: 0xffdd00,
          emissive: 0xccaa00,
          emissiveIntensity: 1.2,
          wireframe: true,
          shininess: 100
        })
        const marker = new THREE.Mesh(geometry, material)
        marker.position.copy(position)
        marker.rotation.x = Date.now() * 0.001
        marker.rotation.y = Date.now() * 0.001
        
        const orbitGeometry = new THREE.RingGeometry(0.03, 0.035, 32)
        const orbitMaterial = new THREE.MeshBasicMaterial({
          color: 0xffdd00,
          transparent: true,
          opacity: 0.15,
          side: THREE.DoubleSide
        })
        const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial)
        orbit.position.copy(position)
        orbit.lookAt(0, 0, 0)
        markersGroup.add(orbit)
        
        const point: GlobePoint = {
          id: sat.id,
          lat: sat.lat,
          lng: sat.lng,
          type: 'satellite',
          data: sat
        }
        marker.userData = { type: 'satellite', point }
        allPoints.push(point)
        
        markersGroup.add(marker)
      })
    }

    if (showWeather && weatherData.length > 0) {
      weatherData.forEach(weather => {
        const position = latLngToVector3(weather.lat, weather.lng, 1.5)
        
        const tempNormalized = (weather.temperature + 20) / 60
        const color = new THREE.Color()
        color.setHSL(0.65 - tempNormalized * 0.65, 0.9, 0.6)
        
        const geometry = new THREE.SphereGeometry(0.02, 12, 12)
        const material = new THREE.MeshBasicMaterial({ 
          color: color,
          transparent: true,
          opacity: 0.5
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
        
        markersGroup.add(marker)
      })
    }

    if (showThreats && threatPredictions.length > 0) {
      threatPredictions.forEach(threat => {
        const position = latLngToVector3(threat.lat, threat.lng, 1.8)
        
        const color = threat.threatLevel === 'critical' ? 0xff0000 : 
                     threat.threatLevel === 'high' ? 0xff6600 : 0xffaa00
        
        const geometry = new THREE.RingGeometry(0.02, 0.04, 32)
        const material = new THREE.MeshBasicMaterial({ 
          color: color,
          transparent: true,
          opacity: 0.6,
          side: THREE.DoubleSide
        })
        const marker = new THREE.Mesh(geometry, material)
        marker.position.copy(position)
        marker.lookAt(0, 0, 0)
        
        const innerGeometry = new THREE.RingGeometry(0.005, 0.015, 32)
        const innerMaterial = new THREE.MeshBasicMaterial({
          color: color,
          transparent: true,
          opacity: 0.8,
          side: THREE.DoubleSide
        })
        const inner = new THREE.Mesh(innerGeometry, innerMaterial)
        inner.position.copy(position)
        inner.lookAt(0, 0, 0)
        markersGroup.add(inner)
        
        const point: GlobePoint = {
          id: threat.id,
          lat: threat.lat,
          lng: threat.lng,
          type: 'threat',
          data: threat
        }
        marker.userData = { type: 'threat', point }
        
        markersGroup.add(marker)
      })
    }

    if (showAnnotations && annotations && annotations.length > 0) {
      annotations.forEach(annotation => {
        const position = latLngToVector3(annotation.lat, annotation.lng, 2.2)
        
        const color = annotation.type === 'alert' ? 0xff0000 :
                     annotation.type === 'observation' ? 0x00ff00 : 0x0088ff
        
        const geometry = new THREE.CylinderGeometry(0.004, 0.004, 0.04, 8)
        const material = new THREE.MeshPhongMaterial({ 
          color: color,
          emissive: color,
          emissiveIntensity: 0.8,
          shininess: 100
        })
        const marker = new THREE.Mesh(geometry, material)
        marker.position.copy(position)
        marker.lookAt(0, 0, 0)
        
        const flagGeometry = new THREE.PlaneGeometry(0.025, 0.015)
        const flagMaterial = new THREE.MeshBasicMaterial({
          color: color,
          transparent: true,
          opacity: 0.7,
          side: THREE.DoubleSide
        })
        const flag = new THREE.Mesh(flagGeometry, flagMaterial)
        const flagOffset = latLngToVector3(annotation.lat, annotation.lng, 4)
        flag.position.copy(flagOffset)
        flag.lookAt(0, 0, 0)
        markersGroup.add(flag)
        
        const point: GlobePoint = {
          id: annotation.id,
          lat: annotation.lat,
          lng: annotation.lng,
          type: 'annotation',
          data: annotation
        }
        marker.userData = { type: 'annotation', point }
        allPoints.push(point)
        
        markersGroup.add(marker)
      })
    }
    
    if (showConnectionLines && allPoints.length > 1 && globeRef.current) {
      const connectionGroup = new THREE.Group()
      connectionLinesRef.current = connectionGroup
      
      for (let i = 0; i < Math.min(allPoints.length, 50); i++) {
        const point1 = allPoints[i]
        const nearbyPoints = allPoints
          .filter(p => p.id !== point1.id && p.type !== point1.type)
          .sort((a, b) => {
            const dist1 = Math.sqrt(Math.pow(a.lat - point1.lat, 2) + Math.pow(a.lng - point1.lng, 2))
            const dist2 = Math.sqrt(Math.pow(b.lat - point1.lat, 2) + Math.pow(b.lng - point1.lng, 2))
            return dist1 - dist2
          })
          .slice(0, 2)
        
        nearbyPoints.forEach(point2 => {
          const pos1 = latLngToVector3(point1.lat, point1.lng, 2)
          const pos2 = latLngToVector3(point2.lat, point2.lng, 2)
          
          const curve = new THREE.QuadraticBezierCurve3(
            pos1,
            new THREE.Vector3().addVectors(pos1, pos2).multiplyScalar(0.5).normalize().multiplyScalar(110),
            pos2
          )
          
          const points = curve.getPoints(20)
          const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)
          const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x4fc3f7,
            transparent: true,
            opacity: 0.15,
            linewidth: 1
          })
          
          const line = new THREE.Line(lineGeometry, lineMaterial)
          connectionGroup.add(line)
        })
      }
      
      globeRef.current.add(connectionGroup)
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
    <div className="w-full space-y-4">
      <Card className="border-accent/30 bg-gradient-to-r from-card/90 via-card/80 to-card/90 backdrop-blur-sm shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 border-2 border-accent/30 shadow-lg">
                <Globe size={36} className="text-accent" weight="fill" />
              </div>
              <div className="space-y-1.5">
                <CardTitle className="text-3xl tracking-tight font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                  Unified Intelligence Globe
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  Real-time 3D visualization with live flight tracking, camera feeds, satellites, and intelligence layers
                </CardDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshData}
                disabled={loading}
                className="gap-2 border-accent/30 hover:bg-accent/10 hover:border-accent/50 transition-all"
              >
                <ArrowsClockwise size={18} className={loading ? 'animate-spin' : ''} />
                <span className="hidden sm:inline font-medium">Refresh Data</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExportDialogOpen(true)}
                className="gap-2 border-accent/30 hover:bg-accent/10 hover:border-accent/50 transition-all"
              >
                <FilePdf size={18} />
                <span className="hidden sm:inline font-medium">Export PDF</span>
              </Button>
            </div>
          </div>
          
          {loading && (
            <div className="mt-4 p-4 bg-gradient-to-r from-accent/10 via-accent/5 to-transparent rounded-xl border border-accent/20 shadow-inner">
              <div className="flex items-center gap-3 mb-3">
                <Spinner size={20} className="animate-spin text-accent" />
                <span className="text-sm font-semibold text-foreground">Loading intelligence data...</span>
                <span className="text-sm font-bold text-accent ml-auto tabular-nums">{loadingProgress}%</span>
              </div>
              <Progress value={loadingProgress} className="h-2" />
            </div>
          )}
        </CardHeader>
      </Card>
      
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-3 space-y-4">
          <Card className="border-accent/30 bg-card/80 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-3 border-b border-accent/20">
              <CardTitle className="text-base flex items-center gap-2.5 font-bold tracking-tight">
                <div className="p-1.5 rounded-lg bg-accent/20 border border-accent/30">
                  <Gear size={18} className="text-accent" weight="fill" />
                </div>
                View Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent/10 transition-colors border border-transparent hover:border-accent/20">
                  <Label htmlFor="real-data" className="text-sm font-medium flex-1 cursor-pointer">
                    Use Real Data
                  </Label>
                  <Switch
                    id="real-data"
                    checked={useRealData}
                    onCheckedChange={setUseRealData}
                  />
                </div>
                
                <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent/10 transition-colors border border-transparent hover:border-accent/20">
                  <Label htmlFor="auto-rotate" className="text-sm font-medium flex-1 cursor-pointer">
                    Auto Rotate Globe
                  </Label>
                  <Switch
                    id="auto-rotate"
                    checked={autoRotate}
                    onCheckedChange={setAutoRotate}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-accent/30 bg-card/80 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-3 border-b border-accent/20">
              <CardTitle className="text-base flex items-center gap-2.5 font-bold tracking-tight">
                <div className="p-1.5 rounded-lg bg-accent/20 border border-accent/30">
                  <Eye size={18} className="text-accent" weight="fill" />
                </div>
                Data Layers
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ScrollArea className="h-[500px] pr-3">
                <div className="space-y-3">
                  <div className="space-y-3 pb-3 border-b border-border">
                    <Label className="text-xs font-semibold text-muted-foreground">CAMERA ZOOM</Label>
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setCameraDistance(Math.max(150, cameraDistance - 20))}>
                        <Plus size={16} />
                      </Button>
                      <Slider
                        value={[cameraDistance]}
                        onValueChange={([val]) => setCameraDistance(val)}
                        min={150}
                        max={500}
                        step={10}
                        className="flex-1"
                      />
                      <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setCameraDistance(Math.min(500, cameraDistance + 20))}>
                        <Minus size={16} />
                      </Button>
                    </div>
                    <div className="text-xs text-center text-muted-foreground">Distance: {cameraDistance}</div>
                  </div>
                  
                  <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
                    <Path size={16} className="text-accent" weight="fill" />
                    <Label htmlFor="show-connections" className="text-sm font-medium flex-1 cursor-pointer">
                      Connection Lines
                    </Label>
                    <Switch
                      id="show-connections"
                      checked={showConnectionLines}
                      onCheckedChange={setShowConnectionLines}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
                      <Airplane size={16} className="text-green-500" weight="fill" />
                      <Label htmlFor="show-flights" className="text-sm font-medium flex-1 cursor-pointer">
                        Flights
                      </Label>
                      <Badge variant="secondary" className="text-xs">{stats.totalFlights}</Badge>
                      <Switch
                        id="show-flights"
                        checked={showFlights}
                        onCheckedChange={setShowFlights}
                      />
                    </div>
                    
                    {showFlights && (
                      <div className="ml-8 pl-4 border-l-2 border-border space-y-2">
                        <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
                          <ShieldCheck size={14} className="text-red-500" weight="fill" />
                          <Label htmlFor="military-only" className="text-xs flex-1 cursor-pointer">
                            Military Only
                          </Label>
                          <Badge variant="destructive" className="text-xs">{stats.militaryFlights}</Badge>
                          <Switch
                            id="military-only"
                            checked={militaryOnly}
                            onCheckedChange={setMilitaryOnly}
                            className="scale-90"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
                      <Video size={16} className="text-cyan-500" weight="fill" />
                      <Label htmlFor="show-cameras" className="text-sm font-medium flex-1 cursor-pointer">
                        Cameras
                      </Label>
                      <Badge variant="default" className="text-xs">{stats.activeCameras}</Badge>
                      <Switch
                        id="show-cameras"
                        checked={showCameras}
                        onCheckedChange={setShowCameras}
                      />
                    </div>
                    
                    {showCameras && (
                      <div className="ml-8 pl-4 border-l-2 border-border space-y-2">
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
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
                    <Planet size={16} className="text-yellow-500" weight="fill" />
                    <Label htmlFor="show-satellites" className="text-sm font-medium flex-1 cursor-pointer">
                      Satellites
                    </Label>
                    <Badge variant="secondary" className="text-xs">{stats.satellites}</Badge>
                    <Switch
                      id="show-satellites"
                      checked={showSatellites}
                      onCheckedChange={setShowSatellites}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
                    <CloudRain size={16} className="text-blue-400" weight="fill" />
                    <Label htmlFor="show-weather" className="text-sm font-medium flex-1 cursor-pointer">
                      Weather
                    </Label>
                    <Switch
                      id="show-weather"
                      checked={showWeather}
                      onCheckedChange={setShowWeather}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
                    <Warning size={16} className="text-orange-500" weight="fill" />
                    <Label htmlFor="show-threats" className="text-sm font-medium flex-1 cursor-pointer">
                      Threats
                    </Label>
                    <Badge variant="destructive" className="text-xs">{stats.threats}</Badge>
                    <Switch
                      id="show-threats"
                      checked={showThreats}
                      onCheckedChange={setShowThreats}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
                    <MapPin size={16} className="text-blue-500" weight="fill" />
                    <Label htmlFor="show-annotations" className="text-sm font-medium flex-1 cursor-pointer">
                      Annotations
                    </Label>
                    <Badge variant="secondary" className="text-xs">{stats.annotations}</Badge>
                    <Switch
                      id="show-annotations"
                      checked={showAnnotations}
                      onCheckedChange={setShowAnnotations}
                    />
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
          
          <Card className="border-accent/30 bg-card/80 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-3 border-b border-accent/20">
              <CardTitle className="text-base flex items-center gap-2.5 font-bold tracking-tight">
                <div className="p-1.5 rounded-lg bg-accent/20 border border-accent/30">
                  <ChartBar size={18} className="text-accent" weight="fill" />
                </div>
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50 shadow-sm">
                    <div className="text-muted-foreground mb-1.5 text-xs font-medium">Total Flights</div>
                    <div className="text-2xl font-bold text-foreground tabular-nums">{stats.totalFlights}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20 shadow-sm">
                    <div className="text-muted-foreground mb-1.5 text-xs font-medium">Military</div>
                    <div className="text-2xl font-bold text-red-500 tabular-nums">{stats.militaryFlights}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 shadow-sm">
                    <div className="text-muted-foreground mb-1.5 text-xs font-medium">Cameras</div>
                    <div className="text-2xl font-bold text-cyan-500 tabular-nums">{stats.activeCameras}/{stats.totalCameras}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20 shadow-sm">
                    <div className="text-muted-foreground mb-1.5 text-xs font-medium">Satellites</div>
                    <div className="text-2xl font-bold text-yellow-500 tabular-nums">{stats.satellites}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20 shadow-sm">
                    <div className="text-muted-foreground mb-1.5 text-xs font-medium">Threats</div>
                    <div className="text-2xl font-bold text-orange-500 tabular-nums">{stats.threats}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 shadow-sm">
                    <div className="text-muted-foreground mb-1.5 text-xs font-medium">Annotations</div>
                    <div className="text-2xl font-bold text-blue-500 tabular-nums">{stats.annotations}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-accent/30 bg-card/80 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-3 border-b border-accent/20">
              <CardTitle className="text-base flex items-center gap-2.5 font-bold tracking-tight">
                <div className="p-1.5 rounded-lg bg-accent/20 border border-accent/30">
                  <Target size={18} className="text-accent" weight="fill" />
                </div>
                Legend
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/20">
                  <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></div>
                  <span className="font-medium text-foreground">Civilian Flight</span>
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-gradient-to-r from-red-500/10 to-transparent border border-red-500/20">
                  <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50"></div>
                  <span className="font-medium text-foreground">Military Flight</span>
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-gradient-to-r from-cyan-500/10 to-transparent border border-cyan-500/20">
                  <div className="w-3 h-3 rounded-full bg-cyan-500 shadow-lg shadow-cyan-500/50"></div>
                  <span className="font-medium text-foreground">Online Camera</span>
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/20">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/50"></div>
                  <span className="font-medium text-foreground">Satellite</span>
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/20">
                  <div className="w-3 h-3 rounded-full bg-orange-500 shadow-lg shadow-orange-500/50"></div>
                  <span className="font-medium text-foreground">Threat Zone</span>
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20">
                  <div className="w-3 h-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"></div>
                  <span className="font-medium text-foreground">Annotation</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="xl:col-span-9 border-accent/20 overflow-hidden bg-gradient-to-br from-background via-card to-background">
          <div 
            ref={containerRef}
            className="w-full h-[900px] relative overflow-hidden"
            style={{ 
              cursor: autoRotate ? 'default' : 'grab',
              background: 'radial-gradient(ellipse at center, rgba(15, 30, 50, 1) 0%, rgba(5, 10, 20, 1) 100%)'
            }}
          >
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-background/98 via-card/95 to-background/98 backdrop-blur-xl z-10">
                <div className="text-center space-y-6 max-w-md px-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full bg-accent/10 animate-ping"></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-28 h-28 rounded-full border-4 border-accent/30 border-t-accent animate-spin"></div>
                    </div>
                    <Globe size={72} className="relative mx-auto text-accent animate-pulse" weight="fill" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-bold text-foreground tracking-tight">Initializing Globe</p>
                    <p className="text-sm text-muted-foreground">Loading real-time intelligence data from live sources...</p>
                  </div>
                  <div className="space-y-2">
                    <Progress value={loadingProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground tabular-nums">{loadingProgress}% Complete</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-3">
              <Badge 
                variant="default" 
                className="bg-card/95 backdrop-blur-xl border-2 border-accent/40 shadow-2xl px-4 py-2 text-sm"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${useRealData ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse shadow-lg ${useRealData ? 'shadow-green-500/50' : 'shadow-yellow-500/50'}`}></div>
                  <span className="font-semibold tracking-wide">{useRealData ? 'LIVE DATA' : 'SIMULATED DATA'}</span>
                </div>
              </Badge>
              
              {!loading && (
                <Badge 
                  variant="outline" 
                  className="bg-card/95 backdrop-blur-xl border-2 border-border shadow-xl text-xs px-3 py-1.5 font-medium"
                >
                  {autoRotate ? '🔄 Auto Rotating' : '👆 Drag to Rotate'}
                </Badge>
              )}
            </div>
          </div>
        </Card>
      </div>
      
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedItem?.type === 'flight' && `Flight ${selectedItem.data.callsign}`}
              {selectedItem?.type === 'camera' && selectedItem.data.name}
              {selectedItem?.type === 'satellite' && selectedItem.data.name}
              {selectedItem?.type === 'weather' && 'Weather Data'}
              {selectedItem?.type === 'threat' && 'Threat Assessment'}
              {selectedItem?.type === 'annotation' && 'Annotation Details'}
            </DialogTitle>
            <DialogDescription>
              {selectedItem?.type === 'flight' && 'Live flight tracking information'}
              {selectedItem?.type === 'camera' && 'Camera feed details'}
              {selectedItem?.type === 'satellite' && 'Satellite orbital information'}
              {selectedItem?.type === 'weather' && 'Current weather conditions'}
              {selectedItem?.type === 'threat' && 'Threat analysis and assessment'}
              {selectedItem?.type === 'annotation' && 'User-created annotation'}
            </DialogDescription>
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
    </div>
  )
}
