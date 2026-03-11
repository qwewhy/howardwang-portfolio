import { startTransition, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { useAppShellStore } from '../../app/store/app-shell-store'
import { usePhysicsSkillsStore } from '../../app/store/physics-skills-store'
import type { SkillGroup } from '../../entities/content/types'
import { LazyPhysicsSkillCard } from '../../features/physics-skills/LazyPhysicsSkillCard'
import { SKILL_ACCENTS, getSkillLogoSrc } from '../../shared/config/skill-assets'
import styles from './SkillsShowcase.module.css'

interface SkillsShowcaseCopy {
  eyebrow: string
  title?: string
  description?: string
  toStaticLabel: string
  toPhysicsLabel: string
  toStaticAriaLabel: string
  toPhysicsAriaLabel: string
}

interface SkillsShowcaseProps {
  groups: SkillGroup[]
  copy: SkillsShowcaseCopy
  variant?: 'featured' | 'auto'
  className?: string
}

interface PhysicsSession {
  key: number
  bombIndex: number
  groupCount: number
}

export function SkillsShowcase({
  groups,
  copy,
  variant = 'auto',
  className,
}: SkillsShowcaseProps) {
  const isMobile = useAppShellStore((state) => state.isMobile)
  const reducedMotion = useAppShellStore((state) => state.reducedMotion)
  const physicsMode = usePhysicsSkillsStore((state) => state.physicsMode)
  const togglePhysicsMode = usePhysicsSkillsStore((state) => state.togglePhysicsMode)
  const skillSectionRef = useRef<HTMLDivElement>(null)
  const sessionKeyRef = useRef(0)
  const [physicsSession, setPhysicsSession] = useState<PhysicsSession | null>(null)
  const [skillsVisible, setSkillsVisible] = useState(false)

  const canPhysics = !isMobile && !reducedMotion
  const enablePhysics = canPhysics && physicsMode
  const showPhysics = enablePhysics && skillsVisible
  const showPhysicsOverlay = showPhysics && physicsSession !== null

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      if (!showPhysics || groups.length === 0) {
        setPhysicsSession(null)
        return
      }

      setPhysicsSession((current) => {
        if (current && current.groupCount === groups.length) {
          return current
        }

        sessionKeyRef.current += 1
        return {
          key: sessionKeyRef.current,
          bombIndex: Math.floor(Math.random() * groups.length),
          groupCount: groups.length,
        }
      })
    })

    return () => cancelAnimationFrame(frameId)
  }, [groups.length, showPhysics])

  useEffect(() => {
    if (!enablePhysics) return

    const element = skillSectionRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSkillsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [enablePhysics])

  const physicsItemsByGroup = useMemo(
    () =>
      groups.map((group) =>
        group.items.map((label) => ({
          label,
          logoSrc: getSkillLogoSrc(label),
        })),
      ),
    [groups],
  )

  if (groups.length === 0) {
    return null
  }

  return (
    <section className={`${styles.section} ${className ?? ''}`.trim()}>
      <div className="pageIntro">
        <div className={styles.introRow}>
          <span className="eyebrow">{copy.eyebrow}</span>
          {canPhysics && (
            <button
              type="button"
              className={styles.physicsToggle}
              onClick={() => startTransition(togglePhysicsMode)}
              aria-label={physicsMode ? copy.toStaticAriaLabel : copy.toPhysicsAriaLabel}
            >
              {physicsMode ? copy.toStaticLabel : copy.toPhysicsLabel}
            </button>
          )}
        </div>
        {copy.title && <h2 className="sectionTitle">{copy.title}</h2>}
        {copy.description && <p className={styles.introDescription}>{copy.description}</p>}
      </div>

      <div
        ref={skillSectionRef}
        className={`${styles.grid} ${variant === 'featured' ? styles.featuredGrid : styles.autoGrid}`}
      >
        {groups.map((group, index) => {
          const accent = SKILL_ACCENTS[index] ?? SKILL_ACCENTS[0]

          return (
            <article
              key={group.group}
              className={`panel ${styles.skillCard}`}
              style={{ '--skill-accent': accent } as CSSProperties}
            >
              <h3 className={styles.skillHeading}>{group.group}</h3>
              <div className={styles.skillList} style={showPhysicsOverlay ? { visibility: 'hidden' } : undefined}>
                {group.items.map((item) => {
                  const logoSrc = getSkillLogoSrc(item)
                  return (
                    <span key={item} className={styles.skillChip}>
                      {logoSrc && <img src={logoSrc} alt="" className={styles.skillIcon} loading="lazy" />}
                      {item}
                    </span>
                  )
                })}
              </div>
              {showPhysicsOverlay && (
                <LazyPhysicsSkillCard
                  key={`${physicsSession.key}:${group.group}`}
                  items={physicsItemsByGroup[index]}
                  accentRgb={accent}
                  hasBomb={index === physicsSession.bombIndex}
                />
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
