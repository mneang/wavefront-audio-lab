import { describe, expect, it } from 'vitest'
import {
  calculateAlignmentCorrection,
  createCurrentViewSnapshot,
  createPlaybackSnapshot,
} from './timing'

describe('speaker alignment timing', () => {
  it('delays Fill at L1 and produces a zero difference there', () => {
    const correction = calculateAlignmentCorrection('L1')
    const aligned = createCurrentViewSnapshot('L1', correction)

    expect(correction?.speakerId).toBe('fill')
    expect(correction?.delayMs).toBeCloseTo(22.06839, 3)
    expect(aligned.view).toBe('current-alignment')
    expect(aligned.differenceMs).toBeCloseTo(0, 10)
    expect(Object.isFrozen(aligned)).toBe(true)
    expect(Object.isFrozen(aligned.arrivals.fill)).toBe(true)
  })

  it('retains the L1 correction to show the trade-off at L2 and L3', () => {
    const correction = calculateAlignmentCorrection('L1')
    const atL2 = createCurrentViewSnapshot('L2', correction)
    const atL3 = createCurrentViewSnapshot('L3', correction)

    expect(atL2.differenceMs).toBeCloseTo(-9.45454, 3)
    expect(atL3.differenceMs).toBeCloseTo(32.86927, 3)
    expect(atL3.correction).toBe(correction)
  })

  it('shows Original before correction and when listeners change without one', () => {
    expect(createCurrentViewSnapshot('L1', null).view).toBe('original')
    expect(createCurrentViewSnapshot('L3', null).view).toBe('original')
  })

  it('keeps Original playback uncorrected without mutating the applied correction', () => {
    const correction = calculateAlignmentCorrection('L1')
    const original = createPlaybackSnapshot('L3', 'original', correction)
    const aligned = createPlaybackSnapshot('L3', 'aligned', correction)

    expect(original.view).toBe('original-playback')
    expect(original.correction).toBe(null)
    expect(original.arrivals.fill.emissionDelayMs).toBe(0)
    expect(original.differenceMs).toBeCloseTo(10.80087, 3)
    expect(aligned.view).toBe('aligned-playback')
    expect(aligned.differenceMs).toBeCloseTo(32.86927, 3)
    expect(correction?.delayMs).toBeCloseTo(22.06839, 3)
  })

  it('replaces the previous correction when explicitly aligning at a new point', () => {
    const firstCorrection = calculateAlignmentCorrection('L1')
    const nextCorrection = calculateAlignmentCorrection('L3')

    expect(firstCorrection?.speakerId).toBe('fill')
    expect(nextCorrection?.speakerId).toBe('main')
    expect(nextCorrection?.delayMs).toBeCloseTo(10.80087, 3)
  })
})