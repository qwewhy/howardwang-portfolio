import { lazy, Suspense } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getSiteContent } from '../../app/i18n/catalog'
import { getLocalizedPath } from '../../app/router/route-utils'
import { SignalGrid } from '../../features/contribution-visual/SignalGrid'
import { TokenCounter } from '../../features/token-counter/TokenCounter'
import { ProjectCard } from '../../widgets/project-card/ProjectCard'
import { isLocale, siteConfig } from '../../shared/config/site'
import styles from './HomePage.module.css'

const HeroScene = lazy(() => import('../../features/hero-scene/HeroScene'))

export default function HomePage() {
  const { locale: localeParam } = useParams()
  const locale = localeParam && isLocale(localeParam) ? localeParam : siteConfig.defaultLocale
  const content = getSiteContent(locale)

  return (
    <div className="pageShell">
      <section className={styles.hero}>
        <div className={styles.heroScene}>
          <Suspense fallback={null}>
            <HeroScene />
          </Suspense>
        </div>

        <div className={styles.heroCopy}>
          <span className="eyebrow">{content.home.hero.eyebrow}</span>
          <h1 className={styles.heroHeadline}>{content.home.hero.title}</h1>
          <p className={styles.heroSubtitle}>{content.home.hero.subtitle}</p>

          <div className={styles.heroActions}>
            <Link className={`buttonPrimary ${styles.heroCta}`} to={getLocalizedPath(locale, 'work')}>
              {content.nav.work}
            </Link>
            <Link className={`buttonSecondary ${styles.heroCta}`} to={getLocalizedPath(locale, 'about')}>
              {content.nav.about}
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className="pageIntro">
          <span className="eyebrow">{content.home.metricsIntro.eyebrow}</span>
          <h2 className="sectionTitle">{content.home.metricsIntro.title}</h2>
          <p className={styles.sectionLead}>{content.home.metricsIntro.description}</p>
        </div>
        <div className={`panel ${styles.signalPanel}`}>
          <SignalGrid locale={locale} contributionYears={content.home.hero.contributionYears} />
        </div>
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
          <span className="eyebrow">{content.home.aiUsageIntro.eyebrow}</span>
          <h2 className="sectionTitle">{content.home.aiUsageIntro.title}</h2>
          <p className={styles.sectionLead}>{content.home.aiUsageIntro.description}</p>
        </div>
        <div className={`panel ${styles.aiPanel}`}>
          <TokenCounter locale={locale} />
        </div>
      </section>

      <section className={styles.section}>
        <div className="pageIntro">
          <span className="eyebrow">{content.home.educationIntro.eyebrow}</span>
          <h2 className="sectionTitle">{content.home.educationIntro.title}</h2>
          <p className={styles.sectionLead}>{content.home.educationIntro.description}</p>
        </div>
        <div className={styles.educationGrid}>
          {content.education.map((entry) => (
            <article key={entry.institution} className={`panel ${styles.educationCard}`}>
              <div className={styles.educationMain}>
                <div className={styles.educationContent}>
                  <span className={styles.educationPeriod}>{entry.period}</span>
                  <h3 className="cardTitle">{entry.institution}</h3>
                  <p className={styles.educationDegree}>{entry.degree}</p>
                </div>
                {entry.logo && (
                  <img
                    className={styles.educationLogo}
                    src={`${import.meta.env.BASE_URL}${entry.logo}`}
                    alt={entry.institution}
                    loading="lazy"
                    decoding="async"
                  />
                )}
              </div>
              <div className={styles.educationHighlights}>
                {entry.highlights.map((highlight) => (
                  <span key={highlight} className={styles.educationHighlight}>
                    {highlight}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className="pageIntro">
          <span className="eyebrow">{content.home.capabilityIntro.eyebrow}</span>
          <h2 className="sectionTitle">{content.home.capabilityIntro.title}</h2>
          <p className={styles.sectionLead}>{content.home.capabilityIntro.description}</p>
        </div>
        <div className={styles.skillGrid}>
          {content.resume.skills.map((group) => (
            <article key={group.group} className={`panel ${styles.skillCard}`}>
              <h3 className={styles.skillHeading}>{group.group}</h3>
              <div className={styles.skillList}>
                {group.items.map((item) => (
                  <span key={item} className={styles.skillChip}>
                    {item}
                  </span>
                ))}
              </div>
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
