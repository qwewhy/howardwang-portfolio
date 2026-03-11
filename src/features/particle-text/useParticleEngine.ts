import { useEffect, useRef, useState, type RefObject } from 'react'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Particle {
  x: number
  y: number
  originX: number
  originY: number
  vx: number
  vy: number
  size: number
  r: number
  g: number
  b: number
  a: number
}

const PARTICLE_ALPHA_THRESHOLD = 0.08
const MIN_PARTICLE_ALPHA = 0.62

export interface ParticleConfig {
  particleGap: number
  particleSize: number
  repelRadius: number
  springFactor: number
  friction: number
  repelStrength: number
}

/* ------------------------------------------------------------------ */
/*  Text → Particle sampling                                           */
/* ------------------------------------------------------------------ */

function sampleParticles(
  textEl: HTMLElement,
  containerRect: DOMRect,
  gap: number,
  size: number,
  dpr: number,
): Particle[] {
  const w = containerRect.width
  const h = containerRect.height
  if (w === 0 || h === 0) return []

  const offscreen = document.createElement('canvas')
  const cw = Math.ceil(w * dpr)
  const ch = Math.ceil(h * dpr)
  offscreen.width = cw
  offscreen.height = ch
  const ctx = offscreen.getContext('2d', { willReadFrequently: true })!
  ctx.scale(dpr, dpr)

  // Walk all text nodes and draw each character at its exact DOM position
  const walker = document.createTreeWalker(textEl, NodeFilter.SHOW_TEXT)
  let node: Text | null
  while ((node = walker.nextNode() as Text | null)) {
    if (!node.textContent) continue
    const parent = node.parentElement
    if (!parent) continue
    const style = getComputedStyle(parent)
    ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
    ctx.fillStyle = style.color
    ctx.textBaseline = 'top'

    for (let i = 0; i < node.length; i++) {
      const ch = node.textContent[i]
      if (!ch.trim()) continue
      const range = document.createRange()
      range.setStart(node, i)
      range.setEnd(node, i + 1)
      const rects = range.getClientRects()
      if (rects.length === 0) continue
      const r = rects[0]
      ctx.fillText(ch, r.left - containerRect.left, r.top - containerRect.top)
    }
  }

  // Sample pixels
  const imageData = ctx.getImageData(0, 0, cw, ch)
  const data = imageData.data
  const scaledGap = Math.max(1, Math.round(gap * dpr))
  const particles: Particle[] = []

  for (let py = 0; py < ch; py += scaledGap) {
    for (let px = 0; px < cw; px += scaledGap) {
      const idx = (py * cw + px) * 4
      const alpha = data[idx + 3] / 255
      if (alpha >= PARTICLE_ALPHA_THRESHOLD) {
        particles.push({
          x: px / dpr,
          y: py / dpr,
          originX: px / dpr,
          originY: py / dpr,
          vx: 0,
          vy: 0,
          size,
          r: data[idx],
          g: data[idx + 1],
          b: data[idx + 2],
          a: Math.min(1, Math.max(alpha, MIN_PARTICLE_ALPHA)),
        })
      }
    }
  }

  return particles
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

export function useParticleEngine(
  wrapRef: RefObject<HTMLDivElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  textRef: RefObject<HTMLDivElement | null>,
  config: ParticleConfig,
  enabled: boolean,
): { active: boolean } {
  const [active, setActive] = useState(false)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: -9999, y: -9999, inside: false })
  const rafRef = useRef(0)
  const { friction, particleGap, particleSize, repelRadius, repelStrength, springFactor } = config

  useEffect(() => {
    if (!enabled) return

    const wrap = wrapRef.current
    const canvas = canvasRef.current
    const textEl = textRef.current
    if (!wrap || !canvas || !textEl) return

    const ctx = canvas.getContext('2d', { willReadFrequently: false })
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let destroyed = false

    /* ---------- Sizing ---------- */
    function resize() {
      if (destroyed || !wrap || !canvas) return
      const rect = wrap.getBoundingClientRect()
      canvas.width = Math.ceil(rect.width * dpr)
      canvas.height = Math.ceil(rect.height * dpr)
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      return rect
    }

    /* ---------- Init ---------- */
    async function init() {
      // wait for fonts so character metrics are correct
      await document.fonts.ready
      if (destroyed) return

      const rect = resize()
      if (!rect || !textEl) return

      particlesRef.current = sampleParticles(textEl, rect, particleGap, particleSize, dpr)
      if (particlesRef.current.length > 0) setActive(true)
    }

    /* ---------- Mouse tracking ---------- */
    function onMouseMove(e: MouseEvent) {
      if (!wrap) return
      const rect = wrap.getBoundingClientRect()
      mouseRef.current.x = e.clientX - rect.left
      mouseRef.current.y = e.clientY - rect.top
      mouseRef.current.inside = true
    }
    function onMouseLeave() {
      mouseRef.current.inside = false
    }

    wrap.addEventListener('mousemove', onMouseMove)
    wrap.addEventListener('mouseleave', onMouseLeave)

    /* ---------- Animation loop ---------- */
    function tick() {
      if (destroyed) return
      rafRef.current = requestAnimationFrame(tick)

      const particles = particlesRef.current
      if (particles.length === 0 || !ctx || !canvas) return

      const mouse = mouseRef.current
      const rSq = repelRadius * repelRadius

      // Physics
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        if (mouse.inside) {
          const dx = mouse.x - p.x
          const dy = mouse.y - p.y
          const distSq = dx * dx + dy * dy
          if (distSq < rSq && distSq > 0.01) {
            const dist = Math.sqrt(distSq)
            const force = ((repelRadius - dist) / repelRadius) * repelStrength
            p.vx -= (dx / dist) * force
            p.vy -= (dy / dist) * force
          }
        }

        p.vx += (p.originX - p.x) * springFactor
        p.vy += (p.originY - p.y) * springFactor
        p.vx *= friction
        p.vy *= friction
        p.x += p.vx
        p.y += p.vy
      }

      // Render
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Group by RGBA for fewer fillStyle switches
      let lastR = -1, lastG = -1, lastB = -1, lastA = -1
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        if (p.r !== lastR || p.g !== lastG || p.b !== lastB || p.a !== lastA) {
          ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${p.a})`
          lastR = p.r; lastG = p.g; lastB = p.b; lastA = p.a
        }
        ctx.fillRect(p.x * dpr, p.y * dpr, p.size * dpr, p.size * dpr)
      }
    }

    /* ---------- Resize observer ---------- */
    let resizeTimer: ReturnType<typeof setTimeout>
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(async () => {
        if (destroyed || !textEl) return
        const rect = resize()
        if (!rect) return
        await document.fonts.ready
        particlesRef.current = sampleParticles(textEl, rect, particleGap, particleSize, dpr)
      }, 200)
    })
    ro.observe(wrap)

    /* ---------- Theme change observer ---------- */
    const mo = new MutationObserver(async () => {
      if (destroyed || !textEl || !wrap) return
      // Theme changed — re-sample to pick up new colors
      await document.fonts.ready
      const rect = wrap.getBoundingClientRect()
      particlesRef.current = sampleParticles(textEl, rect, particleGap, particleSize, dpr)
    })
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    /* ---------- Start ---------- */
    init()
    rafRef.current = requestAnimationFrame(tick)

    /* ---------- Cleanup ---------- */
    return () => {
      destroyed = true
      cancelAnimationFrame(rafRef.current)
      clearTimeout(resizeTimer)
      ro.disconnect()
      mo.disconnect()
      wrap.removeEventListener('mousemove', onMouseMove)
      wrap.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [canvasRef, enabled, friction, particleGap, particleSize, repelRadius, repelStrength, springFactor, textRef, wrapRef])

  return { active }
}
