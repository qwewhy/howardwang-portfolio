import { useEffect, useRef } from 'react'
import { useAppShellStore } from '../../app/store/app-shell-store'
import type { HeroSceneAdapter } from '../../scenes/hero/adapter'
import styles from './HeroScene.module.css'

export default function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null)
  const adapterRef = useRef<HeroSceneAdapter | null>(null)
  const reducedMotion = useAppShellStore((state) => state.reducedMotion)
  const lowPerformanceMode = useAppShellStore((state) => state.lowPerformanceMode)

  useEffect(() => {
    const container = containerRef.current
    if (!container || reducedMotion) return

    let disposed = false
    let resizeObserver: ResizeObserver | undefined

    const mountScene = async () => {
      const module = await import('../../scenes/hero/adapter')
      if (disposed || !containerRef.current) return

      const adapter = module.createSceneAdapter()
      const performanceMode = lowPerformanceMode ? 'reduced' : 'default'
      adapter.mount(containerRef.current, { performanceMode })
      adapterRef.current = adapter

      resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0]
        if (entry) adapter.resize(entry.contentRect.width, entry.contentRect.height)
      })
      resizeObserver.observe(containerRef.current)
    }

    void mountScene()

    return () => {
      disposed = true
      resizeObserver?.disconnect()
      adapterRef.current?.unmount()
      adapterRef.current = null
    }
  }, [lowPerformanceMode, reducedMotion])

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1
      const y = -(event.clientY / window.innerHeight) * 2 + 1
      adapterRef.current?.setMousePosition(x, y)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [])

  return (
    <div className={styles.wrap} aria-hidden="true">
      <div ref={containerRef} className={styles.canvas} />
    </div>
  )
}
