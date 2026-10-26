# WAVEFRONT

**Hear where timing breaks.** Two virtual speakers. Three listening positions. One fix that makes another seat worse.

**[▶ Try the live lab](https://mneang.github.io/wavefront-audio-lab/)** · No login · Headphones recommended

## Problem

Two speakers can play the same sound, yet their signals reach audience positions at different times. Correcting that mismatch for one listener can make it worse for another.

## Why existing approaches fall short for beginners

Static diagrams show timing numbers but cannot let you **hear** them. Professional acoustic tools serve real-world measurement, not a quick conceptual introduction. WAVEFRONT bridges the learning gap with a ready-to-use browser experiment—no measurement equipment needed.

## Live demo: 60-second challenge

1. **Hear it:** At **L1**, press **Hear the Difference**. Fill arrives **22.07 ms earlier** than Main.
2. **Align it:** Press **Align for This Position**, then **Play Aligned**. A **+22.07 ms delay** brings L1's modeled difference to **0.00 ms**.
3. **Question it:** Select **L3** without resetting. Compare **Play Original** (**+10.80 ms**) with **Play Aligned** (**+32.87 ms**)—the mismatch is now **over three times larger**.

**One correction. Different seats. Different outcomes.**

## Architecture

**Venue coordinates → TypeScript sound-travel model (343 m/s) → one timing snapshot → native Web Audio + SVG visualization.** Two scheduled copies of a generated clap create the audible result; the venue map and arrival timeline follow the *same calculations*, not a hardcoded animation. Built with **React, Vite, TypeScript, SVG/CSS, and Vitest**. No backend or external API.

## Sponsor technology & learning process

Built with **Devpost's Learn Skill Pack** and **GitHub Copilot**, progressing from [scope](devpost/scope.md) → [product requirements](devpost/prd.md) → [technical spec](devpost/spec.md) → [verified build stages](devpost/checklist.md). My first test was whether the mathematically calculated **22 ms** gap could actually be heard; I validated the sound *before* building out the visual workspace.

## Impact

For beginner audio learners and volunteer AV operators, WAVEFRONT makes speaker timing **visible, audible, and explorable** before working with real equipment. It is a simplified educational simulation—not a professional acoustic measurement or room-calibration tool.

## Screenshots

<img width="960" height="540" alt="WAVEFRONT: L1 aligned at 0.00 ms while the same correction produces a +32.87 ms difference at L3" src="https://github.com/user-attachments/assets/055a317f-14d2-48dc-8e3f-c3c59dfb1387" />

## Future work

Editable speaker layouts, guided lessons, and richer acoustic models.

**Run locally:** `npm ci` → `npm run dev` · **Check:** `npm run test -- --run` · [MIT License](LICENSE)
