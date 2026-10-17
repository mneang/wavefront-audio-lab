export const ROOM = {
  widthMeters: 20,
  depthMeters: 12,
} as const

export const SPEED_OF_SOUND_METERS_PER_SECOND = 343

export const SPEAKERS = {
  main: { id: 'main', label: 'Main', xMeters: 3, yMeters: 1 },
  fill: { id: 'fill', label: 'Fill', xMeters: 14, yMeters: 5 },
} as const

export const LISTENERS = {
  L1: { id: 'L1', label: 'Audience L1', xMeters: 12, yMeters: 9 },
  L2: { id: 'L2', label: 'Audience L2', xMeters: 17, yMeters: 10 },
  L3: { id: 'L3', label: 'Audience L3', xMeters: 3, yMeters: 9 },
} as const

export type SpeakerId = keyof typeof SPEAKERS
export type ListenerId = keyof typeof LISTENERS