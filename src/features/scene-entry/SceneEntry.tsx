import { startTransition, useEffect, useRef, useState } from 'react'
import { getSiteContent } from '../../app/i18n/catalog'
import { useAppShellStore } from '../../app/store/app-shell-store'
import { createProjectSceneStore } from '../../app/store/scene-store'
import type { ProjectChapter } from '../../entities/content/types'
import type { ProjectSlug, Locale } from '../../shared/config/site'
import type { SceneAdapter } from '../../scenes/core/types'
import { loadSceneModule } from './scene-loader'
import styles from './SceneEntry.module.css'

interface SceneEntryProps {
  locale: Locale
  slug: ProjectSlug
  chapters: ProjectChapter[]
}

export function SceneEntry({ locale, slug, chapters }: SceneEntryProps) {
  const content = getSiteContent(locale)
  const useSceneStore = createProjectSceneStore(slug)
  const fallbackChapterId = chapters[0]?.id ?? 'overview'
  const chapterId = useSceneStore((state) => state.chapterId)
  const setChapter = useSceneStore((state) => state.setChapter)
  const sceneReady = useSceneStore((state) => state.sceneReady)
  const setSceneReady = useSceneStore((state) => state.setSceneReady)
  const setPerformanceMode = useSceneStore((state) => state.setPerformanceMode)
  const performanceMode = useSceneStore((state) => state.performanceMode)
  const lowPerformanceMode = useAppShellStore((state) => state.lowPerformanceMode)
  const reducedMotion = useAppShellStore((state) => state.reducedMotion)
  const containerRef = useRef<HTMLDivElement>(null)
  const adapterRef = useRef<SceneAdapter | null>(null)
  const requestedChapterRef = useRef(fallbackChapterId)
  const [requested, setRequested] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const hasMatchingChapter = chapters.some((chapter) => chapter.id === chapterId)

    if (!hasMatchingChapter) {
      requestedChapterRef.current = fallbackChapterId
      setChapter(fallbackChapterId)
    }
  }, [chapterId, chapters, fallbackChapterId, setChapter])

  useEffect(() => {
    const nextMode = lowPerformanceMode || reducedMotion ? 'reduced' : 'default'
    setPerformanceMode(nextMode)
  }, [lowPerformanceMode, reducedMotion, setPerformanceMode])

  useEffect(() => {
    if (!sceneReady && chapterId) {
      requestedChapterRef.current = chapterId
    }

    adapterRef.current?.setChapter(chapterId)
  }, [chapterId, sceneReady])

  useEffect(() => {
    adapterRef.current?.setPerformanceMode(performanceMode)
  }, [performanceMode])

  useEffect(() => {
    if (!requested || !containerRef.current) {
      return
    }

    let disposed = false
    let resizeObserver: ResizeObserver | undefined

    const mountScene = async () => {
      setHasError(false)
      setIsLoading(true)

      try {
        const module = await loadSceneModule(slug)

        if (disposed || !containerRef.current) {
          return
        }

        const adapter = module.createSceneAdapter()
        adapter.mount(containerRef.current, { performanceMode })
        adapter.setChapter(requestedChapterRef.current)
        adapterRef.current = adapter
        setSceneReady(true)

        resizeObserver = new ResizeObserver((entries) => {
          const entry = entries[0]

          if (entry) {
            adapter.resize(entry.contentRect.width, entry.contentRect.height)
          }
        })

        resizeObserver.observe(containerRef.current)
      } catch {
        setHasError(true)
      } finally {
        setIsLoading(false)
      }
    }

    void mountScene()

    return () => {
      disposed = true
      resizeObserver?.disconnect()
      adapterRef.current?.unmount()
      adapterRef.current = null
      setSceneReady(false)
    }
  }, [fallbackChapterId, performanceMode, requested, setSceneReady, slug])

  return (
    <section className={`panel ${styles.entry}`}>
      <div className={styles.toolbar}>
        <div>
          <div className="eyebrow">{content.copy.scenePosterLabel}</div>
          <h3 className="cardTitle" style={{ marginTop: '0.6rem' }}>
            {content.copy.enterSceneLabel}
          </h3>
        </div>
        <button
          type="button"
          className="buttonPrimary"
          onClick={() => {
            requestedChapterRef.current = chapterId || fallbackChapterId
            startTransition(() => {
              setRequested(true)
            })
          }}
          onMouseEnter={() => {
            void loadSceneModule(slug)
          }}
        >
          {sceneReady ? content.copy.sceneReadyLabel : content.copy.enterSceneLabel}
        </button>
      </div>

      <div className={styles.chapterRow} aria-label={content.copy.chapterLabel}>
        {chapters.map((chapter) => (
          <button
            key={chapter.id}
            type="button"
            className={`${styles.chapterButton} ${chapterId === chapter.id ? styles.chapterActive : ''}`}
            onClick={() => setChapter(chapter.id)}
          >
            {chapter.eyebrow}
          </button>
        ))}
      </div>

      <div className={styles.viewport}>
        <div ref={containerRef} className={styles.canvasHost} />
        {!sceneReady && (
          <div className={styles.overlay}>
            <div className={styles.overlayInner}>
              <h4 className="cardTitle">{isLoading ? content.copy.sceneLoadingLabel : content.copy.scenePosterLabel}</h4>
              <p className="sectionDescription">
                {hasError ? content.copy.sceneErrorLabel : content.copy.scenePosterDescription}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
