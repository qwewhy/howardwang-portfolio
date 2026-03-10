import { Link } from 'react-router-dom'
import { getSiteContent } from '../../app/i18n/catalog'
import { getLocalizedPath } from '../../app/router/route-utils'
import { useProjectIndexStore } from '../../app/store/project-index-store'
import type { Locale, ProjectSlug } from '../../shared/config/site'
import { prefetchProject } from '../../features/project-prefetch/prefetch'
import styles from './ProjectCard.module.css'

interface ProjectCardProps {
  locale: Locale
  slug: ProjectSlug
}

export function ProjectCard({ locale, slug }: ProjectCardProps) {
  const content = getSiteContent(locale)
  const project = content.projects[slug]
  const setHoveredSlug = useProjectIndexStore((state) => state.setHoveredSlug)

  return (
    <article
      className={`panel ${styles.card}`}
      onMouseEnter={() => {
        setHoveredSlug(slug)
        void prefetchProject(slug)
      }}
      onMouseLeave={() => setHoveredSlug(null)}
      onFocus={() => {
        setHoveredSlug(slug)
        void prefetchProject(slug)
      }}
      onBlur={() => setHoveredSlug(null)}
    >
      <div className={styles.preview} data-slug={slug}>
        <div className={styles.previewWords}>
          {project.poster.accentWords.slice(0, 2).map((word) => (
            <span key={word} className={styles.previewWord}>{word}</span>
          ))}
        </div>
      </div>
      <div className={styles.header}>
        <div className={styles.eyebrow}>
          {project.role} · {project.period}
        </div>
        <h3 className="cardTitle">{project.title}</h3>
        <p className={styles.summary}>{project.summary}</p>
        <div className="chipRow">
          {project.badges.map((badge) => (
            <span key={badge} className="chip">
              {badge}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.metric}>
        <span className={styles.metricValue}>{project.metrics[0]?.value}</span>
        <div className={styles.metricCopy}>
          <strong>{project.metrics[0]?.label}</strong>
          <span className={styles.metricSource}>{content.evidenceSources[project.metrics[0]?.source ?? 'resume']}</span>
        </div>
      </div>

      <div className={styles.meta}>
        {project.techStack.slice(0, 3).map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>

      <Link className={`buttonSecondary ${styles.cardAction}`} to={getLocalizedPath(locale, 'project', slug)}>
        {content.copy.openProjectLabel}
      </Link>
    </article>
  )
}
