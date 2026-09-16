# ⚡ VoltPad — Electrical Wiring Diagram Studio

A drag-and-drop electrical wiring diagram creator built with **React + Vite**.

## Features

- **Drag & drop components** — load centers, breakers, transformers, receptacles, GFCIs,
  switches, luminaires, fans, motors, junction boxes, splices, ground rods.
- **AWG-aware conductors** — wire thickness scales with real conductor diameter
  (24 AWG = 1px, growing from there) and colour follows a heat ramp:
  24 violet → 18 cyan → 14 yellow → 12 orange → 10 red → 2/0 deep oxblood.
- **Live specs** — diameter (mm), cross-section (mm²), typical ampacity, stroke weight.
- **Pan & zoom canvas** — Ctrl/⌘ + wheel to zoom, drag the background to pan,
  hold Alt while dragging a part to disable grid snapping.
- **Undo / redo**, keyboard shortcuts, custom wire colours, labels.
- **Export** — one-click PNG (2× pixel ratio) and A4 PDF with a branded header.
- **Persistent sessions** — the diagram, viewport and gauge are auto-saved to
  `localStorage` with a **12-month expiry**.
- **Account gate** — username + password are POSTed to an Airtable webhook,
  then the session is cached locally so you don't sign in again.

## Getting started

```bash
npm install
npm run dev
