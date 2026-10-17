import {
  LISTENERS,
  ROOM,
  SPEED_OF_SOUND_METERS_PER_SECOND,
  SPEAKERS,
  type ListenerId,
  type SpeakerId,
} from './venue'

export interface GeometricArrival {
  readonly distanceMeters: number
  readonly arrivalMs: number
}

export type GeometricArrivals = Readonly<Record<SpeakerId, GeometricArrival>>

export function distanceBetween(
  first: { readonly xMeters: number; readonly yMeters: number },
  second: { readonly xMeters: number; readonly yMeters: number },
): number {
  return Math.hypot(first.xMeters - second.xMeters, first.yMeters - second.yMeters)
}

export function calculateGeometricArrivals(listenerId: ListenerId): GeometricArrivals {
  const listener = LISTENERS[listenerId]

  return Object.freeze({
    main: calculateArrival('main', listener),
    fill: calculateArrival('fill', listener),
  })
}

function calculateArrival(
  speakerId: SpeakerId,
  listener: (typeof LISTENERS)[ListenerId],
): GeometricArrival {
  const speaker = SPEAKERS[speakerId]
  const distanceMeters = distanceBetween(speaker, listener)

  if (
    listener.xMeters < 0 ||
    listener.xMeters > ROOM.widthMeters ||
    listener.yMeters < 0 ||
    listener.yMeters > ROOM.depthMeters
  ) {
    throw new RangeError(`Listener ${listener.id} is outside the configured venue.`)
  }

  return Object.freeze({
    distanceMeters,
    arrivalMs: (distanceMeters / SPEED_OF_SOUND_METERS_PER_SECOND) * 1000,
  })
}