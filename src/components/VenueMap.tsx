import type { KeyboardEvent } from 'react'
import { LISTENERS, ROOM, SPEAKERS, type ListenerId, type SpeakerId } from '../acoustics/venue'
import type { TimingSnapshot } from '../acoustics/timing'
import type { PlaybackStatus } from '../App'

const MAP = {
  left: 70,
  top: 52,
  width: 620,
  height: 360,
  scaleX: 31,
  scaleY: 30,
} as const

const SLOW_MOTION_FACTOR = 16

interface VenueMapProps {
  listenerId: ListenerId
  snapshot: TimingSnapshot
  playbackStatus: PlaybackStatus
  playbackRunId: number
  onSelectListener: (listenerId: ListenerId) => void
}

function mapX(xMeters: number): number {
  return MAP.left + xMeters * MAP.scaleX
}

function mapY(yMeters: number): number {
  return MAP.top + yMeters * MAP.scaleY
}

function pathFor(speakerId: SpeakerId, listenerId: ListenerId): string {
  const speaker = SPEAKERS[speakerId]
  const listener = LISTENERS[listenerId]
  return `M ${mapX(speaker.xMeters)} ${mapY(speaker.yMeters)} L ${mapX(listener.xMeters)} ${mapY(listener.yMeters)}`
}

function handleListenerKeyDown(
  event: KeyboardEvent<SVGGElement>,
  listenerId: ListenerId,
  onSelectListener: (listenerId: ListenerId) => void,
): void {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    onSelectListener(listenerId)
  }
}

export function VenueMap({
  listenerId,
  snapshot,
  playbackStatus,
  playbackRunId,
  onSelectListener,
}: VenueMapProps) {
  const isPlaybackVisible = playbackStatus === 'Playing' || playbackStatus === 'Complete'
  const roomBounds = `M ${MAP.left} ${MAP.top} H ${MAP.left + MAP.width} V ${MAP.top + MAP.height} H ${MAP.left} Z`

  return (
    <div className="venue-map-wrap">
      <svg
        className="venue-map"
        viewBox="0 0 760 470"
        role="group"
        aria-label={`Top-down ${ROOM.widthMeters} by ${ROOM.depthMeters} metre venue. ${listenerId} is selected.`}
      >
        <defs>
          <pattern id="venue-grid" width="31" height="30" patternUnits="userSpaceOnUse">
            <path d="M 31 0 L 0 0 0 30" fill="none" stroke="#344247" strokeWidth="0.8" />
          </pattern>
          <filter id="listener-focus" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>

        <path className="room-shape" d={roomBounds} />
        <rect
          x={MAP.left}
          y={MAP.top}
          width={MAP.width}
          height={MAP.height}
          fill="url(#venue-grid)"
          pointerEvents="none"
        />
        <text className="map-axis-label" x={MAP.left} y="34">STAGE / FRONT</text>
        <text className="map-axis-label" x={MAP.left + MAP.width} y="34" textAnchor="end">20 m</text>
        <text className="map-axis-label" x={MAP.left - 12} y={MAP.top + MAP.height + 18} textAnchor="end">12 m</text>

        <g className="sound-paths" aria-hidden="true">
          {(Object.keys(SPEAKERS) as SpeakerId[]).map((speakerId) => (
            <path
              key={speakerId}
              className={`sound-path speaker-${speakerId}${speakerId === 'main' ? '' : ' is-secondary'}`}
              d={pathFor(speakerId, listenerId)}
            />
          ))}
        </g>

        {isPlaybackVisible && (['main', 'fill'] as const).map((speakerId) => {
          const speaker = SPEAKERS[speakerId]
          const arrival = snapshot.arrivals[speakerId]
          const path = pathFor(speakerId, snapshot.listenerId)
          const durationMs = arrival.geometricArrivalMs * SLOW_MOTION_FACTOR
          const beginMs = arrival.emissionDelayMs * SLOW_MOTION_FACTOR

          return (
            <circle
              key={`${playbackRunId}-${snapshot.listenerId}-${snapshot.view}-${speakerId}`}
              className={`wave-pulse speaker-${speakerId}`}
              r="7"
              cx={mapX(speaker.xMeters)}
              cy={mapY(speaker.yMeters)}
              aria-hidden="true"
            >
              <animateMotion
                path={path}
                begin={`${beginMs}ms`}
                dur={`${durationMs}ms`}
                fill="freeze"
                calcMode="linear"
              />
            </circle>
          )
        })}

        {(Object.keys(SPEAKERS) as SpeakerId[]).map((speakerId) => {
          const speaker = SPEAKERS[speakerId]
          return (
            <g
              className={`map-speaker speaker-${speakerId}`}
              key={speakerId}
              transform={`translate(${mapX(speaker.xMeters)} ${mapY(speaker.yMeters)})`}
            >
              <rect x="-14" y="-14" width="28" height="28" rx="4" />
              <path d="M -4 -6 L 5 -6 L 10 -11 L 10 11 L 5 6 L -4 6 Z" />
              <text x="0" y="-23" textAnchor="middle">{speaker.label.toUpperCase()}</text>
            </g>
          )
        })}

        {(Object.keys(LISTENERS) as ListenerId[]).map((id) => {
          const point = LISTENERS[id]
          const selected = id === listenerId
          return (
            <g
              className={`map-listener${selected ? ' is-selected' : ''}`}
              key={id}
              transform={`translate(${mapX(point.xMeters)} ${mapY(point.yMeters)})`}
              role="button"
              tabIndex={0}
              aria-label={`Select listening position ${id}`}
              aria-pressed={selected}
              onClick={() => onSelectListener(id)}
              onKeyDown={(event) => handleListenerKeyDown(event, id, onSelectListener)}
            >
              {selected && <circle className="listener-halo" r="22" filter="url(#listener-focus)" />}
              <circle className="listener-ring" r="13" />
              <circle className="listener-core" r="4" />
              <text x="18" y="4">{id}</text>
            </g>
          )
        })}
      </svg>
      <div className="map-legend" aria-label="Map legend">
        <span><i className="legend-dot speaker-main" /> Main</span>
        <span><i className="legend-dot speaker-fill" /> Fill</span>
        <span><i className="legend-listener" /> Audience positions</span>
        {isPlaybackVisible && <span className="slow-motion-note">Arrival motion · 16× slow motion</span>}
      </div>
    </div>
  )
}