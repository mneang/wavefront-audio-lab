import type { TimingSnapshot } from '../acoustics/timing'
import { SPEAKERS, type SpeakerId } from '../acoustics/venue'

interface ArrivalTimelineProps {
  snapshot: TimingSnapshot
}

const TIMELINE = {
  left: 82,
  right: 470,
  maxMs: 65,
  rows: { main: 48, fill: 98 },
} as const

function xForArrival(arrivalMs: number): number {
  return TIMELINE.left + (arrivalMs / TIMELINE.maxMs) * (TIMELINE.right - TIMELINE.left)
}

export function ArrivalTimeline({ snapshot }: ArrivalTimelineProps) {
  const ticks = [0, 15, 30, 45, 60]

  return (
    <section className="timeline-panel" aria-label={`Arrival timeline for ${snapshot.listenerId}, ${snapshot.view}`}>
      <div className="timeline-heading">
        <div>
          <p className="eyebrow">ARRIVAL TIMELINE</p>
          <h3>{snapshot.listenerId} · {snapshot.view.replaceAll('-', ' ')}</h3>
        </div>
        <span className="timeline-unit">RELATIVE SCALE · ms</span>
      </div>
      <svg className="arrival-timeline" viewBox="0 0 500 134" role="img" aria-label={`Main arrives at ${snapshot.arrivals.main.finalArrivalMs.toFixed(2)} milliseconds. Fill arrives at ${snapshot.arrivals.fill.finalArrivalMs.toFixed(2)} milliseconds.`}>
        {ticks.map((tick) => {
          const x = xForArrival(tick)
          return (
            <g className="timeline-tick" key={tick}>
              <line x1={x} x2={x} y1="19" y2="112" />
              <text x={x} y="128" textAnchor="middle">{tick}</text>
            </g>
          )
        })}
        {(Object.keys(SPEAKERS) as SpeakerId[]).map((speakerId) => {
          const arrival = snapshot.arrivals[speakerId].finalArrivalMs
          const x = xForArrival(arrival)
          const y = TIMELINE.rows[speakerId]
          return (
            <g className={`timeline-track speaker-${speakerId}`} key={speakerId}>
              <text className="track-label" x="4" y={y + 4}>{SPEAKERS[speakerId].label}</text>
              <line className="track-rail" x1={TIMELINE.left} x2={TIMELINE.right} y1={y} y2={y} />
              <line className="arrival-stem" x1={x} x2={x} y1={y - 16} y2={y + 16} />
              <circle className="arrival-marker" cx={x} cy={y} r="6" />
              <text className="arrival-label" x={x} y={y - 12} textAnchor="middle">{arrival.toFixed(2)}</text>
            </g>
          )
        })}
      </svg>
      <p className="timeline-difference">
        Fill − Main <strong>{snapshot.differenceMs > 0 ? '+' : ''}{snapshot.differenceMs.toFixed(2)} ms</strong>
      </p>
    </section>
  )
}