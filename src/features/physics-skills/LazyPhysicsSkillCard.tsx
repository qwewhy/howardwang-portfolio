import { lazy, Suspense } from 'react'
import type { PhysicsSkillCardProps } from './PhysicsSkillCard'

const PhysicsSkillCard = lazy(() =>
  import('./PhysicsSkillCard').then((m) => ({ default: m.PhysicsSkillCard })),
)

/**
 * Lazy wrapper — renders nothing until the chunk (including matter-js) loads.
 * The parent keeps the static skill chips visible as fallback.
 */
export function LazyPhysicsSkillCard(props: PhysicsSkillCardProps) {
  return (
    <Suspense fallback={null}>
      <PhysicsSkillCard {...props} />
    </Suspense>
  )
}
