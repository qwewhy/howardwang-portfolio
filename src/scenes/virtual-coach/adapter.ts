import * as THREE from 'three'
import { createSceneBundle } from '../core/createSceneBundle'
import type { SceneAdapter, SceneMountOptions, ScenePerformanceMode } from '../core/types'

export function createSceneAdapter(): SceneAdapter {
  const bundle = createSceneBundle({
    background: 0x08131c,
    cameraPosition: [0, 0.2, 8],
  })

  const stage = new THREE.Group()
  bundle.root.add(stage)

  const pulseRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.4, 0.05, 14, 48),
    new THREE.MeshBasicMaterial({ color: 0xff9b5a, transparent: true, opacity: 0.8 }),
  )
  pulseRing.rotation.x = Math.PI / 2
  stage.add(pulseRing)

  const coreNode = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0xff9b5a, emissive: 0x55210a, metalness: 0.15, roughness: 0.3 }),
  )
  stage.add(coreNode)

  const riskNodes = Array.from({ length: 6 }, (_, index) => {
    const node = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 24, 24),
      new THREE.MeshStandardMaterial({ color: index % 2 === 0 ? 0x6be6ff : 0x43e7b1, metalness: 0.1, roughness: 0.4 }),
    )
    const angle = (Math.PI * 2 * index) / 6
    node.position.set(Math.cos(angle) * 2.2, Math.sin(angle) * 0.8, Math.sin(angle) * 1.2)
    stage.add(node)
    return node
  })

  const orbitLine = new THREE.Mesh(
    new THREE.TorusGeometry(2.2, 0.02, 10, 80),
    new THREE.MeshBasicMaterial({ color: 0x6be6ff, transparent: true, opacity: 0.55 }),
  )
  orbitLine.rotation.y = Math.PI / 2
  stage.add(orbitLine)

  let activeMode: ScenePerformanceMode = 'default'

  const applyChapter = (chapterId: string) => {
    if (chapterId === 'voice-pulse-field') {
      pulseRing.visible = true
      orbitLine.visible = false
    } else if (chapterId === 'risk-node-graph') {
      pulseRing.visible = true
      orbitLine.visible = true
    } else {
      pulseRing.visible = false
      orbitLine.visible = true
    }
  }

  bundle.setAnimation((elapsed) => {
    pulseRing.scale.setScalar(1 + Math.sin(elapsed * 2) * 0.08)
    coreNode.rotation.y = elapsed * 0.3
    orbitLine.rotation.z = elapsed * 0.2
    riskNodes.forEach((node, index) => {
      const angle = elapsed * (activeMode === 'reduced' ? 0.18 : 0.34) + index
      node.position.x = Math.cos(angle) * 2.15
      node.position.z = Math.sin(angle) * 1.35
      node.position.y = Math.sin(angle * 1.7) * 0.7
    })
  })

  return {
    mount(container: HTMLElement, options: SceneMountOptions) {
      activeMode = options.performanceMode
      bundle.mount(container)
      bundle.setPerformanceMode(options.performanceMode)
      applyChapter('voice-pulse-field')
    },
    unmount() {
      bundle.unmount()
    },
    resize(width, height) {
      bundle.resize(width, height)
    },
    setChapter(chapterId) {
      applyChapter(chapterId)
    },
    setPerformanceMode(mode) {
      activeMode = mode
      bundle.setPerformanceMode(mode)
    },
  }
}
