import { calculateGeometricArrivals } from './geometry'
import type { ListenerId, SpeakerId } from './venue'

export interface SpeakerCorrection {
  readonly speakerId: SpeakerId
  readonly delayMs: number
}

export type TimingView =
  | 'original'
  | 'current-alignment'
  | 'original-playback'
  | 'aligned-playback'

export interface SpeakerTiming {
  readonly distanceMeters: number
  readonly geometricArrivalMs: number
  readonly emissionDelayMs: number
  readonly finalArrivalMs: number
  readonly playbackOffsetMs: number
}

export interface TimingSnapshot {
  readonly listenerId: ListenerId
  readonly view: TimingView
  readonly correction: SpeakerCorrection | null
  readonly arrivals: Readonly<Record<SpeakerId, SpeakerTiming>>
  readonly differenceMs: number
}

export function calculateAlignmentCorrection(
  listenerId: ListenerId,
): SpeakerCorrection | null {
  const arrivals = calculateGeometricArrivals(listenerId)

  if (arrivals.main.arrivalMs === arrivals.fill.arrivalMs) {
    return null
  }

  const speakerId =
    arrivals.main.arrivalMs < arrivals.fill.arrivalMs ? 'main' : 'fill'
  const earlierArrival = arrivals[speakerId].arrivalMs
  const laterArrival = arrivals[speakerId === 'main' ? 'fill' : 'main'].arrivalMs

  return Object.freeze({ speakerId, delayMs: laterArrival - earlierArrival })
}

export function createCurrentViewSnapshot(
  listenerId: ListenerId,
  correction: SpeakerCorrection | null,
): TimingSnapshot {
  return createSnapshot(
    listenerId,
    correction ? 'current-alignment' : 'original',
    correction,
  )
}

export function createPlaybackSnapshot(
  listenerId: ListenerId,
  version: 'original' | 'aligned',
  correction: SpeakerCorrection | null,
): TimingSnapshot {
  if (version === 'aligned' && correction === null) {
    throw new Error('Aligned playback requires an applied speaker correction.')
  }

  return createSnapshot(
    listenerId,
    version === 'original' ? 'original-playback' : 'aligned-playback',
    version === 'original' ? null : correction,
  )
}

function createSnapshot(
  listenerId: ListenerId,
  view: TimingView,
  correction: SpeakerCorrection | null,
): TimingSnapshot {
  const geometric = calculateGeometricArrivals(listenerId)
  const emissionDelayMs = {
    main: correction?.speakerId === 'main' ? correction.delayMs : 0,
    fill: correction?.speakerId === 'fill' ? correction.delayMs : 0,
  } as const
  const finalMainMs = geometric.main.arrivalMs + emissionDelayMs.main
  const finalFillMs = geometric.fill.arrivalMs + emissionDelayMs.fill
  const firstArrivalMs = Math.min(finalMainMs, finalFillMs)
  const arrivals = Object.freeze({
    main: Object.freeze({
      ...geometric.main,
      geometricArrivalMs: geometric.main.arrivalMs,
      emissionDelayMs: emissionDelayMs.main,
      finalArrivalMs: finalMainMs,
      playbackOffsetMs: finalMainMs - firstArrivalMs,
    }),
    fill: Object.freeze({
      ...geometric.fill,
      geometricArrivalMs: geometric.fill.arrivalMs,
      emissionDelayMs: emissionDelayMs.fill,
      finalArrivalMs: finalFillMs,
      playbackOffsetMs: finalFillMs - firstArrivalMs,
    }),
  })

  return Object.freeze({
    listenerId,
    view,
    correction,
    arrivals,
    differenceMs: finalFillMs - finalMainMs,
  })
}