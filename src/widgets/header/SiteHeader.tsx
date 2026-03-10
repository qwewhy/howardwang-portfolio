import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { getSiteContent } from '../../app/i18n/catalog'
import { getLocalizedPath } from '../../app/router/route-utils'
import { useAppShellStore } from '../../app/store/app-shell-store'
import type { Locale } from '../../shared/config/site'
import { LocaleSwitcher } from '../../features/locale-switcher/LocaleSwitcher'
import { ThemeSwitcher } from '../../features/theme-switcher/ThemeSwitcher'
import styles from './SiteHeader.module.css'

interface SiteHeaderProps {
  locale: Locale
}

export function SiteHeader({ locale }: SiteHeaderProps) {
  const content = getSiteContent(locale)
  const navigationOpen = useAppShellStore((state) => state.navigationOpen)
  const setNavigationOpen = useAppShellStore((state) => state.setNavigationOpen)
  const isMobile = useAppShellStore((state) => state.isMobile)

  /* lock body scroll when mobile menu is open */
  useEffect(() => {
    if (isMobile && navigationOpen) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [isMobile, navigationOpen])

  const navLinks = (
    [
      ['home', getLocalizedPath(locale, 'home')],
      ['work', getLocalizedPath(locale, 'work')],
      ['about', getLocalizedPath(locale, 'about')],
      ['contact', getLocalizedPath(locale, 'contact')],
    ] as const
  )

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          <NavLink className={styles.brand} to={getLocalizedPath(locale, 'home')}>
            <span className={styles.name}>{content.profile.name}</span>
            <span className={styles.tagline}>{content.profile.tagline}</span>
          </NavLink>

          <nav
            className={`${styles.nav} ${navigationOpen ? styles.navOpen : ''}`}
            aria-label={content.copy.navigationLabel}
          >
            {navLinks.map(([key, href]) => (
              <NavLink
                key={key}
                end={key === 'home'}
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navActive : ''}`}
                to={href}
                onClick={() => setNavigationOpen(false)}
              >
                {content.nav[key]}
              </NavLink>
            ))}

            {/* locale + theme inside mobile menu panel */}
            <div className={styles.mobileMenuControls}>
              <LocaleSwitcher locale={locale} />
              <ThemeSwitcher locale={locale} />
            </div>
          </nav>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.menuButton}
              aria-label={navigationOpen ? content.copy.closeMenuLabel : content.copy.openMenuLabel}
              aria-expanded={navigationOpen}
              onClick={() => setNavigationOpen(!navigationOpen)}
            >
              <span className={`${styles.hamburger} ${navigationOpen ? styles.hamburgerOpen : ''}`} aria-hidden="true" />
            </button>
            {/* desktop-only locale + theme */}
            <div className={styles.desktopControls}>
              <LocaleSwitcher locale={locale} />
              <ThemeSwitcher locale={locale} />
            </div>
          </div>
        </div>
      </header>

      {/* overlay outside header — backdrop-filter on header creates containing block for fixed descendants */}
      {navigationOpen && (
        <div
          className={styles.overlay}
          onClick={() => setNavigationOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  )
}
