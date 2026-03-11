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

type ParticleShapeKind = 'none' | 'pill-outline'

export interface ParticleConfig {
  particleGap: number
  particleSize: number
  minParticleAlpha: number
  contrastBoost: number
  saturationBoost: number
  shapeKind: ParticleShapeKind
  repelRadius: number
  springFactor: number
  friction: number
  repelStrength: number
}

interface RgbaColor {
  r: number
  g: number
  b: number
  a: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function parseCssColor(input: string): RgbaColor {
  const color = input.trim()

  if (!color) {
    return { r: 255, g: 255, b: 255, a: 1 }
  }

  if (color.startsWith('#')) {
    const hex = color.slice(1)
    const normalized = hex.length === 3
      ? hex.split('').map((char) => char + char).join('')
      : hex

    if (normalized.length === 6 || normalized.length === 8) {
      return {
        r: parseInt(normalized.slice(0, 2), 16),
        g: parseInt(normalized.slice(2, 4), 16),
        b: parseInt(normalized.slice(4, 6), 16),
        a: normalized.length === 8 ? parseInt(normalized.slice(6, 8), 16) / 255 : 1,
      }
    }
  }

  const match = color.match(/rgba?\(([^)]+)\)/i)
  if (match) {
    const [r = '255', g = '255', b = '255', a = '1'] = match[1].split(',').map((value) => value.trim())
    return {
      r: Number.parseFloat(r),
      g: Number.parseFloat(g),
      b: Number.parseFloat(b),
      a: Number.parseFloat(a),
    }
  }

  return { r: 255, g: 255, b: 255, a: 1 }
}

function enhanceRgb(
  r: number,
  g: number,
  b: number,
  saturationBoost: number,
  contrastBoost: number,
): Pick<RgbaColor, 'r' | 'g' | 'b'> {
  const avg = (r + g + b) / 3
  let nr = avg + (r - avg) * saturationBoost
  let ng = avg + (g - avg) * saturationBoost
  let nb = avg + (b - avg) * saturationBoost

  const luminance = (0.2126 * nr + 0.7152 * ng + 0.0722 * nb) / 255
  if (luminance >= 0.72) {
    nr += (255 - nr) * contrastBoost
    ng += (255 - ng) * contrastBoost
    nb += (255 - nb) * contrastBoost
  } else if (luminance <= 0.24) {
    nr *= 1 - contrastBoost
    ng *= 1 - contrastBoost
    nb *= 1 - contrastBoost
  }

  return {
    r: clamp(Math.round(nr), 0, 255),
    g: clamp(Math.round(ng), 0, 255),
    b: clamp(Math.round(nb), 0, 255),
  }
}

function pushParticle(
  particles: Particle[],
  x: number,
  y: number,
  size: number,
  color: RgbaColor,
  saturationBoost: number,
  contrastBoost: number,
  minParticleAlpha: number,
) {
  const enhanced = enhanceRgb(color.r, color.g, color.b, saturationBoost, contrastBoost)
  particles.push({
    x,
    y,
    originX: x,
    originY: y,
    vx: 0,
    vy: 0,
    size,
    r: enhanced.r,
    g: enhanced.g,
    b: enhanced.b,
    a: Math.min(1, Math.max(color.a, minParticleAlpha)),
  })
}

function appendRoundedRectOutlineParticles(
  particles: Particle[],
  textEl: HTMLElement,
  containerRect: DOMRect,
  gap: number,
  size: number,
  contrastBoost: number,
  saturationBoost: number,
  minParticleAlpha: number,
) {
  const shapeEl = textEl.firstElementChild as HTMLElement | null
  if (!shapeEl) return

  const shapeRect = shapeEl.getBoundingClientRect()
  if (shapeRect.width === 0 || shapeRect.height === 0) return

  const rootStyle = getComputedStyle(document.documentElement)
  const accent = parseCssColor(rootStyle.getPropertyValue('--color-accent'))

  const baseRadius = Math.min(
    Number.parseFloat(getComputedStyle(shapeEl).borderTopLeftRadius) || shapeRect.height / 2,
    shapeRect.width / 2,
    shapeRect.height / 2,
  )

  const left = shapeRect.left - containerRect.left
  const top = shapeRect.top - containerRect.top
  const step = Math.max(gap * 0.95, 1)

  const addRing = (offset: number, alpha: number, particleSize: number) => {
    const ringLeft = left - offset
    const ringTop = top - offset
    const ringWidth = shapeRect.width + offset * 2
    const ringHeight = shapeRect.height + offset * 2
    const radius = Math.min(baseRadius + offset, ringWidth / 2, ringHeight / 2)
    const ringColor = { ...accent, a: alpha }

    for (let x = ringLeft + radius; x <= ringLeft + ringWidth - radius; x += step) {
      pushParticle(particles, x, ringTop, particleSize, ringColor, saturationBoost, contrastBoost, minParticleAlpha)
      pushParticle(particles, x, ringTop + ringHeight, particleSize, ringColor, saturationBoost, contrastBoost, minParticleAlpha)
    }

    for (let y = ringTop + radius; y <= ringTop + ringHeight - radius; y += step) {
      pushParticle(particles, ringLeft, y, particleSize, ringColor, saturationBoost, contrastBoost, minParticleAlpha)
      pushParticle(particles, ringLeft + ringWidth, y, particleSize, ringColor, saturationBoost, contrastBoost, minParticleAlpha)
    }

    const cornerCenters = [
      { cx: ringLeft + radius, cy: ringTop + radius, start: Math.PI, end: Math.PI * 1.5 },
      { cx: ringLeft + ringWidth - radius, cy: ringTop + radius, start: Math.PI * 1.5, end: Math.PI * 2 },
      { cx: ringLeft + ringWidth - radius, cy: ringTop + ringHeight - radius, start: 0, end: Math.PI * 0.5 },
      { cx: ringLeft + radius, cy: ringTop + ringHeight - radius, start: Math.PI * 0.5, end: Math.PI },
    ]

    const arcStep = Math.max(step / Math.max(radius, 1), 0.12)
    for (const corner of cornerCenters) {
      for (let angle = corner.start; angle <= corner.end; angle += arcStep) {
        pushParticle(
          particles,
          corner.cx + Math.cos(angle) * radius,
          corner.cy + Math.sin(angle) * radius,
          particleSize,
          ringColor,
          saturationBoost,
          contrastBoost,
          minParticleAlpha,
        )
      }
    }
  }

  addRing(0, 0.92, size)
  addRing(Math.max(size * 1.35, 1.75), 0.54, Math.max(size * 0.85, 0.8))
}

/* ------------------------------------------------------------------ */
/*  Text → Particle sampling                                           */
/* ------------------------------------------------------------------ */

function sampleParticles(
  textEl: HTMLElement,
  containerRect: DOMRect,
  config: ParticleConfig,
  dpr: number,
): Particle[] {
  const w = containerRect.width
  const h = containerRect.height
  if (w === 0 || h === 0) return []

  const { contrastBoost, minParticleAlpha, particleGap, particleSize, saturationBoost, shapeKind } = config

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
  const scaledGap = Math.max(1, Math.round(particleGap * dpr))
  const particles: Particle[] = []

  for (let py = 0; py < ch; py += scaledGap) {
    for (let px = 0; px < cw; px += scaledGap) {
      const idx = (py * cw + px) * 4
      const alpha = data[idx + 3] / 255
      if (alpha >= PARTICLE_ALPHA_THRESHOLD) {
        pushParticle(
          particles,
          px / dpr,
          py / dpr,
          particleSize,
          { r: data[idx], g: data[idx + 1], b: data[idx + 2], a: alpha },
          saturationBoost,
          contrastBoost,
          minParticleAlpha,
        )
      }
    }
  }

  if (shapeKind === 'pill-outline') {
    appendRoundedRectOutlineParticles(
      particles,
      textEl,
      containerRect,
      particleGap,
      particleSize,
      contrastBoost,
      Math.max(saturationBoost, 1.18),
      minParticleAlpha,
    )
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
  const {
    contrastBoost,
    friction,
    minParticleAlpha,
    particleGap,
    particleSize,
    repelRadius,
    repelStrength,
    saturationBoost,
    shapeKind,
    springFactor,
  } = config

  useEffect(() => {
    if (!enabled) return

    const samplingConfig: ParticleConfig = {
      contrastBoost,
      friction,
      minParticleAlpha,
      particleGap,
      particleSize,
      repelRadius,
      repelStrength,
      saturationBoost,
      shapeKind,
      springFactor,
    }

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

      particlesRef.current = sampleParticles(textEl, rect, samplingConfig, dpr)
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
        particlesRef.current = sampleParticles(textEl, rect, samplingConfig, dpr)
      }, 200)
    })
    ro.observe(wrap)

    /* ---------- Theme change observer ---------- */
    const mo = new MutationObserver(async () => {
      if (destroyed || !textEl || !wrap) return
      // Theme changed — re-sample to pick up new colors
      await document.fonts.ready
      const rect = wrap.getBoundingClientRect()
      particlesRef.current = sampleParticles(textEl, rect, samplingConfig, dpr)
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
  }, [
    canvasRef,
    contrastBoost,
    enabled,
    friction,
    minParticleAlpha,
    particleGap,
    particleSize,
    repelRadius,
    repelStrength,
    saturationBoost,
    shapeKind,
    springFactor,
    textRef,
    wrapRef,
  ])

  return { active }
}
