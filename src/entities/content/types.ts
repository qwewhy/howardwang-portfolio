import type { Locale, ProjectSlug } from '../../shared/config/site'

export type EvidenceSourceId = 'resume' | 'userProvided' | 'liveSite' | 'githubScreenshot'

export interface SeoEntry {
  title: string
  description: string
}

export interface LinkItem {
  label: string
  href: string
  external?: boolean
}


export interface MetricEntry {
  value: string
  label: string
  context: string
  source: EvidenceSourceId
}

export interface CapabilityEntry {
  id: string
  title: string
  description: string
  linkedProjects: ProjectSlug[]
}

export interface ContributionYear {
  year: string
  total: string
}

export interface EducationEntry {
  institution: string
  degree: string
  period: string
  highlights: string[]
  logo?: string
}

export interface ProjectChapter {
  id: string
  eyebrow: string
  title: string
  summary: string
  bullets: string[]
}

export interface PosterSpec {
  title: string
  description: string
  accentWords: string[]
}

export interface LivePage {
  label: string
  url: string
}

export interface ProjectContentSchema {
  slug: ProjectSlug
  title: string
  role: string
  period: string
  location: string
  summary: string
  badges: string[]
  metrics: MetricEntry[]
  techStack: string[]
  links: LinkItem[]
  liveUrl?: string
  livePages?: LivePage[]
  evidenceSource: EvidenceSourceId[]
  poster: PosterSpec
  chapters: ProjectChapter[]
}

export interface PageIntro {
  eyebrow: string
  title: string
  description: string
}

export interface HomeContent {
  hero: {
    eyebrow: string
    title: string
    subtitle: string
    contributionYears: ContributionYear[]
  }
  workIntro: PageIntro
  metricsIntro: PageIntro
  capabilityIntro: PageIntro
  aiUsageIntro: PageIntro
  educationIntro: PageIntro
  contactIntro: PageIntro
}

export interface WorkContent {
  intro: PageIntro
}

export interface AboutContent {
  intro: PageIntro
}

export interface ResumeContent {
  intro: PageIntro
  summary: string
  sections: Array<{
    title: string
    entries: Array<{
      heading: string
      subheading: string
      detail: string
      bullets: string[]
    }>
  }>
  skills: Array<{ group: string; items: string[] }>
}

export interface ContactContent {
  intro: PageIntro
  note: string
  links: LinkItem[]
}

export interface AppCopy {
  locale: Locale
  localeLabel: string
  switchLocaleLabel: string
  navigationLabel: string
  themeLabel: string
  themeDarkLabel: string
  themeLightLabel: string
  openMenuLabel: string
  closeMenuLabel: string
  menuLabel: string
  closeLabel: string
  openProjectLabel: string
  enterSceneLabel: string
  sceneReadyLabel: string
  sceneLoadingLabel: string
  sceneErrorLabel: string
  scenePosterLabel: string
  scenePosterDescription: string
  chapterLabel: string
  techStackLabel: string
  evidenceLabel: string
  metricsLabel: string
  sourceLabel: string
  summaryLabel: string
  nextProjectLabel: string
  liveLabel: string
  researchLabel: string
  internshipLabel: string
  unavailablePdfLabel: string
  footerText: string
  skipToContentLabel: string
  loadingRouteLabel: string
  notFoundTitle: string
  notFoundDescription: string
  backHomeLabel: string
  contributionsSuffix: string
  tryLiveLabel: string
  livePreviewLabel: string
}

export interface SiteContent {
  locale: Locale
  copy: AppCopy
  nav: Record<'home' | 'work' | 'about' | 'resume' | 'contact', string>
  evidenceSources: Record<EvidenceSourceId, string>
  profile: {
    name: string
    title: string
    tagline: string
    summary: string
    location: string
    status: string
    links: LinkItem[]
  }
  home: HomeContent
  work: WorkContent
  about: AboutContent
  resume: ResumeContent
  contact: ContactContent
  education: EducationEntry[]
  metrics: MetricEntry[]
  capabilities: CapabilityEntry[]
  projects: Record<ProjectSlug, ProjectContentSchema>
  seo: {
    home: SeoEntry
    work: SeoEntry
    about: SeoEntry
    resume: SeoEntry
    contact: SeoEntry
    projects: Record<ProjectSlug, SeoEntry>
  }
}
