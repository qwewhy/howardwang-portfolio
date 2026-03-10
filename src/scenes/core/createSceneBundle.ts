import * as THREE from 'three'
import type { ScenePerformanceMode } from './types'

interface SceneBundleOptions {
  background: number
  cameraPosition: [number, number, number]
}

export interface SceneBundle {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  root: THREE.Group
  getRenderer: () => THREE.WebGLRenderer | null
  setAnimation: (callback: (elapsed: number) => void) => void
  setPerformanceMode: (mode: ScenePerformanceMode) => void
  mount: (container: HTMLElement) => void
  resize: (width: number, height: number) => void
  unmount: () => void
}

function disposeNode(node: THREE.Object3D) {
  const mesh = node as THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>
  mesh.geometry?.dispose?.()

  if (Array.isArray(mesh.material)) {
    mesh.material.forEach((material: THREE.Material) => material.dispose())
  } else {
    mesh.material?.dispose?.()
  }
}

export function createSceneBundle({ background, cameraPosition }: SceneBundleOptions): SceneBundle {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(background)

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
  camera.position.set(...cameraPosition)

  const root = new THREE.Group()
  scene.add(root)

  scene.add(new THREE.AmbientLight(0xffffff, 0.9))

  const directional = new THREE.DirectionalLight(0xffffff, 1.1)
  directional.position.set(4, 6, 8)
  scene.add(directional)

  let renderer: THREE.WebGLRenderer | null = null
  let frameId = 0
  let animation = (elapsed: number) => {
    root.rotation.y = elapsed * 0.14
  }

  function setAnimation(callback: (elapsed: number) => void) {
    animation = callback
  }

  function setPerformanceMode(mode: ScenePerformanceMode) {
    if (!renderer) {
      return
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mode === 'reduced' ? 1 : 1.75))
  }

  function loop(timestamp: number) {
    if (!renderer) {
      return
    }

    animation(timestamp / 1000)
    renderer.render(scene, camera)
    frameId = window.requestAnimationFrame(loop)
  }

  function mount(container: HTMLElement) {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.domElement.setAttribute('aria-hidden', 'true')
    container.appendChild(renderer.domElement)
    resize(container.clientWidth, container.clientHeight)
    frameId = window.requestAnimationFrame(loop)
  }

  function resize(width: number, height: number) {
    if (!renderer) {
      return
    }

    const safeWidth = Math.max(width, 1)
    const safeHeight = Math.max(height, 1)
    camera.aspect = safeWidth / safeHeight
    camera.updateProjectionMatrix()
    renderer.setSize(safeWidth, safeHeight, false)
  }

  function unmount() {
    window.cancelAnimationFrame(frameId)
    root.traverse(disposeNode)
    renderer?.dispose()
    renderer?.domElement.remove()
    renderer = null
  }

  return {
    scene,
    camera,
    root,
    getRenderer: () => renderer,
    setAnimation,
    setPerformanceMode,
    mount,
    resize,
    unmount,
  }
}
