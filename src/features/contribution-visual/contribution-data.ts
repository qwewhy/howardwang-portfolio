/**
 * Static GitHub contribution intensity data derived from user-provided screenshots.
 * Each year contains 52 weeks × 7 days = 364 cells.
 * Values: 0 = no activity, 1 = low, 2 = medium, 3 = high.
 * Data flows column-first (week by week), each column is Mon–Sun.
 *
 * 2025 pattern from screenshot:
 *   Jan–Mar: heavy (lots of 2/3)
 *   Apr–Jun: sparse (mostly 0/1)
 *   Jul–Aug: very sparse
 *   Sep–Dec: heavy again (lots of 2/3)
 *
 * 2026 pattern from screenshot:
 *   Jan–Mar: moderate to heavy
 *   Apr onward: future / empty
 */

// Helper: generate a week (7 days) with a given density profile
function week(pattern: number[]): number[] {
  return pattern.slice(0, 7)
}

// 2025: 52 weeks
const y2025: number[] = [
  // Week 1-4 (Jan)
  ...week([0, 2, 3, 0, 2, 0, 0]),
  ...week([0, 2, 2, 1, 3, 2, 0]),
  ...week([0, 3, 1, 0, 1, 2, 0]),
  ...week([1, 2, 3, 2, 2, 0, 0]),
  // Week 5-8 (Feb)
  ...week([0, 3, 3, 2, 3, 1, 0]),
  ...week([0, 2, 1, 0, 2, 3, 0]),
  ...week([1, 3, 2, 1, 3, 2, 0]),
  ...week([0, 2, 2, 3, 1, 0, 0]),
  // Week 9-13 (Mar)
  ...week([0, 3, 2, 0, 2, 1, 0]),
  ...week([0, 1, 3, 2, 3, 2, 0]),
  ...week([1, 2, 1, 0, 2, 3, 0]),
  ...week([0, 3, 2, 1, 1, 0, 0]),
  ...week([0, 2, 1, 0, 2, 1, 0]),
  // Week 14-17 (Apr) — sparse
  ...week([0, 1, 0, 0, 1, 0, 0]),
  ...week([0, 2, 1, 0, 0, 0, 0]),
  ...week([0, 0, 1, 0, 1, 0, 0]),
  ...week([0, 1, 0, 0, 0, 1, 0]),
  // Week 18-21 (May) — sparse
  ...week([0, 1, 1, 0, 0, 0, 0]),
  ...week([0, 0, 0, 1, 1, 0, 0]),
  ...week([0, 1, 0, 0, 0, 0, 0]),
  ...week([0, 0, 1, 0, 1, 0, 0]),
  // Week 22-26 (Jun) — very sparse
  ...week([0, 0, 0, 0, 2, 0, 0]),
  ...week([0, 0, 0, 0, 0, 0, 0]),
  ...week([0, 0, 1, 0, 0, 0, 0]),
  ...week([0, 0, 0, 0, 0, 0, 0]),
  ...week([0, 0, 0, 0, 1, 0, 0]),
  // Week 27-30 (Jul) — very sparse
  ...week([0, 0, 0, 0, 0, 0, 0]),
  ...week([0, 0, 0, 0, 0, 0, 0]),
  ...week([0, 1, 0, 0, 0, 0, 0]),
  ...week([0, 0, 0, 0, 0, 0, 0]),
  // Week 31-34 (Aug) — sparse
  ...week([0, 0, 0, 0, 0, 0, 0]),
  ...week([0, 0, 1, 0, 0, 0, 0]),
  ...week([0, 0, 0, 0, 0, 0, 0]),
  ...week([0, 0, 0, 1, 0, 0, 0]),
  // Week 35-39 (Sep) — heavy again
  ...week([0, 1, 2, 1, 2, 1, 0]),
  ...week([0, 2, 3, 2, 1, 0, 0]),
  ...week([1, 3, 2, 0, 2, 1, 0]),
  ...week([0, 2, 1, 2, 3, 2, 0]),
  ...week([0, 1, 3, 1, 2, 0, 0]),
  // Week 40-43 (Oct) — heavy
  ...week([0, 3, 2, 1, 3, 2, 0]),
  ...week([1, 2, 3, 2, 2, 1, 0]),
  ...week([0, 3, 1, 2, 3, 2, 0]),
  ...week([0, 2, 3, 1, 2, 0, 0]),
  // Week 44-48 (Nov) — heavy
  ...week([1, 3, 2, 2, 3, 1, 0]),
  ...week([0, 2, 3, 1, 2, 2, 0]),
  ...week([1, 3, 1, 2, 3, 2, 0]),
  ...week([0, 2, 2, 3, 1, 0, 0]),
  ...week([0, 1, 2, 1, 2, 1, 0]),
  // Week 49-52 (Dec) — moderate
  ...week([0, 2, 1, 0, 1, 2, 0]),
  ...week([1, 1, 2, 1, 0, 0, 0]),
  ...week([0, 1, 0, 1, 1, 0, 0]),
  ...week([0, 0, 1, 0, 0, 0, 0]),
]

// 2026: 52 weeks (only first ~10 weeks active, rest future/empty)
const y2026: number[] = [
  // Week 1-4 (Jan)
  ...week([0, 1, 2, 0, 1, 0, 0]),
  ...week([0, 2, 3, 1, 2, 1, 0]),
  ...week([1, 2, 1, 0, 2, 2, 0]),
  ...week([0, 3, 2, 1, 1, 0, 0]),
  // Week 5-8 (Feb)
  ...week([0, 2, 1, 2, 3, 1, 0]),
  ...week([0, 1, 2, 0, 2, 2, 0]),
  ...week([1, 3, 1, 1, 2, 0, 0]),
  ...week([0, 2, 2, 1, 3, 1, 0]),
  // Week 9-10 (Mar — partial, current month)
  ...week([0, 1, 3, 2, 1, 0, 0]),
  ...week([0, 2, 1, 0, 0, 0, 0]),
  // Week 11-52 (Apr–Dec — future, all zeros)
  ...Array.from({ length: 42 * 7 }, () => 0),
]

export const contributionData: Record<string, number[]> = {
  '2025': y2025,
  '2026': y2026,
}

export const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
