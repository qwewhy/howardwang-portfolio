import { Link, useParams } from 'react-router-dom'
import { getSiteContent } from '../../app/i18n/catalog'
import { getLocalizedPath } from '../../app/router/route-utils'
import { SignalGrid } from '../../features/contribution-visual/SignalGrid'
import { ProjectCard } from '../../widgets/project-card/ProjectCard'
import { isLocale, siteConfig } from '../../shared/config/site'
import styles from './HomePage.module.css'

export default function HomePage() {
  const { locale: localeParam } = useParams()
  const locale = localeParam && isLocale(localeParam) ? localeParam : siteConfig.defaultLocale
  const content = getSiteContent(locale)
  const proofMetrics = content.metrics.slice(0, 3)

  return (
    <div className="pageShell">
      <section className={styles.hero}>
        <div className={`panel ${styles.heroCard}`}>
          <span className="eyebrow">{content.home.hero.eyebrow}</span>
          <h1 className="heroTitle">{content.home.hero.title}</h1>
          <p className={styles.heroDescription}>{content.home.hero.description}</p>

          <div className={styles.badgeGrid}>
            {content.home.hero.badges.map((badge) => (
              <article key={badge.label} className={styles.heroBadge}>
                <strong className={styles.badgeLabel}>{badge.label}</strong>
                <span className="muted">{badge.detail}</span>
              </article>
            ))}
          </div>

          <div className={styles.heroActions}>
            <Link className="buttonPrimary" to={getLocalizedPath(locale, 'work')}>
              {content.nav.work}
            </Link>
            <Link className="buttonSecondary" to={getLocalizedPath(locale, 'about')}>
              {content.nav.about}
            </Link>
          </div>
        </div>

        <SignalGrid contributionYears={content.home.hero.contributionYears} />
      </section>

      <section className={styles.section}>
        <div className="pageIntro">
          <span className="eyebrow">{content.home.workIntro.eyebrow}</span>
          <h2 className="sectionTitle">{content.home.workIntro.title}</h2>
          <p className={styles.sectionLead}>{content.home.workIntro.description}</p>
        </div>
        <div className={styles.workGrid}>
          {siteConfig.projectSlugs.map((slug) => (
            <ProjectCard key={slug} locale={locale} slug={slug} />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className="pageIntro">
          <span className="eyebrow">{content.home.metricsIntro.eyebrow}</span>
          <h2 className="sectionTitle">{content.home.metricsIntro.title}</h2>
          <p className={styles.sectionLead}>{content.home.metricsIntro.description}</p>
        </div>
        <div className={styles.proofGrid}>
          {proofMetrics.map((metric) => (
            <article key={metric.label} className={`panel ${styles.proofCard}`}>
              <span className={styles.proofValue}>
                {metric.value}
              </span>
              <strong>{metric.label}</strong>
              <p className={styles.proofContext}>{metric.context}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={`panel ${styles.contactCard}`}>
          <span className="eyebrow">{content.home.contactIntro.eyebrow}</span>
          <h2 className="sectionTitle">{content.home.contactIntro.title}</h2>
          <p className={styles.sectionLead}>{content.home.contactIntro.description}</p>
          <div className="chipRow">
            {content.contact.links.map((link) => (
              <a key={link.label} className="buttonSecondary" href={link.href} target={link.external ? '_blank' : undefined} rel={link.external ? 'noreferrer' : undefined}>
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
