import { lazy, Suspense, useRef, useState, useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getSiteContent } from '../../app/i18n/catalog'
import { getLocalizedPath } from '../../app/router/route-utils'
import { useAppShellStore } from '../../app/store/app-shell-store'
import { usePhysicsSkillsStore } from '../../app/store/physics-skills-store'
import { SignalGrid } from '../../features/contribution-visual/SignalGrid'
import { LazyPhysicsSkillCard } from '../../features/physics-skills'
import { TokenCounter } from '../../features/token-counter/TokenCounter'
import { ProjectCard } from '../../widgets/project-card/ProjectCard'
import { isLocale, siteConfig } from '../../shared/config/site'
import styles from './HomePage.module.css'

const HeroScene = lazy(() => import('../../features/hero-scene/HeroScene'))
const ParticleText = lazy(() => import('../../features/particle-text/ParticleText'))

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
  'Python 3': 'python.svg',
  Django: 'django.svg',
  FastAPI: 'fastapi.svg',
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
  'OpenAI SDK': 'openai.svg',
  'Claude Code': 'claude.svg',
  Cursor: 'cursor.svg',
  'Open Code': 'opencode.svg',
  'Google Antigravity': 'google-antigravity.svg',
  'OpenAI Codex': 'openai.svg',
}

const SKILL_ACCENTS = ['107,230,255', '67,231,177', '255,155,90', '167,139,250']

export default function HomePage() {
  const { locale: localeParam } = useParams()
  const locale = localeParam && isLocale(localeParam) ? localeParam : siteConfig.defaultLocale
  const content = getSiteContent(locale)
  const isMobile = useAppShellStore((state) => state.isMobile)
  const reducedMotion = useAppShellStore((state) => state.reducedMotion)
  const physicsMode = usePhysicsSkillsStore((s) => s.physicsMode)
  const togglePhysicsMode = usePhysicsSkillsStore((s) => s.togglePhysicsMode)
  const heroEyebrowClassName = `eyebrow ${styles.heroEyebrow}`

  // ── Physics skills: only activate when section scrolls into view ──────
  const skillSectionRef = useRef<HTMLDivElement>(null)
  const [skillsVisible, setSkillsVisible] = useState(false)
  const canPhysics = !isMobile && !reducedMotion
  const enablePhysics = canPhysics && physicsMode

  useEffect(() => {
    if (!enablePhysics) return
    const el = skillSectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSkillsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [enablePhysics])

  // ── Bomb: pick one random card each time physics activates ──────────
  const bombIndexRef = useRef(-1)
  const showPhysics = enablePhysics && skillsVisible
  if (showPhysics && bombIndexRef.current === -1) {
    bombIndexRef.current = Math.floor(Math.random() * content.resume.skills.length)
  }
  if (!showPhysics) {
    bombIndexRef.current = -1
  }

  /** Pre-compute physics items per group (stable across renders) */
  const physicsItemsByGroup = useMemo(
    () =>
      content.resume.skills.map((group) =>
        group.items.map((label) => ({
          label,
          logoSrc: SKILL_LOGO[label] ? `/logos/skills/${SKILL_LOGO[label]}` : undefined,
        })),
      ),
    [content.resume.skills],
  )
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
            <Suspense fallback={null}>
              <HeroScene />
            </Suspense>
          </div>
        )}

        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            {!isMobile ? (
              <Suspense
                fallback={
                  <>
                    {heroEyebrow}
                    <h1 className="heroTitle">{content.home.hero.title}</h1>
                    <p className={styles.heroSubtitle}>{content.home.hero.subtitle}</p>
                  </>
                }
              >
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
              </Suspense>
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

      <section className={styles.section}>
        <div className="pageIntro">
          <div className={styles.skillIntroRow}>
            <span className="eyebrow">{content.home.capabilityIntro.eyebrow}</span>
            {canPhysics && skillsVisible && (
              <button
                className={styles.physicsToggle}
                onClick={togglePhysicsMode}
                aria-label={physicsMode ? 'Switch to static view' : 'Switch to physics view'}
              >
                {physicsMode ? 'To Static' : 'To Physics'}
              </button>
            )}
          </div>
          <h2 className="sectionTitle">{content.home.capabilityIntro.title}</h2>
          <p className={styles.sectionLead}>{content.home.capabilityIntro.description}</p>
        </div>
        <div ref={skillSectionRef} className={styles.skillGrid}>
          {content.resume.skills.map((group, i) => {
            const accent = SKILL_ACCENTS[i] ?? SKILL_ACCENTS[0]
            return (
              <article
                key={group.group}
                className={`panel ${styles.skillCard}`}
                style={{ '--skill-accent': accent } as React.CSSProperties}
              >
                <h3 className={styles.skillHeading}>{group.group}</h3>
                {/* Static chip list: stays visible as fallback, hidden when physics active */}
                <div className={styles.skillList} style={showPhysics ? { visibility: 'hidden' } : undefined}>
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
                {/* Physics overlay: lazy-loaded, chips drop from above */}
                {showPhysics && (
                  <LazyPhysicsSkillCard
                    items={physicsItemsByGroup[i]}
                    accentRgb={accent}
                    hasBomb={i === bombIndexRef.current}
                  />
                )}
              </article>
            )
          })}
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
