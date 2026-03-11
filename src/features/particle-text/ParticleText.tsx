import { useRef, useState, useEffect } from 'react'
import { useAppShellStore } from '../../app/store/app-shell-store'
import { useParticleEngine, type ParticleConfig } from './useParticleEngine'
import styles from './ParticleText.module.css'

interface ParticleTextProps {
  children: React.ReactNode
  className?: string
  particleGap?: number
  particleSize?: number
  repelRadius?: number
  springFactor?: number
  friction?: number
  repelStrength?: number
  transitionDelay?: number
  transitionDuration?: number
}

export default function ParticleText({
  children,
  className,
  particleGap = 3,
  particleSize = 1.2,
  repelRadius = 100,
  springFactor = 0.05,
  friction = 0.85,
  repelStrength = 5,
  transitionDelay = 600,
  transitionDuration = 800,
}: ParticleTextProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useAppShellStore((s) => s.reducedMotion)

  const config: ParticleConfig = { particleGap, particleSize, repelRadius, springFactor, friction, repelStrength }
  const { active } = useParticleEngine(wrapRef, canvasRef, textRef, config, !reducedMotion)

  const [showParticles, setShowParticles] = useState(false)

  useEffect(() => {
    if (!active) return
    const timer = setTimeout(() => setShowParticles(true), transitionDelay)
    return () => clearTimeout(timer)
  }, [active, transitionDelay])

  return (
    <div
      ref={wrapRef}
      className={className ? `${styles.wrap} ${className}` : styles.wrap}
      style={{ '--particle-fade': `${transitionDuration}ms` } as React.CSSProperties}
    >
      <div ref={textRef} className={styles.textLayer} data-active={showParticles || undefined}>
        {children}
      </div>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        data-active={showParticles || undefined}
        aria-hidden="true"
      />
    </div>
  )
}
