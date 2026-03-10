import * as THREE from 'three'
import { createSceneBundle } from '../core/createSceneBundle'
import type { SceneAdapter, SceneMountOptions, ScenePerformanceMode } from '../core/types'

export interface HeroSceneAdapter extends SceneAdapter {
  setMousePosition: (normalizedX: number, normalizedY: number) => void
}

/* ---------- physics constants ---------- */
const DAMPING = 0.08
const DRAG = 1 - DAMPING
const MASS = 0.1
const REST = 25
const X_SEGS = 32
const Y_SEGS = 20
const GRAVITY_VAL = 981 * 0.35
const TS = 18 / 1000
const TS_SQ = TS * TS
const CONSTRAINT_ITERS = 5

const clothW = REST * X_SEGS
const clothH = REST * Y_SEGS

const gravityForce = new THREE.Vector3(0, -GRAVITY_VAL * MASS, 0)

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
  const base = Math.min(Math.max(viewportW / 1280, 0.45), 1.35)
  return {
    scale: 0.018 * base,
    cameraZ: THREE.MathUtils.lerp(7.5, 5.5, Math.min((viewportW - 375) / (1280 - 375), 1)),
    cameraY: THREE.MathUtils.lerp(-1.5, -2.0, Math.min((viewportW - 375) / (1280 - 375), 1)),
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

  /* override default lighting: dark ambient + colored point lights */
  bundle.scene.children
    .filter((c) => c instanceof THREE.Light)
    .forEach((light) => bundle.scene.remove(light))

  /* minimal ambient — just enough to not clip to pure black */
  const ambient = new THREE.AmbientLight(0xffffff, 0.08)
  bundle.scene.add(ambient)

  /* key — accent green from right, nearly edge-on to rake across folds */
  const keyLight = new THREE.DirectionalLight(0x34d399, 5.5)
  keyLight.position.set(6, 1, 0.8)
  bundle.scene.add(keyLight)

  /* fill — soft cyan from upper-left for secondary fold definition */
  const fillLight = new THREE.DirectionalLight(0x6be6ff, 2.5)
  fillLight.position.set(-4, 3, 1.5)
  bundle.scene.add(fillLight)

  /* rim — bright green from behind-below to silhouette fold edges */
  const rimLight = new THREE.DirectionalLight(0x43e7b1, 4.0)
  rimLight.position.set(-1, -4, -4)
  bundle.scene.add(rimLight)

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

  /* --- procedural environment map for PBR reflections --- */
  const envScene = new THREE.Scene()
  /* dark base with colored gradient spheres to give reflections direction */
  envScene.background = new THREE.Color(0x020606)
  const envGeo = new THREE.SphereGeometry(20, 16, 16)
  const envMat1 = new THREE.MeshBasicMaterial({ color: 0x0a3d2e, side: THREE.BackSide })
  const envSphere1 = new THREE.Mesh(envGeo, envMat1)
  envSphere1.position.set(10, 5, 0)
  envScene.add(envSphere1)
  const envMat2 = new THREE.MeshBasicMaterial({ color: 0x0a2535, side: THREE.BackSide })
  const envSphere2 = new THREE.Mesh(envGeo, envMat2)
  envSphere2.position.set(-10, -3, -5)
  envScene.add(envSphere2)

  /* --- PBR physical material with fabric sheen for edge glow --- */
  const mat = new THREE.MeshPhysicalMaterial({
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.94,
    color: new THREE.Color(0x0e2830),
    roughness: 0.45,
    metalness: 0.15,
    /* sheen creates fabric-like edge brightening (Fresnel) */
    sheen: 1.0,
    sheenRoughness: 0.3,
    sheenColor: new THREE.Color(0x34d399),
    emissive: new THREE.Color(0x010808),
    emissiveIntensity: 0.15,
    envMapIntensity: 2.0,
  })

  const clothMesh = new THREE.Mesh(geo, mat)
  stage.add(clothMesh)

  /* --- mouse interaction --- */
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

    /* wind — aggressive multi-frequency gusts for dramatic ripples */
    const windStr = Math.cos(elapsed * speed / 3) * 5.0 + 12.0
      + Math.sin(elapsed * speed * 1.7) * 3.0
      + Math.sin(elapsed * speed * 3.5) * 1.5
    windForce.set(
      Math.sin(elapsed * speed * 0.8) + Math.sin(elapsed * speed * 2.1) * 0.6 + Math.cos(elapsed * speed * 4.0) * 0.3,
      Math.cos(elapsed * speed * 0.6) * 0.8 + Math.sin(elapsed * speed * 1.5) * 0.5 + Math.sin(elapsed * speed * 3.2) * 0.25,
      Math.sin(elapsed * speed * 1.3) * 0.9 + Math.cos(elapsed * speed * 2.5) * 0.5 + Math.sin(elapsed * speed * 4.5) * 0.2,
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

    /* mouse pull: strong push toward camera for visible deformation */
    if (hasPullTarget) {
      const pullRadius = clothW * 0.4
      const pullStrength = 40
      for (const p of particles) {
        const dx = pullPoint.x - p.position.x
        const dy = pullPoint.y - p.position.y
        const dz = pullPoint.z - p.position.z
        const distSq = dx * dx + dy * dy + dz * dz
        const rSq = pullRadius * pullRadius
        if (distSq < rSq && distSq > 0) {
          const factor = (1 - distSq / rSq) * pullStrength
          tmpForce.set(dx * 0.3, dy * 0.3, pullRadius * 0.8).normalize().multiplyScalar(factor)
          p.addForce(tmpForce)
        }
      }
    }

    for (const p of particles) {
      p.addForce(gravityForce)
      p.integrate()
    }

    /* Z-axis depth clamp — allow more dramatic billowing */
    for (const p of particles) {
      if (p.position.z > 80) p.position.z = 80
      if (p.position.z < -80) p.position.z = -80
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
    /* smooth mouse interpolation — faster tracking for responsive feel */
    mouseSmooth.x = THREE.MathUtils.lerp(mouseSmooth.x, mouseNDC.x, 0.09)
    mouseSmooth.y = THREE.MathUtils.lerp(mouseSmooth.y, mouseNDC.y, 0.09)

    /* raycast from smoothed mouse to find pull target on cloth */
    mouseVec2.set(mouseSmooth.x, mouseSmooth.y)
    raycaster.setFromCamera(mouseVec2, bundle.camera)
    const hits = raycaster.intersectObject(clothMesh)
    if (hits.length > 0) {
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
      /* enable tone mapping + generate environment map for PBR */
      const renderer = bundle.getRenderer()
      if (renderer) {
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 1.6
        const pmrem = new THREE.PMREMGenerator(renderer)
        const envMap = pmrem.fromScene(envScene, 0.04).texture
        mat.envMap = envMap
        mat.needsUpdate = true
        pmrem.dispose()
      }
      bundle.setPerformanceMode(options.performanceMode)
    },
    unmount() {
      bundle.unmount()
    },
    resize(w, h) {
      bundle.resize(w, h)
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
  }
}
