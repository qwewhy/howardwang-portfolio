import { useEffect, useRef } from 'react'
import { useAppShellStore } from '../../app/store/app-shell-store'
import type { HeroSceneAdapter, HeroTextContent } from '../../scenes/hero/adapter'
import styles from './HeroScene.module.css'

interface HeroSceneProps {
  textContent?: HeroTextContent
}

export default function HeroScene({ textContent }: HeroSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const adapterRef = useRef<HeroSceneAdapter | null>(null)
  const textContentRef = useRef(textContent)
  textContentRef.current = textContent
  const reducedMotion = useAppShellStore((state) => state.reducedMotion)
  const lowPerformanceMode = useAppShellStore((state) => state.lowPerformanceMode)
  const isMobile = useAppShellStore((state) => state.isMobile)

  useEffect(() => {
    const container = containerRef.current
    if (!container || reducedMotion || isMobile) return

    let disposed = false
    let resizeObserver: ResizeObserver | undefined

    const mountScene = async () => {
      const module = await import('../../scenes/hero/adapter')
      if (disposed || !containerRef.current) return

      const adapter = module.createSceneAdapter()
      const performanceMode = lowPerformanceMode ? 'reduced' : 'default'
      adapter.mount(containerRef.current, { performanceMode })
      adapterRef.current = adapter

      /* paint text after fonts load — cloth shows gradient-only until then */
      if (textContentRef.current) {
        const content = textContentRef.current
        document.fonts.ready.then(() => {
          if (!disposed && adapterRef.current) {
            adapterRef.current.setTextContent(content)
          }
        })
      }

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
  }, [lowPerformanceMode, reducedMotion, isMobile])

  /* repaint if textContent changes after mount */
  useEffect(() => {
    if (textContent && adapterRef.current) {
      document.fonts.ready.then(() => {
        if (adapterRef.current && textContent) {
          adapterRef.current.setTextContent(textContent)
        }
      })
    }
  }, [textContent])

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1
      const y = -(event.clientY / window.innerHeight) * 2 + 1
      adapterRef.current?.setMousePosition(x, y)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [])

  /* don't render canvas on mobile — Three.js won't even lazy-load */
  if (isMobile) return null

  return (
    <div className={styles.wrap} aria-hidden="true">
      <div ref={containerRef} className={styles.canvas} />
    </div>
  )
}
