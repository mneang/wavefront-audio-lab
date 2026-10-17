import { describe, expect, it } from 'vitest'
import { calculateGeometricArrivals, distanceBetween } from './geometry'

describe('venue geometry', () => {
  it('calculates each speaker distance and arrival time from L1 coordinates', () => {
    const arrivals = calculateGeometricArrivals('L1')

    expect(arrivals.main.distanceMeters).toBeCloseTo(12.04159, 4)
    expect(arrivals.main.arrivalMs).toBeCloseTo(35.10669, 3)
    expect(arrivals.fill.distanceMeters).toBeCloseTo(4.472136, 4)
    expect(arrivals.fill.arrivalMs).toBeCloseTo(13.03830, 3)
    expect(arrivals.fill.arrivalMs - arrivals.main.arrivalMs).toBeCloseTo(-22.06839, 3)
  })

  it('matches the approved distances and uncorrected differences at all listeners', () => {
    const expected = {
      L1: { mainDistance: 12.04159, fillDistance: 4.47214, differenceMs: -22.06839 },
      L2: { mainDistance: 16.64332, fillDistance: 5.83095, differenceMs: -31.52293 },
      L3: { mainDistance: 8, fillDistance: 11.70470, differenceMs: 10.80087 },
    } as const

    for (const [listenerId, result] of Object.entries(expected) as [
      keyof typeof expected,
      (typeof expected)[keyof typeof expected],
    ][]) {
      const arrivals = calculateGeometricArrivals(listenerId)

      expect(arrivals.main.distanceMeters).toBeCloseTo(result.mainDistance, 4)
      expect(arrivals.fill.distanceMeters).toBeCloseTo(result.fillDistance, 4)
      expect(arrivals.fill.arrivalMs - arrivals.main.arrivalMs).toBeCloseTo(
        result.differenceMs,
        3,
      )
    }
  })

  it('uses Euclidean distance', () => {
    expect(distanceBetween({ xMeters: 0, yMeters: 0 }, { xMeters: 3, yMeters: 4 })).toBe(5)
  })
})