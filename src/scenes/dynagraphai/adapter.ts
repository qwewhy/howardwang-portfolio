import * as THREE from 'three'
import { createSceneBundle } from '../core/createSceneBundle'
import type { SceneAdapter, SceneMountOptions, ScenePerformanceMode } from '../core/types'

export function createSceneAdapter(): SceneAdapter {
  const bundle = createSceneBundle({
    background: 0x07131d,
    cameraPosition: [0, 0.6, 7],
  })

  const stage = new THREE.Group()
  bundle.root.add(stage)

  const promptBeam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 4.2, 24),
    new THREE.MeshStandardMaterial({ color: 0x6be6ff, emissive: 0x1c5063, metalness: 0.2, roughness: 0.3 }),
  )
  promptBeam.rotation.z = Math.PI / 2
  promptBeam.position.set(-0.6, 0.5, 0)
  stage.add(promptBeam)

  const viewport = new THREE.Mesh(
    new THREE.BoxGeometry(3.1, 1.9, 0.18),
    new THREE.MeshStandardMaterial({ color: 0x15293b, emissive: 0x09141f, metalness: 0.14, roughness: 0.24 }),
  )
  viewport.position.set(0.8, 0.4, -0.1)
  stage.add(viewport)

  const viewportGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(2.5, 1.3),
    new THREE.MeshBasicMaterial({ color: 0x43e7b1, transparent: true, opacity: 0.6 }),
  )
  viewportGlow.position.set(0.8, 0.4, 0.01)
  stage.add(viewportGlow)

  const nodes = Array.from({ length: 8 }, (_, index) => {
    const node = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.28, 0.28),
      new THREE.MeshStandardMaterial({ color: index % 2 === 0 ? 0x43e7b1 : 0x6be6ff, metalness: 0.25, roughness: 0.35 }),
    )
    node.position.set(-1.2 + index * 0.36, -0.9 + (index % 3) * 0.24, 0.6 - (index % 4) * 0.14)
    stage.add(node)
    return node
  })

  let activeChapter = 'prompt-signal'
  let activeMode: ScenePerformanceMode = 'default'

  const glowMaterial = viewportGlow.material as THREE.MeshBasicMaterial

  const applyChapter = (chapterId: string) => {
    activeChapter = chapterId

    if (chapterId === 'prompt-signal') {
      promptBeam.visible = true
      glowMaterial.opacity = 0.46
      stage.rotation.x = -0.12
    } else if (chapterId === 'scene-graph-assembly') {
      promptBeam.visible = true
      glowMaterial.opacity = 0.22
      stage.rotation.x = 0.18
    } else {
      promptBeam.visible = false
      glowMaterial.opacity = 0.72
      stage.rotation.x = 0
    }
  }

  bundle.setAnimation((elapsed) => {
    viewport.rotation.y = Math.sin(elapsed * 0.35) * 0.18
    promptBeam.scale.y = 0.9 + Math.sin(elapsed * 2.1) * 0.08
    nodes.forEach((node, index) => {
      node.position.y += Math.sin(elapsed * (activeMode === 'reduced' ? 0.35 : 0.7) + index) * 0.0015
      node.rotation.x = elapsed * 0.22 + index * 0.08
      node.rotation.z = elapsed * 0.18 + index * 0.04
    })

    if (activeChapter === 'viewport-export') {
      stage.rotation.y = elapsed * 0.18
    } else {
      stage.rotation.y = Math.sin(elapsed * 0.4) * 0.22
    }
  })

  return {
    mount(container: HTMLElement, options: SceneMountOptions) {
      activeMode = options.performanceMode
      bundle.mount(container)
      bundle.setPerformanceMode(options.performanceMode)
      applyChapter(activeChapter)
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

