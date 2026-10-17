---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [x] **1. You can verify the L1 timing and hear original versus aligned audio**
  Becomes usable: A local WAVEFRONT app calculates L1's arrival times from coordinates, shows the approximately 22.07 ms difference, and plays the same generated sound as two correctly timed virtual signals before and after applying the calculated Fill delay. Playing Original remains uncorrected.
  Why now: This bootstraps Vite inside a runnable behavior and tests the kernel's riskiest assumptions first: calculated timing, correct Web Audio scheduling, and whether the honest default mismatch is perceptible before investing in the complete visual workspace.
  PRD ref: `prd.md > The Core Journey`, `Original and Aligned Playback`, `Playback Status and Failure`.
  Spec ref: `spec.md > Stack`, `Where It Runs and How Someone Tries It`, `Acoustic Model and Verified Geometry`, `Timing Snapshot and Data Flow`, `Alignment Rule`, `Test Plan`, `playbackController`.
  Build: Scaffold Vite + React + TypeScript without overwriting existing files; preserve the learner-profile ignore rule and add local credential ignores while allowing `.env.example`. Implement centralized venue coordinates, pure distance/arrival/correction/snapshot functions and tests for L1/L2/L3. Add the generated clap buffer and Web Audio playback with explicit click activation, Original/Aligned selection, audio failure/retry behavior, and a minimal readable workbench for trying the L1 before/after sound. Keep dependencies to the spec.
  Verify (mechanical): Run `npm run test -- --run` and `npm run build`; inspect test results for the expected coordinate/alignment values and confirm no build errors.
  Learner check: Start the app with `npm run dev -- --host 0.0.0.0`. At the forwarded local URL, play Original at L1, apply alignment, play Aligned, then play Original again. Try laptop speakers or headphones and report whether the initial mismatch and tighter aligned result are clearly perceptible; also check that Original stays uncorrected.
  Commit: `Prove calculated L1 audio alignment`

- [ ] **2. You can compare alignment across all three listeners without stale playback**
  Becomes usable: Selecting L1, L2, or L3 shows Original timing before any correction and Current Alignment after correction. Listener changes retain the correction, cancel in-flight playback, and safely ignore completion from canceled sessions; Reset returns to L1, no correction, Ready.
  Why now: Once the core audio is real, this completes the defining cross-position trade-off and makes the interaction reliable when users change position mid-playback.
  PRD ref: `prd.md > The Core Journey`, `Venue Map and Listener Selection`, `Original and Aligned Playback`, `Playback Status and Failure`, `States and Boundaries`.
  Spec ref: `spec.md > The Core Journey Through the System`, `Components`, `Acoustic Model and Verified Geometry`, `Timing Snapshot and Data Flow`, `Alignment Rule`, `Test Plan`, `Important Failure Modes`.
  Build: Add React listener selection and separate selected position, stored correction, displayed timing snapshot, playback state, and active session identity. Show all three calculated results and retained correction. Cancel playback on listener change/reset, reject stale callbacks, and keep Original snapshots uncorrected.
  Verify (mechanical): Run `npm run test -- --run` and `npm run build`; verify state/snapshot tests for all listeners, retained correction, Original replay, cancellation, and reset.
  Learner check: Align at L1, select L3, and confirm the Current Alignment view shows Fill delay about +22.07 ms and a remaining difference about +32.87 ms without replaying. Start playback and switch listeners before it finishes; confirm the old playback and completion state do not reappear.
  Commit: `Add listener comparison and safe playback cancellation`

- [ ] **3. You can see the calculated sound journey in the venue map and timeline**
  Becomes usable: The main workspace shows the fixed speakers, selectable listeners, sound paths, timing panel, and instrument-style timeline. Map pulses and timeline markers use the exact labeled Original, Aligned, or Current Alignment snapshot used by playback; the workspace is clear and usable on a laptop.
  Why now: With geometry and audio behavior already proven, this connects the visible centerpiece to working data rather than risking a polished animation that only simulates the kernel.
  PRD ref: `prd.md > Screens and Layout`, `Look and Feel`, `Venue Map and Listener Selection`, `Original and Aligned Playback`, `Playback Status and Failure`.
  Spec ref: `spec.md > Look and Feel`, `Components`, `Timing Snapshot and Data Flow`, `Test Plan`, `Important Failure Modes`.
  Build: Add the SVG venue map and arrival timeline, map-based listener selection, selected-listener focus, paths and accurately ordered pulses. Label slow-motion visualization where used. Add the title/model disclosure, timing/correction panel, controls, playback states and recovery copy; refine responsive workstation styling without adding screens or unrelated features.
  Verify (mechanical): Run `npm run test -- --run` and `npm run build`; manually exercise Original → Align → Aligned playback → select L3, and confirm displayed labels/markers match each timing snapshot.
  Learner check: At the local app, follow the full L1-to-L3 demonstration. Confirm the selected listener is clear, arrivals appear in the same order as the numbers and sound, the alignment markers converge at L1, and the retained Fill delay creates the expected L3 trade-off.
  Commit: `Connect timing snapshots to venue visualization`

## Hands-on Checkpoints

- [x] Early usable behavior explored — learner clearly heard two closely spaced Original impacts and a tighter Aligned sound; controls worked, no issues were reported, and the approved coordinates are retained.
- [ ] Final kick-the-tires exploration and feedback completed — after Slice 3, exercise the complete L1 → alignment → L3 flow and identify any fixes before marking the proof of concept ready.

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — focused investigation of the shared immutable timing snapshot and how it keeps the geometry, Web Audio scheduler, and visible markers consistent.
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: [what actually happened; real document/test/code references; unfinished work if interrupted]
Route and stops: [actual paths and symbols; guided stops completed, or reference-only route]
Edit outcome: [tried/kept/reverted/declined/not applicable; verification if changed]
Reflection: [offered/answered/declined/already covered — personal answer belongs only in the ignored profile]
Activity mode: [live app and editor, explicit static fallback, focused alternative, prior practice, or recap]

## Revisions
