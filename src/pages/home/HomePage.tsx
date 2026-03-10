import { lazy, Suspense, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getSiteContent } from '../../app/i18n/catalog'
import { getLocalizedPath } from '../../app/router/route-utils'
import { useAppShellStore } from '../../app/store/app-shell-store'
import { SignalGrid } from '../../features/contribution-visual/SignalGrid'
import { TokenCounter } from '../../features/token-counter/TokenCounter'
import { ProjectCard } from '../../widgets/project-card/ProjectCard'
import { isLocale, siteConfig } from '../../shared/config/site'
import styles from './HomePage.module.css'

const HeroScene = lazy(() => import('../../features/hero-scene/HeroScene'))

/** Map skill display-name → logo file under /logos/skills/ */
const SKILL_LOGO: Record<string, string> = {
  'React 18': 'react.svg',
  'Next.js': 'nextjs.svg',
  TanStack: 'tanstack.png',
  JavaScript: 'javascript.svg',
  TypeScript: 'typescript.svg',
  WebGL: 'webgl.svg',
  'Three.js': 'threejs.svg',
  R3F: 'threejs.svg',
  Drei: 'threejs.svg',
  Cannon: 'threejs.svg',
  Rapier3D: 'rapier.svg',
  GLSL: 'glsl.svg',
  WASM: 'wasm.svg',
  'driver.js': 'driverjs.svg',
  'CodeMirror 6': 'codemirror.svg',
  Vitest: 'vitest.svg',
  Vite: 'vitejs.svg',
  Webpack: 'webpack.svg',
  'React Router': 'reactrouter.svg',
  Zustand: 'zustand.svg',
  'Tailwind CSS': 'tailwindcss.svg',
  'Ant Design': 'antdesign.svg',
  Figma: 'figma.svg',
  'ESLint/TSLint': 'eslint.svg',
  Prettier: 'prettier.svg',
  'Node.js': 'nodejs.svg',
  NestJS: 'nestjs.svg',
  Java: 'java.svg',
  'Spring Boot 3': 'spring.svg',
  MongoDB: 'mongodb.svg',
  Redis: 'redis.svg',
  MySQL: 'mysql.svg',
  Elasticsearch: 'elasticsearch.svg',
  Supabase: 'supabase.svg',
  Stripe: 'stripe.svg',
  'Swagger/Knife4j': 'swagger.svg',
  'Spring AI': 'spring.svg',
  'Spring AI Alibaba': 'spring.svg',
  Qdrant: 'qdrant.svg',
  OpenClaw: 'openclaw.svg',
  'Vercel AI SDK': 'vercel.svg',
  DeepSeek: 'deepseek.svg',
  'OpenAI SDK': 'openai.svg',
}

export default function HomePage() {
  const { locale: localeParam } = useParams()
  const locale = localeParam && isLocale(localeParam) ? localeParam : siteConfig.defaultLocale
  const content = getSiteContent(locale)
  const isMobile = useAppShellStore((state) => state.isMobile)

  return (
    <div className="pageShell">
      <section className={`${styles.hero} ${isMobile ? styles.heroMobile : ''}`}>
        {!isMobile && (
          <div className={styles.heroScene}>
            <Suspense fallback={null}>
              <HeroScene />
            </Suspense>
          </div>
        )}

        <div className={styles.heroText}>
          <span className="eyebrow">{content.home.hero.eyebrow}</span>
          <h1 className="heroTitle">{content.home.hero.title}</h1>
          <p className={styles.heroSubtitle}>{content.home.hero.subtitle}</p>
        </div>

        <div className={styles.heroActions}>
          <Link className={`buttonPrimary ${styles.heroCta}`} to={getLocalizedPath(locale, 'work')}>
            {content.nav.work}
          </Link>
          <Link className={`buttonSecondary ${styles.heroCta}`} to={getLocalizedPath(locale, 'about')}>
            {content.nav.about}
          </Link>
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

      <section className={styles.section}>
        <div className="pageIntro">
          <span className="eyebrow">{content.home.capabilityIntro.eyebrow}</span>
          <h2 className="sectionTitle">{content.home.capabilityIntro.title}</h2>
          <p className={styles.sectionLead}>{content.home.capabilityIntro.description}</p>
        </div>
        <div className={styles.skillGrid}>
          {content.resume.skills.map((group, i) => (
            <article
              key={group.group}
              className={`panel ${styles.skillCard}`}
              style={{ '--skill-accent': ['107,230,255', '67,231,177', '255,155,90'][i] ?? '107,230,255' } as React.CSSProperties}
            >
              <h3 className={styles.skillHeading}>{group.group}</h3>
              <div className={styles.skillList}>
                {group.items.map((item) => (
                  <span key={item} className={styles.skillChip}>
                    {SKILL_LOGO[item] && (
                      <img
                        src={`/logos/skills/${SKILL_LOGO[item]}`}
                        alt=""
                        className={styles.skillIcon}
                        loading="lazy"
                      />
                    )}
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
