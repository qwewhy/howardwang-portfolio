import { startTransition } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getSiteContent } from '../../app/i18n/catalog'
import { switchLocalePath } from '../../app/router/route-utils'
import { useLocaleStore } from '../../app/store/locale-store'
import { siteConfig, type Locale } from '../../shared/config/site'
import styles from './LocaleSwitcher.module.css'

interface LocaleSwitcherProps {
  locale: Locale
}

export function LocaleSwitcher({ locale }: LocaleSwitcherProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const setPreferredLocale = useLocaleStore((state) => state.setPreferredLocale)
  const content = getSiteContent(locale)

  return (
    <div className={styles.switcher} aria-label={content.copy.switchLocaleLabel}>
      {siteConfig.locales.map((nextLocale) => (
        <button
          key={nextLocale}
          type="button"
          className={`${styles.button} ${nextLocale === locale ? styles.active : ''}`}
          onClick={() => {
            startTransition(() => {
              setPreferredLocale(nextLocale)
              navigate(switchLocalePath(location.pathname, nextLocale))
            })
          }}
        >
          {getSiteContent(nextLocale).copy.localeLabel}
        </button>
      ))}
    </div>
  )
}
