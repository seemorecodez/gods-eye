import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { fetchRealFlights, generateFlights, updateFlights, Flight, getActiveFlightsCount, getMilitaryFlights } from '@/lib/airline-traffic'
import { Airplane, Globe, Pause, Play, Video, Radio } from '@phosphor-icons/react'
import { toast } from 'sonner'

export function UnifiedGlobeMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const globeRef = useRef<THREE.Group | null>(null)
  const flightLinesRef = useRef<THREE.Group | null>(null)
  const airplanesRef = useRef<THREE.Group | null>(null)
  const camerasRef = useRef<THREE.Group | null>(null)
  const satellitesRef = useRef<THREE.Group | null>(null)
  const animationIdRef = useRef<number | null>(null)
  
  const [flights, setFlights] = useState<Flight[]>([])
  const [isPlaying, setIsPlaying] = useState(true)
  const [showFlightPaths, setShowFlightPaths] = useState(true)
  const [showAirplanes, setShowAirplanes] = useState(true)
  const [showCameras, setShowCameras] = useState(true)
  const [showSatellites, setShowSatellites] = useState(true)
  const [showMilitaryOnly, setShowMilitaryOnly] = useState(false)
  const [useRealData, setUseRealData] = useState(true)
  const [globeRotationSpeed, setGlobeRotationSpeed] = useState(0.3)
  const [flightCount, setFlightCount] = useState(500)
  const [holographicIntensity, setHolographicIntensity] = useState(0.8)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('flights')

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

    const airplanesGroup = new THREE.Group()
    airplanesRef.current = airplanesGroup
    scene.add(airplanesGroup)

    const camerasGroup = new THREE.Group()
    camerasRef.current = camerasGroup
    scene.add(camerasGroup)
    createCameraMarkers(camerasGroup)

    const satellitesGroup = new THREE.Group()
    satellitesRef.current = satellitesGroup
    scene.add(satellitesGroup)
    createSatelliteMarkers(satellitesGroup)

    const loadFlights = async () => {
      setLoading(true)
      try {
        const initialFlights = useRealData 
          ? await fetchRealFlights(flightCount)
          : generateFlights(flightCount)
        setFlights(initialFlights)
        createFlightVisuals(initialFlights, flightLinesGroup, airplanesGroup)
        toast.success(`Loaded ${initialFlights.length} live flights`)
      } catch (error) {
        console.error('Error loading flights:', error)
        const fallbackFlights = generateFlights(flightCount)
        setFlights(fallbackFlights)
        createFlightVisuals(fallbackFlights, flightLinesGroup, airplanesGroup)
        toast.warning('Using simulated flight data')
      } finally {
        setLoading(false)
      }
    }

    loadFlights()

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
      
      if (rendererRef.current && containerRef.current) {
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

  useEffect(() => {
    if (!flightLinesRef.current || !airplanesRef.current) return
    
    while (flightLinesRef.current.children.length > 0) {
      flightLinesRef.current.remove(flightLinesRef.current.children[0])
    }
    while (airplanesRef.current.children.length > 0) {
      airplanesRef.current.remove(airplanesRef.current.children[0])
    }
    
    const filteredFlights = showMilitaryOnly ? getMilitaryFlights(flights) : flights
    createFlightVisuals(filteredFlights, flightLinesRef.current, airplanesRef.current)
  }, [flights, showFlightPaths, showAirplanes, showMilitaryOnly, holographicIntensity])

  useEffect(() => {
    if (camerasRef.current) {
      camerasRef.current.visible = showCameras
    }
  }, [showCameras])

  useEffect(() => {
    if (satellitesRef.current) {
      satellitesRef.current.visible = showSatellites
    }
  }, [showSatellites])

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

  function createCameraMarkers(group: THREE.Group) {
    const cameraLocations = [
      { lat: 40.7128, lng: -74.0060, name: 'New York' },
      { lat: 51.5074, lng: -0.1278, name: 'London' },
      { lat: 35.6762, lng: 139.6503, name: 'Tokyo' },
      { lat: 48.8566, lng: 2.3522, name: 'Paris' },
      { lat: -33.8688, lng: 151.2093, name: 'Sydney' },
      { lat: 55.7558, lng: 37.6173, name: 'Moscow' },
      { lat: 39.9042, lng: 116.4074, name: 'Beijing' },
      { lat: 19.4326, lng: -99.1332, name: 'Mexico City' },
    ]

    cameraLocations.forEach(cam => {
      const pos = latLngToVector3(cam.lat, cam.lng, 203)
      const geometry = new THREE.SphereGeometry(1.5, 16, 16)
      const material = new THREE.MeshBasicMaterial({ 
        color: 0xff6b00, 
        transparent: true,
        opacity: 0.8
      })
      const marker = new THREE.Mesh(geometry, material)
      marker.position.copy(pos)
      group.add(marker)
    })
  }

  function createSatelliteMarkers(group: THREE.Group) {
    for (let i = 0; i < 20; i++) {
      const lat = (Math.random() - 0.5) * 180
      const lng = (Math.random() - 0.5) * 360
      const altitude = 250 + Math.random() * 150
      
      const pos = latLngToVector3(lat, lng, altitude)
      const geometry = new THREE.OctahedronGeometry(1.2, 0)
      const material = new THREE.MeshBasicMaterial({ 
        color: 0x00ff88, 
        transparent: true,
        opacity: 0.9
      })
      const marker = new THREE.Mesh(geometry, material)
      marker.position.copy(pos)
      group.add(marker)
    }
  }

  function createFlightVisuals(
    flightList: Flight[],
    linesGroup: THREE.Group,
    planesGroup: THREE.Group
  ) {
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
          color: 0x00ffff, 
          transparent: true, 
          opacity: 0.15 * holographicIntensity 
        })
        
        const line = new THREE.Line(geometry, material)
        linesGroup.add(line)
      }

      if (showAirplanes && flight.status === 'en-route' && index % 5 === 0) {
        const currentPos = latLngToVector3(
          flight.currentPosition.lat,
          flight.currentPosition.lng,
          202 + (flight.currentPosition.altitude / 40000) * 30
        )

        const planeGeometry = new THREE.ConeGeometry(0.8, 2.5, 4)
        const planeMaterial = new THREE.MeshBasicMaterial({ 
          color: 0x4dc3ff,
          transparent: true,
          opacity: 0.9 * holographicIntensity
        })
        const plane = new THREE.Mesh(planeGeometry, planeMaterial)
        
        plane.position.copy(currentPos)
        
        const nextPos = latLngToVector3(
          flight.destination.lat,
          flight.destination.lng,
          202
        )
        plane.lookAt(nextPos)
        
        planesGroup.add(plane)
      }
    })
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
                Integrated view combining flight tracking, camera feeds, satellites, and collaborative intelligence
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
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList>
              <TabsTrigger value="flights">Flights</TabsTrigger>
              <TabsTrigger value="cameras">Cameras</TabsTrigger>
              <TabsTrigger value="satellites">Satellites</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="flights" className="space-y-4">
              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={showFlightPaths}
                    onCheckedChange={setShowFlightPaths}
                    id="flight-paths"
                  />
                  <Label htmlFor="flight-paths" className="text-sm text-muted-foreground cursor-pointer">
                    Flight Paths
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={showAirplanes}
                    onCheckedChange={setShowAirplanes}
                    id="airplanes"
                  />
                  <Label htmlFor="airplanes" className="text-sm text-muted-foreground cursor-pointer">
                    Aircraft Markers
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

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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
                <div className="bg-muted/50 rounded-lg p-3 border border-border">
                  <div className="text-xs text-muted-foreground">Scheduled</div>
                  <div className="text-2xl font-bold text-foreground">
                    {flights.filter(f => f.status === 'scheduled').length}
                  </div>
                </div>
                <div className="bg-destructive/20 rounded-lg p-3 border border-destructive/50">
                  <div className="text-xs text-destructive-foreground">Military</div>
                  <div className="text-2xl font-bold text-destructive">
                    {getMilitaryFlights(flights).length}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="cameras" className="space-y-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={showCameras}
                  onCheckedChange={setShowCameras}
                  id="show-cameras"
                />
                <Label htmlFor="show-cameras" className="text-sm text-muted-foreground cursor-pointer">
                  Show Camera Feeds
                </Label>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-muted/50 rounded-lg p-3 border border-border">
                  <Video size={20} className="text-accent mb-2" />
                  <div className="text-xs text-muted-foreground">Active Cameras</div>
                  <div className="text-xl font-bold text-foreground">8</div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="satellites" className="space-y-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={showSatellites}
                  onCheckedChange={setShowSatellites}
                  id="show-satellites"
                />
                <Label htmlFor="show-satellites" className="text-sm text-muted-foreground cursor-pointer">
                  Show Satellites
                </Label>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-muted/50 rounded-lg p-3 border border-border">
                  <Radio size={20} className="text-accent mb-2" />
                  <div className="text-xs text-muted-foreground">Tracked Satellites</div>
                  <div className="text-xl font-bold text-foreground">20</div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
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
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
