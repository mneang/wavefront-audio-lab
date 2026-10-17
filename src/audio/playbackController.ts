import type { TimingSnapshot } from '../acoustics/timing'
import { createClapBuffer } from './createClapBuffer'

export interface PlaybackCallbacks {
  onComplete: () => void
  onUnavailable: () => void
}

interface ActivePlayback {
  readonly sources: readonly AudioBufferSourceNode[]
  readonly output: GainNode
  readonly callbacks: PlaybackCallbacks
  readonly onStateChange: () => void
  completedSources: number
}

export class PlaybackController {
  private context: AudioContext | null = null
  private buffer: AudioBuffer | null = null
  private activePlayback: ActivePlayback | null = null
  private generation = 0
  private readonly createContext: () => AudioContext

  constructor(createContext: () => AudioContext = () => new window.AudioContext()) {
    this.createContext = createContext
  }

  async play(snapshot: TimingSnapshot, callbacks: PlaybackCallbacks): Promise<void> {
    this.cancel()
    const generation = this.generation

    try {
      const context = this.getContext()
      if (context.state !== 'running') {
        await context.resume()
      }
      if (generation !== this.generation) return
      if (context.state !== 'running') {
        throw new Error('Audio output did not become available.')
      }

      this.buffer ??= createClapBuffer(context)
      const output = context.createGain()
      output.gain.value = 0.32
      output.connect(context.destination)

      const sources = (['main', 'fill'] as const).map(() => {
        const source = context.createBufferSource()
        source.buffer = this.buffer
        source.connect(output)
        return source
      })

      let playback: ActivePlayback
      const onStateChange = () => {
        if (context.state !== 'running' && this.activePlayback === playback) {
          this.fail(playback)
        }
      }

      playback = {
        sources,
        output,
        callbacks,
        onStateChange,
        completedSources: 0,
      }
      this.activePlayback = playback
      context.addEventListener('statechange', onStateChange)

      for (const [index, speakerId] of (['main', 'fill'] as const).entries()) {
        const source = sources[index]
        source.onended = () => this.handleEnded(playback)
        const offsetSeconds = snapshot.arrivals[speakerId].playbackOffsetMs / 1000
        source.start(context.currentTime + 0.12 + offsetSeconds)
      }
    } catch {
      if (generation !== this.generation) return
      this.cancel()
      callbacks.onUnavailable()
    }
  }

  cancel(): void {
    this.generation += 1
    const playback = this.activePlayback
    if (!playback) return

    this.activePlayback = null
    this.context?.removeEventListener('statechange', playback.onStateChange)
    for (const source of playback.sources) {
      source.onended = null
      try {
        source.stop()
      } catch {
        // A source may already have ended before cancellation.
      }
      source.disconnect()
    }
    playback.output.disconnect()
  }

  private getContext(): AudioContext {
    if (!this.context) {
      this.context = this.createContext()
    }
    return this.context
  }

  private handleEnded(playback: ActivePlayback): void {
    if (this.activePlayback !== playback) return

    playback.completedSources += 1
    if (playback.completedSources !== playback.sources.length) return

    const context = this.context
    this.activePlayback = null
    context?.removeEventListener('statechange', playback.onStateChange)
    playback.output.disconnect()

    if (context?.state === 'running') {
      playback.callbacks.onComplete()
    } else {
      playback.callbacks.onUnavailable()
    }
  }

  private fail(playback: ActivePlayback): void {
    if (this.activePlayback !== playback) return
    this.cancel()
    playback.callbacks.onUnavailable()
  }
}