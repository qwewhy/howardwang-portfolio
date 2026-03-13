import type { AboutSnippetId } from './types'

export const ABOUT_CODE_SNIPPETS: Record<AboutSnippetId, string> = {
  'ai-loop': `type ProductBrief = {
  goal: string
  constraints: string[]
  acceptanceCriteria: string[]
}

export async function shipWithAI(brief: ProductBrief) {
  const draft = await planner.generate(brief)
  const hardenedSpec = reviewer.refine(draft, {
    keepTypes: true,
    keepAccessibility: true,
  })

  return executor.patch(hardenedSpec, {
    verify: ['eslint', 'typecheck', 'visual-regression'],
    owner: 'human',
  })
}`,
  'quality-gates': `interface GateResult {
  name: 'lint' | 'types' | 'tests'
  status: 'passed' | 'failed'
}

export function runMergeGate(scope: string[]) {
  const results: GateResult[] = [
    lint(scope),
    typecheck(scope),
    testCriticalPaths(scope),
  ]

  if (results.some((result) => result.status === 'failed')) {
    throw new Error('Merge blocked until every gate is green.')
  }

  return annotatePullRequest(results)
}`,
  'modular-hooks': `type NodeSelection = {
  nodeId: string
  source: 'tree' | 'viewport'
}

export function useSceneSelection() {
  const selectedNodeId = useSceneStore((state) => state.selectedNodeId)
  const selectNode = useSceneStore((state) => state.selectNode)

  function onSelect(payload: NodeSelection) {
    selectNode(payload.nodeId, payload.source)
  }

  return { selectedNodeId, onSelect }
}`,
  'docs-contract': `/**
 * Creates a timeline snapshot that is safe to replay and export.
 * Invariants:
 * 1. frames are sorted
 * 2. ids are stable
 * 3. easing is already serialized
 */
export function createTimelineSnapshot(tracks: Track[]) {
  return tracks.map((track) => ({
    id: track.id,
    frames: track.frames.toSorted((a, b) => a.at - b.at),
    easing: serializeEasing(track.easing),
  }))
}`,
  'pubsub-zustand': `type FocusIntent = {
  nodeId: string
  source: 'hierarchy' | 'timeline'
}

interface EditorBusState {
  focusIntent: FocusIntent | null
  publishFocus: (intent: FocusIntent) => void
}

export const useEditorBus = create<EditorBusState>((set) => ({
  focusIntent: null,
  publishFocus: (intent) => set({ focusIntent: intent }),
}))

const unsubscribe = useEditorBus.subscribe(
  (state) => state.focusIntent,
  (intent) => intent && viewportController.focus(intent.nodeId),
)`,
  'pubsub-qt': `class TimelinePanel : public QWidget {
    Q_OBJECT

signals:
    void frameScrubbed(int frame);
};

connect(
    timelinePanel,
    &TimelinePanel::frameScrubbed,
    viewport,
    &ViewportWidget::previewFrame
);`,
  'pubsub-react': `function EditorShell() {
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null)

  return (
    <>
      <HierarchyTree onFocusNode={setFocusedNodeId} />
      <Viewport focusedNodeId={focusedNodeId} />
      <Inspector focusedNodeId={focusedNodeId} />
    </>
  )
}`,
  'di-services': `interface SearchGateway {
  search(query: string): Promise<SearchResult[]>
}

export class ProjectSearchService {
  constructor(private readonly gateway: SearchGateway) {}

  run(query: string) {
    return this.gateway.search(query.trim())
  }
}

const searchService = new ProjectSearchService(
  new AlgoliaSearchGateway(client),
)`,
}
