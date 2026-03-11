import { useState } from 'react'
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

function getNextProjectSlug(slug: ProjectSlug): ProjectSlug {
  const currentIndex = siteConfig.projectSlugs.indexOf(slug)
  return siteConfig.projectSlugs[(currentIndex + 1) % siteConfig.projectSlugs.length]
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

function LiveEmbedSection({ project, content }: { project: ProjectContentSchema; content: SiteContent }) {
  const [activeUrl, setActiveUrl] = useState(project.liveUrl!)
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

  if (!localeParam || !isLocale(localeParam) || !slugParam || !isProjectSlug(slugParam)) {
    return <NotFoundPage />
  }

  const content = getSiteContent(localeParam)
  const project = content.projects[slugParam]
  const nextProject = content.projects[getNextProjectSlug(slugParam)]
  const skillGroups = getProjectSkillGroups(project, content)

  return (
    <div className={`pageShell ${styles.layout}`}>
      <section className={`${styles.hero} ${project.poster ? '' : styles.heroSingle}`.trim()}>
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
      </section>

      {project.chapters.length > 0 && (
        <SceneEntry locale={localeParam} slug={slugParam} chapters={project.chapters} />
      )}

      {project.liveUrl && <LiveEmbedSection project={project} content={content} />}

      {project.chapters.length > 0 && (
        <section className={styles.chapterGrid}>
          {project.chapters.map((chapter) => (
            <article key={chapter.id} className={`panel ${styles.chapter}`} id={chapter.id}>
              <span className="eyebrow">{chapter.eyebrow}</span>
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

      {project.detailSections && project.detailSections.length > 0 && (
        <section className={styles.detailGrid}>
          {project.detailSections.map((section) => (
            <article key={section.id} className={`panel ${styles.detailCard}`} id={section.id}>
              <div className={styles.detailLead}>
                <span className="eyebrow">{section.eyebrow}</span>
                <h2 className={styles.detailTitle}>{section.title}</h2>
              </div>
              <div className={styles.detailBody}>
                <p className={styles.detailSummary}>{section.summary}</p>
                <div className={styles.detailChipRow}>
                  {section.bullets.map((bullet) => (
                    <span key={bullet} className={styles.detailChip}>
                      {bullet}
                    </span>
                  ))}
                </div>
              </div>
            </article>
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

      <section className={`panel ${styles.sectionCard}`}>
        <span className="eyebrow">{content.copy.nextProjectLabel}</span>
        <h2 className="cardTitle">{nextProject.title}</h2>
        <p className="sectionDescription">{nextProject.summary}</p>
        <Link className={`buttonPrimary ${styles.nextLink}`} to={getLocalizedPath(localeParam, 'project', nextProject.slug)}>
          {content.copy.openProjectLabel}
        </Link>
      </section>
    </div>
  )
}
