import { getSiteContent } from '../../app/i18n/catalog'
import { useThemeStore } from '../../app/store/theme-store'
import type { Locale } from '../../shared/config/site'
import styles from './ThemeSwitcher.module.css'

interface ThemeSwitcherProps {
  locale: Locale
}

export function ThemeSwitcher({ locale }: ThemeSwitcherProps) {
  const themeId = useThemeStore((state) => state.themeId)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)
  const content = getSiteContent(locale)

  return (
    <button type="button" className={styles.toggle} onClick={toggleTheme} aria-label={content.copy.themeLabel}>
      <span className={styles.dot} aria-hidden="true" />
      <span>{themeId === 'dark' ? content.copy.themeDarkLabel : content.copy.themeLightLabel}</span>
    </button>
  )
}
