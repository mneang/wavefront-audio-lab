# WAVEFRONT

**An interactive audio rehearsal lab for exploring speaker timing.**

WAVEFRONT helps beginners and volunteer AV operators understand why two speakers playing the same sound may reach audience positions at different times. Select a listener in the venue map, hear the modeled arrival gap, align for that position, then compare the result at another listener.

## What It Does

- Shows a top-down 20 m by 12 m venue with two virtual speakers and three audience listening positions.
- Calculates speaker-to-listener distances and sound arrival times from coordinates.
- Plays one generated percussion sound through two virtual signals using the browser's Web Audio API.
- Applies an emission delay to the earlier-arriving virtual speaker and compares Original with Aligned playback.
- Shows arrival times, signed timing difference, sound paths, animated wavefronts, and a matching arrival timeline.
- Demonstrates the trade-off: aligning at L1 leaves approximately 0 ms difference there, while the retained correction produces approximately +32.87 ms at L3.

## Try It Locally

Requirements: Node.js and npm versions compatible with Vite 8, plus a modern browser with Web Audio API support.

```sh
npm install
npm run dev -- --host 0.0.0.0
```

Open the local URL printed by Vite, normally `http://localhost:5173/`. Start playback with the on-screen button to activate browser audio. Use headphones or speakers at a comfortable volume.

Run the checks:

```sh
npm run test -- --run
npm run build
```

## The Model

The room dimensions are 20 m by 12 m. Coordinates are measured in metres from the front-left corner. Main is at `(3, 1)`, Fill is at `(14, 5)`, and the listening positions are L1 `(12, 9)`, L2 `(17, 10)`, and L3 `(3, 9)`. Arrival time is calculated from straight-line distance using a fixed speed of sound of 343 m/s.

| Listening position | Original Fill − Main | With the L1 Fill correction |
| --- | ---: | ---: |
| L1 | −22.07 ms | 0.00 ms |
| L2 | −31.52 ms | −9.45 ms |
| L3 | +10.80 ms | +32.87 ms |

A positive correction means a later emission from the virtual speaker; it does not change sound speed. The two virtual signals are mixed through one browser audio output, not sent to separate physical loudspeakers.

This is a simplified geometric sound-arrival model, not a venue measurement or room-acoustics simulator. It does not account for reflections, barriers, temperature, speaker response, or device latency. The browser can report that scheduled audio sources finished; it cannot confirm what a listener physically heard. The default timing has been verified as audible on the project author's setup, but audibility can vary by device and listening conditions.

## Built With

Vite, React, TypeScript, native Web Audio API, SVG, CSS, and Vitest. No backend, database, account, or external API is required.

## Project Documents

- [Approved scope](devpost/scope.md)
- [Product requirements](devpost/prd.md)
- [Technical specification](devpost/spec.md)
- [Build checklist and verification record](devpost/checklist.md)
- [Code and data-flow map](devpost/app-map.html)

## License

Released under the MIT License. See [LICENSE](LICENSE).
