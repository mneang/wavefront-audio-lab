---
doc: prd
status: approved
---

# WAVEFRONT — Product Requirements

A browser-based audio rehearsal workspace that helps beginners and volunteer AV operators understand speaker arrival-time differences before setting up a real small venue.
Source: `scope.md > Who It's For`, `The Unique Kernel`.

## The Core Journey

1. The user opens one ready-to-use workspace with a small-venue map, two labeled speakers (Main and Fill), and three selectable audience positions. One position is selected, with an initial layout whose calculated arrival-time difference is clearly audible.
2. The user chooses **Hear the Difference**. The selected listener becomes the focus. Both speakers play the same short clap-like sound, scheduled according to their calculated arrivals. Sound-wave pulses travel toward the selected listener; the display shows each arrival time, the difference in milliseconds, and two markers on an arrival timeline. The wave animation may run in clearly labeled slow motion, but the audio and all displayed timing derive from the same calculations.
3. After playback completes, the arrival markers remain visible, the difference is highlighted, and a short explanation states that the sounds reach this position at different times. **Align for This Position** is the clear next action.
4. The user selects **Align for This Position**. WAVEFRONT calculates which speaker arrives first and applies the required delay to that speaker. The correction and new arrival-time difference appear; at the selected position the markers converge and the difference is approximately 0 ms. The user can separately select **Play Aligned** to hear the same sound with the correction applied.
5. The user can replay the original and aligned versions with straightforward controls. They can select another audience position: the applied speaker delay stays unchanged, while arrival times and the difference update for that listener. The new position may show that the previous alignment is no longer ideal. WAVEFRONT does not automatically optimize every position.

## Screens and Layout

One main workspace, with no onboarding or separate dashboard. The prominent WAVEFRONT title and brief purpose statement sit with a central top-down venue visualization that occupies more space than the controls. The map shows the Main and Fill speakers, sound paths, and three audience positions; the selected position is unmistakable. A compact timing panel and simplified measurement-style arrival timeline show calculated values and markers. Audio actions and playback status sit near the timing information. The layout should fit a laptop screen without excessive scrolling.

## Look and Feel

A premium audio-engineering workstation, approachable to beginners and inspired by professional audio production and measurement tools such as RME TotalMix, Room EQ Wizard, and modern digital mixing consoles. Use a deep charcoal or midnight-navy foundation with subtle panel separation; cyan or electric blue for Main/Speaker A and warm amber for Fill/Speaker B, consistently across map elements, paths, wavefronts, and timeline markers; and restrained green for successful alignment. Use clean sans-serif typography with monospaced timing values, crisp lines, subtle grid markings, and professional instrument-style readouts. Keep the venue visualization as the centerpiece. Use purposeful motion and clear selected, action, and playback states; avoid decorative particles, excessive glow, gradients, and motion that obscures or overstates the calculations. Communicate precision without implying professional measurement accuracy.

## Features and Behavior

### Venue Map and Listener Selection

- Start with a preconfigured small-venue layout containing two clearly labeled speakers (Main and Fill) and three selectable audience listening positions; one position is selected by default.
- Keep speaker positions fixed in the proof of concept, but represent their locations and listener locations as real positions used to calculate sound arrivals; do not substitute hardcoded arrival-time values.
- Focus the selected listener during playback and clearly distinguish each speaker's sound path and wavefront.
- Keep the map and calculated timing information available regardless of audio playback availability.
- Selecting another listener updates position-dependent arrival calculations but does not change the applied speaker delay or automatically align that position.
- Clearly disclose that the display uses a simplified geometric sound-arrival model, not physical venue measurements or room simulation. Identify any relevant simplifications in plain language.
Source: `scope.md > The Core Loop`, `What "Working" Looks Like`, `The POC Boundary`.

### Original and Aligned Playback

- Provide a prominent **Hear the Difference** action for the initial uncorrected playback. The two speakers play the same short generated clap- or percussion-like sound with the calculated arrival offset.
- Show both calculated arrival times and their difference in milliseconds, plus two corresponding timeline markers. The same arrival calculations govern playback and the displayed times and markers; do not exaggerate the sound delay independently of the model.
- Configure the default venue geometry to produce a clearly perceptible timing mismatch while remaining plausible for a small venue. Verify audibility during implementation; if needed, adjust the geometry rather than falsifying the timing.
- After the original playback completes, keep the markers visible, highlight the difference, explain that the arrivals differ at the selected position, and make **Align for This Position** the next clear action.
- Aligning applies a calculated delay to whichever speaker's sound arrives earlier at the selected listener. Show the applied correction and updated difference; the selected position should reach approximately 0 ms difference and the timeline markers should visibly converge.
- Make **Play Aligned** available after alignment so the user explicitly triggers playback of the same sound with the correction. Keep simple controls to replay both the uncorrected original and aligned versions.
- At another listener position, the original remains uncorrected and the aligned version uses the already applied speaker delay. Recalculate and show the resulting difference at that position without silently moving the delay.
- Wavefront animation may use labeled slow motion for legibility; it must reflect the same arrival ordering and calculations as the playback, and must not imply real-time propagation speed if slowed.
Source: `scope.md > The Unique Kernel`, `The Core Loop`, `What "Working" Looks Like`, `The POC Boundary`.

### Playback Status and Failure

- Show straightforward playback states: **Ready**, **Playing**, **Complete**, and **Audio Unavailable**.
- Mark playback **Complete** only when the browser reports that the scheduled playback ran to completion while audio remained available. A click alone is not evidence of completion. Do not claim the user physically heard it; the browser cannot reliably verify that.
- If audio cannot start or fails, show an unobtrusive message near the audio controls, such as “Audio couldn't play. Check your device's sound settings and try again.” Offer **Retry Playback** as a normal user-initiated action so browser audio activation can occur through a click.
- Include a brief troubleshooting hint, such as “Check that your tab isn't muted and your output volume is on.”
- On failure, do not show completed playback animation or claim a successful audible comparison. Preserve the selected listener and any applied delay. Keep the map and geometric calculations usable, and clearly distinguish calculated exploration from a verified playback demonstration.
Source: `scope.md > What "Working" Looks Like`, `The POC Boundary`, `Explicitly Cut`.

## States and Boundaries

- **Initial / Ready** — the default map, selected audience position, calculated arrival times, and uncorrected timing difference are visible; the original playback action is available.
- **Playing** — playback is underway; corresponding map pulses and timeline arrivals are shown. Prevent ambiguous overlapping playback actions until this playback completes or fails.
- **Complete** — playback completion is confirmed by the browser; arrival markers and results remain visible, with the next relevant action available.
- **Aligned** — the calculated delay is applied; updated correction and selected-position result are shown, and **Play Aligned** is available.
- **Different listener selected** — recalculate for the selected position while retaining the currently applied delay; do not auto-align.
- **Audio Unavailable** — show recovery guidance and retry; preserve map, calculations, listener selection, and applied delay. Do not report playback success.
- **Simplified model** — sound arrival is calculated from geometric distances under the model's stated assumptions. The interface is not a substitute for measurement or room acoustics analysis.

## Product Decisions

- Prioritize one polished main workspace and the real audible alignment loop over additional features.
- Start with two prepositioned speakers and three audience positions so first use requires no setup; the first action is **Hear the Difference**.
- Keep both speakers fixed in a carefully designed default venue layout, while using their real positions in the timing calculations. This keeps the demonstration reliable without constraining future acoustic logic.
- Delay application and aligned playback are separate actions: **Align for This Position**, then **Play Aligned**.
- Keep an applied delay fixed when the user changes listening positions; require an explicit alignment action to change it.
- Share one source of geometric timing calculations across audio scheduling, displayed values, and timeline/map visualization. Do not manipulate audio separately to make an effect appear stronger.
- Be explicit about the simplified acoustic model and about the browser's inability to verify that a person physically heard playback.
- Keep audio failure feedback lightweight and preserve the non-audio exploration path.

## What We're Building

A single laptop-friendly browser workspace with a preconfigured two-speaker/three-listener venue map; position-based timing calculations; audible original and aligned playback of one generated sound; map pulses, arrival readouts, and a timeline driven by those same calculations; explicit single-position alignment and cross-position comparison; clear model limitations; and honest playback states and recovery behavior.

## Deferred From the POC

- Account, database, and saved-project behavior: not needed for the single-session demonstration.
- External sound equipment and complicated integrations: the experience should run in the browser on its own.
- Professional measurement, room simulation, or claims of real venue accuracy: outside the simplified geometric model.
- Draggable or repositionable speakers: not needed to demonstrate listener-dependent arrival timing and single-position alignment; the fixed setup is easier to understand and verify.
- Multiple dashboards or unrelated product features: they dilute the core interaction and exceed the proof-of-concept boundary.

## Possible Later Enhancements

Draggable speaker positioning, more advanced acoustic or room modeling, broader venue configurations, and additional product features may be considered after the core demonstration is working reliably.

## Non-Goals

- Replacing professional acoustic measurement or venue-tuning tools; the model is educational and simplified.
- Automatically optimizing timing for the whole venue; alignment is explicitly for one selected position at a time.
- Confirming that the user physically heard audio; browser playback state cannot establish that.
- Requiring accounts, stored data, external equipment, uploads, or complex integrations for the core demo.

## Open Questions

No unresolved product decisions block the technical spec. The exact default coordinates and implementation details are for `4-spec` to define while preserving the approved requirements: a plausible, clearly audible default mismatch; position-based arrival calculations; and no artificially exaggerated delay.
