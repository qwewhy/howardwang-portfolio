import * as THREE from 'three'
import { createSceneBundle } from '../core/createSceneBundle'
import type { SceneAdapter, SceneMountOptions, ScenePerformanceMode } from '../core/types'

export function createSceneAdapter(): SceneAdapter {
  const bundle = createSceneBundle({
    background: 0x071621,
    cameraPosition: [0, 0.3, 7.4],
  })

  const stage = new THREE.Group()
  bundle.root.add(stage)

  const moleculeGroup = new THREE.Group()
  stage.add(moleculeGroup)

  const atomPositions = [
    [-1.3, 0, 0.2],
    [-0.4, 0.7, -0.1],
    [-0.3, -0.75, 0.15],
    [0.9, 0.2, -0.2],
    [1.7, -0.55, 0.25],
  ] as const

  const atoms = atomPositions.map((position, index) => {
    const atom = new THREE.Mesh(
      new THREE.SphereGeometry(index % 2 === 0 ? 0.34 : 0.24, 32, 32),
      new THREE.MeshStandardMaterial({ color: index % 2 === 0 ? 0x43e7b1 : 0x6be6ff, metalness: 0.2, roughness: 0.25 }),
    )
    atom.position.set(position[0], position[1], position[2])
    moleculeGroup.add(atom)
    return atom
  })

  const bonds = [
    [atomPositions[0], atomPositions[1]],
    [atomPositions[0], atomPositions[2]],
    [atomPositions[1], atomPositions[3]],
    [atomPositions[3], atomPositions[4]],
  ] as const

  bonds.forEach(([start, end]) => {
    const material = new THREE.LineBasicMaterial({ color: 0x6be6ff })
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(start[0], start[1], start[2]),
      new THREE.Vector3(end[0], end[1], end[2]),
    ])
    moleculeGroup.add(new THREE.Line(geometry, material))
  })

  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(2.55, 0.05, 12, 72),
    new THREE.MeshBasicMaterial({ color: 0x43e7b1, transparent: true, opacity: 0.5 }),
  )
  halo.rotation.x = Math.PI / 2
  stage.add(halo)

  const teachingGrid = new THREE.Group()
  stage.add(teachingGrid)
  Array.from({ length: 36 }, (_, index) => {
    const node = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 18, 18),
      new THREE.MeshBasicMaterial({ color: 0x6be6ff }),
    )
    node.position.set(-2.7 + (index % 9) * 0.65, -2.2 + Math.floor(index / 9) * 0.42, -1.8)
    teachingGrid.add(node)
    return node
  })

  let activeChapter = 'molecule-assembly'
  let activeMode: ScenePerformanceMode = 'default'

  const applyChapter = (chapterId: string) => {
    activeChapter = chapterId

    if (chapterId === 'molecule-assembly') {
      teachingGrid.visible = false
      halo.visible = false
      stage.position.y = 0
    } else if (chapterId === 'reaction-timeline') {
      teachingGrid.visible = false
      halo.visible = true
      stage.position.y = 0.15
    } else {
      teachingGrid.visible = true
      halo.visible = true
      stage.position.y = 0.4
    }
  }

  bundle.setAnimation((elapsed) => {
    moleculeGroup.rotation.y = elapsed * 0.28
    halo.rotation.z = elapsed * (activeMode === 'reduced' ? 0.18 : 0.34)
    atoms.forEach((atom, index) => {
      atom.position.y += Math.sin(elapsed * 0.8 + index * 1.6) * 0.0012
    })
    if (teachingGrid.visible) {
      teachingGrid.rotation.y = Math.sin(elapsed * 0.25) * 0.4
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
