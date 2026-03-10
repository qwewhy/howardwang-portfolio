import { Link, useParams } from 'react-router-dom'
import { getSiteContent } from '../../app/i18n/catalog'
import { getLocalizedPath } from '../../app/router/route-utils'
import { SceneEntry } from '../../features/scene-entry/SceneEntry'
import { isLocale, isProjectSlug, siteConfig, type ProjectSlug } from '../../shared/config/site'
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

export default function ProjectDetailPage() {
  const { locale: localeParam, slug: slugParam } = useParams()

  if (!localeParam || !isLocale(localeParam) || !slugParam || !isProjectSlug(slugParam)) {
    return <NotFoundPage />
  }

  const content = getSiteContent(localeParam)
  const project = content.projects[slugParam]
  const nextProject = content.projects[getNextProjectSlug(slugParam)]

  return (
    <div className={`pageShell ${styles.layout}`}>
      <section className={styles.hero}>
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
                <span className="chip">{content.evidenceSources[metric.source]}</span>
              </div>
            ))}
          </div>
        </article>

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
          <div className="chipRow">
            {project.evidenceSource.map((source) => (
              <span key={source} className="chip">
                {content.evidenceSources[source]}
              </span>
            ))}
          </div>
        </article>
      </section>

      <SceneEntry locale={localeParam} slug={slugParam} chapters={project.chapters} />

      {project.liveUrl && (
        <section className={`panel ${styles.liveEmbed}`}>
          <div className={styles.liveEmbedHeader}>
            <span className="eyebrow">{content.copy.livePreviewLabel}</span>
            <a className="buttonPrimary" href={project.liveUrl} target="_blank" rel="noreferrer">
              <span>{content.copy.tryLiveLabel}</span>
              <ExternalArrowIcon />
            </a>
          </div>
          <iframe
            className={styles.liveFrame}
            src={project.liveUrl}
            title={`${project.title} live preview`}
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        </section>
      )}

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

      <section className={`panel ${styles.sectionCard}`}>
        <span className="eyebrow">{content.copy.techStackLabel}</span>
        <div className="chipRow">
          {project.techStack.map((item) => (
            <span key={item} className="chip">
              {item}
            </span>
          ))}
        </div>
      </section>

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
