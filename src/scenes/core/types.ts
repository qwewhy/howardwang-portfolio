export type ScenePerformanceMode = 'default' | 'reduced'

export interface SceneMountOptions {
  performanceMode: ScenePerformanceMode
}

export interface SceneAdapter {
  mount: (container: HTMLElement, options: SceneMountOptions) => void
  unmount: () => void
  resize: (width: number, height: number) => void
  setChapter: (chapterId: string) => void
  setPerformanceMode: (mode: ScenePerformanceMode) => void
}

