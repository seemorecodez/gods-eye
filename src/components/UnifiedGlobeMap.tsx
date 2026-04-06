import { useEffect, useRef, useState, useMemo } from 'react'
import * as THREE from 'three'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
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
import { useKV } from '@github/spark/hooks'

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
  const [showThreats, setShowThreats] = useState(false)
  const [showAnnotations, setShowAnnotations] = useState(true)

  const [selectedCamera, setSelectedCamera] = useState<CameraFeed | null>(null)
  const [annotationDialogOpen, setAnnotationDialogOpen] = useState(false)
  const [newAnnotation, setNewAnnotation] = useState({ title: '', description: '', lat: 0, lng: 0, type: 'info' as const })

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

    const loadData = async () => {
      setLoading(true)
      try {
        const [initialFlights, cameras, satellites] = await Promise.all([
          useRealData ? fetchRealFlights(flightCount) : Promise.resolve(generateFlights(flightCount)),
          fetchWindyWebcams(),
          fetchSatellitePasses()
        ])
        
        setFlights(initialFlights)
        setAllCameras(cameras)
        setSatellitePasses(satellites)
        
        const weather = await generateWeatherGrid()
        setWeatherData(weather)
        
        const threats = await generateThreatPredictions(events)
        setThreatPredictions(threats)
        
        toast.success(`Loaded ${initialFlights.length} flights, ${cameras.length} cameras, ${satellites.length} satellites`)
      } catch (error) {
        console.error('Error loading data:', error)
        toast.error('Failed to load some data')
      } finally {
        setLoading(false)
      }
    }

    loadData()

    let mouseX = 0
    let mouseY = 0
    let targetRotationX = 0
    let targetRotationY = 0

    const onMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1
    }

    window.addEventListener('mousemove', onMouseMove)

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
      
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      
      if (rendererRef.current && containerRef.current && containerRef.current.contains(rendererRef.current.domElement)) {
        containerRef.current.removeChild(rendererRef.current.domElement)
        rendererRef.current.dispose()
      }
    }
  }, [])

  useEffect(() => {
    if (isPlaying && !animationIdRef.current) {
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

  const activeFlights = getActiveFlightsCount(flights)

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
                Interactive 3D globe combining flight tracking, camera feeds, satellites, and collaborative intelligence
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
            className="w-full h-[700px] rounded-lg border border-border bg-gradient-to-br from-background via-primary/5 to-background relative overflow-hidden"
            style={{
              boxShadow: `0 0 40px rgba(77, 195, 255, ${0.2 * holographicIntensity}), inset 0 0 60px rgba(77, 195, 255, ${0.1 * holographicIntensity})`
            }}
          />
          
          <Tabs defaultValue="controls" className="mt-4">
            <TabsList>
              <TabsTrigger value="controls">
                <Gauge size={16} className="mr-2" />
                Controls
              </TabsTrigger>
              <TabsTrigger value="layers">
                <MapTrifold size={16} className="mr-2" />
                Layers
              </TabsTrigger>
              <TabsTrigger value="data">
                <Info size={16} className="mr-2" />
                Data
              </TabsTrigger>
            </TabsList>

            <TabsContent value="controls" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            <TabsContent value="layers" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={showFlightPaths}
                    onCheckedChange={setShowFlightPaths}
                    id="flight-paths"
                  />
                  <Label htmlFor="flight-paths" className="text-sm text-muted-foreground cursor-pointer">
                    <Airplane size={16} className="inline mr-1" />
                    Flight Paths
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={showCameras}
                    onCheckedChange={setShowCameras}
                    id="cameras"
                  />
                  <Label htmlFor="cameras" className="text-sm text-muted-foreground cursor-pointer">
                    <Video size={16} className="inline mr-1" />
                    Cameras ({allCameras.length})
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={showSatellites}
                    onCheckedChange={setShowSatellites}
                    id="satellites"
                  />
                  <Label htmlFor="satellites" className="text-sm text-muted-foreground cursor-pointer">
                    <Target size={16} className="inline mr-1" />
                    Satellites ({satellitePasses.length})
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={showWeather}
                    onCheckedChange={setShowWeather}
                    id="weather"
                  />
                  <Label htmlFor="weather" className="text-sm text-muted-foreground cursor-pointer">
                    <CloudRain size={16} className="inline mr-1" />
                    Weather
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={showThreats}
                    onCheckedChange={setShowThreats}
                    id="threats"
                  />
                  <Label htmlFor="threats" className="text-sm text-muted-foreground cursor-pointer">
                    <Warning size={16} className="inline mr-1" />
                    Threats ({threatPredictions.length})
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={showAnnotations}
                    onCheckedChange={setShowAnnotations}
                    id="annotations"
                  />
                  <Label htmlFor="annotations" className="text-sm text-muted-foreground cursor-pointer">
                    <ChatCircle size={16} className="inline mr-1" />
                    Annotations ({annotations?.length || 0})
                  </Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="data" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="bg-muted/50 rounded-lg p-3 border border-border">
                  <div className="text-xs text-muted-foreground">En Route</div>
                  <div className="text-2xl font-bold text-foreground">
                    {flights.filter(f => f.status === 'en-route').length}
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 border border-border">
                  <div className="text-xs text-muted-foreground">Cameras</div>
                  <div className="text-2xl font-bold text-foreground">
                    {allCameras.length}
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 border border-border">
                  <div className="text-xs text-muted-foreground">Satellites</div>
                  <div className="text-2xl font-bold text-foreground">
                    {satellitePasses.length}
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 border border-border">
                  <div className="text-xs text-muted-foreground">Weather Pts</div>
                  <div className="text-2xl font-bold text-foreground">
                    {weatherData.length}
                  </div>
                </div>
                <div className="bg-destructive/20 rounded-lg p-3 border border-destructive/50">
                  <div className="text-xs text-destructive-foreground">Threats</div>
                  <div className="text-2xl font-bold text-destructive">
                    {threatPredictions.length}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
