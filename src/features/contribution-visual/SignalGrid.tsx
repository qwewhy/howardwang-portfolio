import { getSiteContent } from '../../app/i18n/catalog'
import type { ContributionYear } from '../../entities/content/types'
import type { Locale } from '../../shared/config/site'
import { contributionData, contributionTotals, monthLabels } from './contribution-data'
import styles from './SignalGrid.module.css'

interface SignalGridProps {
  locale: Locale
  contributionYears: ContributionYear[]
}

export function SignalGrid({ locale, contributionYears }: SignalGridProps) {
  const content = getSiteContent(locale)
  const suffix = content.copy.contributionsSuffix

  return (
    <div className={styles.gridWrap}>
      {contributionYears.map((entry) => {
        const yearData = contributionData[entry.year] ?? []
        const weeks = Math.ceil(yearData.length / 7)
        const total = contributionTotals[entry.year]
        const totalLabel = total != null ? `${total} ${suffix}` : entry.total

        return (
          <div key={entry.year} className={styles.yearBlock}>
            <div className={styles.yearHeader}>
              <span className={styles.yearLabel}>{entry.year}</span>
              <span className={styles.yearTotal}>{totalLabel}</span>
            </div>

            <div className={styles.monthRow}>
              {monthLabels.map((m) => (
                <span key={m} className={styles.monthLabel}>{m}</span>
              ))}
            </div>

            <div
              className={styles.heatGrid}
              style={{ gridTemplateColumns: `repeat(${weeks}, 1fr)` }}
            >
              {yearData.map((level, i) => (
                <span
                  key={i}
                  className={styles.cell}
                  data-level={level}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
