# DataXAI — ArchitectXperience corporate site

A modern, premium marketing site for **DataXAI ArchitectXperience**, rebuilt from
`dataxai-compact-preview.html` with the same layout and sections and the colour
theme retained from [www.dataxai.in](https://www.dataxai.in).

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Main page (hero, experience, business value, partnership enquiry) |
| `thank-you.html` | Post-enquiry confirmation page (form `action` target) |
| `styles.css` | All styling and design tokens |
| `script.js` | Nav, tab panel + auto-advance, scroll-reveal, count-up, hero tilt |
| `assets/logo-mark.png` | DataXAI wordmark only (transparent) — used in the header, with the tagline set as live text |
| `assets/logo.png` | Full DataXAI logo incl. tagline (transparent) — spare |
| `assets/favicon.png` | Favicon |
| `assets/archxp.jpg` | Hero visual (the ArchitectXperience overview: Discovery → Architecture Studio → AI Review) |
| `assets/value-scene.jpg` | Photo/hologram scene used in the "Business value" section (decorative only — all copy is real HTML text). |
| `assets/enquiry-visual.jpg` | Side image in the Partnership enquiry section (hidden below 920px). |
| `assets/{learn,think,discover,design,challenge,prove}.jpg` | Journey stage images (16:9). Replace any file in place to swap a stage image; a missing file just hides that stage's image frame. |
| `.claude/launch.json` | Local dev-server config for the Claude Code preview |

## Design

- **Colour theme** taken from `dataxai.in`: near-black surfaces (`#05070d`, `#0a0e1a`,
  `#0d1220`) with a blue → indigo → violet → cyan brand gradient
  (`#60a5fa`, `#8b5cf6`, `#22d3ee`) and an amber highlight.
- **Type**: Manrope (Google Fonts) with a system fallback stack.
- All tokens live in `:root` in `styles.css`.

## Animations (section-specific, purposeful)

- **Global** — thin gradient scroll-progress bar; drifting aurora field.
- **Hero** — word-by-word headline reveal, continuously flowing gradient on the
  accent words, a slow "focus tour" on the visual that pans and zooms across
  Discovery → Architecture Studio → AI Review on a loop with a synced caption
  chip and progress dots, count-up proof stats (`6 / 5 / 100%`), animated scroll cue.
- **Experience** — journey panel scales in; per-stage light-sweep on the image +
  slow ken-burns; ghost stage number; deliverable "chips" that stagger in; a
  smooth auto-advance timer on the progress rail (pauses on hover/focus, runs only
  while in view); live "Stage N of 6" counter; active-tab pip.
- **Business value** — real HTML text (crisp at any zoom) laid out to echo the
  reference design: heading + intro beside a framed photo/hologram scene, then
  three role cards with drawn icons. Compacts on short viewports so the whole
  section stays on one screen.
- **Partnership** (nav "Partnership" target) — the enquiry form as an on-page
  two-panel card (form + `enquiry-visual.jpg` scene); all "Request a demo" /
  "See the platform in action" links jump here. Single column below 920px.
- **Footer** — animated link underlines.

Every effect is neutralised under `prefers-reduced-motion: reduce`. Content is
never gated behind an animation: a `<noscript>` block, `.js`-scoped hide rules,
and JS safety-nets (rAF + `setTimeout` fallbacks, an on-load reveal sweep)
guarantee text and images are visible even if scripts or the frame loop stall.

## Run locally

```bash
python -m http.server 4173
```

Then open <http://localhost:4173>. (Opening `index.html` directly with `file://`
also works; the enquiry form shows a preview-only notice instead of submitting.)

## Deploy

The enquiry form (an on-page section, `#partnership`) is wired for
**Netlify Forms** (`data-netlify="true"`, hidden `form-name`, honeypot). Fields:
name, email, company, role, message. On any other host, point the form
at your own handler and keep `action="/thank-you.html"` (or update it). Form
notifications must be configured on the host before the site goes live.
