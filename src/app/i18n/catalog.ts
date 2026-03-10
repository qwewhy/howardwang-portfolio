import type { SiteContent } from '../../entities/content/types'
import { type Locale } from '../../shared/config/site'
import { enContent } from './messages/en'
import { zhContent } from './messages/zh'

const catalog: Record<Locale, SiteContent> = {
  en: enContent,
  zh: zhContent,
}

export function getSiteContent(locale: Locale): SiteContent {
  return catalog[locale]
}

