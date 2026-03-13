import { Link, useParams } from 'react-router-dom'
import { getSiteContent } from '../../app/i18n/catalog'
import { getLocalizedPath } from '../../app/router/route-utils'
import { isLocale, siteConfig } from '../../shared/config/site'
import { PatternLab } from './components/PatternLab'
import { StatusPulse } from './components/StatusPulse'
import styles from './AboutPage.module.css'

export default function AboutPage() {
  const { locale: localeParam } = useParams()
  const locale = localeParam && isLocale(localeParam) ? localeParam : siteConfig.defaultLocale
  const content = getSiteContent(locale)
  const { about } = content
  const capabilityIntro = about.capabilityIntro ?? about.intro
  const heroStats = about.heroStats ?? []

  return (
    <div className={`pageShell ${styles.layout}`}>
      <section className={styles.heroStage}>
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <span className="eyebrow">{about.intro.eyebrow}</span>
            <h1 className="heroTitle">{about.intro.title}</h1>
            <p className={styles.heroLead}>{about.intro.description}</p>
            <div className={styles.heroTags}>
              {content.capabilities.slice(0, 4).map((capability) => (
                <span key={capability.id} className={styles.heroTag}>
                  {capability.title}
                </span>
              ))}
            </div>

            {about.heroHighlight && (
              <div className={styles.heroHighlight}>
                <span className={styles.highlightValue}>{about.heroHighlight.value}</span>
                <div className={styles.highlightMeta}>
                  <strong className={styles.highlightLabel}>{about.heroHighlight.label}</strong>
                  <span className={styles.highlightDetail}>{about.heroHighlight.detail}</span>
                </div>
              </div>
            )}
          </div>

          {heroStats.length > 0 && (
            <aside className={`panel ${styles.heroPanel}`}>
              <div className={styles.heroPanelHeader}>
                <strong className={styles.heroPanelTitle}>{content.profile.title}</strong>
                <p className={styles.heroPanelText}>{content.profile.summary}</p>
              </div>
              <div className={styles.statGrid}>
                {heroStats.map((stat) => (
                  <article key={stat.label} className={styles.statCard}>
                    <span className={styles.statValue}>{stat.value}</span>
                    <strong className={styles.statLabel}>{stat.label}</strong>
                    <span className={styles.statDetail}>{stat.detail}</span>
                  </article>
                ))}
              </div>
            </aside>
          )}
        </div>

        {about.bio && about.bio.length > 0 && (
          <div className={styles.storyGrid}>
            {about.bio.map((entry, index) => (
              <article key={entry.heading} className={`panel ${styles.storyCard}`}>
                <span className={styles.storyIndex}>{String(index + 1).padStart(2, '0')}</span>
                <h2 className={styles.storyHeading}>{entry.heading}</h2>
                <p className={styles.storyText}>{entry.text}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className={styles.capabilityStage}>
        <div className="pageIntro">
          <span className="eyebrow">{capabilityIntro.eyebrow}</span>
          <h2 className="sectionTitle">{capabilityIntro.title}</h2>
          <p className={styles.sectionLead}>{capabilityIntro.description}</p>
        </div>

        <div className={styles.capabilityGrid}>
          {content.capabilities.map((capability, index) => (
            <article key={capability.id} className={`panel ${styles.capCard}`}>
              <div className={styles.capCardHeader}>
                <span className={styles.capIndex}>{String(index + 1).padStart(2, '0')}</span>
                <h3 className={styles.capTitle}>{capability.title}</h3>
              </div>
              <p className={styles.capDescription}>{capability.description}</p>
              <div className="chipRow">
                {capability.linkedProjects.map((slug) => {
                  const project = content.projects[slug]

                  return (
                    <Link
                      key={slug}
                      className={styles.projectChip}
                      to={getLocalizedPath(locale, 'project', slug)}
                    >
                      {project.title}
                    </Link>
                  )
                })}
              </div>
            </article>
          ))}
        </div>
      </section>

      <PatternLab about={about} />
      {about.status && <StatusPulse status={about.status} />}
    </div>
  )
}
