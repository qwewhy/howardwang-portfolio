import { Navigate, Route, Routes } from 'react-router-dom'
import { LocalizedLayout } from './LocalizedLayout'
import { getLocalizedPath } from './route-utils'
import { siteConfig } from '../../shared/config/site'
import AboutPage from '../../pages/about/AboutPage'
import ContactPage from '../../pages/contact/ContactPage'
import HomePage from '../../pages/home/HomePage'
import NotFoundPage from '../../pages/not-found/NotFoundPage'
import ProjectDetailPage from '../../pages/project-detail/ProjectDetailPage'
import ResumePage from '../../pages/resume/ResumePage'
import WorkPage from '../../pages/work/WorkPage'

export function ServerRouter() {
  return (
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
  )
}

