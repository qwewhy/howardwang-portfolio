import { useParams } from 'react-router-dom'
import { getSiteContent } from '../../app/i18n/catalog'
import { isLocale, siteConfig } from '../../shared/config/site'
import styles from './ResumePage.module.css'

export default function ResumePage() {
  const { locale: localeParam } = useParams()
  const locale = localeParam && isLocale(localeParam) ? localeParam : siteConfig.defaultLocale
  const content = getSiteContent(locale)

  return (
    <div className={`pageShell ${styles.layout}`}>
      <section className="pageIntro">
        <span className="eyebrow">{content.resume.intro.eyebrow}</span>
        <h1 className="sectionTitle">{content.resume.intro.title}</h1>
        <p className="sectionDescription">{content.resume.intro.description}</p>
      </section>

      <section className={`panel ${styles.sectionCard}`}>
        <h2 className="cardTitle">{content.copy.summaryLabel}</h2>
        <p className="sectionDescription">{content.resume.summary}</p>
        <span className="chip">{content.copy.unavailablePdfLabel}</span>
      </section>

      {content.resume.sections.map((section) => (
        <section key={section.title} className={`panel ${styles.sectionCard}`}>
          <h2 className="cardTitle">{section.title}</h2>
          {section.entries.map((entry) => (
            <article key={entry.heading} className={styles.entry}>
              <h3 className="cardTitle">{entry.heading}</h3>
              <strong>{entry.subheading}</strong>
              <p className="sectionDescription">{entry.detail}</p>
              <div className="chipRow">
                {entry.bullets.map((bullet) => (
                  <span key={bullet} className="chip">
                    {bullet}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </section>
      ))}

      <section className={styles.skills}>
        {content.resume.skills.map((group) => (
          <article key={group.group} className={`panel ${styles.sectionCard}`}>
            <h2 className="cardTitle">{group.group}</h2>
            <div className="chipRow">
              {group.items.map((item) => (
                <span key={item} className="chip">
                  {item}
                </span>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}
