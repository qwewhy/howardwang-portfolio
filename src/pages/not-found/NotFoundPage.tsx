import { Link, useParams } from 'react-router-dom'
import { getSiteContent } from '../../app/i18n/catalog'
import { getLocalizedPath } from '../../app/router/route-utils'
import { isLocale, siteConfig } from '../../shared/config/site'

export default function NotFoundPage() {
  const { locale: localeParam } = useParams()
  const locale = localeParam && isLocale(localeParam) ? localeParam : siteConfig.defaultLocale
  const content = getSiteContent(locale)

  return (
    <div className="pageShell" style={{ paddingTop: '3rem' }}>
      <section className="panel sectionStack" style={{ padding: '1.4rem' }}>
        <span className="eyebrow">404</span>
        <h1 className="sectionTitle">{content.copy.notFoundTitle}</h1>
        <p className="sectionDescription">{content.copy.notFoundDescription}</p>
        <Link className="buttonPrimary" to={getLocalizedPath(locale, 'home')}>
          {content.copy.backHomeLabel}
        </Link>
      </section>
    </div>
  )
}

