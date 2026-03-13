import { startTransition, useEffect } from 'react'
import type { AboutStatusPanel } from '../../../entities/content/types'
import { useAboutInteractionsStore } from '../about-interactions-store'
import styles from './StatusPulse.module.css'

interface StatusPulseProps {
  status: AboutStatusPanel
}

export function StatusPulse({ status }: StatusPulseProps) {
  const activeStatusId = useAboutInteractionsStore((state) => state.activeStatusId)
  const selectStatus = useAboutInteractionsStore((state) => state.selectStatus)

  const fallbackSignal = status.signals[0]
  const activeSignal = status.signals.find((signal) => signal.id === activeStatusId) ?? fallbackSignal

  useEffect(() => {
    if (!fallbackSignal) {
      return
    }

    if (activeStatusId !== activeSignal?.id) {
      selectStatus(activeSignal?.id ?? fallbackSignal.id)
    }
  }, [activeSignal?.id, activeStatusId, fallbackSignal, selectStatus])

  if (!activeSignal) {
    return null
  }

  return (
    <section className={styles.section}>
      <div className="pageIntro">
        <span className="eyebrow">{status.eyebrow}</span>
        <h2 className="sectionTitle">{status.title}</h2>
        <p className={styles.intro}>{status.description}</p>
      </div>

      <div className={styles.grid}>
        <article className={`panel ${styles.corePanel}`}>
          <svg
            className={styles.coreLogo}
            viewBox="0 0 512 512"
            fill="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="sp-fl" x1="0" y1="0" x2="1" y2="0.5">
                <stop offset="0%" stopColor="#1f9e78" />
                <stop offset="100%" stopColor="#1a8a6e" />
              </linearGradient>
              <linearGradient id="sp-fr" x1="0" y1="0" x2="1" y2="0.5">
                <stop offset="0%" stopColor="#35c99a" />
                <stop offset="100%" stopColor="#2ab893" />
              </linearGradient>
              <linearGradient id="sp-ft" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="#43e7b1" />
                <stop offset="100%" stopColor="#6be6ff" />
              </linearGradient>
            </defs>
            <path d="M124,410 L124,130 L208,88 L208,368 Z" fill="url(#sp-fl)" />
            <path d="M208,88 L264,118 L264,398 L208,368 Z" fill="url(#sp-fr)" />
            <path d="M124,130 L208,88 L264,118 L180,160 Z" fill="url(#sp-ft)" />
            <path d="M248,434 L248,154 L332,112 L332,392 Z" fill="url(#sp-fl)" />
            <path d="M332,112 L388,142 L388,422 L332,392 Z" fill="url(#sp-fr)" />
            <path d="M248,154 L332,112 L388,142 L304,184 Z" fill="url(#sp-ft)" />
            <path d="M208,310 L208,268 L248,290 L248,332 Z" fill="url(#sp-fl)" />
            <path d="M248,290 L248,332 L332,288 L332,246 Z" fill="url(#sp-fr)" />
            <path d="M208,268 L248,290 L332,246 L292,224 Z" fill="url(#sp-ft)" />
          </svg>
          <span className={styles.signalLabel}>{activeSignal.label}</span>
          <h3 className={styles.signalValue}>{activeSignal.value}</h3>
          <p className={styles.signalDescription}>{activeSignal.description}</p>

          <div className={styles.metaGrid}>
            {status.meta.map((item) => (
              <div key={item.label} className={styles.metaCard}>
                <span className={styles.metaLabel}>{item.label}</span>
                <strong className={styles.metaValue}>{item.value}</strong>
              </div>
            ))}
          </div>

          <div className={styles.tagRow}>
            {activeSignal.tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        </article>

        <div className={styles.signalGrid}>
          {status.signals.map((signal) => {
            const isActive = signal.id === activeSignal.id

            return (
              <button
                key={signal.id}
                type="button"
                className={`${styles.signalCard} ${isActive ? styles.signalCardActive : ''}`}
                onClick={() => startTransition(() => selectStatus(signal.id))}
                onMouseEnter={() => startTransition(() => selectStatus(signal.id))}
                onFocus={() => startTransition(() => selectStatus(signal.id))}
              >
                <span className={styles.signalCardLabel}>{signal.label}</span>
                <strong className={styles.signalCardValue}>{signal.value}</strong>
                <span className={styles.signalCardDescription}>{signal.description}</span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
