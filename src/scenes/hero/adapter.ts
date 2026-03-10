import * as THREE from 'three'
import { createSceneBundle } from '../core/createSceneBundle'
import type { SceneAdapter, SceneMountOptions, ScenePerformanceMode } from '../core/types'

export interface HeroTextContent {
  eyebrow: string
  title: string
  subtitle: string
}

export interface HeroSceneAdapter extends SceneAdapter {
  setMousePosition: (normalizedX: number, normalizedY: number) => void
  setTextContent: (content: HeroTextContent) => void
}

/* ---------- physics constants ---------- */
const DAMPING = 0.14
const DRAG = 1 - DAMPING
const MASS = 0.1
const REST = 25
const X_SEGS = 32
const Y_SEGS = 20
const GRAVITY_VAL = 981 * 0.35
const TS = 18 / 1000
const TS_SQ = TS * TS
const CONSTRAINT_ITERS = 8

const clothW = REST * X_SEGS
const clothH = REST * Y_SEGS

const gravityForce = new THREE.Vector3(0, -GRAVITY_VAL * MASS, 0)

/* ---------- canvas text texture ---------- */
const TEX_W = 2048
const TEX_H = 1280

function createTextCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = TEX_W
  canvas.height = TEX_H
  return canvas
}

function drawGradientOnly(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!
  const w = canvas.width
  const h = canvas.height
  const grad = ctx.createLinearGradient(0, 0, w * 0.3, h)
  grad.addColorStop(0, '#2a9d7e')
  grad.addColorStop(0.5, '#35b896')
  grad.addColorStop(1, '#4dc8b0')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  ctx.fillStyle = 'rgba(255,255,255,0.03)'
  for (let i = 0; i < 800; i++) {
    ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2)
  }
}

function drawTextContent(canvas: HTMLCanvasElement, content: HeroTextContent) {
  const ctx = canvas.getContext('2d')!
  const w = canvas.width
  const h = canvas.height

  /* gradient background */
  const grad = ctx.createLinearGradient(0, 0, w * 0.3, h)
  grad.addColorStop(0, '#2a9d7e')
  grad.addColorStop(0.5, '#35b896')
  grad.addColorStop(1, '#4dc8b0')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  /* subtle noise overlay for fabric feel */
  ctx.fillStyle = 'rgba(255,255,255,0.03)'
  for (let i = 0; i < 800; i++) {
    ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2)
  }

  const cx = w / 2
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  /* eyebrow */
  ctx.fillStyle = 'rgba(255,255,255,0.75)'
  ctx.font = `500 ${Math.round(w * 0.022)}px "Space Grotesk", "IBM Plex Sans", system-ui, sans-serif`
  ctx.fillText(content.eyebrow.toUpperCase(), cx, h * 0.18)

  /* title — word wrap */
  ctx.fillStyle = '#ffffff'
  ctx.font = `700 ${Math.round(w * 0.058)}px "Space Grotesk", "IBM Plex Sans", system-ui, sans-serif`
  const titleLines = wrapText(ctx, content.title, w * 0.82)
  const titleLineH = w * 0.068
  const titleStartY = h * 0.42 - ((titleLines.length - 1) * titleLineH) / 2
  for (let i = 0; i < titleLines.length; i++) {
    ctx.fillText(titleLines[i], cx, titleStartY + i * titleLineH)
  }

  /* subtitle */
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.font = `400 ${Math.round(w * 0.024)}px "IBM Plex Sans", "Space Grotesk", system-ui, sans-serif`
  const subLines = wrapText(ctx, content.subtitle, w * 0.7)
  const subLineH = w * 0.034
  const subStartY = h * 0.72 - ((subLines.length - 1) * subLineH) / 2
  for (let i = 0; i < subLines.length; i++) {
    ctx.fillText(subLines[i], cx, subStartY + i * subLineH)
  }
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}

/* ---------- parametric surface ---------- */
function clothPos(u: number, v: number, out: THREE.Vector3) {
  out.set((u - 0.5) * clothW, -v * clothH, 0)
}

/* ---------- particle ---------- */
class Particle {
  position: THREE.Vector3
  previous: THREE.Vector3
  original: THREE.Vector3
  a = new THREE.Vector3()
  invMass: number
  private t1 = new THREE.Vector3()
  private t2 = new THREE.Vector3()

  constructor(u: number, v: number) {
    this.position = new THREE.Vector3()
    this.previous = new THREE.Vector3()
    this.original = new THREE.Vector3()
    this.invMass = 1 / MASS
    clothPos(u, v, this.position)
    clothPos(u, v, this.previous)
    clothPos(u, v, this.original)
  }

  addForce(f: THREE.Vector3) {
    this.a.add(this.t2.copy(f).multiplyScalar(this.invMass))
  }

  integrate() {
    const np = this.t1.subVectors(this.position, this.previous)
    np.multiplyScalar(DRAG).add(this.position)
    np.add(this.a.multiplyScalar(TS_SQ))
    this.t1 = this.previous
    this.previous = this.position
    this.position = np
    this.a.set(0, 0, 0)
  }
}

/* ---------- constraint solver ---------- */
const diff = new THREE.Vector3()
function satisfy(p1: Particle, p2: Particle, dist: number) {
  diff.subVectors(p2.position, p1.position)
  const cur = diff.length()
  if (cur === 0) return
  const correction = diff.multiplyScalar(1 - dist / cur)
  const half = correction.multiplyScalar(0.5)
  p1.position.add(half)
  p2.position.sub(half)
}

/* ---------- responsive scale helper ---------- */
function getResponsiveParams(viewportW: number) {
  /* scale factor: 1.0 at 1280px, smaller on mobile, larger on wide screens */
  const base = Math.min(Math.max(viewportW / 1280, 0.45), 1.35)
  return {
    scale: 0.012 * base,
    cameraZ: THREE.MathUtils.lerp(9, 7, Math.min((viewportW - 375) / (1280 - 375), 1)),
    cameraY: THREE.MathUtils.lerp(-1.8, -2.2, Math.min((viewportW - 375) / (1280 - 375), 1)),
  }
}

/* ---------- adapter ---------- */
export function createSceneAdapter(): HeroSceneAdapter {
  const bundle = createSceneBundle({
    background: 0x000000,
    cameraPosition: [0, -2.2, 7.5],
  })
  bundle.scene.background = null
  bundle.camera.fov = 52
  bundle.camera.updateProjectionMatrix()

  const stage = new THREE.Group()
  const initParams = getResponsiveParams(window.innerWidth)
  stage.scale.setScalar(initParams.scale)
  bundle.camera.position.set(0, initParams.cameraY, initParams.cameraZ)
  bundle.camera.updateProjectionMatrix()
  bundle.root.add(stage)

  /* --- build particles & constraints --- */
  const particles: Particle[] = []
  for (let v = 0; v <= Y_SEGS; v++) {
    for (let u = 0; u <= X_SEGS; u++) {
      particles.push(new Particle(u / X_SEGS, v / Y_SEGS))
    }
  }

  const idx = (u: number, v: number) => u + v * (X_SEGS + 1)

  type Constraint = [Particle, Particle, number]
  const constraints: Constraint[] = []
  for (let v = 0; v < Y_SEGS; v++) {
    for (let u = 0; u < X_SEGS; u++) {
      constraints.push([particles[idx(u, v)], particles[idx(u, v + 1)], REST])
      constraints.push([particles[idx(u, v)], particles[idx(u + 1, v)], REST])
    }
  }
  for (let v = 0; v < Y_SEGS; v++) {
    constraints.push([particles[idx(X_SEGS, v)], particles[idx(X_SEGS, v + 1)], REST])
  }
  for (let u = 0; u < X_SEGS; u++) {
    constraints.push([particles[idx(u, Y_SEGS)], particles[idx(u + 1, Y_SEGS)], REST])
  }

  /* pins: entire top row */
  const pins: number[] = []
  for (let u = 0; u <= X_SEGS; u++) pins.push(idx(u, 0))

  /* --- build geometry --- */
  const numVerts = particles.length
  const positions = new Float32Array(numVerts * 3)
  const uvs = new Float32Array(numVerts * 2)
  const indices: number[] = []

  for (let v = 0; v <= Y_SEGS; v++) {
    for (let u = 0; u <= X_SEGS; u++) {
      const i = idx(u, v)
      uvs[i * 2] = u / X_SEGS
      uvs[i * 2 + 1] = v / Y_SEGS
    }
  }

  for (let v = 0; v < Y_SEGS; v++) {
    for (let u = 0; u < X_SEGS; u++) {
      const a = idx(u, v)
      const b = idx(u + 1, v)
      const c = idx(u, v + 1)
      const d = idx(u + 1, v + 1)
      indices.push(a, b, c)
      indices.push(b, d, c)
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
  geo.setIndex(indices)

  /* --- canvas texture --- */
  const textCanvas = createTextCanvas()
  drawGradientOnly(textCanvas) /* show gradient immediately, text added after fonts load */
  const canvasTexture = new THREE.CanvasTexture(textCanvas)
  canvasTexture.flipY = false
  canvasTexture.colorSpace = THREE.SRGBColorSpace

  const mat = new THREE.MeshPhongMaterial({
    map: canvasTexture,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.88,
    shininess: 18,
    specular: new THREE.Color(0x222222),
  })

  const clothMesh = new THREE.Mesh(geo, mat)
  stage.add(clothMesh)

  /* --- mouse interaction: raycasted pull effect --- */
  let activeMode: ScenePerformanceMode = 'default'
  const mouseNDC = { x: 0, y: 0 }
  const mouseSmooth = { x: 0, y: 0 }
  const windForce = new THREE.Vector3()
  const tmpForce = new THREE.Vector3()
  const raycaster = new THREE.Raycaster()
  const mouseVec2 = new THREE.Vector2()
  const pullPoint = new THREE.Vector3()
  let hasPullTarget = false

  function simulate(elapsed: number) {
    const speed = activeMode === 'reduced' ? 0.3 : 0.5

    /* gentle wind — heavily reduced Z component to prevent forward/back sway */
    const windStr = Math.cos(elapsed * speed / 7) * 3 + 6
    windForce.set(
      Math.sin(elapsed * speed / 2),
      Math.cos(elapsed * speed / 3) * 0.5,
      Math.sin(elapsed * speed) * 0.15,
    )
    windForce.normalize().multiplyScalar(windStr)

    /* per-face aerodynamic wind */
    const normals = geo.attributes.normal
    const faceIndices = geo.index
    if (normals && faceIndices) {
      const normal = new THREE.Vector3()
      for (let i = 0, il = faceIndices.count; i < il; i += 3) {
        for (let j = 0; j < 3; j++) {
          const vi = faceIndices.getX(i + j)
          normal.fromBufferAttribute(normals, vi)
          tmpForce.copy(normal).normalize().multiplyScalar(normal.dot(windForce))
          particles[vi].addForce(tmpForce)
        }
      }
    }

    /* mouse pull: attract nearby particles toward pull point */
    if (hasPullTarget) {
      const pullRadius = clothW * 0.35
      const pullStrength = 28
      for (const p of particles) {
        const dx = pullPoint.x - p.position.x
        const dy = pullPoint.y - p.position.y
        const dz = pullPoint.z - p.position.z
        const distSq = dx * dx + dy * dy + dz * dz
        const rSq = pullRadius * pullRadius
        if (distSq < rSq && distSq > 0) {
          const factor = (1 - distSq / rSq) * pullStrength
          tmpForce.set(dx, dy, dz + pullRadius * 0.3).normalize().multiplyScalar(factor)
          p.addForce(tmpForce)
        }
      }
    }

    for (const p of particles) {
      p.addForce(gravityForce)
      p.integrate()
    }

    /* Z-axis depth clamp — prevent cloth from billowing too far forward or backward */
    for (const p of particles) {
      if (p.position.z > 60) p.position.z = 60
      if (p.position.z < -60) p.position.z = -60
    }

    for (let iter = 0; iter < CONSTRAINT_ITERS; iter++) {
      for (const c of constraints) satisfy(c[0], c[1], c[2])
    }

    /* pin top row */
    for (const pi of pins) {
      particles[pi].position.copy(particles[pi].original)
      particles[pi].previous.copy(particles[pi].original)
    }
  }

  function syncGeometry() {
    const posAttr = geo.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < numVerts; i++) {
      const p = particles[i].position
      posAttr.setXYZ(i, p.x, p.y, p.z)
    }
    posAttr.needsUpdate = true
    geo.computeVertexNormals()
  }

  /* warm up so cloth is already flowing on first render */
  for (let i = 0; i < 150; i++) {
    simulate(i * 0.016)
    syncGeometry()
  }

  /* --- animation --- */
  bundle.setAnimation((elapsed) => {
    /* smooth mouse interpolation */
    mouseSmooth.x = THREE.MathUtils.lerp(mouseSmooth.x, mouseNDC.x, 0.04)
    mouseSmooth.y = THREE.MathUtils.lerp(mouseSmooth.y, mouseNDC.y, 0.04)

    /* raycast from smoothed mouse to find pull target on cloth */
    mouseVec2.set(mouseSmooth.x, mouseSmooth.y)
    raycaster.setFromCamera(mouseVec2, bundle.camera)
    const hits = raycaster.intersectObject(clothMesh)
    if (hits.length > 0) {
      /* convert world hit point back to cloth local space */
      pullPoint.copy(hits[0].point)
      stage.worldToLocal(pullPoint)
      hasPullTarget = true
    } else {
      hasPullTarget = false
    }

    simulate(elapsed)
    syncGeometry()

    stage.rotation.y = THREE.MathUtils.lerp(stage.rotation.y, mouseSmooth.x * 0.025, 0.012)
  })

  return {
    mount(container: HTMLElement, options: SceneMountOptions) {
      activeMode = options.performanceMode
      bundle.mount(container)
      bundle.setPerformanceMode(options.performanceMode)
    },
    unmount() {
      bundle.unmount()
    },
    resize(w, h) {
      bundle.resize(w, h)
      /* responsive scaling on resize */
      const params = getResponsiveParams(w)
      stage.scale.setScalar(params.scale)
      bundle.camera.position.set(0, params.cameraY, params.cameraZ)
      bundle.camera.updateProjectionMatrix()
    },
    setChapter() {},
    setPerformanceMode(mode) {
      activeMode = mode
      bundle.setPerformanceMode(mode)
    },
    setMousePosition(x, y) {
      mouseNDC.x = x
      mouseNDC.y = y
    },
    setTextContent(content: HeroTextContent) {
      drawTextContent(textCanvas, content)
      canvasTexture.needsUpdate = true
    },
  }
}
