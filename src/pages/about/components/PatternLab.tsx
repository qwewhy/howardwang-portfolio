import { startTransition, useEffect } from 'react'
import { ABOUT_CODE_SNIPPETS } from '../../../entities/content/about-snippets'
import type { AboutContent } from '../../../entities/content/types'
import { useAboutInteractionsStore } from '../about-interactions-store'
import { CodeWindow } from './CodeWindow'
import styles from './PatternLab.module.css'

interface PatternLabProps {
  about: AboutContent
}

const EMPTY_HABITS: NonNullable<AboutContent['codingHabits']> = []

export function PatternLab({ about }: PatternLabProps) {
  const habits = about.codingHabits ?? EMPTY_HABITS
  const activeHabitId = useAboutInteractionsStore((state) => state.activeHabitId)
  const activeVariantId = useAboutInteractionsStore((state) => state.activeVariantId)
  const selectHabit = useAboutInteractionsStore((state) => state.selectHabit)
  const selectVariant = useAboutInteractionsStore((state) => state.selectVariant)

  const fallbackHabit = habits[0]
  const activeHabit = habits.find((habit) => habit.id === activeHabitId) ?? fallbackHabit
  const activeVariant = activeHabit?.variants.find((variant) => variant.id === activeVariantId) ?? activeHabit?.variants[0]

  useEffect(() => {
    if (!fallbackHabit) {
      return
    }

    const nextHabit = habits.find((habit) => habit.id === activeHabitId) ?? fallbackHabit
    const nextVariant = nextHabit.variants.find((variant) => variant.id === activeVariantId) ?? nextHabit.variants[0]

    if (nextVariant && (activeHabitId !== nextHabit.id || activeVariantId !== nextVariant.id)) {
      selectHabit(nextHabit.id, nextVariant.id)
    }
  }, [activeHabitId, activeVariantId, fallbackHabit, habits, selectHabit])

  if (!activeHabit || !activeVariant) {
    return null
  }

  return (
    <section className={styles.section}>
      <div className="pageIntro">
        {about.codingHabitsTitle && <h2 className="sectionTitle">{about.codingHabitsTitle}</h2>}
        {about.codingHabitsIntro && <p className={styles.intro}>{about.codingHabitsIntro}</p>}
      </div>

      <div className={styles.catalog}>
        {habits.map((habit) => {
          const isActive = habit.id === activeHabit.id

          return (
            <button
              key={habit.id}
              type="button"
              className={`${styles.habitButton} ${isActive ? styles.habitButtonActive : ''}`}
              onClick={() => startTransition(() => selectHabit(habit.id, habit.variants[0]?.id ?? activeVariant.id))}
            >
              <span className={styles.habitDensity}>{habit.densityLabel}</span>
              <strong className={styles.habitLabel}>{habit.label}</strong>
            </button>
          )
        })}
      </div>

      <article className={`panel ${styles.detailPanel}`}>
        <div className={styles.detailHeader}>
          <div className={styles.detailCopy}>
            <span className={styles.detailBadge}>{activeHabit.densityLabel}</span>
            <h3 className={styles.detailTitle}>{activeHabit.label}</h3>
            <p className={styles.detailDescription}>{activeHabit.description}</p>
          </div>

          <div className={styles.toolRow}>
            {activeHabit.tools.map((tool) => (
              <span key={tool} className={styles.toolToken}>
                {tool}
              </span>
            ))}
          </div>
        </div>

        <div className={styles.overviewGrid}>
          <div className={styles.highlightCard}>
            <p className={styles.highlightText}>{activeHabit.highlight}</p>
          </div>

          <div className={styles.principleCard}>
            <ul className={styles.principleList}>
              {activeHabit.principles.map((principle) => (
                <li key={principle} className={styles.principleItem}>
                  {principle}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {activeHabit.variants.length > 1 && (
          <div className={styles.variantTabs}>
            {activeHabit.variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                className={`${styles.variantButton} ${variant.id === activeVariant.id ? styles.variantButtonActive : ''}`}
                onClick={() => startTransition(() => selectVariant(variant.id))}
              >
                {variant.label}
              </button>
            ))}
          </div>
        )}

        <div className={styles.previewStack}>
          <div className={styles.previewNote}>
            <h4 className={styles.previewTitle}>{activeVariant.label}</h4>
            <p className={styles.previewSummary}>{activeVariant.summary}</p>
            <p className={styles.previewAnnotation}>{activeVariant.annotation}</p>
          </div>

          <CodeWindow
            code={ABOUT_CODE_SNIPPETS[activeVariant.snippetId]}
            fileLabel={activeVariant.fileLabel}
            language={activeVariant.language}
          />
        </div>
      </article>
    </section>
  )
}
