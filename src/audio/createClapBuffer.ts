export function createClapBuffer(context: AudioContext): AudioBuffer {
  const durationSeconds = 0.16
  const frameCount = Math.ceil(context.sampleRate * durationSeconds)
  const buffer = context.createBuffer(1, frameCount, context.sampleRate)
  const samples = buffer.getChannelData(0)
  let randomState = 0x1a2b3c4d

  for (let index = 0; index < frameCount; index += 1) {
    randomState ^= randomState << 13
    randomState ^= randomState >>> 17
    randomState ^= randomState << 5

    const timeSeconds = index / context.sampleRate
    const noise = (randomState / 0x80000000) * Math.exp(-timeSeconds * 55)
    const body = Math.sin(2 * Math.PI * 185 * timeSeconds) * Math.exp(-timeSeconds * 20)
    samples[index] = (noise * 0.78 + body * 0.22) * 0.72
  }

  return buffer
}