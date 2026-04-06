import { useEffect, useRef, useState, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import * as THREE from 'three'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { fetchRealFlights, generateFlights, updateFlights, Flight, getActiveFlightsCount, getMilitaryFlights } from '@/lib/airline-traffic'
import { fetchWindyWebcams } from '@/lib/windy-webcams-api'
import { fetchTrafficCameras } from '@/lib/traffic-camera-api'
import { fetchSatellitePasses, generateSatelliteImageryFeeds, SatellitePass } from '@/lib/satellite-api'
import { generateWeatherGrid } from '@/lib/weather-api'
import { fetchAllRepositories } from '@/lib/github-api'
import { generateThreatPredictions } from '@/lib/threat-analysis'
import { MapEvent, CameraFeed, WeatherData, ThreatPrediction, MapAnnotation } from '@/lib/types'
import { Airplane, Globe, Pause, Play, MapPin, Target, Video, CloudRain, Warning, ChatCircle, X, Info, Gauge, Compass, ArrowUp, Buildings, Clock, MapTrifold } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

export function UnifiedGlobeMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const globeRef = useRef<THREE.Group | null>(null)
  const flightLinesRef = useRef<THREE.Group | null>(null)
  const airplanesRef = useRef<Map<string, THREE.Mesh>>(new Map())
  const camerasGroupRef = useRef<THREE.Group | null>(null)
  const satellitesGroupRef = useRef<THREE.Group | null>(null)
  const annotationsGroupRef = useRef<THREE.Group | null>(null)
  const eventsGroupRef = useRef<THREE.Group | null>(null)
  const animationIdRef = useRef<number | null>(null)
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster())
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2())
  
  const [flights, setFlights] = useState<Flight[]>([])
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [showFlightPaths, setShowFlightPaths] = useState(true)
  const [showAirplanes, setShowAirplanes] = useState(true)
  const [showMilitaryOnly, setShowMilitaryOnly] = useState(false)
  const [useRealData, setUseRealData] = useState(true)
  const [globeRotationSpeed, setGlobeRotationSpeed] = useState(0.3)
  const [flightCount, setFlightCount] = useState(500)
  const [holographicIntensity, setHolographicIntensity] = useState(0.8)
  const [loading, setLoading] = useState(false)
  
  const [allCameras, setAllCameras] = useState<CameraFeed[]>([])
  const [satellitePasses, setSatellitePasses] = useState<SatellitePass[]>([])
  const [weatherData, setWeatherData] = useState<WeatherData[]>([])
  const [events, setEvents] = useState<MapEvent[]>([])
  const [threatPredictions, setThreatPredictions] = useState<ThreatPrediction[]>([])
  const [annotations, setAnnotations] = useKV<MapAnnotation[]>("unified-map-annotations", [])
  
  const [showCameras, setShowCameras] = useState(false)
  const [showSatellites, setShowSatellites] = useState(false)
  const [showWeather, setShowWeather] = useState(false)
  const [showEvents, setShowEvents] = useState(false)
  const [showAnnotations, setShowAnnotations] = useState(false)
  const [showThreats, setShowThreats] = useState(false)
  
  const [filterRegion, setFilterRegion] = useState<string>('')
  const [filterType, setFilterType] = useState<CameraFeed['type'] | 'all'>('all')
  
  const [flightDialogOpen, setFlightDialogOpen] = useState(false)
  const [annotationDialogOpen, setAnnotationDialogOpen] = useState(false)
  const [annotationContent, setAnnotationContent] = useState('')
  const [viewMode, setViewMode] = useState<'globe' | 'hybrid'>('globe')

  useEffect(() => {
    async function loadAllData() {
      setLoading(true)
      try {
        const initialFlights = useRealData 
          ? await fetchRealFlights(flightCount)
          : generateFlights(flightCount)
        setFlights(initialFlights)
        
        const [webcams, trafficCams, satellites, satelliteFeeds, repos] = await Promise.all([
          fetchWindyWebcams(100),
          fetchTrafficCameras(),
          fetchSatellitePasses(),
          generateSatelliteImageryFeeds(),
          fetchAllRepositories()
        ])
        
        const combinedCameras = [...webcams, ...trafficCams, ...satelliteFeeds]
        setAllCameras(combinedCameras)
        setSatellitePasses(satellites)
        
        const weather = await generateWeatherGrid(30)
        setWeatherData(weather)
        
        const activityData = repos.map((repo, idx) => {
          const latRange = [-60, 60]
          const lngRange = [-180, 180]
          return {
            id: `event-${idx}`,
            type: 'detection' as const,
            lat: latRange[0] + Math.random() * (latRange[1] - latRange[0]),
            lng: lngRange[0] + Math.random() * (lngRange[1] - lngRange[0]),
            title: repo.name,
            description: repo.description,
            severity: 'medium' as const,
            timestamp: new Date(),
            repository: repo.fullName
          }
        })
        setEvents(activityData.slice(0, 50))
        
        const threats = await generateThreatPredictions(activityData, 20)
        setThreatPredictions(threats)
        
        toast.success(`Loaded ${initialFlights.length} flights, ${combinedCameras.length} cameras, ${satellites.length} satellites`)
      } catch (error) {
        console.error('Error loading data:', error)
        toast.error('Failed to load some data')
      } finally {
        setLoading(false)
      }
    }

    loadAllData()
  }, [])

  useEffect(() => {
    if (!containerRef.current) return

    const scene = new THREE.Scene()
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      10000
    )
    camera.position.z = 600
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance'
    })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setClearColor(0x000000, 0)
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const ambientLight = new THREE.AmbientLight(0x4dc3ff, 0.5)
    scene.add(ambientLight)

    const pointLight = new THREE.PointLight(0x4dc3ff, 1, 1000)
    pointLight.position.set(200, 200, 200)
    scene.add(pointLight)

    const pointLight2 = new THREE.PointLight(0x00ffff, 0.5, 1000)
    pointLight2.position.set(-200, -200, 200)
    scene.add(pointLight2)

    const globeGroup = new THREE.Group()
    globeRef.current = globeGroup
    scene.add(globeGroup)

    const sphereGeometry = new THREE.SphereGeometry(200, 64, 64)
    const gradientTexture = createGradientTexture()
    
    const sphereMaterial = new THREE.MeshPhongMaterial({
      map: gradientTexture,
      transparent: true,
      opacity: 0.3,
      shininess: 100,
      specular: new THREE.Color(0x4dc3ff),
      emissive: new THREE.Color(0x001a33),
      emissiveIntensity: 0.2
    })
    
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
    globeGroup.add(sphere)

    const wireframeGeometry = new THREE.SphereGeometry(201, 32, 32)
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x4dc3ff,
      wireframe: true,
      transparent: true,
      opacity: 0.15
    })
    const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial)
    globeGroup.add(wireframe)

    const latLngLines = createLatLngLines()
    globeGroup.add(latLngLines)

    const glowGeometry = new THREE.SphereGeometry(215, 32, 32)
    const glowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        c: { value: 0.3 },
        p: { value: 4.5 },
        glowColor: { value: new THREE.Color(0x4dc3ff) },
        viewVector: { value: camera.position }
      },
      vertexShader: `
        uniform vec3 viewVector;
        varying float intensity;
        void main() {
          vec3 vNormal = normalize(normalMatrix * normal);
          vec3 vNormel = normalize(normalMatrix * viewVector);
          intensity = pow(0.7 - dot(vNormal, vNormel), 4.0);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying float intensity;
        void main() {
          vec3 glow = glowColor * intensity;
          gl_FragColor = vec4(glow, intensity * 0.8);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    })
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial)
    globeGroup.add(glowMesh)

    const flightLinesGroup = new THREE.Group()
    flightLinesRef.current = flightLinesGroup
    scene.add(flightLinesGroup)

    const camerasGroup = new THREE.Group()
    camerasGroupRef.current = camerasGroup
    scene.add(camerasGroup)

    const satellitesGroup = new THREE.Group()
    satellitesGroupRef.current = satellitesGroup
    scene.add(satellitesGroup)

    const annotationsGroup = new THREE.Group()
    annotationsGroupRef.current = annotationsGroup
    scene.add(annotationsGroup)

    const eventsGroup = new THREE.Group()
    eventsGroupRef.current = eventsGroup
    scene.add(eventsGroup)

    let mouseX = 0
    let mouseY = 0
    let targetRotationX = 0
    let targetRotationY = 0

    const onMouseMove = (event: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      mouseX = (event.clientX / window.innerWidth) * 2 - 1
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1
      
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    }

    const onClick = (event: MouseEvent) => {
      if (!containerRef.current || !cameraRef.current) return
      
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current)
      
      const airplanesArray = Array.from(airplanesRef.current.values())
      const intersects = raycasterRef.current.intersectObjects(airplanesArray)
      
      if (intersects.length > 0) {
        const clickedPlane = intersects[0].object
        const flightId = clickedPlane.userData.flightId
        const flight = flights.find(f => f.id === flightId)
        if (flight) {
          setSelectedFlight(flight)
          setFlightDialogOpen(true)
        }
      }
    }

    window.addEventListener('mousemove', onMouseMove)
    containerRef.current.addEventListener('click', onClick)

    const animate = () => {
      if (!isPlaying) return
      
      animationIdRef.current = requestAnimationFrame(animate)

      if (globeRef.current) {
        targetRotationX += globeRotationSpeed * 0.001
        targetRotationY = mouseY * 0.1
        
        globeRef.current.rotation.y = targetRotationX
        globeRef.current.rotation.x += (targetRotationY - globeRef.current.rotation.x) * 0.05
      }

      if (cameraRef.current && globeRef.current) {
        const targetCameraX = mouseX * 50
        const targetCameraY = -mouseY * 50
        
        cameraRef.current.position.x += (targetCameraX - cameraRef.current.position.x) * 0.05
        cameraRef.current.position.y += (targetCameraY - cameraRef.current.position.y) * 0.05
        cameraRef.current.lookAt(globeRef.current.position)
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current)
      }
    }

    animate()

    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return
      
      cameraRef.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      cameraRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', handleResize)
      if (containerRef.current) {
        containerRef.current.removeEventListener('click', onClick)
      }
      
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      
      if (rendererRef.current && containerRef.current) {
        try {
          containerRef.current.removeChild(rendererRef.current.domElement)
        } catch (e) {}
        rendererRef.current.dispose()
      }
    }
  }, [])

  useEffect(() => {
    if (isPlaying && !animationIdRef.current && rendererRef.current && sceneRef.current && cameraRef.current) {
      const animate = () => {
        animationIdRef.current = requestAnimationFrame(animate)

        if (globeRef.current) {
          globeRef.current.rotation.y += globeRotationSpeed * 0.001
        }

        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current)
        }
      }
      animate()
    } else if (!isPlaying && animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current)
      animationIdRef.current = null
    }
  }, [isPlaying, globeRotationSpeed])

  useEffect(() => {
    const interval = setInterval(() => {
      setFlights(currentFlights => {
        const updated = updateFlights(currentFlights)
        
        if (updated.length < flightCount * 0.5) {
          const newFlights = generateFlights(Math.floor(flightCount * 0.3))
          return [...updated, ...newFlights]
        }
        
        return updated
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [flightCount])

  useEffect(() => {
    if (!useRealData) return

    const refreshInterval = setInterval(async () => {
      try {
        const freshFlights = await fetchRealFlights(flightCount)
        setFlights(freshFlights)
      } catch (error) {
        console.error('Failed to refresh flight data:', error)
      }
    }, 30000)

    return () => clearInterval(refreshInterval)
  }, [useRealData, flightCount])

  useEffect(() => {
    if (!flightLinesRef.current) return
    
    while (flightLinesRef.current.children.length > 0) {
      flightLinesRef.current.remove(flightLinesRef.current.children[0])
    }
    
    airplanesRef.current.clear()
    
    const filteredFlights = showMilitaryOnly ? getMilitaryFlights(flights) : flights
    createFlightVisuals(filteredFlights, flightLinesRef.current)
  }, [flights, showFlightPaths, showAirplanes, showMilitaryOnly, holographicIntensity])

  useEffect(() => {
    if (!camerasGroupRef.current) return
    
    while (camerasGroupRef.current.children.length > 0) {
      camerasGroupRef.current.remove(camerasGroupRef.current.children[0])
    }
    
    if (showCameras) {
      allCameras.forEach(camera => {
        const pos = latLngToVector3(camera.lat, camera.lng, 205)
        const geometry = new THREE.SphereGeometry(1.5, 8, 8)
        const material = new THREE.MeshBasicMaterial({
          color: camera.status === 'online' ? 0x00ff00 : 0xff0000,
          transparent: true,
          opacity: 0.9
        })
        const marker = new THREE.Mesh(geometry, material)
        marker.position.copy(pos)
        camerasGroupRef.current!.add(marker)
      })
    }
  }, [allCameras, showCameras])

  useEffect(() => {
    if (!satellitesGroupRef.current) return
    
    while (satellitesGroupRef.current.children.length > 0) {
      satellitesGroupRef.current.remove(satellitesGroupRef.current.children[0])
    }
    
    if (showSatellites) {
      satellitePasses.forEach(sat => {
        const pos = latLngToVector3(sat.lat, sat.lng, 210)
        const geometry = new THREE.SphereGeometry(2, 8, 8)
        const material = new THREE.MeshBasicMaterial({
          color: 0xffff00,
          transparent: true,
          opacity: 0.9
        })
        const marker = new THREE.Mesh(geometry, material)
        marker.position.copy(pos)
        satellitesGroupRef.current!.add(marker)
      })
    }
  }, [satellitePasses, showSatellites])

  function createGradientTexture(): THREE.Texture {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')!
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 512)
    gradient.addColorStop(0, '#001a33')
    gradient.addColorStop(0.5, '#003d66')
    gradient.addColorStop(1, '#001a33')
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 512, 512)
    
    const texture = new THREE.Texture(canvas)
    texture.needsUpdate = true
    return texture
  }

  function createLatLngLines(): THREE.Group {
    const linesGroup = new THREE.Group()
    const lineMaterial = new THREE.LineBasicMaterial({ 
      color: 0x4dc3ff, 
      transparent: true, 
      opacity: 0.2 
    })

    for (let lat = -80; lat <= 80; lat += 20) {
      const points = []
      for (let lng = 0; lng <= 360; lng += 5) {
        const phi = (90 - lat) * (Math.PI / 180)
        const theta = lng * (Math.PI / 180)
        
        const x = 200 * Math.sin(phi) * Math.cos(theta)
        const y = 200 * Math.cos(phi)
        const z = 200 * Math.sin(phi) * Math.sin(theta)
        
        points.push(new THREE.Vector3(x, y, z))
      }
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      const line = new THREE.Line(geometry, lineMaterial)
      linesGroup.add(line)
    }

    for (let lng = 0; lng < 360; lng += 20) {
      const points = []
      for (let lat = -90; lat <= 90; lat += 5) {
        const phi = (90 - lat) * (Math.PI / 180)
        const theta = lng * (Math.PI / 180)
        
        const x = 200 * Math.sin(phi) * Math.cos(theta)
        const y = 200 * Math.cos(phi)
        const z = 200 * Math.sin(phi) * Math.sin(theta)
        
        points.push(new THREE.Vector3(x, y, z))
      }
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      const line = new THREE.Line(geometry, lineMaterial)
      linesGroup.add(line)
    }

    return linesGroup
  }

  function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lng + 180) * (Math.PI / 180)
    
    const x = -radius * Math.sin(phi) * Math.cos(theta)
    const y = radius * Math.cos(phi)
    const z = radius * Math.sin(phi) * Math.sin(theta)
    
    return new THREE.Vector3(x, y, z)
  }

  function createFlightVisuals(flightList: Flight[], linesGroup: THREE.Group) {
    flightList.forEach((flight, index) => {
      if (flight.status === 'scheduled' || flight.status === 'arrived') return
      if (!flight.origin || !flight.destination) return

      if (showFlightPaths && index % 3 === 0) {
        const startPos = latLngToVector3(flight.origin.lat, flight.origin.lng, 202)
        const endPos = latLngToVector3(flight.destination.lat, flight.destination.lng, 202)
        
        const distance = startPos.distanceTo(endPos)
        const midHeight = 202 + distance * 0.15
        const midPos = new THREE.Vector3()
          .addVectors(startPos, endPos)
          .multiplyScalar(0.5)
          .normalize()
          .multiplyScalar(midHeight)

        const curve = new THREE.QuadraticBezierCurve3(startPos, midPos, endPos)
        const points = curve.getPoints(50)
        const geometry = new THREE.BufferGeometry().setFromPoints(points)
        
        const material = new THREE.LineBasicMaterial({ 
          color: flight.isMilitary ? 0xff0000 : 0x00ffff, 
          transparent: true, 
          opacity: 0.15 * holographicIntensity 
        })
        
        const line = new THREE.Line(geometry, material)
        linesGroup.add(line)
      }

      if (showAirplanes && flight.status === 'en-route') {
        const currentPos = latLngToVector3(
          flight.currentPosition.lat,
          flight.currentPosition.lng,
          202 + (flight.currentPosition.altitude / 40000) * 30
        )

        const planeGeometry = new THREE.ConeGeometry(1.2, 3.5, 4)
        const planeMaterial = new THREE.MeshBasicMaterial({ 
          color: flight.isMilitary ? 0xff4444 : 0x4dc3ff,
          transparent: true,
          opacity: 0.9 * holographicIntensity
        })
        const plane = new THREE.Mesh(planeGeometry, planeMaterial)
        
        plane.position.copy(currentPos)
        plane.userData.flightId = flight.id
        
        if (flight.destination) {
          const nextPos = latLngToVector3(
            flight.destination.lat,
            flight.destination.lng,
            202
          )
          plane.lookAt(nextPos)
        }
        
        linesGroup.add(plane)
        airplanesRef.current.set(flight.id, plane)
      }
    })
  }

  const saveAnnotation = async () => {
    if (!annotationContent.trim()) {
      toast.error('Please enter annotation content')
      return
    }

    const user = await window.spark.user()
    
    const annotation: MapAnnotation = {
      id: `ann-${Date.now()}`,
      lat: 0,
      lng: 0,
      author: user?.login || 'Anonymous',
      content: annotationContent,
      timestamp: new Date(),
      type: 'note'
    }

    setAnnotations((current) => [...(current || []), annotation])
    toast.success('Annotation added successfully')
    
    setAnnotationContent('')
    setAnnotationDialogOpen(false)
  }

  const filteredCameras = useMemo(() => {
    return allCameras.filter(cam => {
      if (filterType !== 'all' && cam.type !== filterType) return false
      if (filterRegion && !cam.name.toLowerCase().includes(filterRegion.toLowerCase())) return false
      return true
    })
  }, [allCameras, filterType, filterRegion])

  const activeFlights = getActiveFlightsCount(flights)
  const militaryFlights = getMilitaryFlights(flights)

  return (
    <div className="space-y-4">
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Globe size={32} className="text-accent" weight="fill" />
                UNIFIED INTELLIGENCE GLOBE
              </CardTitle>
              <CardDescription>
                Integrated 3D visualization with live flight tracking, camera feeds, satellites, and collaborative intelligence
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="default" className="text-lg px-4 py-2">
                <Airplane size={20} className="mr-2" weight="fill" />
                {activeFlights} Active
              </Badge>
              <Button
                size="sm"
                variant={isPlaying ? 'default' : 'secondary'}
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause size={20} weight="fill" /> : <Play size={20} weight="fill" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div 
            ref={containerRef} 
            className="w-full h-[700px] rounded-lg border border-border bg-gradient-to-br from-background via-primary/5 to-background relative overflow-hidden cursor-pointer"
            style={{
              boxShadow: `0 0 40px rgba(77, 195, 255, ${0.2 * holographicIntensity}), inset 0 0 60px rgba(77, 195, 255, ${0.1 * holographicIntensity})`
            }}
          />
          
          <Tabs defaultValue="flights" className="mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="flights">
                <Airplane size={16} className="mr-2" />
                Flights
              </TabsTrigger>
              <TabsTrigger value="cameras">
                <Video size={16} className="mr-2" />
                Cameras
              </TabsTrigger>
              <TabsTrigger value="layers">
                <MapTrifold size={16} className="mr-2" />
                Layers
              </TabsTrigger>
              <TabsTrigger value="controls">
                <Globe size={16} className="mr-2" />
                Controls
              </TabsTrigger>
            </TabsList>

            <TabsContent value="flights" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="bg-muted/50 rounded-lg p-3 border border-border">
                  <div className="text-xs text-muted-foreground">Total Flights</div>
                  <div className="text-2xl font-bold text-foreground">{flights.length}</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 border border-border">
                  <div className="text-xs text-muted-foreground">En Route</div>
                  <div className="text-2xl font-bold text-foreground">
                    {flights.filter(f => f.status === 'en-route').length}
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 border border-border">
                  <div className="text-xs text-muted-foreground">Departing</div>
                  <div className="text-2xl font-bold text-foreground">
                    {flights.filter(f => f.status === 'departed').length}
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 border border-border">
                  <div className="text-xs text-muted-foreground">Landing</div>
                  <div className="text-2xl font-bold text-foreground">
                    {flights.filter(f => f.status === 'landing').length}
                  </div>
                </div>
                <div className="bg-destructive/20 rounded-lg p-3 border border-destructive/50">
                  <div className="text-xs text-destructive-foreground">Military</div>
                  <div className="text-2xl font-bold text-destructive">
                    {militaryFlights.length}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={useRealData}
                    onCheckedChange={async (checked) => {
                      setUseRealData(checked)
                      setLoading(true)
                      try {
                        const newFlights = checked 
                          ? await fetchRealFlights(flightCount)
                          : generateFlights(flightCount)
                        setFlights(newFlights)
                        toast.success(checked ? 'Using real OpenSky Network data' : 'Using simulated flight data')
                      } catch (error) {
                        toast.error('Failed to load real data, using simulated')
                        setFlights(generateFlights(flightCount))
                      } finally {
                        setLoading(false)
                      }
                    }}
                    id="real-data"
                  />
                  <Label htmlFor="real-data" className="text-sm text-muted-foreground cursor-pointer">
                    Real-Time Data {loading && '(Loading...)'}
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={showMilitaryOnly}
                    onCheckedChange={setShowMilitaryOnly}
                    id="military-only"
                  />
                  <Label htmlFor="military-only" className="text-sm text-muted-foreground cursor-pointer">
                    Military Aircraft Only
                  </Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="cameras" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Camera Type</label>
                  <Select value={filterType} onValueChange={(v) => setFilterType(v as CameraFeed['type'] | 'all')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types ({allCameras.length})</SelectItem>
                      <SelectItem value="webcam">Webcams ({allCameras.filter(c => c.type === 'webcam').length})</SelectItem>
                      <SelectItem value="traffic">Traffic ({allCameras.filter(c => c.type === 'traffic').length})</SelectItem>
                      <SelectItem value="satellite">Satellites ({allCameras.filter(c => c.type === 'satellite').length})</SelectItem>
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
              <div className="text-xs text-muted-foreground">
                Showing {filteredCameras.length} of {allCameras.length} camera feeds
              </div>
            </TabsContent>

            <TabsContent value="layers" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Switch checked={showFlightPaths} onCheckedChange={setShowFlightPaths} id="flight-paths" />
                  <Label htmlFor="flight-paths" className="text-sm cursor-pointer">Flight Paths</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={showAirplanes} onCheckedChange={setShowAirplanes} id="airplanes" />
                  <Label htmlFor="airplanes" className="text-sm cursor-pointer">Aircraft Markers</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={showCameras} onCheckedChange={setShowCameras} id="cameras" />
                  <Label htmlFor="cameras" className="text-sm cursor-pointer">Camera Feeds ({allCameras.length})</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={showSatellites} onCheckedChange={setShowSatellites} id="satellites" />
                  <Label htmlFor="satellites" className="text-sm cursor-pointer">Satellites ({satellitePasses.length})</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={showWeather} onCheckedChange={setShowWeather} id="weather" />
                  <Label htmlFor="weather" className="text-sm cursor-pointer">Weather Overlay</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={showEvents} onCheckedChange={setShowEvents} id="events" />
                  <Label htmlFor="events" className="text-sm cursor-pointer">Intelligence Events</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="controls" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Globe Rotation Speed</Label>
                  <Slider
                    value={[globeRotationSpeed]}
                    onValueChange={([value]) => setGlobeRotationSpeed(value)}
                    min={0}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="text-xs text-accent text-center">{globeRotationSpeed.toFixed(1)}x</div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Holographic Intensity</Label>
                  <Slider
                    value={[holographicIntensity]}
                    onValueChange={([value]) => setHolographicIntensity(value)}
                    min={0}
                    max={1}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="text-xs text-accent text-center">{Math.round(holographicIntensity * 100)}%</div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Flight Density</Label>
                  <Slider
                    value={[flightCount]}
                    onValueChange={([value]) => {
                      setFlightCount(value)
                      const newFlights = generateFlights(value)
                      setFlights(newFlights)
                      toast.success(`Flight density updated to ${value} routes`)
                    }}
                    min={100}
                    max={1000}
                    step={50}
                    className="w-full"
                  />
                  <div className="text-xs text-accent text-center">{flightCount} routes</div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={flightDialogOpen} onOpenChange={setFlightDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Airplane size={24} className="text-accent" weight="fill" />
              Flight Details: {selectedFlight?.callsign}
            </DialogTitle>
          </DialogHeader>
          {selectedFlight && (
            <ScrollArea className="max-h-[600px]">
              <div className="space-y-4 pr-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 rounded-lg p-4 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Info size={16} className="text-accent" />
                      <span className="text-xs text-muted-foreground">Flight ID</span>
                    </div>
                    <div className="text-lg font-bold font-mono">{selectedFlight.callsign}</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Target size={16} className="text-accent" />
                      <span className="text-xs text-muted-foreground">Status</span>
                    </div>
                    <Badge className="text-sm">
                      {selectedFlight.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Gauge size={18} className="text-accent" />
                    Current Position & Velocity
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Altitude:</span>
                      <span className="font-mono font-bold">{selectedFlight.currentPosition.altitude.toFixed(0)} ft</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Speed:</span>
                      <span className="font-mono font-bold">{selectedFlight.currentPosition.speed.toFixed(0)} kt</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Compass size={14} />
                        Heading:
                      </span>
                      <span className="font-mono font-bold">{selectedFlight.currentPosition.heading.toFixed(0)}°</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <ArrowUp size={14} />
                        V/S:
                      </span>
                      <span className="font-mono font-bold">{selectedFlight.currentPosition.verticalRate.toFixed(0)} ft/min</span>
                    </div>
                    <div className="flex justify-between col-span-2">
                      <span className="text-muted-foreground">Coordinates:</span>
                      <span className="font-mono text-xs">
                        {selectedFlight.currentPosition.lat.toFixed(4)}°, {selectedFlight.currentPosition.lng.toFixed(4)}°
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {selectedFlight.origin && (
                    <div className="bg-card border border-border rounded-lg p-4">
                      <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                        <Buildings size={16} className="text-green-500" />
                        Origin
                      </h3>
                      <div className="space-y-1 text-sm">
                        <div className="font-bold">{selectedFlight.origin.code}</div>
                        <div className="text-xs text-muted-foreground">{selectedFlight.origin.name}</div>
                        <div className="text-xs text-muted-foreground">{selectedFlight.origin.country}</div>
                      </div>
                    </div>
                  )}
                  {selectedFlight.destination && (
                    <div className="bg-card border border-border rounded-lg p-4">
                      <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                        <Buildings size={16} className="text-red-500" />
                        Destination
                      </h3>
                      <div className="space-y-1 text-sm">
                        <div className="font-bold">{selectedFlight.destination.code}</div>
                        <div className="text-xs text-muted-foreground">{selectedFlight.destination.name}</div>
                        <div className="text-xs text-muted-foreground">{selectedFlight.destination.country}</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-card border border-border rounded-lg p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Airplane size={18} className="text-accent" />
                    Aircraft Information
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium">{selectedFlight.aircraft.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Registration:</span>
                      <span className="font-mono">{selectedFlight.aircraft.registration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Airline:</span>
                      <span className="font-medium">{selectedFlight.aircraft.airline}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ICAO24:</span>
                      <span className="font-mono">{selectedFlight.icao24}</span>
                    </div>
                    {selectedFlight.squawk && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Squawk:</span>
                        <span className="font-mono">{selectedFlight.squawk}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category:</span>
                      <Badge variant={selectedFlight.isMilitary ? 'destructive' : 'default'}>
                        {selectedFlight.isMilitary ? 'MILITARY' : 'CIVILIAN'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {selectedFlight.departureTime && selectedFlight.arrivalTime && (
                  <div className="bg-card border border-border rounded-lg p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Clock size={18} className="text-accent" />
                      Flight Schedule
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Departure:</span>
                        <span className="font-mono">{selectedFlight.departureTime.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Arrival:</span>
                        <span className="font-mono">{selectedFlight.arrivalTime.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Progress:</span>
                        <span className="font-bold">{(selectedFlight.progress * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  Last updated: {new Date(selectedFlight.lastUpdate * 1000).toLocaleString()}
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      <Card className="p-4 border-border bg-card/50">
        <div className="flex items-start gap-3">
          <Info size={20} className="text-accent mt-1" weight="fill" />
          <div>
            <h3 className="font-semibold text-sm mb-1">Interactive Features</h3>
            <p className="text-xs text-muted-foreground">
              Click on any aircraft to view detailed flight information including real-time position, speed, altitude, heading, vertical speed, origin/destination airports, and aircraft details. 
              The globe integrates {flights.length} live flights from OpenSky Network, {allCameras.length} camera feeds worldwide, {satellitePasses.length} orbital satellites, and collaborative intelligence layers. 
              Move your mouse to control the camera angle. Toggle layers to show/hide different data sources. Military aircraft are shown in red when detected.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
