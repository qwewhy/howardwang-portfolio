import { isLocale, isProjectSlug, siteConfig, type Locale, type ProjectSlug } from '../../shared/config/site'

export type RouteKey = 'redirect' | 'home' | 'work' | 'about' | 'resume' | 'contact' | 'project' | 'not-found'

export interface ResolvedRoute {
  locale: Locale
  pathname: string
  key: RouteKey
  slug?: ProjectSlug
}

export function normalizePathname(pathname: string): string {
  if (!pathname || pathname === '/') {
    return '/'
  }

  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`
  return normalized.replace(/\/+$/, '') || '/'
}

export function resolveRoute(pathname: string): ResolvedRoute {
  const normalized = normalizePathname(pathname)

  if (normalized === '/') {
    return {
      locale: siteConfig.defaultLocale,
      pathname: normalized,
      key: 'redirect',
    }
  }

  const segments = normalized.split('/').filter(Boolean)
  const [localeSegment, section, slug] = segments

  if (!localeSegment || !isLocale(localeSegment)) {
    return {
      locale: siteConfig.defaultLocale,
      pathname: normalized,
      key: 'not-found',
    }
  }

  const locale = localeSegment

  if (segments.length === 1) {
    return { locale, pathname: normalized, key: 'home' }
  }

  if (section === 'work' && segments.length === 2) {
    return { locale, pathname: normalized, key: 'work' }
  }

  if (section === 'work' && slug && segments.length === 3 && isProjectSlug(slug)) {
    return {
      locale,
      pathname: normalized,
      key: 'project',
      slug,
    }
  }

  if (section === 'about' && segments.length === 2) {
    return { locale, pathname: normalized, key: 'about' }
  }

  if (section === 'resume' && segments.length === 2) {
    return { locale, pathname: normalized, key: 'resume' }
  }

  if (section === 'contact' && segments.length === 2) {
    return { locale, pathname: normalized, key: 'contact' }
  }

  return {
    locale,
    pathname: normalized,
    key: 'not-found',
  }
}

export function getLocalizedPath(
  locale: Locale,
  key: Exclude<RouteKey, 'redirect' | 'not-found'>,
  slug?: ProjectSlug,
): string {
  switch (key) {
    case 'home':
      return `/${locale}`
    case 'work':
      return `/${locale}/work`
    case 'about':
      return `/${locale}/about`
    case 'resume':
      return `/${locale}/resume`
    case 'contact':
      return `/${locale}/contact`
    case 'project':
      return `/${locale}/work/${slug ?? siteConfig.projectSlugs[0]}`
  }
}

export function switchLocalePath(pathname: string, nextLocale: Locale): string {
  const resolved = resolveRoute(pathname)

  if (resolved.key === 'redirect' || resolved.key === 'not-found') {
    return getLocalizedPath(nextLocale, 'home')
  }

  if (resolved.key === 'project') {
    return getLocalizedPath(nextLocale, 'project', resolved.slug)
  }

  return getLocalizedPath(nextLocale, resolved.key)
}

export function getStaticRenderPaths(): string[] {
  const localizedPaths = siteConfig.locales.flatMap((locale) => {
    const basePaths = [
      getLocalizedPath(locale, 'home'),
      getLocalizedPath(locale, 'work'),
      getLocalizedPath(locale, 'about'),
      getLocalizedPath(locale, 'resume'),
      getLocalizedPath(locale, 'contact'),
    ]

    const projectPaths = siteConfig.projectSlugs.map((slug) => getLocalizedPath(locale, 'project', slug))

    return [...basePaths, ...projectPaths]
  })

  return ['/', ...localizedPaths]
}

