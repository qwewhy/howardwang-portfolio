import { getSiteContent } from '../i18n/catalog'
import { getLocalizedPath, resolveRoute } from '../router/route-utils'
import { buildSiteUrl, siteConfig, type Locale } from '../../shared/config/site'

export interface RouteMeta {
  title: string
  description: string
  canonical: string
  alternates: Array<{ locale: Locale; href: string }>
  lang: Locale
}

export function getRouteMeta(pathname: string): RouteMeta {
  const resolved = resolveRoute(pathname)
  const locale = resolved.locale
  const content = getSiteContent(locale)

  const entry =
    resolved.key === 'project' && resolved.slug
      ? content.seo.projects[resolved.slug]
      : resolved.key === 'home'
        ? content.seo.home
        : resolved.key === 'work'
          ? content.seo.work
          : resolved.key === 'about'
            ? content.seo.about
            : resolved.key === 'resume'
              ? content.seo.resume
              : resolved.key === 'contact'
                ? content.seo.contact
                : content.seo.home

  const canonicalPath =
    resolved.key === 'project' && resolved.slug
      ? getLocalizedPath(locale, 'project', resolved.slug)
      : resolved.key === 'redirect' || resolved.key === 'not-found'
        ? getLocalizedPath(siteConfig.defaultLocale, 'home')
        : getLocalizedPath(locale, resolved.key)

  return {
    title: entry.title,
    description: entry.description,
    canonical: buildSiteUrl(canonicalPath),
    alternates: siteConfig.locales.map((alternateLocale) => ({
      locale: alternateLocale,
      href:
        resolved.key === 'project' && resolved.slug
          ? buildSiteUrl(getLocalizedPath(alternateLocale, 'project', resolved.slug))
          : resolved.key === 'redirect' || resolved.key === 'not-found'
            ? buildSiteUrl(getLocalizedPath(alternateLocale, 'home'))
            : buildSiteUrl(getLocalizedPath(alternateLocale, resolved.key)),
    })),
    lang: locale,
  }
}

export function buildHeadMarkup(pathname: string): string {
  const meta = getRouteMeta(pathname)
  const alternateTags = meta.alternates
    .map(({ locale, href }) => `<link rel="alternate" hreflang="${locale}" href="${href}" />`)
    .join('\n')

  return [
    `<title>${meta.title}</title>`,
    `<meta name="description" content="${meta.description}" />`,
    `<link rel="canonical" href="${meta.canonical}" />`,
    `<meta property="og:title" content="${meta.title}" />`,
    `<meta property="og:description" content="${meta.description}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:url" content="${meta.canonical}" />`,
    `<meta property="og:site_name" content="${siteConfig.siteName}" />`,
    alternateTags,
  ].join('\n')
}

