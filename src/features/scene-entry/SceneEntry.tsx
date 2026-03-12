import { startTransition, useEffect, useRef, useState } from 'react'
import { getSiteContent } from '../../app/i18n/catalog'
import { useAppShellStore } from '../../app/store/app-shell-store'
import { createProjectSceneStore } from '../../app/store/scene-store'
import type { ProjectChapter } from '../../entities/content/types'
import type { ProjectSlug, Locale } from '../../shared/config/site'
import { BrowserChrome } from '../../shared/ui/BrowserChrome'
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
  const previewChapters = chapters.filter((chapter) => chapter.previewUrl)
  const hasInteractivePreview = previewChapters.length > 0 && previewChapters.length === chapters.length
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
  const activeChapter = chapters.find((chapter) => chapter.id === chapterId) ?? chapters[0]
  const activePreviewUrl = activeChapter?.previewUrl ?? previewChapters[0]?.previewUrl ?? ''

  useEffect(() => {
    const hasMatchingChapter = chapters.some((chapter) => chapter.id === chapterId)

    if (!hasMatchingChapter) {
      requestedChapterRef.current = fallbackChapterId
      setChapter(fallbackChapterId)
    }
  }, [chapterId, chapters, fallbackChapterId, setChapter])

  useEffect(() => {
    if (hasInteractivePreview) {
      return
    }

    const nextMode = lowPerformanceMode || reducedMotion ? 'reduced' : 'default'
    setPerformanceMode(nextMode)
  }, [hasInteractivePreview, lowPerformanceMode, reducedMotion, setPerformanceMode])

  useEffect(() => {
    if (hasInteractivePreview) {
      return
    }

    if (!sceneReady && chapterId) {
      requestedChapterRef.current = chapterId
    }

    adapterRef.current?.setChapter(chapterId)
  }, [chapterId, hasInteractivePreview, sceneReady])

  useEffect(() => {
    if (hasInteractivePreview) {
      return
    }

    adapterRef.current?.setPerformanceMode(performanceMode)
  }, [hasInteractivePreview, performanceMode])

  useEffect(() => {
    if (hasInteractivePreview || !requested || !containerRef.current) {
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
  }, [fallbackChapterId, hasInteractivePreview, performanceMode, requested, setSceneReady, slug])

  if (hasInteractivePreview && activePreviewUrl) {
    return (
      <section className={`panel ${styles.entry}`}>
        <div className={styles.toolbar}>
          <a className="buttonPrimary" href={activePreviewUrl} target="_blank" rel="noreferrer">
            {content.copy.enterSceneLabel}
          </a>
        </div>

        <div className={styles.chapterRow} aria-label={content.copy.chapterLabel}>
          {chapters.map((chapter) => (
            <button
              key={chapter.id}
              type="button"
              className={`${styles.chapterButton} ${chapterId === chapter.id ? styles.chapterActive : ''}`}
              onClick={() => setChapter(chapter.id)}
            >
              {chapter.eyebrow || chapter.title}
            </button>
          ))}
        </div>

        <BrowserChrome url={activePreviewUrl} title={`${activeChapter?.title ?? slug} interactive preview`} />
      </section>
    )
  }

  return (
    <section className={`panel ${styles.entry}`}>
      {!sceneReady ? (
        <div className={styles.toolbar}>
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
            {content.copy.enterSceneLabel}
          </button>
        </div>
      ) : null}

      <div className={styles.chapterRow} aria-label={content.copy.chapterLabel}>
        {chapters.map((chapter) => (
          <button
            key={chapter.id}
            type="button"
            className={`${styles.chapterButton} ${chapterId === chapter.id ? styles.chapterActive : ''}`}
            onClick={() => setChapter(chapter.id)}
          >
            {chapter.eyebrow || chapter.title}
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
