import { useLayoutEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getSiteContent } from '../../app/i18n/catalog'
import { getLocalizedPath } from '../../app/router/route-utils'
import type { ProjectContentSchema, SiteContent, SkillGroup } from '../../entities/content/types'
import { SceneEntry } from '../../features/scene-entry/SceneEntry'
import { isLocale, isProjectSlug, siteConfig, type ProjectSlug } from '../../shared/config/site'
import { BrowserChrome } from '../../shared/ui/BrowserChrome'
import { SkillsShowcase } from '../../widgets/skills-showcase/SkillsShowcase'
import NotFoundPage from '../not-found/NotFoundPage'
import styles from './ProjectDetailPage.module.css'

function getAdjacentProjectSlug(slug: ProjectSlug, offset: number): ProjectSlug {
  const currentIndex = siteConfig.projectSlugs.indexOf(slug)
  const total = siteConfig.projectSlugs.length
  return siteConfig.projectSlugs[(currentIndex + offset + total) % total]
}

function ExternalArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M4.5 11.5 11.5 4.5M6 4.5h5.5V10"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  )
}

function NavigationArrowIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      {direction === 'left' ? (
        <path
          d="M11.5 8H4.5M7.5 5 4.5 8l3 3"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      ) : (
        <path
          d="M4.5 8h7M8.5 5l3 3-3 3"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      )}
    </svg>
  )
}

function getPrimaryLiveUrl(project: ProjectContentSchema) {
  return project.livePages?.[0]?.url ?? project.liveUrl!
}

function getProjectAssetSrc(src: string) {
  return src.startsWith('http') ? src : `${import.meta.env.BASE_URL}${src}`
}

function LiveEmbedSection({ project, content }: { project: ProjectContentSchema; content: SiteContent }) {
  const [activeUrl, setActiveUrl] = useState(() => getPrimaryLiveUrl(project))
  const livePages = project.livePages

  return (
    <section className={`panel ${styles.liveEmbed}`}>
      <div className={styles.liveEmbedHeader}>
        <span className="eyebrow">{content.copy.livePreviewLabel}</span>
        {livePages && livePages.length > 1 && (
          <div className={styles.pageTabRow}>
            {livePages.map((page) => (
              <button
                key={page.url}
                type="button"
                className={`${styles.pageTab} ${activeUrl === page.url ? styles.pageTabActive : ''}`}
                onClick={() => setActiveUrl(page.url)}
              >
                {page.label}
              </button>
            ))}
          </div>
        )}
        <a className="buttonPrimary" href={activeUrl} target="_blank" rel="noreferrer">
          <span>{content.copy.tryLiveLabel}</span>
          <ExternalArrowIcon />
        </a>
      </div>
      <BrowserChrome url={activeUrl} title={project.title} />
    </section>
  )
}

function getProjectSkillGroups(project: ProjectContentSchema, content: SiteContent): SkillGroup[] {
  return project.skillGroups ?? [{ group: content.copy.techStackLabel, items: project.techStack }]
}

export default function ProjectDetailPage() {
  const { locale: localeParam, slug: slugParam } = useParams()

  useLayoutEffect(() => {
    if (!localeParam || !slugParam) {
      return
    }

    window.scrollTo(0, 0)
  }, [localeParam, slugParam])

  if (!localeParam || !isLocale(localeParam) || !slugParam || !isProjectSlug(slugParam)) {
    return <NotFoundPage />
  }

  const content = getSiteContent(localeParam)
  const project = content.projects[slugParam]
  const previousProject = content.projects[getAdjacentProjectSlug(slugParam, -1)]
  const nextProject = content.projects[getAdjacentProjectSlug(slugParam, 1)]
  const skillGroups = getProjectSkillGroups(project, content)
  const showChapterCards = project.renderChapterCards ?? true
  const hasHeroAside = Boolean(project.poster || project.heroLogo)
  const detailSections = [
    ...(showChapterCards ? [] : project.chapters.map((chapter) => ({ ...chapter, eyebrow: '' }))),
    ...(project.detailSections ?? []),
  ]

  return (
    <div className={`pageShell ${styles.layout}`}>
      <section className={`${styles.hero} ${hasHeroAside ? '' : styles.heroSingle}`.trim()}>
        <article className={`panel ${styles.heroCard}`}>
          <span className="eyebrow">
            {project.role} · {project.period}
          </span>
          <h1 className="sectionTitle">{project.title}</h1>
          <p className="sectionDescription">{project.summary}</p>
          <div className="chipRow">
            {project.badges.map((badge) => (
              <span key={badge} className="chip">
                {badge}
              </span>
            ))}
          </div>
          <div className="chipRow">
            {project.links.map((link) => (
              <a key={link.label} className="buttonSecondary" href={link.href} target={link.external ? '_blank' : undefined} rel={link.external ? 'noreferrer' : undefined}>
                {link.label}
              </a>
            ))}
          </div>
          <div className="metricGrid">
            {project.metrics.map((metric) => (
              <div key={metric.label} className="panel sectionStack" style={{ padding: '1rem' }}>
                <span className="sectionTitle" style={{ fontSize: '1.8rem' }}>
                  {metric.value}
                </span>
                <strong>{metric.label}</strong>
                <span className="muted">{metric.context}</span>
              </div>
            ))}
          </div>
        </article>

        {project.poster && (
          <article className={`panel ${styles.posterCard}`}>
            <div className={styles.poster} data-slug={slugParam}>
              <div className={styles.posterWords}>
                {project.poster.accentWords.map((word) => (
                  <span key={word} className={styles.posterWord}>
                    {word}
                  </span>
                ))}
              </div>
            </div>
            <span className="eyebrow">{project.poster.title}</span>
            <p className="sectionDescription">{project.poster.description}</p>
          </article>
        )}

        {!project.poster && project.heroLogo && (
          <article className={`panel ${styles.heroLogoCard}`}>
            {project.heroLogo.eyebrow ? <span className="eyebrow">{project.heroLogo.eyebrow}</span> : null}
            <div className={styles.heroLogoStage}>
              <img
                className={styles.heroLogoImage}
                src={getProjectAssetSrc(project.heroLogo.src)}
                alt={project.heroLogo.alt}
              />
            </div>
            {project.heroLogo.caption ? <p className="sectionDescription">{project.heroLogo.caption}</p> : null}
            {project.heroLogo.tags && project.heroLogo.tags.length > 0 ? (
              <div className="chipRow">
                {project.heroLogo.tags.map((tag) => (
                  <span key={tag} className="chip">
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </article>
        )}
      </section>

      {project.chapters.length > 0 && (
        <SceneEntry locale={localeParam} slug={slugParam} chapters={project.chapters} />
      )}

      {project.liveUrl && <LiveEmbedSection key={`${localeParam}:${project.slug}`} project={project} content={content} />}

      {showChapterCards && project.chapters.length > 0 && (
        <section className={styles.chapterGrid}>
          {project.chapters.map((chapter) => (
            <article key={chapter.id} className={`panel ${styles.chapter}`} id={chapter.id}>
              {chapter.eyebrow ? <span className="eyebrow">{chapter.eyebrow}</span> : null}
              <h2 className="cardTitle">{chapter.title}</h2>
              <p className="sectionDescription">{chapter.summary}</p>
              <div className="chipRow">
                {chapter.bullets.map((bullet) => (
                  <span key={bullet} className="chip">
                    {bullet}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </section>
      )}

      {detailSections.length > 0 && (
        <section className={styles.detailGrid}>
          {detailSections.map((section) => (
            <details key={section.id} className={`panel ${styles.detailDisclosure}`} id={section.id}>
              <summary className={styles.detailTrigger}>
                <div className={styles.detailLead}>
                  {section.eyebrow ? <span className="eyebrow">{section.eyebrow}</span> : null}
                  <h2 className={styles.detailTitle}>{section.title}</h2>
                </div>
                <span className={styles.detailChevron} aria-hidden="true">
                  <svg viewBox="0 0 16 16" fill="none">
                    <path
                      d="m4 6 4 4 4-4"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                    />
                  </svg>
                </span>
              </summary>
              <div className={styles.detailPanel}>
                <div className={styles.detailPanelInner}>
                  <p className={styles.detailSummary}>{section.summary}</p>
                  <div className={styles.detailChipRow}>
                    {section.bullets.map((bullet) => (
                      <span key={bullet} className={styles.detailChip}>
                        {bullet}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </details>
          ))}
        </section>
      )}

      <SkillsShowcase
        className={styles.stackSection}
        groups={skillGroups}
        copy={{
          eyebrow: content.copy.techStackLabel,
          toStaticLabel: content.copy.toStaticLabel,
          toPhysicsLabel: content.copy.toPhysicsLabel,
          toStaticAriaLabel: content.copy.toStaticAriaLabel,
          toPhysicsAriaLabel: content.copy.toPhysicsAriaLabel,
        }}
      />

      <section className={styles.projectNavGrid}>
        <Link
          className={`panel ${styles.projectNavCard} ${styles.projectNavPrev}`}
          to={getLocalizedPath(localeParam, 'project', previousProject.slug)}
        >
          <span className="eyebrow">{content.copy.previousProjectLabel}</span>
          <h2 className="cardTitle">{previousProject.title}</h2>
          <p className="sectionDescription">{previousProject.summary}</p>
          <span className={styles.projectNavFoot}>
            <NavigationArrowIcon direction="left" />
            <span>{content.copy.previousProjectLabel}</span>
          </span>
        </Link>

        <Link
          className={`panel ${styles.projectNavCard} ${styles.projectNavNext}`}
          to={getLocalizedPath(localeParam, 'project', nextProject.slug)}
        >
          <span className="eyebrow">{content.copy.nextProjectLabel}</span>
          <h2 className="cardTitle">{nextProject.title}</h2>
          <p className="sectionDescription">{nextProject.summary}</p>
          <span className={styles.projectNavFoot}>
            <span>{content.copy.nextProjectLabel}</span>
            <NavigationArrowIcon direction="right" />
          </span>
        </Link>
      </section>
    </div>
  )
}
