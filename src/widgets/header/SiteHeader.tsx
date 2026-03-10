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

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <NavLink className={styles.brand} to={getLocalizedPath(locale, 'home')}>
          <span className={styles.name}>{content.profile.name}</span>
          <span className={styles.tagline}>{content.profile.tagline}</span>
        </NavLink>

        <nav className={`${styles.nav} ${navigationOpen ? styles.navOpen : ''}`} aria-label={content.copy.navigationLabel}>
          {(
            [
              ['home', getLocalizedPath(locale, 'home')],
              ['work', getLocalizedPath(locale, 'work')],
              ['about', getLocalizedPath(locale, 'about')],
              ['contact', getLocalizedPath(locale, 'contact')],
            ] as const
          ).map(([key, href]) => (
            <NavLink key={key} end={key === 'home'} className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navActive : ''}`} to={href}>
              {content.nav[key]}
            </NavLink>
          ))}
        </nav>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.menuButton}
            aria-label={navigationOpen ? content.copy.closeMenuLabel : content.copy.openMenuLabel}
            onClick={() => setNavigationOpen(!navigationOpen)}
          >
            {navigationOpen ? content.copy.closeLabel : content.copy.menuLabel}
          </button>
          <LocaleSwitcher locale={locale} />
          <ThemeSwitcher locale={locale} />
        </div>
      </div>
    </header>
  )
}
