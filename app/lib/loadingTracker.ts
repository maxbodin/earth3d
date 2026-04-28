/**
 * LoadingTracker: external store for application startup progress.
 *
 * Tracks actual loading milestones.
 * and exposes a React-compatible subscribe / getSnapshot interface for useSyncExternalStore.
 *
 * Design principles:
 *  - Zero React imports (pure TS singleton)
 *  - Idempotent: calling completeStep twice for the same id is a no-op
 *  - Immutable snapshots: each state change produces a new snapshot object
 */

export interface LoadingStepDefinition {
  readonly id: string
  readonly label: string
  readonly weight: number
}

export const LOADING_STEPS = {
  RENDERER_SETUP: {
    id: 'renderer_setup',
    label: 'Initializing WebGL renderer',
    weight: 5,
  },
  GLOBE_SCENE: {
    id: 'globe_scene',
    label: 'Building globe scene',
    weight: 5,
  },
  PLANE_SCENE: {
    id: 'plane_scene',
    label: 'Building map scene',
    weight: 5,
  },
  SOLAR_SCENE: {
    id: 'solar_scene',
    label: 'Building solar system',
    weight: 5,
  },
  EARTH_TEXTURE: {
    id: 'earth_texture',
    label: 'Loading Earth texture',
    weight: 35,
  },
  DISPLACEMENT_MAP: {
    id: 'displacement_map',
    label: 'Loading terrain data',
    weight: 20,
  },
  PLANE_MAP: {
    id: 'plane_map',
    label: 'Initializing satellite map',
    weight: 15,
  },
  PLANET_MESH: {
    id: 'planet_mesh',
    label: 'Building planet mesh',
    weight: 10,
  },
} as const satisfies Record<string, LoadingStepDefinition>

export interface LoadingSnapshot {
  /** 0–100 */
  progress: number
  /** Label of the next pending step */
  currentLabel: string
  /** True when all steps have been completed */
  isComplete: boolean
}

const SERVER_SNAPSHOT: LoadingSnapshot = {
  progress: 0,
  currentLabel: 'Initializing…',
  isComplete: false,
}

class LoadingTrackerClass {
  private readonly steps: readonly LoadingStepDefinition[]
  private readonly totalWeight: number
  private readonly done: Set<string> = new Set()
  private readonly listeners: Set<() => void> = new Set()
  private snapshot: LoadingSnapshot

  constructor(steps: LoadingStepDefinition[]) {
    this.steps = steps
    this.totalWeight = steps.reduce((sum, s) => sum + s.weight, 0)
    this.snapshot = this.compute()
  }

  /** Mark a step as complete. Idempotent - safe to call multiple times. */
  completeStep(id: string): void {
    if (this.done.has(id)) return
    this.done.add(id)
    this.snapshot = this.compute()
    this.notify()
  }

  /** useSyncExternalStore - client snapshot */
  getSnapshot(): LoadingSnapshot {
    return this.snapshot
  }

  /** useSyncExternalStore - server snapshot (always loading state) */
  getServerSnapshot(): LoadingSnapshot {
    return SERVER_SNAPSHOT
  }

  /** useSyncExternalStore - subscription */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return (): void => {
      this.listeners.delete(listener)
    }
  }

  private compute(): LoadingSnapshot {
    const doneWeight = this.steps
      .filter((s) => this.done.has(s.id))
      .reduce((sum, s) => sum + s.weight, 0)

    const progress = this.totalWeight > 0 ? (doneWeight / this.totalWeight) * 100 : 0
    const isComplete = doneWeight >= this.totalWeight
    const pending = this.steps.find((s) => !this.done.has(s.id))
    const currentLabel = pending?.label ?? 'Ready'

    return { progress, currentLabel, isComplete }
  }

  private notify(): void {
    this.listeners.forEach((l) => l())
  }
}

export const LoadingTracker = new LoadingTrackerClass(
  Object.values(LOADING_STEPS),
)
