/**
 * Off-screen measurement utility for skill chips.
 * Creates a hidden clone of a chip to measure its rendered width/height
 * so matter-js bodies can be sized accurately.
 */

export interface ChipSize {
  w: number
  h: number
}

const CACHE = new Map<string, ChipSize>()

/**
 * Measure multiple chip labels at once using a single reflow.
 * Returns a Map<label, ChipSize>.
 */
export function measureChips(
  labels: string[],
  hasIcon: (label: string) => boolean,
  containerWidth: number,
): Map<string, ChipSize> {
  const result = new Map<string, ChipSize>()
  const toMeasure: string[] = []

  for (const label of labels) {
    const key = `${label}:${containerWidth}`
    const cached = CACHE.get(key)
    if (cached) {
      result.set(label, cached)
    } else {
      toMeasure.push(label)
    }
  }

  if (toMeasure.length === 0) return result

  // Create hidden container for batch measurement
  const container = document.createElement('div')
  container.style.cssText =
    'position:absolute;top:-9999px;left:-9999px;visibility:hidden;pointer-events:none;'
  container.style.width = `${containerWidth}px`
  document.body.appendChild(container)

  const elements: HTMLSpanElement[] = []

  for (const label of toMeasure) {
    const chip = document.createElement('span')
    chip.className = 'physics-chip-measure'
    chip.style.cssText =
      'display:inline-flex;align-items:center;gap:0.38rem;padding:0.42rem 0.72rem;' +
      'border-radius:8px;border:1px solid transparent;font-size:0.82rem;line-height:1.35;' +
      "font-family:'IBM Plex Sans',sans-serif;white-space:nowrap;"

    if (hasIcon(label)) {
      const icon = document.createElement('span')
      icon.style.cssText = 'display:inline-block;width:16px;height:16px;flex:none;'
      chip.appendChild(icon)
    }

    chip.appendChild(document.createTextNode(label))
    container.appendChild(chip)
    elements.push(chip)
  }

  // Single reflow read
  for (let i = 0; i < toMeasure.length; i++) {
    const rect = elements[i].getBoundingClientRect()
    const size: ChipSize = { w: Math.ceil(rect.width), h: Math.ceil(rect.height) }
    const key = `${toMeasure[i]}:${containerWidth}`
    CACHE.set(key, size)
    result.set(toMeasure[i], size)
  }

  document.body.removeChild(container)
  return result
}
