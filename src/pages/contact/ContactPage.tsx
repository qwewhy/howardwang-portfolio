import { useParams } from 'react-router-dom'
import { getSiteContent } from '../../app/i18n/catalog'
import { isLocale, siteConfig } from '../../shared/config/site'
import styles from './ContactPage.module.css'

export default function ContactPage() {
  const { locale: localeParam } = useParams()
  const locale = localeParam && isLocale(localeParam) ? localeParam : siteConfig.defaultLocale
  const content = getSiteContent(locale)

  return (
    <div className={`pageShell ${styles.layout}`}>
      <section className="pageIntro">
        <span className="eyebrow">{content.contact.intro.eyebrow}</span>
        <h1 className="sectionTitle">{content.contact.intro.title}</h1>
        <p className="sectionDescription">{content.contact.intro.description}</p>
      </section>

      <section className={`panel ${styles.card}`}>
        <p className="sectionDescription">{content.contact.note}</p>
        <div className="chipRow">
          {content.contact.links.map((link) => (
            <a key={link.label} className="buttonSecondary" href={link.href} target={link.external ? '_blank' : undefined} rel={link.external ? 'noreferrer' : undefined}>
              {link.label}
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}

