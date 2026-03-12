import { useCallback, useState } from 'react'
import styles from './BrowserChrome.module.css'

interface BrowserChromeProps {
  url: string
  title: string
  className?: string
  sandbox?: string
}

interface BrowserFrameProps {
  url: string
  title: string
  sandbox: string
}

function BrowserFrame({ url, title, sandbox }: BrowserFrameProps) {
  const [loading, setLoading] = useState(true)
  const handleLoad = useCallback(() => setLoading(false), [])

  return (
    <div className={styles.frameWrapper}>
      {loading && (
        <div className={styles.loader}>
          <div className={styles.spinner} />
        </div>
      )}
      <iframe
        className={styles.frame}
        src={url}
        title={`${title} live preview`}
        loading="lazy"
        sandbox={sandbox}
        onLoad={handleLoad}
      />
    </div>
  )
}

export function BrowserChrome({ url, title, className, sandbox = 'allow-scripts allow-same-origin allow-popups' }: BrowserChromeProps) {

  return (
    <div className={`${styles.chrome} ${className ?? ''}`}>
      <div className={styles.toolbar}>
        <div className={styles.dots}>
          <span className={`${styles.dot} ${styles.dotClose}`} />
          <span className={`${styles.dot} ${styles.dotMinimize}`} />
          <span className={`${styles.dot} ${styles.dotMaximize}`} />
        </div>

        <span className={styles.urlField}>
          <svg className={styles.lockIcon} viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          {url}
        </span>

        <a
          className={styles.externalButton}
          href={url}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${title} in new tab`}
        >
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M4.5 11.5 11.5 4.5M6 4.5h5.5V10"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
          </svg>
        </a>
      </div>

      <BrowserFrame key={url} url={url} title={title} sandbox={sandbox} />
    </div>
  )
}
