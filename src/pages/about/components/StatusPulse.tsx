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
          <div className={styles.coreHalo} aria-hidden="true" />
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
