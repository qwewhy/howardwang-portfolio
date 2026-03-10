import * as THREE from 'three'
import { createSceneBundle } from '../core/createSceneBundle'
import type { SceneAdapter, SceneMountOptions, ScenePerformanceMode } from '../core/types'

export interface HeroSceneAdapter extends SceneAdapter {
  setMousePosition: (normalizedX: number, normalizedY: number) => void
}

/* ---------- physics constants ---------- */
const DAMPING = 0.03
const DRAG = 1 - DAMPING
const MASS = 0.1
const REST = 25
const X_SEGS = 25
const Y_SEGS = 15
const GRAVITY_VAL = 981 * 1.4
const TS = 18 / 1000
const TS_SQ = TS * TS
const SCALE = 0.011

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

/* ---------- adapter ---------- */
export function createSceneAdapter(): HeroSceneAdapter {
  const bundle = createSceneBundle({
    background: 0x000000,
    cameraPosition: [0, -2.2, 7.5],
  })
  bundle.scene.background = null
  bundle.camera.fov = 48
  bundle.camera.updateProjectionMatrix()

  const stage = new THREE.Group()
  stage.scale.setScalar(SCALE)
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
  const colors = new Float32Array(numVerts * 3)
  const indices: number[] = []

  const colTop = new THREE.Color(0x43e7b1)
  const colBot = new THREE.Color(0x6be6ff)
  const tmpCol = new THREE.Color()

  for (let v = 0; v <= Y_SEGS; v++) {
    for (let u = 0; u <= X_SEGS; u++) {
      const i = idx(u, v)
      uvs[i * 2] = u / X_SEGS
      uvs[i * 2 + 1] = v / Y_SEGS
      const t = v / Y_SEGS
      tmpCol.copy(colTop).lerp(colBot, t)
      colors[i * 3] = tmpCol.r
      colors[i * 3 + 1] = tmpCol.g
      colors[i * 3 + 2] = tmpCol.b
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
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geo.setIndex(indices)

  const mat = new THREE.MeshPhongMaterial({
    vertexColors: true,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.55,
    shininess: 25,
    specular: new THREE.Color(0x333333),
  })

  const clothMesh = new THREE.Mesh(geo, mat)
  stage.add(clothMesh)

  /* --- wind & mouse --- */
  let activeMode: ScenePerformanceMode = 'default'
  const mouseTarget = { x: 0, y: 0 }
  const windForce = new THREE.Vector3()
  const tmpForce = new THREE.Vector3()

  function simulate(elapsed: number) {
    const speed = activeMode === 'reduced' ? 0.5 : 1
    const windStr = Math.cos(elapsed * speed / 7) * 20 + 40
    windForce.set(
      Math.sin(elapsed * speed / 2),
      Math.cos(elapsed * speed / 3),
      Math.sin(elapsed * speed),
    )
    windForce.normalize().multiplyScalar(windStr)
    windForce.x += mouseTarget.x * 25
    windForce.z += mouseTarget.y * 15

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

    for (const p of particles) {
      p.addForce(gravityForce)
      p.integrate()
    }

    for (const c of constraints) satisfy(c[0], c[1], c[2])

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
    simulate(elapsed)
    syncGeometry()

    stage.rotation.y = THREE.MathUtils.lerp(stage.rotation.y, mouseTarget.x * 0.08, 0.02)
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
    },
    setChapter() {},
    setPerformanceMode(mode) {
      activeMode = mode
      bundle.setPerformanceMode(mode)
    },
    setMousePosition(x, y) {
      mouseTarget.x = x
      mouseTarget.y = y
    },
  }
}
