import { Link, useParams } from 'react-router-dom'
import { getSiteContent } from '../../app/i18n/catalog'
import { getLocalizedPath } from '../../app/router/route-utils'
import { useAppShellStore } from '../../app/store/app-shell-store'
import HeroScene from '../../features/hero-scene/HeroScene'
import ParticleText from '../../features/particle-text/ParticleText'
import { SignalGrid } from '../../features/contribution-visual/SignalGrid'
import { TokenCounter } from '../../features/token-counter/TokenCounter'
import { isLocale, siteConfig } from '../../shared/config/site'
import { ProjectCard } from '../../widgets/project-card/ProjectCard'
import { SkillsShowcase } from '../../widgets/skills-showcase/SkillsShowcase'
import styles from './HomePage.module.css'

export default function HomePage() {
  const { locale: localeParam } = useParams()
  const locale = localeParam && isLocale(localeParam) ? localeParam : siteConfig.defaultLocale
  const content = getSiteContent(locale)
  const isMobile = useAppShellStore((state) => state.isMobile)
  const heroEyebrowClassName = `eyebrow ${styles.heroEyebrow}`

  const heroEyebrow = (
    <span className={heroEyebrowClassName}>
      <span className={styles.heroEyebrowLabel}>{content.home.hero.eyebrow}</span>
    </span>
  )

  return (
    <div className="pageShell">
      <section className={`${styles.hero} ${isMobile ? styles.heroMobile : ''}`}>
        {!isMobile && (
          <div className={styles.heroScene}>
            <HeroScene />
          </div>
        )}

        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            {!isMobile ? (
              <>
                <ParticleText
                  key={`${locale}-eyebrow`}
                  particleGap={1}
                  particleSize={0.95}
                  minParticleAlpha={1}
                  contrastBoost={0.28}
                  saturationBoost={1.6}
                  shapeKind="pill-outline"
                  repelRadius={52}
                  repelStrength={2.2}
                  springFactor={0.042}
                  friction={0.89}
                  transitionDelay={640}
                  transitionDuration={620}
                >
                  {heroEyebrow}
                </ParticleText>
                <ParticleText
                  className={styles.heroTitleParticle}
                  key={`${locale}-title`}
                  particleGap={2}
                  particleSize={1.4}
                  minParticleAlpha={1}
                  contrastBoost={0.48}
                  saturationBoost={1.16}
                  repelRadius={116}
                  repelStrength={4}
                  springFactor={0.048}
                >
                  <h1 className="heroTitle">{content.home.hero.title}</h1>
                </ParticleText>
                <ParticleText
                  key={`${locale}-subtitle`}
                  particleGap={1}
                  particleSize={1.08}
                  minParticleAlpha={0.94}
                  contrastBoost={0.26}
                  saturationBoost={1.08}
                  repelRadius={74}
                  repelStrength={2.8}
                  springFactor={0.04}
                  friction={0.88}
                  transitionDelay={720}
                  transitionDuration={700}
                >
                  <p className={styles.heroSubtitle}>{content.home.hero.subtitle}</p>
                </ParticleText>
              </>
            ) : (
              <>
                {heroEyebrow}
                <h1 className="heroTitle">{content.home.hero.title}</h1>
                <p className={styles.heroSubtitle}>{content.home.hero.subtitle}</p>
              </>
            )}
          </div>

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
                    className={`${styles.educationLogo}${entry.logo.includes('neu') ? ` ${styles.educationLogoWide}` : ''}`}
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

      <SkillsShowcase
        className={styles.section}
        groups={content.resume.skills}
        variant="featured"
        copy={{
          eyebrow: content.home.capabilityIntro.eyebrow,
          title: content.home.capabilityIntro.title,
          description: content.home.capabilityIntro.description,
          toStaticLabel: content.copy.toStaticLabel,
          toPhysicsLabel: content.copy.toPhysicsLabel,
          toStaticAriaLabel: content.copy.toStaticAriaLabel,
          toPhysicsAriaLabel: content.copy.toPhysicsAriaLabel,
        }}
      />

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
