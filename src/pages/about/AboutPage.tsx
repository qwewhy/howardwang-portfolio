import { Link, useParams } from 'react-router-dom'
import { getSiteContent } from '../../app/i18n/catalog'
import { getLocalizedPath } from '../../app/router/route-utils'
import { isLocale, siteConfig } from '../../shared/config/site'
import styles from './AboutPage.module.css'

export default function AboutPage() {
  const { locale: localeParam } = useParams()
  const locale = localeParam && isLocale(localeParam) ? localeParam : siteConfig.defaultLocale
  const content = getSiteContent(locale)

  return (
    <div className={`pageShell ${styles.layout}`}>
      <section className="pageIntro">
        <span className="eyebrow">{content.about.intro.eyebrow}</span>
        <h1 className="sectionTitle">{content.about.intro.title}</h1>
        <p className="sectionDescription">{content.about.intro.description}</p>
      </section>

      <section className={styles.capGrid}>
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
    </div>
  )
}
