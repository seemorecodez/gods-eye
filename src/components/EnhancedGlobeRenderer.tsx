import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface GlobePoint {
  id: string
  lat: number
  lng: number
  type: 'flight' | 'camera' | 'satellite'
  color: number
}

interface EnhancedGlobeRendererProps {
  points: GlobePoint[]
  showConnectionLines: boolean
  cameraDistance: number
  autoRotate: boolean
  onPointClick?: (point: GlobePoint) => void
  onPointHover?: (point: GlobePoint | null) => void
}

export function EnhancedGlobeRenderer({
  points,
  showConnectionLines,
  cameraDistance,
  autoRotate,
  onPointClick,
  onPointHover
}: EnhancedGlobeRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const globeRef = useRef<THREE.Mesh | null>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!containerRef.current) return

    const width = containerRef.current.clientWidth
    const height = containerRef.current.clientHeight

    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x000000, 300, 600)
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(50, width / height, 1, 1000)
    camera.position.z = cameraDistance
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance'
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    rendererRef.current = renderer
    containerRef.current.appendChild(renderer.domElement)

    const sunLight = new THREE.DirectionalLight(0xffffff, 2)
    sunLight.position.set(200, 100, 100)
    sunLight.castShadow = true
    scene.add(sunLight)

    const ambientLight = new THREE.AmbientLight(0x333366, 0.6)
    scene.add(ambientLight)

    const fillLight = new THREE.DirectionalLight(0x6688aa, 0.4)
    fillLight.position.set(-100, -50, -100)
    scene.add(fillLight)

    const earthTexture = createRealisticEarthTexture()
    const bumpTexture = createBumpTexture()
    
    const globeGeometry = new THREE.SphereGeometry(100, 128, 128)
    const globeMaterial = new THREE.MeshPhongMaterial({
      map: earthTexture,
      bumpMap: bumpTexture,
      bumpScale: 2,
      specularMap: createSpecularTexture(),
      specular: new THREE.Color(0x333333),
      shininess: 15,
      emissive: new THREE.Color(0x111122),
      emissiveIntensity: 0.05
    })

    const globe = new THREE.Mesh(globeGeometry, globeMaterial)
    globe.castShadow = true
    globe.receiveShadow = true
    globeRef.current = globe
    scene.add(globe)

    const cloudsGeometry = new THREE.SphereGeometry(101, 64, 64)
    const cloudsMaterial = new THREE.MeshPhongMaterial({
      map: createCloudTexture(),
      transparent: true,
      opacity: 0.15,
      depthWrite: false
    })
    const clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial)
    scene.add(clouds)

    const atmosphereGeometry = new THREE.SphereGeometry(105, 64, 64)
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
          float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
          vec3 atmosphere = vec3(0.3, 0.6, 1.0) * intensity;
          gl_FragColor = vec4(atmosphere, intensity * 0.8);
        }
      `
    })
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial)
    scene.add(atmosphere)

    const stars = createStarField()
    scene.add(stars)

    const animate = () => {
      if (!renderer || !scene || !camera || !globe) return

      if (autoRotate) {
        globe.rotation.y += 0.0005
        clouds.rotation.y += 0.00055
      }

      renderer.render(scene, camera)
      animationFrameRef.current = requestAnimationFrame(animate)
    }
    animate()

    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return
      const w = containerRef.current.clientWidth
      const h = containerRef.current.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement)
      }
      window.removeEventListener('resize', handleResize)
    }
  }, [autoRotate])

  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.position.z = cameraDistance
    }
  }, [cameraDistance])

  return <div ref={containerRef} className="w-full h-full" />
}

function createRealisticEarthTexture(): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = 4096
  canvas.height = 2048
  const ctx = canvas.getContext('2d')!

  const oceanGradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
  oceanGradient.addColorStop(0, '#1a2332')
  oceanGradient.addColorStop(0.4, '#0d47a1')
  oceanGradient.addColorStop(0.5, '#0277bd')
  oceanGradient.addColorStop(0.6, '#0d47a1')
  oceanGradient.addColorStop(1, '#1a2332')
  ctx.fillStyle = oceanGradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const continents = [
    { x: 0.15, y: 0.35, w: 0.08, h: 0.25 },
    { x: 0.25, y: 0.25, w: 0.15, h: 0.3 },
    { x: 0.45, y: 0.15, w: 0.18, h: 0.35 },
    { x: 0.68, y: 0.25, w: 0.12, h: 0.28 },
    { x: 0.75, y: 0.45, w: 0.08, h: 0.12 },
    { x: 0.55, y: 0.65, w: 0.1, h: 0.15 },
  ]

  continents.forEach(cont => {
    const centerX = canvas.width * (cont.x + cont.w / 2)
    const centerY = canvas.height * (cont.y + cont.h / 2)
    const landGradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, canvas.width * Math.max(cont.w, cont.h) * 0.6
    )
    landGradient.addColorStop(0, '#4a7c3a')
    landGradient.addColorStop(0.4, '#2d5a1e')
    landGradient.addColorStop(0.7, '#1a3a12')
    landGradient.addColorStop(1, '#0f2808')
    ctx.fillStyle = landGradient

    for (let i = 0; i < 60; i++) {
      const offsetX = (Math.random() - 0.5) * canvas.width * cont.w * 0.4
      const offsetY = (Math.random() - 0.5) * canvas.height * cont.h * 0.4
      const size = Math.random() * canvas.width * cont.w * 0.7 + canvas.width * cont.w * 0.3
      ctx.beginPath()
      ctx.ellipse(
        centerX + offsetX,
        centerY + offsetY,
        size, size * 0.75,
        Math.random() * Math.PI,
        0, Math.PI * 2
      )
      ctx.fill()
    }
  })

  ctx.strokeStyle = 'rgba(100, 150, 200, 0.1)'
  ctx.lineWidth = 1
  for (let lat = -90; lat <= 90; lat += 15) {
    ctx.globalAlpha = lat === 0 ? 0.2 : 0.1
    ctx.beginPath()
    ctx.moveTo(0, ((90 - lat) / 180) * canvas.height)
    ctx.lineTo(canvas.width, ((90 - lat) / 180) * canvas.height)
    ctx.stroke()
  }
  for (let lng = -180; lng <= 180; lng += 15) {
    ctx.globalAlpha = lng === 0 ? 0.2 : 0.1
    ctx.beginPath()
    ctx.moveTo(((lng + 180) / 360) * canvas.width, 0)
    ctx.lineTo(((lng + 180) / 360) * canvas.width, canvas.height)
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  return new THREE.CanvasTexture(canvas)
}

function createBumpTexture(): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = 2048
  canvas.height = 1024
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#888888'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  return new THREE.CanvasTexture(canvas)
}

function createSpecularTexture(): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = 2048
  canvas.height = 1024
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  return new THREE.CanvasTexture(canvas)
}

function createCloudTexture(): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = 2048
  canvas.height = 1024
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = 'transparent'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
  for (let i = 0; i < 300; i++) {
    ctx.beginPath()
    ctx.arc(
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      Math.random() * 50 + 20,
      0, Math.PI * 2
    )
    ctx.fill()
  }
  return new THREE.CanvasTexture(canvas)
}

function createStarField(): THREE.Points {
  const starsGeometry = new THREE.BufferGeometry()
  const starsMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1.5,
    transparent: true,
    opacity: 0.8
  })

  const starsVertices = []
  for (let i = 0; i < 3000; i++) {
    const x = (Math.random() - 0.5) * 2000
    const y = (Math.random() - 0.5) * 2000
    const z = (Math.random() - 0.5) * 2000
    starsVertices.push(x, y, z)
  }

  starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3))
  return new THREE.Points(starsGeometry, starsMaterial)
}
