# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project goal

Build a **static landing-page website for a fictional transport / logistics
company**, using the project-level web-design skills (see below) to drive the
visual direction and implementation.

- It is a static site (no backend); the deliverable is HTML/CSS/JS that can be
  served from any static host.
- Use the installed design skills for layout, styling, and image direction
  rather than producing generic, templated UI.
- The specific content (company name, sections, copy, palette, imagery) will be
  provided by the user separately — do not invent these details; ask if unclear.

## Current state

The static landing page is built. It is the fictional **BMS Enterprise**
passenger-transport company on the **Bavaria · Maserada · Sacile** line, themed
as an **LCARS** (Star Trek) interface — this is the single chosen style system;
do not mix in others.

Site files:

- `index.html` — single page: header/nav, hero, mezzi (3 inline-SVG vehicle
  cards), mappa, footer, plus a `<dialog>` ticket-purchase modal.
- `styles.css` — full LCARS theme (color tokens, elbow panels, responsive
  breakpoints, `prefers-reduced-motion`, dark Leaflet tiles).
- `main.js` — Leaflet map init (stops + POIs) + the fake (client-side only)
  ticket flow. The `STOPS` and `POIS` data arrays hold the line content.
- `assets/fonts/` — self-hosted woff2: Antonio (UI) and Orbitron (wordmark).
- `README.md` — how to serve + line data notes.
- `FERMATE.md`, `POIS.md` — source content (stops + points of interest) that the
  `STOPS` / `POIS` arrays in `main.js` were populated from.

Tooling (unchanged):

- `skills-lock.json` — pins installed Claude Code skills to source repos and
  content hashes (analogous to a package lockfile).
- `.claude/skills/` — the installed skill bundles referenced by the lockfile.

### Run / serve

No build step. Serve the folder statically:

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

The Leaflet map (CDN + OpenStreetMap tiles) needs network at runtime; everything
else works offline.

### Content notes

- `STOPS` and `POIS` in `main.js` are populated from `FERMATE.md` / `POIS.md`.
  Stop coordinates were geocoded from addresses via Nominatim/OSM; add more POIs by
  appending to the `POIS` array (schema `{ name, coords: [lat, lng], desc }`).
- The Star Trek logo uses **Orbitron** (a free OFL lookalike); real Trek fonts are
  proprietary and not bundled.

## Design skills (use these for this project)

The skills here are all frontend/visual-design oriented and are sourced from
external GitHub repos (`Leonxlnx/taste-skill`, `emilkowalski/skill`). For this
landing page, reach for them as follows:

- Start with `design-taste-frontend` (the current default build skill) for the
  actual page, and `impeccable` for UX/visual polish and review passes.
- Use `imagegen-frontend-web` to art-direct/generate hero and section imagery,
  and `brandkit` if the fictional company needs a logo / identity.
- Pick **one** style system to keep the site coherent (e.g. `minimalist-ui`,
  `high-end-visual-design`, or `industrial-brutalist-ui`) — don't mix them.

Full list of installed skills, by group:

- **Frontend build/redesign**: `design-taste-frontend` (current default),
  `design-taste-frontend-v1` (legacy), `frontend-design`, `impeccable`,
  `redesign-existing-projects`, `emil-design-eng`.
- **Image-direction / generation**: `imagegen-frontend-web`,
  `imagegen-frontend-mobile`, `image-to-code`, `brandkit`.
- **Style systems**: `minimalist-ui`, `industrial-brutalist-ui`,
  `high-end-visual-design`, `gpt-taste`, `stitch-design-taste`.
- **Output control**: `full-output-enforcement`.

`skills-lock.json` and `.claude/skills/` must stay in sync: each entry in the
lockfile (`source`, `skillPath`, `computedHash`) corresponds to an installed
bundle under `.claude/skills/<name>/`. Do not hand-edit installed skill files
without updating the lockfile, and vice versa.
