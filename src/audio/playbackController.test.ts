import { describe, expect, it, vi } from 'vitest'
import {
  calculateAlignmentCorrection,
  createPlaybackSnapshot,
} from '../acoustics/timing'
import { PlaybackController } from './playbackController'

interface FakeSource {
  buffer: AudioBuffer | null
  onended: (() => void) | null
  startTime: number | null
  stop: ReturnType<typeof vi.fn>
  disconnect: ReturnType<typeof vi.fn>
  connect: ReturnType<typeof vi.fn>
  start: ReturnType<typeof vi.fn>
}

function createFakeContext(state: AudioContextState = 'running') {
  const sources: FakeSource[] = []
  const context = {
    currentTime: 5,
    destination: {},
    sampleRate: 22050,
    state,
    resume: vi.fn(async () => undefined),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    createBuffer: vi.fn((_channels: number, length: number) => ({
      getChannelData: () => new Float32Array(length),
    })),
    createGain: vi.fn(() => ({
      gain: { value: 1 },
      connect: vi.fn(),
      disconnect: vi.fn(),
    })),
    createBufferSource: vi.fn(() => {
      const source: FakeSource = {
        buffer: null,
        onended: null,
        startTime: null,
        stop: vi.fn(),
        disconnect: vi.fn(),
        connect: vi.fn(),
        start: vi.fn((startTime: number) => {
          source.startTime = startTime
        }),
      }
      sources.push(source)
      return source
    }),
  }

  return { context: context as unknown as AudioContext, sources }
}

function callbacks() {
  return { onComplete: vi.fn(), onUnavailable: vi.fn() }
}

describe('PlaybackController', () => {
  it('schedules both identical sources using the snapshot relative offsets', async () => {
    const { context, sources } = createFakeContext()
    const controller = new PlaybackController(() => context)

    await controller.play(createPlaybackSnapshot('L1', 'original', null), callbacks())

    expect(sources).toHaveLength(2)
    expect(sources[0].buffer).toBe(sources[1].buffer)
    expect(sources[0].start).toHaveBeenCalledWith(expect.closeTo(5.142068, 5))
    expect(sources[1].start).toHaveBeenCalledWith(5.12)
  })

  it('schedules aligned sources together while Original stays uncorrected', async () => {
    const correction = calculateAlignmentCorrection('L1')
    const { context, sources } = createFakeContext()
    const controller = new PlaybackController(() => context)

    await controller.play(
      createPlaybackSnapshot('L1', 'aligned', correction),
      callbacks(),
    )

    expect(sources).toHaveLength(2)
    expect(sources[0].buffer).toBe(sources[1].buffer)
    expect(sources[0].start).toHaveBeenCalledWith(5.12)
    expect(sources[1].start).toHaveBeenCalledWith(5.12)
  })

  it('does not schedule audio or report failure after pending activation is canceled', async () => {
    const { context, sources } = createFakeContext('suspended')
    let finishResume: (() => void) | undefined
    context.resume = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finishResume = () => {
            Object.defineProperty(context, 'state', { value: 'running' })
            resolve()
          }
        }),
    )
    const controller = new PlaybackController(() => context)
    const playbackCallbacks = callbacks()
    const playRequest = controller.play(
      createPlaybackSnapshot('L1', 'original', null),
      playbackCallbacks,
    )

    controller.cancel()
    finishResume?.()
    await playRequest

    expect(sources).toHaveLength(0)
    expect(playbackCallbacks.onComplete).not.toHaveBeenCalled()
    expect(playbackCallbacks.onUnavailable).not.toHaveBeenCalled()
  })

  it('ignores a stale completion callback after cancellation', async () => {
    const { context, sources } = createFakeContext()
    const controller = new PlaybackController(() => context)
    const playbackCallbacks = callbacks()
    await controller.play(
      createPlaybackSnapshot('L1', 'original', null),
      playbackCallbacks,
    )
    const staleHandlers = sources.map((source) => source.onended)

    controller.cancel()
    staleHandlers.forEach((handler) => handler?.())

    expect(sources.every((source) => source.stop.mock.calls.length === 1)).toBe(true)
    expect(playbackCallbacks.onComplete).not.toHaveBeenCalled()
    expect(playbackCallbacks.onUnavailable).not.toHaveBeenCalled()
  })
})