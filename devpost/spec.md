---
doc: spec
status: approved
---

# WAVEFRONT — Technical Spec

## How This Works, In Plain Language

The browser draws one venue from a small configuration file containing the room dimensions and the fixed speaker and listener coordinates. Separate TypeScript math functions calculate each speaker-to-listener distance and sound arrival time. Those functions do not depend on React, so tests can check the acoustic calculations without rendering the interface.

When someone presses a playback button, the app calculates one read-only timing snapshot for that listener and that version (Original or Aligned). That is a fixed copy of the results for this playback; the app does not change its values midway through. The Web Audio player and the venue/timeline visuals both receive that exact snapshot. The browser creates one short clap-like audio sample and schedules two copies of the same sample through one audio output, at times from the snapshot. The two sources represent virtual speakers; they are not separate physical loudspeakers or outputs.

React keeps the selected listener, any applied speaker delay, playback status, and the currently displayed timing snapshot in memory. Changing listener or resetting cancels active sound and invalidates its visual playback; changing listener keeps the speaker correction. Refreshing starts from the default venue at L1, with no correction and playback Ready. There is no server, account, database, saved session, or external API.

This is a direct-path geometry model, not a room simulator. It uses a fixed speed of sound of 343 m/s and does not model reflections, temperature, barriers, speaker characteristics, or the listener's actual device latency. The browser can report whether its scheduled audio nodes ran, but cannot confirm that someone physically heard them.

## The Core Journey Through the System

PRD ref: `prd.md > The Core Journey`, `Screens and Layout`.

1. `src/acoustics/venue.ts` supplies the room and coordinate data. `src/acoustics/geometry.ts` calculates distances and uncorrected arrivals for L1, L2, and L3. React selects L1 initially and displays its Original values.
2. On **Hear the Difference**, the app asks the browser to resume audio from this user click if necessary. It creates a fresh immutable Original timing snapshot for L1. `src/audio/playbackController.ts` schedules two source nodes that reuse the same generated sound buffer using that snapshot; `VenueMap` and `ArrivalTimeline` render the same snapshot. The visuals identify the playback version and selected listener.
3. When both sources finish naturally and the audio context is still running, the player reports completion for that playback session. React keeps the snapshot and markers visible. It does not treat a click or a canceled source as successful playback.
4. On **Align for This Position**, `src/acoustics/timing.ts` derives a speaker delay from the uncorrected geometric arrivals at the selected position. It sets the earlier-arriving speaker's emission delay so the modeled arrivals coincide. React records the correction and displays the Current Alignment snapshot, including the correction label.
5. On **Play Aligned**, the app takes one new Aligned snapshot containing the selected listener, both geometric arrivals, the retained emission delay, and final arrivals. Audio scheduling and visuals use it together. **Play Original** instead takes an uncorrected Original snapshot without changing or clearing the stored correction.
6. Selecting L2 or L3 during playback cancels it, invalidates callbacks from its session, retains the correction, recalculates Current Alignment for the new listener, and returns playback status to Ready. Reset does the same cancellation, then selects L1, clears the correction and playback snapshot, and displays the default Original values.

## Stack

- **Vite + React + TypeScript** — learner-selected. Vite keeps local development and production builds lightweight; React handles the one interactive workspace; TypeScript makes the coordinate, timing, alignment, and playback contracts explicit. Trade-off: this adds a build setup compared with a single static HTML file, but fits the learner's JavaScript/TypeScript experience and supports independent tests.
- **Native Web Audio API** — learner-selected, no audio library. A shared generated `AudioBuffer` is played by two `AudioBufferSourceNode`s scheduled against one `AudioContext` clock. This provides accurate relative scheduling without recordings. Both virtual signals are mixed through the user's normal browser output; there is no routing to two physical speakers.
- **SVG + CSS** — learner-selected. SVG draws the venue map, fixed speaker/listener coordinates, paths, wavefronts, and arrival timeline; CSS handles the instrument-style responsive workspace and interaction states. Slow-motion wave animation changes only visual animation time and is labeled; it never changes playback or displayed timing values.
- **Vitest** — a small development-only test dependency for the standalone TypeScript calculations. It has no runtime role and adds less setup than creating a separate test stack.

Use the current compatible versions resolved by the Vite React/TypeScript scaffold and package manager at build time; pin the resulting `package-lock.json`. Check the installed Node.js version against Vite's requirements when scaffolding. Version requirements can change, so verify them during setup rather than assuming a specific version here.

Documentation:
- [Vite Guide](https://vite.dev/guide/)
- [React Learn](https://react.dev/learn)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [AudioBufferSourceNode](https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode)
- [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG)
- [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)
- [Vitest Guide](https://vitest.dev/guide/)

## Where It Runs and How Someone Tries It

- **Runtime:** Vite development server on the local machine; the app itself runs in a modern browser. Node.js and npm are needed to install and run the build tools. No API keys, account, network service, or deployment is needed for the demo.
- **Install:** `npm install`
- **Test script:** define the package script as `"test": "vitest"`, so the test command below runs the calculation tests in one pass.
- **Run in the dev container:** `npm run dev -- --host 0.0.0.0`; open the forwarded local address, normally `http://localhost:5173/`.
- **Run calculation tests:** `npm run test -- --run`.
- **Check the production build:** `npm run build`.
- **Audio activation:** the first playback starts or resumes the `AudioContext` directly from the user's click. If the browser rejects or suspends playback, show Audio Unavailable and allow an explicit Retry Playback click.
- **Recording:** run locally, allow the development server port through the editor, and record the default L1 Original → Align → Play Aligned → select L3 sequence. Verify browser tab and output volume before recording. The hackathon still requires a short demo video and public GitHub repository; deployment is optional and does not replace either.

## Look and Feel

Implement the approved direction from `prd.md > Look and Feel`: a charcoal or midnight-navy audio workstation; restrained cyan/blue for Main and warm amber for Fill; restrained green for alignment; sans-serif labels and monospaced timing values; crisp SVG lines and subtle map grid; and the map as the visual centerpiece. Keep contrast and timing values readable at laptop recording size. Use brief, purposeful arrival motion, with a visible slow-motion label where used. No decorative particles, excessive glow, or gradient-heavy styling. State plainly that geometry is simplified and speakers are virtual; instrument styling must not suggest measurement-grade acoustic accuracy.

## Components

### `App`

Owns ephemeral UI state: selected listener ID, applied correction or none, playback status, displayed view/snapshot, and active playback session ID. Coordinates selection, reset, alignment, and playback actions. Renders the one-use workspace header, timing panel, listener buttons, and playback controls inline to keep this small single-screen POC lean. Keeps correction separate from the snapshot displayed for a particular playback.

PRD ref: `prd.md > The Core Journey`, `States and Boundaries`.

### `VenueMap`

Renders the room outline and grid, fixed Main/Fill speaker coordinates, all three selectable listener markers, paths to the selected listener, and wave pulses for the displayed playback snapshot. Converts metres to SVG viewBox coordinates; it does not calculate travel times. Selecting a listener signals App, which cancels any active playback before changing the displayed Current Alignment.

PRD ref: `prd.md > Venue Map and Listener Selection`, `Original and Aligned Playback`.

### `ArrivalTimeline`

Plots both arrival markers using the displayed snapshot's arrival times and uses the same speaker colors as the map. Keeps the same scale for before/after and across L1/L2/L3 so timing comparisons are honest. If markers overlap at alignment, preserve both marker identities with a clear aligned state rather than separating them artificially.

PRD ref: `prd.md > Original and Aligned Playback`.

### `playbackController`

Owns one AudioContext, one generated clap-like AudioBuffer, and at most one active playback session. Schedules two buffer sources to the same destination using a timing snapshot. Cancels sources on listener change, Reset, replacement, or failure. Each session has an identity/cancellation marker; late `ended` events from a canceled session cannot change the current UI. Completion requires both sources to end naturally for the current session while the context remains running.

PRD ref: `prd.md > Original and Aligned Playback`, `Playback Status and Failure`, `States and Boundaries`.

## Acoustic Model and Verified Geometry

Coordinates are measured in metres from the room's front-left corner. Room dimensions are 20 m wide by 12 m deep; speed of sound is fixed at 343 m/s. For listener coordinate $(x_l, y_l)$ and speaker coordinate $(x_s, y_s)$:

$$d = \sqrt{(x_l-x_s)^2 + (y_l-y_s)^2}$$

$$t_{ms} = \frac{d}{343} \times 1000$$

The signed difference is `Fill arrival - Main arrival`: a negative value means Fill is earlier; a positive value means Main is earlier. Distances and times are calculated from the centralized coordinates. Keep full precision for calculations and scheduling; show distances and times rounded to two decimals.

Central configuration:

| Point | Role | x (m) | y (m) |
|---|---|---:|---:|
| Main | Main speaker | 3 | 1 |
| Fill | Fill speaker | 14 | 5 |
| L1 | Audience listener, selected by default | 12 | 9 |
| L2 | Audience listener | 17 | 10 |
| L3 | Audience listener | 3 | 9 |

Expected results from the verified coordinate calculation, rounded to two decimals:

| Listener | Main distance / arrival | Fill distance / arrival | Original difference (Fill - Main) | Earlier speaker |
|---|---:|---:|---:|---|
| L1 | 12.04 m / 35.11 ms | 4.47 m / 13.04 ms | -22.07 ms | Fill |
| L2 | 16.64 m / 48.52 ms | 5.83 m / 17.00 ms | -31.52 ms | Fill |
| L3 | 8.00 m / 23.32 ms | 11.70 m / 34.12 ms | +10.80 ms | Main |

Aligning at L1 applies `Fill +22.068392... ms` as a later emission from the virtual Fill speaker; it does not alter the 343 m/s propagation speed or either distance. Expected Current Alignment results with that correction retained:

| Listener | Main arrival | Fill arrival (geometry + 22.068 ms) | Difference (Fill - Main) |
|---|---:|---:|---:|
| L1 | 35.11 ms | 35.11 ms | 0.00 ms |
| L2 | 48.52 ms | 39.07 ms | -9.45 ms |
| L3 | 23.32 ms | 56.19 ms | +32.87 ms |

This table is also the cross-position trade-off acceptance test: aligning L1 reaches approximately zero there, while the Fill delay remains fixed at L2 and L3, including the larger 32.87 ms mismatch at L3. The 22.07 ms starting mismatch is a hypothesis for audibility, not a guaranteed perceptual result. Verify it with the generated signal on ordinary laptop speakers and headphones early in the build. If it is not clearly perceptible, adjust the venue coordinates and regenerate all expected values; do not inflate the audio delay or alter the displayed calculations independently.

## Timing Snapshot and Data Flow

All position data lives in `src/acoustics/venue.ts`. `geometry.ts` produces uncorrected distances and arrivals; `timing.ts` combines those with the current correction and requested mode to produce a new immutable snapshot. Define its fields as TypeScript `readonly` data, construct fresh values rather than mutating them, and freeze the snapshot and nested records at the playback boundary. The snapshot includes listener ID, mode, source arrival values, correction by speaker, final arrival values, signed difference, and relative playback offsets. It is created once for each playback or Current Alignment display.

Web Audio and the visual components consume the same snapshot object. Neither recalculates timing. The playback scheduler uses one AudioContext clock and adds the same small lead-in to both sources; each source's scheduled time corresponds to that snapshot's final modeled arrival. Relative offsets are preserved without changing the modeled arrival values. The timeline uses the snapshot's absolute modeled times and the map animation uses those arrival instants scaled by a separately labeled visual slow-motion factor.

The original snapshot always has zero applied speaker emission delay, even when a correction is stored. Playing Original changes only the displayed playback snapshot and playback status; it never clears or modifies the stored correction. The aligned snapshot adds the stored nonnegative emission delay to the selected virtual speaker's geometric arrival. The Current Alignment display is derived from the stored correction and the selected listener even when audio is idle.

The selected listener, correction, status, snapshot, and session identity live only in React/browser memory. No localStorage, IndexedDB, database, account, or saved session. Refresh resets to L1, no correction, Ready. On listener change or Reset: invalidate the active session first, stop scheduled sources, ignore any later completion callbacks, then update listener/correction/snapshot. Listener change retains correction and displays Current Alignment; Reset selects L1 and clears correction.

### Alignment Rule

There is at most one active correction: a nonnegative emission delay on Main or Fill. **Align for This Position** calculates from the uncorrected geometric arrivals at the selected listener and replaces any previous correction with a delay on whichever speaker is earlier in that uncorrected pair, equal to their absolute difference. This makes each explicit alignment action produce approximately equal arrivals at its target without stacking incompatible delays. Merely changing listeners never changes the correction. On a later position, Current Alignment shows the effect of the retained correction; aligning there again is an explicit replacement action.

## Test Plan

`geometry.ts` and `timing.ts` have no React or Web Audio imports. Unit tests use the centralized coordinates and assert distances, arrivals, signed differences, correction target and amount, and resulting arrivals for all three listeners.

- Assert the rounded geometry table values above for L1, L2, and L3.
- Use a numeric tolerance of 0.01 ms for displayed arrival and difference expectations (and 0.01 m for displayed distance); test unrounded calculations at appropriate tighter floating-point tolerance.
- Assert L1 alignment selects Fill, applies approximately +22.07 ms, and produces approximately 0 ms difference at L1.
- With that correction retained, assert L2 is approximately -9.45 ms and L3 approximately +32.87 ms; selecting either listener does not change the correction.
- Assert Original snapshots remain uncorrected after alignment and do not mutate the stored correction; Aligned snapshots include the correction and identify their listener/mode.
- Assert re-aligning explicitly replaces the prior single-speaker correction rather than accumulating it.

Manual browser acceptance verifies actual generated sound, user-click audio activation, perceived original mismatch, tighter aligned playback, original replay remaining uncorrected, L1-to-L3 trade-off, timeline/map snapshot agreement, and recovery from denied or interrupted audio. Verify both laptop speakers and headphones where possible. A browser can verify Web Audio scheduling and node completion, not physical audibility.

## File Structure

```text
.
├── src/
│   ├── main.tsx                         # Vite entry point
│   ├── App.tsx                           # Workspace state and orchestration
│   ├── App.css                           # Workstation layout and component styles
│   ├── index.css                         # Design tokens and global reset
│   ├── acoustics/
│   │   ├── venue.ts                      # Room, speed, speakers, listener coordinates
│   │   ├── geometry.ts                   # Pure distance and uncorrected arrival functions
│   │   ├── geometry.test.ts              # Coordinate and arrival tests
│   │   ├── timing.ts                     # Corrections and immutable snapshots
│   │   └── timing.test.ts                # Alignment and cross-position tests
│   ├── audio/
│   │   ├── createClapBuffer.ts           # Generated reusable short percussion sample
│   │   └── playbackController.ts         # Web Audio schedule/cancel/status boundary
│   └── components/
│       ├── VenueMap.tsx                  # SVG room, markers, paths, pulses
│       └── ArrivalTimeline.tsx            # Snapshot-matched timing markers
├── devpost/
│   ├── learner-profile.md
│   ├── scope.md
│   ├── prd.md
│   └── spec.md
├── index.html
├── .gitignore                            # Preserve existing learner-profile rule; add build outputs
├── package.json
├── package-lock.json
├── tsconfig*.json                        # Vite React/TypeScript scaffold config
└── vite.config.ts
```

## External Services and Dependencies

No runtime external services, APIs, database, hosting, or credentials. Runtime packages are React and the browser's native Web Audio API; Vite and TypeScript are development/build dependencies; Vitest is test-only. SVG and CSS are browser standards. Package versions and Node compatibility are to be verified when the scaffold is created; there are no service calls, rate limits, or usage costs.

## Important Failure Modes

- **AudioContext cannot start, is suspended, or playback scheduling fails** → show Audio Unavailable with Retry Playback and the device/tab-volume hint; keep map/calculations active; do not mark Complete or show a successful finish animation.
- **Listener changes or Reset occurs during playback** → stop sources and invalidate the session before changing state; do not let stale `ended` callbacks restore old markers or status.
- **A delayed completion callback arrives after a newer session** → compare session identity and ignore it unless it is still current and was not canceled.

## What Was Simplified and Why

- Two virtual signals mixed through one browser output instead of driving two physical loudspeakers — avoids equipment and integration requirements while preserving the core audible timing difference.
- Straight-line propagation at a fixed 343 m/s instead of room acoustics — makes the model transparent, testable, and appropriate to the learning goal; reflections, barriers, temperature, and speaker response remain outside the PoC.
- Fixed speaker coordinates and three predefined listeners instead of draggable venue design — keeps the first experience reliable and focused; geometry remains data-driven so interaction can be added later.
- One in-memory session instead of storage or accounts — no persistence is needed for the short demo, and refresh cleanly restores a known baseline.
- A generated short percussion buffer and browser scheduling instead of prerecorded files or audio libraries — keeps the signal identical between versions and avoids assets or dependencies.
- CSS/SVG motion instead of an animation library — keeps the map and timeline behavior lean and tied directly to the calculated snapshot.

## Decisions and Open Issues

- **Learner-selected:** Vite + React + TypeScript, native Web Audio API, SVG, CSS, no backend or heavy audio/animation dependencies.
- **Implementation constraint:** scaffold the app without replacing existing curriculum or Devpost files; preserve the current `.gitignore` rule for `devpost/learner-profile.md` while adding standard generated-output ignores.
- **Learner-approved model:** 20 m × 12 m room, fixed coordinates in `Acoustic Model and Verified Geometry`, speed of sound 343 m/s, Euclidean direct-path distance. The computed values above were recalculated and checked against the proposed results.
- **Learner-selected:** selected listener, correction, and playback state are memory-only; refresh returns to L1, no correction, Ready.
- **Learner-selected:** changing listeners preserves the applied correction, cancels active playback, and returns to a clearly labeled Current Alignment view. Explicit Original/Aligned playback displays its own labeled immutable snapshot; Original never clears the correction.
- **Learner-selected:** correction is modeled as later emission from a virtual speaker. Original/aligned use the same generated signal, and the playback snapshot is shared by audio scheduling and visuals.
- **Implementation rule derived from single-correction behavior:** explicit alignment replaces, rather than stacks, the previous one-speaker correction, calculating against uncorrected geometry at the chosen listener.
- **Important uncertainty to investigate early:** whether a roughly 22.07 ms offset is clearly perceptible with the generated clap-like sound on typical laptop speakers and headphones. The learner accepts these coordinates provisionally; verify by listening in the first build slice and adjust coordinates honestly if needed.
- **Browser limitation:** successful Web Audio node scheduling/completion is not proof a person heard sound; disclose this boundary and never equate button clicks with successful playback.
- No consequential product or architecture choice remains unresolved for review. Exact package versions and the first audibility result are setup/build-time verification items, not blockers to this spec.
