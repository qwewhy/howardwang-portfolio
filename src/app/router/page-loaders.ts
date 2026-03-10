import type { ProjectSlug } from '../../shared/config/site'

export function preloadHomePage() {
  return import('../../pages/home/HomePage')
}

export function preloadWorkPage() {
  return import('../../pages/work/WorkPage')
}

export function preloadProjectPage() {
  return import('../../pages/project-detail/ProjectDetailPage')
}

export function preloadAboutPage() {
  return import('../../pages/about/AboutPage')
}

export function preloadResumePage() {
  return import('../../pages/resume/ResumePage')
}

export function preloadContactPage() {
  return import('../../pages/contact/ContactPage')
}

export function preloadProjectRoute(slug: ProjectSlug) {
  void slug
  return preloadProjectPage()
}
