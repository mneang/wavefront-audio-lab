---
doc: scope
status: approved
---

# WAVEFRONT

A browser-based audio rehearsal studio that makes speaker timing differences visible and audible through a simplified geometric venue model.

## The Unique Kernel
Users hear two speakers arrive at different times at an audience position, align the earlier speaker for that position, then hear and see how the improvement changes at another position. The real sound and position-based timing calculation make the adjustment demonstrable rather than a hardcoded animation.

## Who It's For
The primary audience is beginners and volunteer AV operators setting up speakers for school auditoriums, community events, and small venues. They may not understand why two speakers playing the same sound can produce an audible timing mismatch at different audience positions; WAVEFRONT helps them explore the problem interactively before attempting a real setup. People learning audio engineering are a secondary audience.

## The Core Loop
Choose a listening position, play a test sound, inspect the calculated arrival times and their difference, align for that position, then play again and compare. Select another position to explore how the chosen delay affects timing elsewhere in the venue.

## Inspiration & Identity
An engaging, visually memorable professional audio lab: interactive and intuitive, technically credible, and focused on the sound-and-visual experience rather than a generic dashboard or chatbot. No external visual references were named.

## Why This Matters to the Learner
The learner wants to apply plan-first development deliberately, prove the core audio experience early, and refine it into a polished, reliable demonstration. They want important acoustic assumptions and trade-offs explained without needing to be an audio engineer.

## What "Working" Looks Like
In an under-three-minute demonstration, someone opens a default speaker and audience layout designed so its position-based timing difference is clearly audible, selects a listening position, and hears a test sound arrive separately from the two speakers. The venue view shows the sound paths and calculated arrival times and difference. They align for that position, replay the same sound, and hear a noticeably tighter result while the displayed difference drops to approximately zero. Selecting another position reveals that the adjustment may not be optimal across the venue. Speaker and listener positions drive the genuine timing calculations, and the audio playback and visual timing use those same calculations; the sound is not exaggerated independently of the displayed values.

## The POC Boundary
Build one polished end-to-end browser experience: a simple top-down venue map with two virtual speakers and several selectable listening positions; a default layout with a clearly audible, position-based arrival difference; genuine geometric sound-arrival timing calculations shared by the audio playback and its visualization; a short generated test sound with audible pre- and post-alignment playback; an alignment action that delays the earlier-arriving speaker for the selected position; and a way to compare the effect at another listening position. Help beginners understand the timing problem before attempting a real setup. Explain that this is a simplified geometric sound-arrival model, not a professional acoustic measurement or room simulation.

## Later
More advanced acoustic or room modeling, additional venue and speaker configurations, and broader product features can wait until the core demonstration is reliable. These are possibilities, not commitments.

## Explicitly Cut
- Accounts and a database: not needed to demonstrate the core interaction.
- External sound equipment and complicated integrations: the proof of concept should work in the browser on its own.
- Professional venue measurement or room simulation: outside the intended simplified geometric model and misleading for this short demonstration.
- Unrelated features: the learner prefers to perfect the core interaction over adding breadth.
