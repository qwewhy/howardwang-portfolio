import styles from './CodeWindow.module.css'

interface CodeWindowProps {
  code: string
  language: string
  fileLabel: string
}

export function CodeWindow({ code, language, fileLabel }: CodeWindowProps) {
  const lines = code.trim().split('\n')

  return (
    <div className={styles.window}>
      <div className={styles.header}>
        <div className={styles.trafficLights} aria-hidden="true">
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
        </div>
        <div className={styles.meta}>
          <span className={styles.fileLabel}>{fileLabel}</span>
          <span className={styles.language}>{language}</span>
        </div>
      </div>
      <ol className={styles.lines} aria-label={fileLabel}>
        {lines.map((line, index) => (
          <li key={`${fileLabel}:${index + 1}`} className={styles.line}>
            <span className={styles.lineNumber}>{index + 1}</span>
            <code className={styles.code}>{line || ' '}</code>
          </li>
        ))}
      </ol>
    </div>
  )
}
