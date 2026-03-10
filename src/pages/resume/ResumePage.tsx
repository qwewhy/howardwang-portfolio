import { Navigate, useParams } from 'react-router-dom'
import { getLocalizedPath } from '../../app/router/route-utils'
import { isLocale, siteConfig } from '../../shared/config/site'

export default function ResumePage() {
  const { locale: localeParam } = useParams()
  const locale = localeParam && isLocale(localeParam) ? localeParam : siteConfig.defaultLocale
  return <Navigate replace to={getLocalizedPath(locale, 'home')} />
}
