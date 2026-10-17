import { useRef, useState } from 'react'
import {
  calculateAlignmentCorrection,
  createCurrentViewSnapshot,
  createPlaybackSnapshot,
  type SpeakerCorrection,
  type TimingSnapshot,
} from './acoustics/timing'
import { LISTENERS, SPEAKERS, type ListenerId } from './acoustics/venue'
import { PlaybackController } from './audio/playbackController'
import { ArrivalTimeline } from './components/ArrivalTimeline'
import { VenueMap } from './components/VenueMap'
import './App.css'

export type PlaybackStatus = 'Ready' | 'Playing' | 'Complete' | 'Audio Unavailable'

function App() {
  const [selectedListenerId, setSelectedListenerId] = useState<ListenerId>('L1')
  const [correction, setCorrection] = useState<SpeakerCorrection | null>(null)
  const [snapshot, setSnapshot] = useState<TimingSnapshot>(() =>
    createCurrentViewSnapshot('L1', null),
  )
  const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus>('Ready')
  const [hasPlayedOriginal, setHasPlayedOriginal] = useState(false)
  const [playbackRunId, setPlaybackRunId] = useState(0)
  const playbackController = useRef<PlaybackController | null>(null)
  const selectedListener = LISTENERS[selectedListenerId]

  function play(version: 'original' | 'aligned') {
    const nextSnapshot = createPlaybackSnapshot(selectedListenerId, version, correction)
    const controller = (playbackController.current ??= new PlaybackController())

    setSnapshot(nextSnapshot)
    setPlaybackRunId((runId) => runId + 1)
    setPlaybackStatus('Playing')
    controller.play(nextSnapshot, {
      onComplete: () => {
        setPlaybackStatus('Complete')
        if (version === 'original') setHasPlayedOriginal(true)
      },
      onUnavailable: () => setPlaybackStatus('Audio Unavailable'),
    })
  }

  function alignForSelectedPosition() {
    playbackController.current?.cancel()
    const nextCorrection = calculateAlignmentCorrection(selectedListenerId)
    setCorrection(nextCorrection)
    setSnapshot(createCurrentViewSnapshot(selectedListenerId, nextCorrection))
    setPlaybackStatus('Ready')
  }

  function selectListener(listenerId: ListenerId) {
    playbackController.current?.cancel()
    setSelectedListenerId(listenerId)
    setSnapshot(createCurrentViewSnapshot(listenerId, correction))
    setPlaybackStatus('Ready')
  }

  function reset() {
    playbackController.current?.cancel()
    setSelectedListenerId('L1')
    setCorrection(null)
    setSnapshot(createCurrentViewSnapshot('L1', null))
    setPlaybackStatus('Ready')
    setHasPlayedOriginal(false)
  }

  const difference = snapshot.differenceMs
  const earlierSpeaker = difference < 0 ? SPEAKERS.fill.label : SPEAKERS.main.label
  const signedDifference = `${difference > 0 ? '+' : ''}${difference.toFixed(2)}`
  const differenceContext =
    Math.abs(difference) < 0.01 ? 'Arrivals aligned' : `${earlierSpeaker} arrives first`
  const isPlaying = playbackStatus === 'Playing'
  const viewLabel = {
    original: 'Original',
    'original-playback': 'Original Playback',
    'aligned-playback': 'Aligned Playback',
    'current-alignment': 'Current Alignment',
  }[snapshot.view]
  const canAlign =
    isPlaying === false &&
    (correction !== null || playbackStatus === 'Complete' || playbackStatus === 'Audio Unavailable')

  return (
    <main className="studio-shell">
      <header className="studio-header">
        <a className="wordmark" href="#top" aria-label="WAVEFRONT home">
          WAVE<span>FRONT</span>
        </a>
        <span className="header-mode">AUDIO REHEARSAL LAB</span>
      </header>

      <section className="intro" id="top">
        <div>
          <p className="eyebrow">VIRTUAL SPEAKER TIMING</p>
          <h1>Hear where timing breaks.</h1>
          <p className="intro-copy">
            Rehearse speaker alignment before the real setup. Explore how arrival
            timing changes across a small venue.
          </p>
        </div>
        <div className="position-chip">
          <span className="status-dot" />
          LISTENER <strong>{selectedListenerId}</strong>
        </div>
      </section>

      <section className="workbench" aria-label={`${selectedListenerId} timing and playback workbench`}>
        <div className="map-panel">
          <div className="map-panel-heading">
            <div>
              <p className="eyebrow">VENUE OVERVIEW</p>
              <h2>Community auditorium</h2>
            </div>
            <span className="dimension-tag">{viewLabel} · 20 m × 12 m</span>
          </div>
          <VenueMap
            listenerId={selectedListenerId}
            snapshot={snapshot}
            playbackStatus={playbackStatus}
            playbackRunId={playbackRunId}
            onSelectListener={selectListener}
          />
          <ArrivalTimeline snapshot={snapshot} />
        </div>

        <aside className="control-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">LISTENING POSITION</p>
              <h2>{selectedListener.label}</h2>
            </div>
            <span className={`playback-status ${playbackStatus === 'Audio Unavailable' ? 'is-error' : ''}`}>
              <span className="status-dot" />
              {playbackStatus.toUpperCase()}
            </span>
          </div>

          <div className="listener-picker" role="group" aria-label="Select audience listening position">
            {(Object.keys(LISTENERS) as ListenerId[]).map((listenerId) => (
              <button
                className={`listener-button${listenerId === selectedListenerId ? ' is-selected' : ''}`}
                type="button"
                key={listenerId}
                aria-pressed={listenerId === selectedListenerId}
                onClick={() => selectListener(listenerId)}
              >
                {listenerId}
              </button>
            ))}
          </div>

          <div className="arrival-list">
            {(['main', 'fill'] as const).map((speakerId) => {
              const speaker = SPEAKERS[speakerId]
              const arrival = snapshot.arrivals[speakerId]
              return (
                <div className={`arrival-row speaker-${speakerId}`} key={speakerId}>
                  <span className="speaker-mark" aria-hidden="true" />
                  <div className="speaker-name">
                    <strong>{speaker.label}</strong>
                    <span>{arrival.distanceMeters.toFixed(2)} m · {arrival.emissionDelayMs > 0 ? `+${arrival.emissionDelayMs.toFixed(2)} ms emission` : 'no added delay'}</span>
                  </div>
                  <div className="arrival-value">
                    <strong>{arrival.finalArrivalMs.toFixed(2)}</strong>
                    <span>ms arrival</span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="difference-readout" aria-live="polite">
            <span>TIMING DIFFERENCE · FILL − MAIN</span>
            <strong>{signedDifference}<small> ms</small></strong>
            <span className="difference-context">{differenceContext}</span>
          </div>

          <div className="correction-readout">
            <span>APPLIED CORRECTION</span>
            <strong>
              {correction
                ? `${SPEAKERS[correction.speakerId].label} delay: +${correction.delayMs.toFixed(2)} ms`
                : 'None'}
            </strong>
          </div>

          <div className="playback-controls">
            <button className="button button-primary" type="button" onClick={() => play('original')} disabled={isPlaying}>
              <span className="play-icon" aria-hidden="true">▶</span>
              {hasPlayedOriginal ? 'Play Original' : 'Hear the Difference'}
            </button>
            <button className="button button-align" type="button" onClick={alignForSelectedPosition} disabled={!canAlign}>
              Align for This Position
            </button>
            <button className="button button-secondary" type="button" onClick={() => play('aligned')} disabled={isPlaying || correction === null}>
              <span className="play-icon" aria-hidden="true">▶</span>
              Play Aligned
            </button>
          </div>

          <div className="secondary-actions">
            <button className="reset-button" type="button" onClick={reset}>Reset to Original</button>
          </div>

          {playbackStatus === 'Audio Unavailable' && (
            <div className="audio-error" role="alert">
              <strong>Audio couldn't play.</strong>
              <span>Check your device's sound settings, that the tab isn't muted, and your output volume is on.</span>
              <button className="retry-button" type="button" onClick={() => play(snapshot.view === 'aligned-playback' ? 'aligned' : 'original')}>
                Retry Playback
              </button>
            </div>
          )}
        </aside>
      </section>

      <footer className="model-note">
        <span className="note-icon" aria-hidden="true">i</span>
        <p>
          Simplified geometric sound-arrival model. These are virtual speaker
          signals mixed through your audio output, not venue measurements or
          physical loudspeaker controls.
        </p>
        <button type="button" onClick={reset} aria-label="Reset playback and alignment">Reset</button>
      </footer>
    </main>
  )
}

export default App
