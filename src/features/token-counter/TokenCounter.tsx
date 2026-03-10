import { useEffect, useRef, useState } from 'react'
import styles from './TokenCounter.module.css'

interface TokenCounterProps {
  locale: 'en' | 'zh'
}

interface CounterData {
  label: string
  value: string
  note: string
  tools: string[]
}

function getCounterData(locale: 'en' | 'zh'): [CounterData, CounterData] {
  if (locale === 'zh') {
    return [
      {
        label: 'Cursor · 2025-2026',
        value: '1,126,048,160',
        note: '仅 Cursor 一年 Token 消耗量',
        tools: ['Cursor'],
      },
      {
        label: '全平台 · 2025-2026',
        value: '5,000,000,000+',
        note: 'Cursor + Claude Code + Codex + Gemini',
        tools: ['Cursor', 'Claude Code', 'Codex', 'Gemini'],
      },
    ]
  }
  return [
    {
      label: 'Cursor · 2025-2026',
      value: '1,126,048,160',
      note: 'Cursor token usage in one year alone',
      tools: ['Cursor'],
    },
    {
      label: 'All platforms · 2025-2026',
      value: '5,000,000,000+',
      note: 'Cursor + Claude Code + Codex + Gemini',
      tools: ['Cursor', 'Claude Code', 'Codex', 'Gemini'],
    },
  ]
}

function FlipDigits({ value }: { value: string }) {
  const chars = value.replace(/\+$/, '').split('')
  const hasPlus = value.endsWith('+')

  return (
    <div className={styles.digitRow}>
      {chars.map((ch, i) =>
        ch === ',' ? (
          <span key={`sep-${i}`} className={styles.separator}>
            ,
          </span>
        ) : (
          <div key={`d-${i}`} className={styles.digit}>
            <span className={styles.digitInner}>{ch}</span>
          </div>
        ),
      )}
      {hasPlus && <span className={styles.separator}>+</span>}
    </div>
  )
}

export function TokenCounter({ locale }: TokenCounterProps) {
  const [animated, setAnimated] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimated(true)
          observer.disconnect()
        }
      },
      { threshold: 0 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const [left, right] = getCounterData(locale)

  return (
    <div ref={ref} className={`${styles.wrap} ${animated ? styles.animated : ''}`}>
      <div className={styles.counter}>
        <span className={styles.counterLabel}>{left.label}</span>
        <FlipDigits value={left.value} />
        <p className={styles.counterNote}>{left.note}</p>
      </div>
      <div className={styles.counter}>
        <span className={styles.counterLabel}>{right.label}</span>
        <FlipDigits value={right.value} />
        <p className={styles.counterNote}>{right.note}</p>
        <div className={styles.tags}>
          {right.tools.map((t) => (
            <span key={t} className={styles.tag}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
