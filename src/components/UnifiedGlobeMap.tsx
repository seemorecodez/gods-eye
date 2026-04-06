import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Airplane, Globe, Pause, Play } from '@phosphor-icons/react'
import { toast } from 'sonner'

export function UnifiedGlobeMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const globeRef = useRef<THREE.Group | null>(null)
  const animationIdRef = useRef<number | null>(null)
  
  const [isPlaying, setIsPlaying] = useState(true)
  const [flightCount, setFlightCount] = useState(0)

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
    camera.position.set(0, 0, 500)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance'
    })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setClearColor(0x000000, 0)
    rendererRef.current = renderer
    containerRef.current.appendChild(renderer.domElement)

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambientLight)

    const pointLight1 = new THREE.PointLight(0x4dc3ff, 1, 1000)
    pointLight1.position.set(200, 200, 200)
    scene.add(pointLight1)

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
      emissive: new THREE.Color(0x1a3a5c),
      emissiveIntensity: 0.2,
      shininess: 100,
      specular: new THREE.Color(0x4dc3ff)
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

    const glowGeometry = new THREE.SphereGeometry(215, 32, 32)
    const glowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        c: { value: 0.3 },
        p: { value: 4.0 },
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

    const latLngLines = createLatLngLines()
    globeGroup.add(latLngLines)

    let mouseX = 0
    let mouseY = 0

    const handleMouseMove = (event: MouseEvent) => {
      if (!containerRef.current) return
      mouseX = (event.clientX / containerRef.current.clientWidth) * 2 - 1
      mouseY = -(event.clientY / containerRef.current.clientHeight) * 2 + 1
    }

    window.addEventListener('mousemove', handleMouseMove)

    const animate = () => {
      if (!isPlaying) return
      
      animationIdRef.current = requestAnimationFrame(animate)

      if (globeRef.current) {
        globeRef.current.rotation.y += 0.001
      }

      if (cameraRef.current && globeRef.current) {
        const targetCameraX = mouseX * 100
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

    toast.success('Globe initialized successfully')

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement)
      }
      
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      
      try {
        rendererRef.current?.dispose()
      } catch (e) {
        console.error('Error disposing renderer:', e)
      }
    }
  }, [])

  useEffect(() => {
    if (isPlaying && !animationIdRef.current) {
      const animate = () => {
        animationIdRef.current = requestAnimationFrame(animate)

        if (globeRef.current) {
          globeRef.current.rotation.y += 0.001
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
  }, [isPlaying])

  function createGradientTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')!
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 512)
    gradient.addColorStop(0, '#001a33')
    gradient.addColorStop(1, '#003366')
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 512, 512)
    
    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    return texture
  }

  function createLatLngLines(): THREE.Group {
    const linesGroup = new THREE.Group()
    const lineMaterial = new THREE.LineBasicMaterial({ 
      color: 0x4dc3ff, 
      transparent: true, 
      opacity: 0.3 
    })

    for (let lat = -80; lat <= 80; lat += 20) {
      const points = []
      for (let lng = 0; lng <= 360; lng += 5) {
        const theta = lng * (Math.PI / 180)
        const phi = (90 - lat) * (Math.PI / 180)
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
        const theta = lng * (Math.PI / 180)
        const phi = (90 - lat) * (Math.PI / 180)
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

  return (
    <Card className="border-border bg-card/50 backdrop-blur">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe size={32} className="text-accent" weight="fill" />
            <div>
              <CardTitle className="text-2xl">Unified Intelligence Globe</CardTitle>
              <CardDescription>
                Interactive 3D geospatial visualization platform
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-2">
              <Airplane size={16} />
              {flightCount} Active
            </Badge>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div 
          ref={containerRef}
          className="w-full h-[700px] rounded-lg border border-border bg-background/50 overflow-hidden"
        />
        <div className="mt-4 text-xs text-muted-foreground">
          <p>
            The globe integrates real-time flight tracking, camera feeds, satellite imagery, and collaborative intelligence.
            Use mouse to interact with the 3D globe visualization.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
