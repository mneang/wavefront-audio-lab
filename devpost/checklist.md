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

- [x] **2. You can compare alignment across all three listeners without stale playback**
  Becomes usable: Selecting L1, L2, or L3 shows Original timing before any correction and Current Alignment after correction. Listener changes retain the correction, cancel in-flight playback, and safely ignore completion from canceled sessions; Reset returns to L1, no correction, Ready.
  Why now: Once the core audio is real, this completes the defining cross-position trade-off and makes the interaction reliable when users change position mid-playback.
  PRD ref: `prd.md > The Core Journey`, `Venue Map and Listener Selection`, `Original and Aligned Playback`, `Playback Status and Failure`, `States and Boundaries`.
  Spec ref: `spec.md > The Core Journey Through the System`, `Components`, `Acoustic Model and Verified Geometry`, `Timing Snapshot and Data Flow`, `Alignment Rule`, `Test Plan`, `Important Failure Modes`.
  Build: Add React listener selection and separate selected position, stored correction, displayed timing snapshot, playback state, and active session identity. Show all three calculated results and retained correction. Cancel playback on listener change/reset, reject stale callbacks, and keep Original snapshots uncorrected.
  Verify (mechanical): Run `npm run test -- --run` and `npm run build`; verify state/snapshot tests for all listeners, retained correction, Original replay, cancellation, and reset.
  Learner check: Learner reviewed screenshots at L1/L2/L3 after applying the L1 correction and confirmed 0.00 ms, -9.45 ms, +32.87 ms, and retained Fill +22.07 ms. Earlier hands-on playback confirmed the Original/Aligned audio difference. Controller tests cover pending-activation cancellation and stale completion; Reset and listener changes both call the cancellation path.
  Commit: `Add listener comparison and safe playback cancellation`

- [x] **3. You can see the calculated sound journey in the venue map and timeline**
  Becomes usable: The main workspace shows the fixed speakers, selectable listeners, sound paths, timing panel, and instrument-style timeline. Map pulses and timeline markers use the exact labeled Original, Aligned, or Current Alignment snapshot used by playback; the workspace is clear and usable on a laptop.
  Why now: With geometry and audio behavior already proven, this connects the visible centerpiece to working data rather than risking a polished animation that only simulates the kernel.
  PRD ref: `prd.md > Screens and Layout`, `Look and Feel`, `Venue Map and Listener Selection`, `Original and Aligned Playback`, `Playback Status and Failure`.
  Spec ref: `spec.md > Look and Feel`, `Components`, `Timing Snapshot and Data Flow`, `Test Plan`, `Important Failure Modes`.
  Build: Add the SVG venue map and arrival timeline, map-based listener selection, selected-listener focus, paths and accurately ordered pulses. Label slow-motion visualization where used. Add the title/model disclosure, timing/correction panel, controls, playback states and recovery copy; refine responsive workstation styling without adding screens or unrelated features.
  Verify (mechanical): Run `npm run test -- --run` and `npm run build`; manually exercise Original → Align → Aligned playback → select L3, and confirm displayed labels/markers match each timing snapshot.
  Learner check: Learner tested the complete experience and approved it: venue and listener selection, Original/Aligned playback, L1 marker alignment, retained +22.07 ms Fill correction and +32.87 ms L3 trade-off, playback controls, listener changes, reset, timeline, and animations all behaved as expected; no blocking issues.
  Commit: `Connect timing snapshots to venue visualization`

## Hands-on Checkpoints

- [x] Early usable behavior explored — learner clearly heard two closely spaced Original impacts and a tighter Aligned sound; controls worked, no issues were reported, and the approved coordinates are retained.
- [x] Final kick-the-tires exploration and feedback completed — learner exercised the full Slice 3 acceptance areas, reported no blocking issues, and approved the proof of concept.

## Final Review

- [x] Final review complete — all learner feedback resolved; automated checks pass and learner explicitly approved the completed proof of concept.

## Code Tour and App Map

- [x] Learning activity complete — focused recap connected the 22.07 ms audibility uncertainty to coordinate-based tests and the learner's successful listening check.
- [x] Optional edit and transfer reflection addressed — no optional code edit was needed before shipping; transfer practice already reflected in the learner's deliberate prioritization of real audio proof and verification.
- [x] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: Focused recap of the learner's uncertainty about whether a calculated 22.07 ms L1 gap would be perceptible. `src/acoustics/geometry.test.ts` and `src/acoustics/timing.test.ts` verify the modeled values; the learner's Slice 1 listening check confirmed the audible result on their setup.
Route and stops: Reference route only, not a live tour: `src/App.tsx` (`play`, `selectListener`); `src/acoustics/geometry.ts` (`calculateGeometricArrivals`); `src/acoustics/timing.ts` (`createPlaybackSnapshot`); `src/audio/playbackController.ts` (`play`); `src/components/VenueMap.tsx`; `src/components/ArrivalTimeline.tsx`).
Edit outcome: Not applicable; no optional code edit was requested or needed before shipping.
Reflection: Already covered by the learner's repeated choice to prioritize real audio proof, measurement-derived values, and early verification.
Activity mode: Focused alternative using completed hands-on practice, followed by a brief evidence-based recap.

## Revisions

- Kept the one-use workspace header, timing panel, and playback controls inline in `App.tsx`, with styles split between `App.css` and `index.css`, instead of introducing separate files for each; the map and timeline remain separate because their SVG rendering is a distinct behavior. This keeps the first working POC lean without changing approved behavior.
