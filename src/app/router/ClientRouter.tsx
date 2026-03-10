import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { getSiteContent } from '../i18n/catalog'
import { LocalizedLayout } from './LocalizedLayout'
import { isLocale, siteConfig } from '../../shared/config/site'
import { getLocalizedPath } from './route-utils'

const HomePage = lazy(() => import('../../pages/home/HomePage'))
const WorkPage = lazy(() => import('../../pages/work/WorkPage'))
const ProjectDetailPage = lazy(() => import('../../pages/project-detail/ProjectDetailPage'))
const AboutPage = lazy(() => import('../../pages/about/AboutPage'))
const ResumePage = lazy(() => import('../../pages/resume/ResumePage'))
const ContactPage = lazy(() => import('../../pages/contact/ContactPage'))
const NotFoundPage = lazy(() => import('../../pages/not-found/NotFoundPage'))

function getFallbackLocale() {
  if (typeof window === 'undefined') {
    return siteConfig.defaultLocale
  }

  const basePath = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL.replace(/\/$/, '')
  const pathname = basePath && window.location.pathname.startsWith(basePath) ? window.location.pathname.slice(basePath.length) || '/' : window.location.pathname
  const [candidateLocale] = pathname.split('/').filter(Boolean)

  return candidateLocale && isLocale(candidateLocale) ? candidateLocale : siteConfig.defaultLocale
}

function RouteLoadingFallback() {
  const content = getSiteContent(getFallbackLocale())

  return (
    <div className="pageShell" style={{ paddingTop: '7rem' }}>
      {content.copy.loadingRouteLabel}
    </div>
  )
}

export function ClientRouter() {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        <Route path="/" element={<Navigate replace to={getLocalizedPath(siteConfig.defaultLocale, 'home')} />} />
        <Route path=":locale" element={<LocalizedLayout />}>
          <Route index element={<HomePage />} />
          <Route path="work" element={<WorkPage />} />
          <Route path="work/:slug" element={<ProjectDetailPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="resume" element={<ResumePage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="*" element={<Navigate replace to={getLocalizedPath(siteConfig.defaultLocale, 'home')} />} />
      </Routes>
    </Suspense>
  )
}
