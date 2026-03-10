import { useEffect } from 'react'
import { Navigate, Outlet, useLocation, useParams } from 'react-router-dom'
import { getSiteContent } from '../i18n/catalog'
import { SiteHeader } from '../../widgets/header/SiteHeader'
import { getRouteMeta } from '../seo/meta'
import { useAppShellStore } from '../store/app-shell-store'
import { useLocaleStore } from '../store/locale-store'
import { useThemeStore } from '../store/theme-store'
import { getLocalizedPath } from './route-utils'
import { isLocale, siteConfig } from '../../shared/config/site'
import styles from '../../widgets/app-shell/AppShell.module.css'

function useEnvironmentSync() {
  const setReducedMotion = useAppShellStore((state) => state.setReducedMotion)
  const setLowPerformanceMode = useAppShellStore((state) => state.setLowPerformanceMode)
  const setIsMobile = useAppShellStore((state) => state.setIsMobile)
  const themeId = useThemeStore((state) => state.themeId)

  useEffect(() => {
    document.documentElement.dataset.theme = themeId
  }, [themeId])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const applyReducedMotion = () => {
      setReducedMotion(mediaQuery.matches)
    }

    applyReducedMotion()
    mediaQuery.addEventListener('change', applyReducedMotion)

    const lowPerformance = window.matchMedia('(max-width: 900px)').matches || navigator.hardwareConcurrency <= 4
    setLowPerformanceMode(lowPerformance || mediaQuery.matches)

    /* live mobile breakpoint detection */
    const mobileQuery = window.matchMedia('(max-width: 640px)')
    const applyMobile = () => setIsMobile(mobileQuery.matches)
    applyMobile()
    mobileQuery.addEventListener('change', applyMobile)

    return () => {
      mediaQuery.removeEventListener('change', applyReducedMotion)
      mobileQuery.removeEventListener('change', applyMobile)
    }
  }, [setLowPerformanceMode, setReducedMotion, setIsMobile])
}

function useDocumentMeta(pathname: string) {
  useEffect(() => {
    const meta = getRouteMeta(pathname)
    document.title = meta.title
    document.documentElement.lang = meta.lang

    const setMetaTag = (selector: string, attribute: 'name' | 'property', value: string, content: string) => {
      let element = document.head.querySelector<HTMLMetaElement>(selector)

      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attribute, value)
        document.head.appendChild(element)
      }

      element.setAttribute('content', content)
    }

    setMetaTag('meta[name="description"]', 'name', 'description', meta.description)
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', meta.title)
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', meta.description)
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', meta.canonical)
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', 'website')
    setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', siteConfig.siteName)

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')

    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }

    canonical.setAttribute('href', meta.canonical)

    document.head
      .querySelectorAll<HTMLLinkElement>('link[data-alternate-locale]')
      .forEach((element) => element.remove())

    meta.alternates.forEach(({ locale, href }) => {
      const alternate = document.createElement('link')
      alternate.setAttribute('rel', 'alternate')
      alternate.setAttribute('hreflang', locale)
      alternate.setAttribute('href', href)
      alternate.dataset.alternateLocale = locale
      document.head.appendChild(alternate)
    })
  }, [pathname])
}

export function LocalizedLayout() {
  const { locale: localeParam } = useParams()
  const location = useLocation()
  const setCurrentLocale = useLocaleStore((state) => state.setCurrentLocale)
  const setNavigationOpen = useAppShellStore((state) => state.setNavigationOpen)
  const locale = localeParam && isLocale(localeParam) ? localeParam : siteConfig.defaultLocale
  const content = getSiteContent(locale)

  useEnvironmentSync()
  useDocumentMeta(location.pathname)

  /* close mobile nav on route change */
  useEffect(() => {
    setNavigationOpen(false)
  }, [location.pathname, setNavigationOpen])

  useEffect(() => {
    setCurrentLocale(locale)
  }, [locale, setCurrentLocale])

  if (!localeParam || !isLocale(localeParam)) {
    return <Navigate replace to={getLocalizedPath(siteConfig.defaultLocale, 'home')} />
  }

  return (
    <div className={styles.shell}>
      <div className={styles.backdrop} aria-hidden="true" />
      <a className="skipLink" href="#main-content">
        {content.copy.skipToContentLabel}
      </a>
      <SiteHeader locale={locale} />
      <main id="main-content" className={styles.main}>
        <div className={styles.routeFrame}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
