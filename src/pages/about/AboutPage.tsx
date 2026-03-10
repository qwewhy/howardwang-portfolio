import { useParams } from 'react-router-dom'
import { getSiteContent } from '../../app/i18n/catalog'
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

      <section className={styles.pillars}>
        {content.about.pillars.map((pillar) => (
          <article key={pillar.title} className={`panel ${styles.pillar}`}>
            <h2 className="cardTitle">{pillar.title}</h2>
            <p className="sectionDescription">{pillar.description}</p>
          </article>
        ))}
      </section>

      <section className="metricGrid">
        {content.capabilities.map((capability) => (
          <article key={capability.id} className="panel sectionStack" style={{ padding: '1.2rem' }}>
            <strong>{capability.title}</strong>
            <p className="sectionDescription">{capability.description}</p>
          </article>
        ))}
      </section>
    </div>
  )
}

