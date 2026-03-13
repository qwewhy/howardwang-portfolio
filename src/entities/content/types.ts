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
  previewUrl?: string
}

export interface SkillGroup {
  group: string
  items: string[]
}

export interface PosterSpec {
  title: string
  description: string
  accentWords: string[]
}

export interface HeroLogoSpec {
  src: string
  alt: string
  eyebrow?: string
  caption?: string
  tags?: string[]
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
  skillGroups?: SkillGroup[]
  links: LinkItem[]
  liveUrl?: string
  livePages?: LivePage[]
  evidenceSource: EvidenceSourceId[]
  poster?: PosterSpec
  heroLogo?: HeroLogoSpec
  chapters: ProjectChapter[]
  detailSections?: ProjectChapter[]
  renderChapterCards?: boolean
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

export interface AboutBioEntry {
  heading: string
  text: string
}

export type AboutSnippetId =
  | 'ai-loop'
  | 'quality-gates'
  | 'modular-hooks'
  | 'docs-contract'
  | 'pubsub-zustand'
  | 'pubsub-qt'
  | 'pubsub-react'
  | 'di-services'

export interface AboutHeroStat {
  value: string
  label: string
  detail: string
}

export interface AboutHabitVariant {
  id: string
  label: string
  language: string
  fileLabel: string
  snippetId: AboutSnippetId
  summary: string
  annotation: string
}

export interface AboutHabitEntry {
  id: string
  label: string
  description: string
  densityLabel: string
  highlight: string
  principles: string[]
  tools: string[]
  variants: AboutHabitVariant[]
}

export interface AboutInterestEntry {
  id: string
  label: string
  cue: string
  description: string
}

export interface AboutTravelCity {
  id: string
  name: string
  country: string
  x: number
  y: number
  moment: string
  summary: string
  foods: string[]
}

export interface AboutTravelAtlas {
  eyebrow: string
  title: string
  description: string
  cue: string
  visitedLabel: string
  cityLabel: string
  foodsLabel: string
  cities: AboutTravelCity[]
}

export interface AboutStatusMeta {
  label: string
  value: string
}

export interface AboutStatusSignal {
  id: string
  label: string
  value: string
  description: string
  tags: string[]
}

export interface AboutStatusPanel {
  eyebrow: string
  title: string
  description: string
  meta: AboutStatusMeta[]
  signals: AboutStatusSignal[]
}

export interface AboutHeroHighlight {
  value: string
  label: string
  detail: string
}

export interface AboutContent {
  intro: PageIntro
  heroHighlight?: AboutHeroHighlight
  heroStats?: AboutHeroStat[]
  capabilityIntro?: PageIntro
  bio?: AboutBioEntry[]
  codingHabitsTitle?: string
  codingHabitsIntro?: string
  codingHabits?: AboutHabitEntry[]
  interestsTitle?: string
  interestsIntro?: string
  interests?: AboutInterestEntry[]
  travelAtlas?: AboutTravelAtlas
  status?: AboutStatusPanel
  statusTitle?: string
  statusItems?: string[]
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
  skills: SkillGroup[]
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
  previousProjectLabel: string
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
  toStaticLabel: string
  toPhysicsLabel: string
  toStaticAriaLabel: string
  toPhysicsAriaLabel: string
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
