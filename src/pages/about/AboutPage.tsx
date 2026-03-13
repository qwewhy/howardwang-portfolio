import { Link, useParams } from 'react-router-dom'
import { getSiteContent } from '../../app/i18n/catalog'
import { getLocalizedPath } from '../../app/router/route-utils'
import { isLocale, siteConfig } from '../../shared/config/site'
import styles from './AboutPage.module.css'

export default function AboutPage() {
  const { locale: localeParam } = useParams()
  const locale = localeParam && isLocale(localeParam) ? localeParam : siteConfig.defaultLocale
  const content = getSiteContent(locale)
  const { about } = content

  return (
    <div className={`pageShell ${styles.layout}`}>
      {/* ── Hero intro ── */}
      <section className="pageIntro">
        <span className="eyebrow">{about.intro.eyebrow}</span>
        <h1 className="sectionTitle">{about.intro.title}</h1>
        <p className="sectionDescription">{about.intro.description}</p>
      </section>

      {/* ── Bio — narrative paragraphs ── */}
      {about.bio && about.bio.length > 0 && (
        <section className={styles.narrative}>
          {about.bio.map((entry) => (
            <div key={entry.heading} className={styles.narrativeBlock}>
              <h2 className={styles.narrativeHeading}>{entry.heading}</h2>
              <p className={styles.narrativeText}>{entry.text}</p>
            </div>
          ))}
        </section>
      )}

      {/* ── Capabilities — compact inline chips ── */}
      <section className={styles.capSection}>
        {content.capabilities.map((cap) => (
          <article key={cap.id} className={`panel ${styles.capCard}`}>
            <strong>{cap.title}</strong>
            <span className="muted">{cap.description}</span>
            <div className="chipRow">
              {cap.linkedProjects.map((slug) => {
                const project = content.projects[slug]
                return (
                  <Link key={slug} className={styles.projectChip} to={getLocalizedPath(locale, 'project', slug)}>
                    {project.title}
                  </Link>
                )
              })}
            </div>
          </article>
        ))}
      </section>

      {/* ── Coding habits — label:value pairs ── */}
      {about.codingHabits && about.codingHabits.length > 0 && (
        <section className={styles.narrative}>
          {about.codingHabitsTitle && (
            <h2 className={styles.chapterTitle}>{about.codingHabitsTitle}</h2>
          )}
          <dl className={styles.habitList}>
            {about.codingHabits.map((habit) => (
              <div key={habit.label} className={styles.habitRow}>
                <dt>{habit.label}</dt>
                <dd className="muted">{habit.description}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* ── Interests — horizontal cards ── */}
      {about.interests && about.interests.length > 0 && (
        <section className={styles.narrative}>
          {about.interestsTitle && (
            <h2 className={styles.chapterTitle}>{about.interestsTitle}</h2>
          )}
          <div className={styles.interestRow}>
            {about.interests.map((interest) => (
              <div key={interest.label} className={styles.interestItem}>
                <strong className={styles.interestLabel}>{interest.label}</strong>
                <span className="muted">{interest.description}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Status — closing statement ── */}
      {about.statusItems && about.statusItems.length > 0 && (
        <section className={styles.statusSection}>
          {about.statusTitle && (
            <h2 className={styles.chapterTitle}>{about.statusTitle}</h2>
          )}
          <div className={styles.statusLines}>
            {about.statusItems.map((item) => (
              <p key={item} className={styles.statusLine}>{item}</p>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
