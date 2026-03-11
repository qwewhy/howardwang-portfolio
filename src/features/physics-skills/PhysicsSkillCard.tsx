import { useEffect, useRef, useCallback, useState } from 'react'
import type Matter from 'matter-js'
import { measureChips, type ChipSize } from './measure-chip'
import styles from './PhysicsSkillCard.module.css'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SkillItem {
  label: string
  logoSrc?: string
}

export interface PhysicsSkillCardProps {
  items: SkillItem[]
  accentRgb: string
  hasBomb?: boolean
}

interface BodyMeta {
  label: string
  logoSrc?: string
  size: ChipSize
}

// ─── Constants ────────────────────────────────────────────────────────────────

const WALL_THICKNESS = 60
const RESTITUTION = 0.35
const FRICTION = 0.4
const FRICTION_AIR = 0.025
const DROP_STAGGER_MS = 35
const DROP_MIN_Y = -500
const DROP_MAX_Y = -80
/** Consecutive all-sleeping frames before pausing the RAF loop */
const IDLE_THRESHOLD = 60
const BOMB_RADIUS = 36
const EXPLOSION_STRENGTH = 0.18
const EXPLOSION_MIN_DIST = 20
const FUSE_DURATION_MS = 2000

// ─── Component ────────────────────────────────────────────────────────────────

export function PhysicsSkillCard({ items, accentRgb, hasBomb }: PhysicsSkillCardProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<Matter.Engine | null>(null)
  const runnerRef = useRef<Matter.Runner | null>(null)
  const bodiesRef = useRef<Matter.Body[]>([])
  const metaRef = useRef<BodyMeta[]>([])
  const rafRef = useRef<number>(0)
  const chipElsRef = useRef<(HTMLSpanElement | null)[]>([])
  const matterRef = useRef<typeof Matter | null>(null)
  const idleCountRef = useRef(0)
  const pausedRef = useRef(false)
  /** Becomes true only after all stagger-drops have been scheduled */
  const dropsStartedRef = useRef(false)
  const bombBodyRef = useRef<Matter.Body | null>(null)
  const bombElRef = useRef<HTMLDivElement | null>(null)
  const explodedRef = useRef(false)
  const litRef = useRef(false)

  const [ready, setReady] = useState(false)

  const hasIcon = useCallback(
    (label: string) => items.some((it) => it.label === label && !!it.logoSrc),
    [items],
  )

  // ── Initialize physics (runs once per mount) ───────────────────────────
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    let disposed = false

    ;(async () => {
      const Matter = await import('matter-js')
      if (disposed) return
      matterRef.current = Matter

      const { Engine, Runner, Bodies, Composite, Mouse, MouseConstraint, Events } = Matter

      const rect = el.getBoundingClientRect()
      const W = rect.width
      const H = rect.height

      const labels = items.map((it) => it.label)
      const sizes = measureChips(labels, hasIcon, W)

      const engine = Engine.create({
        gravity: { x: 0, y: 1.8, scale: 0.001 },
        enableSleeping: true,
      })
      engineRef.current = engine

      // Walls
      const wallOpts: Matter.IBodyDefinition = {
        isStatic: true,
        restitution: 0.3,
        friction: 0.6,
        render: { visible: false },
      }
      const bottom = Bodies.rectangle(W / 2, H + WALL_THICKNESS / 2, W + WALL_THICKNESS * 2, WALL_THICKNESS, wallOpts)
      const left = Bodies.rectangle(-WALL_THICKNESS / 2, H / 2, WALL_THICKNESS, H * 3, wallOpts)
      const right = Bodies.rectangle(W + WALL_THICKNESS / 2, H / 2, WALL_THICKNESS, H * 3, wallOpts)
      const top = Bodies.rectangle(W / 2, -WALL_THICKNESS / 2 - 400, W + WALL_THICKNESS * 2, WALL_THICKNESS, wallOpts)
      Composite.add(engine.world, [bottom, left, right, top])

      // Chip bodies — all start sleeping, woken by stagger
      const bodies: Matter.Body[] = []
      const meta: BodyMeta[] = []

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const size = sizes.get(item.label) ?? { w: 80, h: 32 }
        const x = WALL_THICKNESS + Math.random() * (W - WALL_THICKNESS * 2 - size.w) + size.w / 2
        const y = DROP_MIN_Y + Math.random() * (DROP_MAX_Y - DROP_MIN_Y)

        const body = Bodies.rectangle(x, y, size.w, size.h, {
          restitution: RESTITUTION,
          friction: FRICTION,
          frictionAir: FRICTION_AIR,
          chamfer: { radius: 8 },
          isSleeping: true,
        })
        bodies.push(body)
        meta.push({ label: item.label, logoSrc: item.logoSrc, size })
      }

      Composite.add(engine.world, bodies)
      bodiesRef.current = bodies
      metaRef.current = meta

      // ── Bomb body (optional) ────────────────────────────────────────────
      let bombBody: Matter.Body | null = null
      if (hasBomb) {
        const bx = WALL_THICKNESS + BOMB_RADIUS + Math.random() * (W - WALL_THICKNESS * 2 - BOMB_RADIUS * 2)
        const by = DROP_MIN_Y + Math.random() * (DROP_MAX_Y - DROP_MIN_Y)
        bombBody = Bodies.circle(bx, by, BOMB_RADIUS, {
          restitution: RESTITUTION,
          friction: FRICTION,
          frictionAir: FRICTION_AIR,
          isSleeping: true,
        })
        Composite.add(engine.world, bombBody)
        bombBodyRef.current = bombBody
      }

      // Mouse drag
      const mouse = Mouse.create(el)
      const mouseConstraint = MouseConstraint.create(engine, {
        mouse,
        constraint: { stiffness: 0.6, damping: 0.1, render: { visible: false } },
      })
      mouse.element.removeEventListener('mousewheel', (mouse as any).mousewheel)
      mouse.element.removeEventListener('DOMMouseScroll', (mouse as any).mousewheel)
      Composite.add(engine.world, mouseConstraint)

      // Calm drag — reset angular velocity & resume RAF if paused
      Events.on(mouseConstraint, 'startdrag', (e: any) => {
        const body = e.body as Matter.Body
        if (body) Matter.Body.setAngularVelocity(body, 0)
        if (pausedRef.current) resumeRaf()
      })
      Events.on(mouseConstraint, 'enddrag', () => {
        // Reset idle counter so chips get time to settle after drag
        idleCountRef.current = 0
      })

      // Start physics runner
      const runner = Runner.create()
      Runner.run(runner, engine)
      runnerRef.current = runner

      // Bomb drops first so it ends up buried under chips
      const bombHeadStart = hasBomb ? DROP_STAGGER_MS * 6 : 0
      if (bombBody) {
        Matter.Sleeping.set(bombBody, false)
      }
      for (let i = 0; i < bodies.length; i++) {
        setTimeout(() => {
          if (disposed) return
          Matter.Sleeping.set(bodies[i], false)
        }, bombHeadStart + i * DROP_STAGGER_MS)
      }
      // Mark when all drops have been fired (so idle detection can start safely)
      setTimeout(() => {
        if (!disposed) dropsStartedRef.current = true
      }, bombHeadStart + bodies.length * DROP_STAGGER_MS + 500)

      // Signal React to render chip DOM elements
      setReady(true)

      // ── Render loop (started by a separate effect after React commits) ──
      // See the useEffect below that depends on [ready]

      // ── Bomb: light fuse on click, explode after delay ──────────────
      function handleBombClick() {
        if (litRef.current || explodedRef.current || !bombBody) return
        litRef.current = true

        // Add lit class to start fuse-burn CSS animation
        if (bombElRef.current) {
          bombElRef.current.classList.add(styles.bombLit)
          bombElRef.current.style.pointerEvents = 'none'
        }

        // Explode after fuse burns down
        setTimeout(() => {
          if (disposed || !bombBody) return
          explodedRef.current = true

          const center = { x: bombBody.position.x, y: bombBody.position.y }
          for (const body of bodies) {
            Matter.Sleeping.set(body, false)
            const dx = body.position.x - center.x
            const dy = body.position.y - center.y
            const dist = Math.max(Math.sqrt(dx * dx + dy * dy), EXPLOSION_MIN_DIST)
            const nx = dx / dist
            const ny = dy / dist
            const scale = EXPLOSION_STRENGTH / Math.max(dist / 80, 0.4)
            // Add upward bias so chips fly up
            Matter.Body.applyForce(body, body.position, {
              x: nx * scale,
              y: ny * scale - 0.06,
            })
          }

          // Remove bomb from world and hide DOM
          Composite.remove(engine.world, bombBody)
          bombBodyRef.current = null
          if (bombElRef.current) bombElRef.current.style.display = 'none'

          // Change chip colors to exploded style
          for (const chipEl of chipElsRef.current) {
            if (chipEl) chipEl.classList.add(styles.exploded)
          }

          // Ensure RAF is running
          if (pausedRef.current) resumeRaf()
          idleCountRef.current = 0
        }, FUSE_DURATION_MS)
      }

      // ── Resume RAF loop only (Runner stays alive so MouseConstraint works) ──
      function resumeRaf() {
        if (!pausedRef.current) return
        pausedRef.current = false
        idleCountRef.current = 0
        startRafLoop()
      }

      function startRafLoop() {
        const loop = () => {
          if (disposed || pausedRef.current) return
          syncChipPositions()
          // Auto-pause: only after all drops landed and settled
          if (dropsStartedRef.current) {
            const allSleeping =
              bodies.every((b) => b.isSleeping) &&
              (!bombBodyRef.current || bombBodyRef.current.isSleeping)
            if (allSleeping) {
              idleCountRef.current++
              if (idleCountRef.current >= IDLE_THRESHOLD) {
                pausedRef.current = true
                syncChipPositions() // final sync
                return // stop RAF loop only; Runner stays alive for MouseConstraint
              }
            } else {
              idleCountRef.current = 0
            }
          }
          rafRef.current = requestAnimationFrame(loop)
        }
        rafRef.current = requestAnimationFrame(loop)
      }

      function syncChipPositions() {
        const els = chipElsRef.current
        for (let i = 0; i < bodies.length; i++) {
          const el = els[i]
          if (!el) continue
          const b = bodies[i]
          const m = meta[i]
          el.style.transform = `translate(${b.position.x - m.size.w / 2}px,${b.position.y - m.size.h / 2}px) rotate(${b.angle}rad)`
        }
        // Sync bomb position
        const bEl = bombElRef.current
        const bb = bombBodyRef.current
        if (bEl && bb) {
          bEl.style.transform = `translate(${bb.position.x - BOMB_RADIUS}px,${bb.position.y - BOMB_RADIUS}px) rotate(${bb.angle}rad)`
        }
      }

      // Expose for external use (resize, mouse interaction, bomb click)
      ;(el as any).__physicsResume = resumeRaf
      ;(el as any).__physicsStartLoop = startRafLoop
      ;(el as any).__bombClick = handleBombClick
    })()

    return () => {
      disposed = true
      pausedRef.current = true
      cancelAnimationFrame(rafRef.current)
      if (runnerRef.current && matterRef.current) {
        matterRef.current.Runner.stop(runnerRef.current)
      }
      if (engineRef.current && matterRef.current) {
        matterRef.current.Engine.clear(engineRef.current)
      }
      engineRef.current = null
      runnerRef.current = null
      bodiesRef.current = []
      metaRef.current = []
      bombBodyRef.current = null
      explodedRef.current = false
      litRef.current = false
    }
  }, [items, hasIcon, hasBomb])

  // ── Start RAF loop AFTER React commits chip elements ────────────────────
  useEffect(() => {
    if (!ready) return
    const el = containerRef.current
    if (!el) return
    // Give React one more frame to ensure refs are populated
    const id = requestAnimationFrame(() => {
      const startLoop = (el as any).__physicsStartLoop
      if (typeof startLoop === 'function') startLoop()
    })
    return () => cancelAnimationFrame(id)
  }, [ready])

  // ── Handle resize ───────────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current
    if (!el || !engineRef.current || !matterRef.current) return

    const handleResize = () => {
      const Matter = matterRef.current!
      const engine = engineRef.current
      if (!engine) return

      const rect = el.getBoundingClientRect()
      const W = rect.width
      const H = rect.height

      const statics = engine.world.bodies.filter((b) => b.isStatic)
      if (statics.length >= 4) {
        Matter.Body.setPosition(statics[0], { x: W / 2, y: H + WALL_THICKNESS / 2 })
        Matter.Body.setPosition(statics[1], { x: -WALL_THICKNESS / 2, y: H / 2 })
        Matter.Body.setPosition(statics[2], { x: W + WALL_THICKNESS / 2, y: H / 2 })
        Matter.Body.setPosition(statics[3], { x: W / 2, y: -WALL_THICKNESS / 2 - 400 })
      }
      const resume = (el as any).__physicsResume
      if (typeof resume === 'function') resume()
    }

    const observer = new ResizeObserver(handleResize)
    observer.observe(el)
    return () => observer.disconnect()
  }, [ready])

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className={styles.physicsContainer}
      style={{ '--_accent': accentRgb } as React.CSSProperties}
      onPointerDown={() => {
        if (!pausedRef.current) return
        const el = containerRef.current
        const resume = el && (el as any).__physicsResume
        if (typeof resume === 'function') resume()
      }}
    >
      {ready &&
        metaRef.current.map((m, i) => (
          <span
            key={m.label}
            ref={(el) => { chipElsRef.current[i] = el }}
            className={styles.physicsChip}
          >
            {m.logoSrc && (
              <img src={m.logoSrc} alt="" className={styles.physicsIcon} loading="lazy" />
            )}
            {m.label}
          </span>
        ))}
      {ready && hasBomb && (
        <div
          ref={bombElRef}
          className={styles.bombOverlay}
          onClick={() => {
            const el = containerRef.current
            const handler = el && (el as any).__bombClick
            if (typeof handler === 'function') handler()
          }}
          aria-label="Click to explode"
        >
          <svg viewBox="0 0 36 46" fill="none">
            {/* Bomb body — solid black circle */}
            <circle cx="18" cy="28" r="14" fill="#1a1a1a" />
            {/* Highlight on the bomb */}
            <ellipse cx="13" cy="23" rx="3.5" ry="2.5" fill="rgba(255,255,255,0.1)" />
            {/* Top nub / connector */}
            <rect x="15" y="12" width="6" height="5" rx="2" fill="#2a2a2a" />
            {/* Fuse — curved rope from nub upward */}
            <path
              className={styles.bombFuse}
              d="M21 13 Q27 6 18 3"
              stroke="#666"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
            {/* Spark at fuse tip — hidden until lit */}
            <circle className={styles.bombSpark} cx="18" cy="3" r="2.5" fill="#ff8c00" />
          </svg>
        </div>
      )}
    </div>
  )
}
