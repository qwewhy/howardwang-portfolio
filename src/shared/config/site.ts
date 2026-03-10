export const siteConfig = {
  owner: 'qwewhy',
  repoName: 'howardwang-portfolio',
  siteName: 'Hongyuan Wang',
  defaultLocale: 'en',
  defaultTheme: 'dark',
  locales: ['en', 'zh'] as const,
  themeIds: ['dark', 'light'] as const,
  projectSlugs: ['dynagraphai', 'chemviz3d', 'virtual-coach'] as const,
  siteUrl: 'https://qwewhy.github.io/howardwang-portfolio',
} as const

export type Locale = (typeof siteConfig.locales)[number]
export type ThemeId = (typeof siteConfig.themeIds)[number]
export type ProjectSlug = (typeof siteConfig.projectSlugs)[number]

export const repoBasePath = `/${siteConfig.repoName}/`

export function isLocale(value: string): value is Locale {
  return siteConfig.locales.includes(value as Locale)
}

export function isProjectSlug(value: string): value is ProjectSlug {
  return siteConfig.projectSlugs.includes(value as ProjectSlug)
}

export function buildSiteUrl(pathname: string): string {
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`
  return new URL(normalized, `${siteConfig.siteUrl}/`).toString()
}

