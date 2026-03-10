import { useParams } from 'react-router-dom'
import { getSiteContent } from '../../app/i18n/catalog'
import { isLocale, siteConfig } from '../../shared/config/site'
import { ProjectCard } from '../../widgets/project-card/ProjectCard'
import styles from './WorkPage.module.css'

export default function WorkPage() {
  const { locale: localeParam } = useParams()
  const locale = localeParam && isLocale(localeParam) ? localeParam : siteConfig.defaultLocale
  const content = getSiteContent(locale)

  return (
    <div className="pageShell">
      <section className="pageIntro">
        <span className="eyebrow">{content.work.intro.eyebrow}</span>
        <h1 className="sectionTitle">{content.work.intro.title}</h1>
        <p className="sectionDescription">{content.work.intro.description}</p>
      </section>

      <section className={`panel ${styles.comparison}`}>
        <h2 className="cardTitle">{content.work.comparisonTitle}</h2>
        <p className="sectionDescription">{content.work.comparisonDescription}</p>
      </section>

      <section className={styles.grid}>
        {siteConfig.projectSlugs.map((slug) => (
          <ProjectCard key={slug} locale={locale} slug={slug} />
        ))}
      </section>
    </div>
  )
}

