import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader,
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { fetchWindyWebcams } from '@/lib/windy-webcams-a
import { fetchSatellitePasses, generateSatellit
import { fetchAllRepositories } from '@/lib/github-api'
import { MapEvent, CameraFeed, WeatherData, T
import { toast } from 'sonner'
  const satellitesRef = useRef<THREE.Group | 
  const containerRef = useRef<HTMLDivElemen
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const globeRef = useRef<THREE.Group | null>(null)e(true)
  const airplanesRef = useRef<Map<string, THREE.Mesh>>(new Map
  const satellitesGroupRef = useRef<THREE.Group | null>(null)
  const eventsGroupRef = useRef<THREE.Group | null>(nul
  const raycasterRef = useRef<THREE.Raycaster>(new THRE
  
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null)
  const [showFlightPaths, setShowFlightPaths] = useState(true)
  const [showMilitaryOnly, set
  const [globeRotationSpeed, setGlobeRotationSpeed] = useState(0.3)
  const [flightCount, setFlightCount] = useState(500).current.clientHeight,
  const [holographicIntensity, setHolographicIntensity] = useState(0.8)
  const [loading, setLoading] = useState(false)
    )
  const [allCameras, setAllCameras] = useState<CameraFeed[]>([])
  const [satellitePasses, setSatellitePasses] = useState<SatellitePass[]>([])
  const [weatherData, setWeatherData] = useState<WeatherData[]>([])
  const [events, setEvents] = useState<MapEvent[]>([])
  const [threatPredictions, setThreatPredictions] = useState<ThreatPrediction[]>([])
  const [annotations, setAnnotations] = useKV<MapAnnotation[]>("unified-map-annotations", [])
      powerPreference: 'high-performance'
  const [showCameras, setShowCameras] = useState(false)
  const [showSatellites, setShowSatellites] = useState(false)nerRef.current.clientHeight)
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
    const pointLight2 = new THREE.PointLight(0x00ffff, 0.5, 1000)
  useEffect(() => {ition.set(-200, -200, 200)
    async function loadAllData() {
      setLoading(true)
      try {lobeGroup = new THREE.Group()
        const initialFlights = useRealData 
          ? await fetchRealFlights(flightCount)
          : generateFlights(flightCount)
        setFlights(initialFlights)EE.SphereGeometry(200, 64, 64)
        
        const [webcams, trafficCams, satellites, satelliteFeeds, repos] = await Promise.all([
          fetchWindyWebcams(100),
          fetchTrafficCameras(),HREE.MeshPhongMaterial({
          fetchSatellitePasses(),
          generateSatelliteImageryFeeds(),
          fetchAllRepositories()
        ])iness: 100,
        ecular: new THREE.Color(0x4dc3ff),
        const combinedCameras = [...webcams, ...trafficCams, ...satelliteFeeds]
        setAllCameras(combinedCameras)
        setSatellitePasses(satellites)
        
        const weather = await generateWeatherGrid(30)ereMaterial)
        setWeatherData(weather)
        
        const activityData = repos.map((repo, idx) => {201, 32, 32)
          const latRange = [-60, 60]REE.MeshBasicMaterial({
          const lngRange = [-180, 180]
          return {rue,
            id: `event-${idx}`,
            type: 'detection' as const,
            lat: latRange[0] + Math.random() * (latRange[1] - latRange[0]),
            lng: lngRange[0] + Math.random() * (lngRange[1] - lngRange[0]),
            title: repo.name,
            description: repo.description,
            severity: 'medium' as const,s()
            timestamp: new Date(),
            repository: repo.fullName
          }lowGeometry = new THREE.SphereGeometry(215, 32, 32)
        })glowMaterial = new THREE.ShaderMaterial({
        setEvents(activityData.slice(0, 50))
        c: { value: 0.3 },
        const threats = await generateThreatPredictions(activityData, 20)
        setThreatPredictions(threats).Color(0x4dc3ff) },
        viewVector: { value: camera.position }
        toast.success(`Loaded ${initialFlights.length} flights, ${combinedCameras.length} cameras, ${satellites.length} satellites`)
      } catch (error) {
        console.error('Error loading data:', error)
        toast.error('Failed to load some data')
      } finally {() {
        setLoading(false)normalize(normalMatrix * normal);
      }   vec3 vNormel = normalize(normalMatrix * viewVector);
    i     intensity = pow(0.7 - dot(vNormal, vNormel), 4.0);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      45
      fragmentShader: `
    )   uniform vec3 glowColor;
    cameraRef.current = cameray;
        void main() {
      alpha: true,w = glowColor * intensity;
    })    gl_FragColor = vec4(glow, intensity * 0.8);
        }
    containerRef.current.appendChild(renderer.d
      side: THREE.BackSide,
    scene.add(ambientLight)iveBlending,
    const sparent: true
    scene.a
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial)
    scene.add(pointLight2)h)
    const globeGroup = new THR

    const sphereGeometry = new THREE.SphereGeom
    
      map: gradien
      opacity: 0.3,
      
      emissiveIntensity: 0.2
    
    globeGroup.add(sphere)
    const wireframeGeometry = new THREE.SphereGeometry(20
      color: 0x4dc3ff,

    })
    globeGroup.add(wirefram


    const glowMaterial = new THREE.ShaderM
        c: { value: 0.3 }

      },
        uniform vec3 viewVector;
        void main() {

          gl_Position = projectionMatrix
      `,
        uniform vec3 glow

          gl_FragColor = vec4(glow, intensity * 0.8);
      `,
    
    })
    globeGroup.add(glowMesh
    const flightLinesGro
    scene.add(fligh
    const camerasGrou
    scene.add(camerasGroup)
    const satellitesGroup = new THREE.Grou
    scene.add(satellitesGrou
    co
    
    const eventsGroup = new THREE.Group()
    scene.add(eventsGroup)

    let targetRotationX = 0

      if (!containerRe
      mouseX = (event.
      
      mouseRef.curr

      if (!containerRef.current || !cameraRef.current) return
      raycasterRef.current.se

      
        const clickedPlane = in

          setSelectedFlight(flight)
        }
    }
    window.addEventListene

      if (!isPlaying) return
      animationIdRef.current = requestAnimatio
      if
        targetRotatio
        globeRef.current.rotatio
      }
      if (cameraRef.c
        const targetCameraY = -mouseY * 50
        cameraRef.current.position.x += (targetCameraX - camer
        cameraRef.current.lookAt(globeRef.current.position)

        r
    }
    animate()
    const handleResize = () => 
      
      cameraRef.curre
    }
    window.addEventListener('resize', handleResize)
    retur
      wi
        containerRef.curren
      
        cancelAnimation
      
        try {
        } catch (e) {}

  }, [])
  useEffect(() => {
      const animate = () => {

          globeRef.current.rotation.y += g

          rendererRef.curre

    } else if (!isPlaying && animationIdRef.c
      animationIdRef.current = null
  }, [isPlaying, globeRotation

      setFlights(currentFlights => {
        
          const newFlights = ge

        return updated
    }, 2000)
    return () => clearInte

    if (!useRealDa
    const refreshI
        const freshFlights 
      } catch (error) {


  }, [useRealData, flightCount])
  useEffect(() => {
    
      flightLinesRef.current.remove(flightLinesRef.current.c
    
    
    createFlightVisuals(filteredFlights, flightLinesRef.current)


    while (camerasGroupRef.current.children.
    }
    if
        const pos = latLngToVector3(camera.lat, camera.lng, 205)
      
          transparent: true,
        })
      
      })
  }, [allCameras, showCameras])
  useEffect(() => {
    
      satellitesGroup
    
      satellitePasses.forEach(sat =
        c
       
     

        satellitesGroupRef.current!.add(marker)
    }

    const canvas = document
    canvas.height = 512
    
    gradient.addColorStop(0, '#001a33')

    ctx.fillStyle = gradient
    
    texture.needsUpdate = true
  }
  function createLatLngLines(): THREE.Group {
    const lineMaterial = new THREE.LineBasicMaterial({ 
      t

    for (let lat = -80; lat <= 80; lat += 20) {
      for (let lng = 0; lng <= 360; lng +
        const theta = lng * (Math.PI / 180
        
        const z = 200 * Math.sin(phi) * Math.sin(theta)
        points.push(new THREE.Vector3(x, y, z))
      
     

        satellitesGroupRef.current!.add(marker)
    }

    const canvas = document
    canvas.height = 512
    
    gradient.addColorStop(0, '#001a33')

    ctx.fillStyle = gradient
    
    texture.needsUpdate = true
  }
  function createLatLngLines(): THREE.Group {
    const lineMaterial = new THREE.LineBasicMaterial({ 
      t

    for (let lat = -80; lat <= 80; lat += 20) {
      for (let lng = 0; lng <= 360; lng +
        const theta = lng * (Math.PI / 180
        
        const z = 200 * Math.sin(phi) * Math.sin(theta)
        points.push(new THREE.Vector3(x, y, z))
      
      c

        const points = curve.getPoints(50)
       
      
          opacity: 0.15 * holographicIntensity 
        
        linesGroup.add(line)

        const currentPos = latLngToVe
       
     
        

          opacity: 
        const plane = new THREE.Mesh(planeGeometry, planeMaterial)
        plane.position.copy(c
        

            flight.destination.
          )
        }

      }
  }
  const s
      t
    }
    const user = await window.spark.user()
    const annotation: MapAnnotation = {
      lat: 0,
     
      timestamp: new Date(),

    setAnnotations(
    
    setAnnotationDialogOpen(false)

    retu
      if (filterRegion && !cam.name.toLowerCase()
    })

  const m
  return
      <Card className=
        
            

              <CardDescription>
              </Car

                <Ai
              </Badge>

                onClick={() => setIsPlaying(!isPlayin
           
            </div>
        </CardHeader>
          <div 
            className="w-full h-[700px] rounded-lg border bord
       
          />

              <TabsTrigger value="flights">
                Flights

                Cam
              <TabsTrigger value="layer
    
              <TabsTrigger value="controls">
                Controls
     
    
                <div className="
    
                <div className="bg-muted/50 rounded-lg p-3 border border-border">
                  <div className="text-2xl font-bold text-foregr
                  </div>

                  <
                  </div>
    
                  <div className="text-2xl font-bold text
                  </div>
     
    
                  </di
              </div>
              <div className="flex items-center gap-6 flex-wrap"
                  <Switch
                    onCheckedChange={async (checked) =
                      setLoading(true)
                        cons
                      
          
                        toast.error('Failed to load real 
                      } finally {
                      }
        
     
                  </Label>

                  <
                    onCheckedChange={setSho
    
                    Military Aircraft Only
                </div>
     
    
                <div clas
                  <Select value={filte
                      <SelectValue />
                    <SelectContent>
                      <SelectItem value="webcam">Webca
                      <Sel
                  </Select>
                <div c
          
                    value={filterRegion}
                  />
              </div>
        
     
            <TabsContent value="layers"

                  <Label htmlFor="flight-paths" cla
                <div className="flex items-center g
                  <Lab
                <div cl
                  <Label htmlFor="camera
    
                  <Label htmlFor="satellites" className="te
                <div className="flex it
                  <Label htmlFor="weather
                <div className="flex it
    
              </div>

    
                  <Label className="text-sm t
                    value={[gl
                  
   

                </div>
                <div className="space-y-
                  <Slider
                    onV
                    max={
                   
      

                  <Label className="text-sm tex
                    val
                      setFlightCount(value)
                      setFlights(newFlights)
                    }}
        
                    className="w-full"
                  <div className="tex
              </div>
        
      </Card>
      <
      
              <Airplane size={24} className="text-accent" weight="fill"
            </DialogTitle>
          {selectedFlight 
     

                      <Info size={16} classNa
                    </d
                  </div>
                    <div className="flex items-c
                      <span className="text
        
                    </Badge>
                </div>
                <div className="bg-card border border-b
        
                  </h3>
       
      
                    <div className="flex justify-between">
                      <span className="font-mono font-bol
                    <div c
     

                    <
   

                      <span className="font-mono font-bold">{selectedFlight.currentPo
                    <div className="flex jus
                      <span className="font-mon
    
                  </div>

                  {selectedFlight.origin && (
    
                        Origin
   

                      </div>
                  )}
                    <div className="bg-card border border-border rounded-lg p-
                        <Buildings size={16} className=

                        <div className="font-bo
                        <div className="text-xs text-muted-foreground">{selectedFli
                    </div>
        
                <div className="bg-card border borde
                    <Airplane size={18} classNa
                  </h3>
                    <div className="fle
                      <span cl
                    <d
                      <span classNam

                      <span className="font-medium">{selectedFlight.aircraft.ai
                    <div className="flex j
                      <span className="font-mono">{selectedFlight.icao24}
        
                        <span className="text-muted-for
                      </div>
                    <div clas
                      <Badge variant={selectedF
          
        

                  <div class
       

                      <div className="flex justify-between
                        <span className="fo
                      <div className=
                        <span classNa
                      <div className="flex justify-between">
         

                )}
                <div className="text-xs text-muted-foregroun
                </div>
            </ScrollArea>
        </DialogContent>

        <div className="flex items-start gap-3">
        
            <p className="text-xs text-
              The globe integrates {flights
        
        </div>
    </div>
}






















































































































































































































































































































































































































































































