import { getSiteContent } from '../../app/i18n/catalog'
import type { Locale } from '../../shared/config/site'
import styles from './SiteFooter.module.css'

interface SiteFooterProps {
  locale: Locale
}

export function SiteFooter({ locale }: SiteFooterProps) {
  const content = getSiteContent(locale)

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.copy}>{content.copy.footerText}</p>
        <div className={styles.links}>
          {content.profile.links.map((link) => (
            <a key={link.label} className={styles.link} href={link.href} target={link.external ? '_blank' : undefined} rel={link.external ? 'noreferrer' : undefined}>
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}

