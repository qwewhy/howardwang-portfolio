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

function ExternalArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className={styles.externalIcon}>
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

export function ProjectCard({ locale, slug }: ProjectCardProps) {
  const content = getSiteContent(locale)
  const project = content.projects[slug]
  const setHoveredSlug = useProjectIndexStore((state) => state.setHoveredSlug)
  const featuredMetrics = project.metrics.slice(0, 3)
  const externalAction = project.liveUrl
    ? { href: project.liveUrl, label: content.copy.tryLiveLabel, primary: true }
    : project.links[0]
      ? { href: project.links[0].href, label: project.links[0].label, primary: false }
      : null

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
      <div className={styles.content}>
        <div className={styles.cardHeader}>
          <span className={styles.badge}>{project.badges[0]}</span>
          <h3 className="cardTitle">{project.title}</h3>
        </div>
        <p className={styles.summary}>{project.summary}</p>

        <ul className={styles.featureList}>
          {featuredMetrics.map((metric) => (
            <li key={metric.label} className={styles.featureItem}>
              <span className={styles.featureValue}>{metric.value}</span>
              <span className={styles.featureLabel}>{metric.label}</span>
            </li>
          ))}
        </ul>

        <div className={styles.techList}>
          {project.techStack.slice(0, 3).map((item) => (
            <span key={item} className={styles.techChip}>
              {item}
            </span>
          ))}
        </div>

        <div className={`${styles.cardActions} ${externalAction ? '' : styles.singleAction}`}>
          <Link className={`buttonSecondary ${styles.cardAction}`} to={getLocalizedPath(locale, 'project', slug)}>
            {content.copy.openProjectLabel}
          </Link>
          {externalAction && (
            <a
              className={`${externalAction.primary ? 'buttonPrimary' : 'buttonSecondary'} ${styles.cardAction}`}
              href={externalAction.href}
              target="_blank"
              rel="noreferrer"
            >
              <span>{externalAction.label}</span>
              <ExternalArrowIcon />
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
