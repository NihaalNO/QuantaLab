---
name: quantalab-frontend-design
description: >
  Create production-grade, research-oriented frontend interfaces for Quantalab —
  a quantum debugging and research sandbox platform. Use this skill when building
  any UI component, page, dashboard, visualization, or artifact within the Quantalab
  ecosystem. Generates interfaces that feel scientifically rigorous, technically
  credible, and aesthetically coherent for quantum computing researchers and engineers.
audience: Quantum computing researchers, quantum engineers, advanced physics/CS students, academic institutions
domain: Quantum Computing · Scientific Research · Developer Tooling · Data Visualization
license: Complete terms in LICENSE.txt
---

## Context & Audience

Quantalab serves a technically elite, research-oriented audience:

- **Quantum researchers** who need precision, reproducibility, and trust in data
- **Quantum engineers** who work with circuit diagrams, noise models, and gate-level analysis
- **Advanced students** exploring quantum algorithms and simulation pipelines
- **Academic collaborators** who export results for publication

These users are comfortable with complexity and density. They expect interfaces that look and behave like professional scientific instruments — not consumer apps. Clarity, precision, and information density take priority over decoration, but the aesthetic should still inspire confidence and intellectual rigor.

---

## Design Philosophy

### Core Aesthetic Direction: **"Scientific Dark Lab"**

Quantalab's interface should feel like the control panel of a high-end physics research facility — dark, precise, grid-aware, and deeply technical. Think oscilloscope readouts, particle collision dashboards, quantum circuit diagrams on dark terminals.

- **Primary tone**: Authoritative, precise, research-grade
- **Visual metaphor**: Quantum lab instrumentation — circuit boards, wavefunction plots, lattice grids
- **Mood**: Focused, intelligent, slightly futuristic — not playful, not corporate

### What Makes It Unforgettable

A Quantalab UI should feel like it was built *for physicists, by physicists*. The one thing users remember: **information feels trustworthy and intentional**. Every number, chart, and layout decision signals rigor.

---

## Color System

Commit to a **dark-first** color palette with high-contrast scientific accents.

```css
:root {
  /* Base surfaces */
  --bg-void:        #050810;   /* deepest background — near black with blue undertone */
  --bg-base:        #0a0f1e;   /* primary surface */
  --bg-raised:      #0f1629;   /* elevated cards, panels */
  --bg-overlay:     #161d35;   /* modals, popovers */
  --bg-subtle:      #1c2540;   /* hover states, input backgrounds */

  /* Borders */
  --border-dim:     #1e2a45;
  --border-default: #253354;
  --border-bright:  #2e4070;

  /* Quantum accent palette — never use all at once; pick 1–2 per context */
  --accent-cyan:    #00e5ff;   /* primary interactive, links, active states */
  --accent-violet:  #7c3aed;   /* secondary accent, tags, badges */
  --accent-amber:   #f59e0b;   /* warnings, noise indicators, caution states */
  --accent-emerald: #10b981;   /* success, fidelity-high, stable states */
  --accent-rose:    #f43f5e;   /* errors, high noise, critical risk */

  /* Text */
  --text-primary:   #e2e8f7;
  --text-secondary: #8896b3;
  --text-muted:     #4a5a7a;
  --text-code:      #a8d8ea;

  /* Data visualization */
  --data-1:  #00e5ff;
  --data-2:  #7c3aed;
  --data-3:  #f59e0b;
  --data-4:  #10b981;
  --data-5:  #f43f5e;
  --data-6:  #38bdf8;
}
```

**Rules:**
- Always default to dark surfaces. Never use white or off-white as a background.
- Cyan (`--accent-cyan`) is the primary interactive color — use for active links, selected states, primary CTAs.
- Amber and rose are reserved for semantic states (warning, noise, error). Don't use decoratively.
- Use color sparingly and intentionally. One accent per UI zone is usually enough.

---

## Typography

Pair a monospace technical font with a precise sans-serif for body text. Avoid anything warm, rounded, or editorial.

```css
/* Recommended pairings */

/* Option A — High-tech terminal feel */
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');
--font-mono: 'JetBrains Mono', monospace;  /* code, metrics, circuit labels */
--font-body: 'IBM Plex Sans', sans-serif;  /* UI text, labels, navigation */

/* Option B — Scientific publication feel */
@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
--font-mono: 'Space Mono', monospace;
--font-body: 'DM Sans', sans-serif;

/* Option C — Dense research dashboard */
@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500&family=Barlow:wght@300;400;500;600&display=swap');
--font-mono: 'Fira Code', monospace;
--font-body: 'Barlow', sans-serif;
```

**Typography rules:**
- Metric values, qubit counts, gate depths, fidelity scores → always `font-mono`
- Section headers → `font-body`, weight 500–600, letter-spacing +0.05em, UPPERCASE or small-caps
- Code/QASM blocks → `font-mono`, slightly smaller size, muted background, subtle border-left accent
- Never use font sizes below 11px. Dense UIs should use 12–13px base, not 10px.
- Line-height 1.5–1.6 for body text. Tighter (1.2–1.3) for metric labels and data readouts.

---

## Layout Principles

### Grid & Density
Quantalab users are comfortable with dense, information-rich layouts. Don't over-space. Use structured grids that evoke scientific data tables and instrument panels.

```css
/* Dashboard grid — 12-column, tight gutters */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1px;                   /* hairline dividers between panels */
  background: var(--border-dim);  /* creates grid-line effect between panels */
}

.panel {
  background: var(--bg-raised);
  padding: 1.25rem 1.5rem;
}
```

- **Sidebar navigation**: Fixed, narrow (220–260px), dark, icon + label pairs
- **Main content**: Fluid, multi-pane splits for debugger and sandbox views
- **Panel headers**: Small-caps label + mono metric badges aligned right
- **Dividers**: 1px lines using `--border-dim` — visible but never dominant

### Spatial Rules
- Prefer **asymmetric layouts** for dashboards: wide left panel + narrow right metadata column
- Use **overlap and z-depth** on modals and flyouts (translate + drop-shadow, not just opacity)
- Reserve generous whitespace for **circuit visualizations only** — everything else can be dense

---

## Component Patterns

### Metric Cards (Debugger Output)
```
┌─────────────────────────────────┐
│ CIRCUIT DEPTH          [mono]   │
│                                 │
│   42                            │  ← large mono number, --accent-cyan
│   ▲ +3 from baseline            │  ← delta in --text-secondary
│                                 │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━░░░░░  │  ← progress bar (fill = risk level color)
└─────────────────────────────────┘
```
- Metric value: large, mono, colored by semantic state (cyan = normal, amber = warning, rose = critical)
- Delta indicator: directional arrow + value change
- Progress/risk bar: thin (3–4px height), full-width, color-mapped to severity

### Noise Simulation Panel
- Show ideal vs noisy state as **side-by-side probability bar charts** using `--data-1` vs `--data-5`
- Fidelity score displayed as a **radial gauge** or **large percentage** with conditional color
- KL-divergence shown as a small inline spark-line, not a full chart
- Noise model tags (depolarizing / amplitude / phase) as monospace badge chips

### Circuit Editor Area
- Dark canvas background (`--bg-void`)
- Gate blocks: rounded-2, filled with subtle gradient from `--bg-raised` to `--bg-overlay`
- Qubit wires: 1px `--border-bright` horizontal lines
- Selected gates: cyan border glow (`box-shadow: 0 0 0 1px var(--accent-cyan)`)
- QASM code pane: Monaco-style, dark theme, cyan syntax highlighting for gate names

### Status & Risk Indicators
```css
/* Scalability risk badges */
.badge-low    { background: #0d2e1f; color: var(--accent-emerald); border: 1px solid #1a4d32; }
.badge-medium { background: #2d1f05; color: var(--accent-amber);   border: 1px solid #4a3308; }
.badge-high   { background: #2d0a12; color: var(--accent-rose);    border: 1px solid #4a1220; }
```

### Navigation
- Fixed left sidebar: `--bg-base` background, items with icon + label
- Active state: left border accent (3px `--accent-cyan`) + `--bg-raised` background
- Section dividers: tiny uppercase labels in `--text-muted`
- Top bar: breadcrumb path + project name (mono) + user avatar + status dot

---

## Motion & Interaction

Use animation sparingly and purposefully — this is a professional tool, not a consumer app. Motion should communicate **state changes**, not add decoration.

### Meaningful Animations
```css
/* Panel load-in — staggered reveal for metric cards */
.metric-card {
  animation: slideInUp 0.3s ease forwards;
  opacity: 0;
}
.metric-card:nth-child(1) { animation-delay: 0.05s; }
.metric-card:nth-child(2) { animation-delay: 0.10s; }
.metric-card:nth-child(3) { animation-delay: 0.15s; }

@keyframes slideInUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Noise simulation — value count-up */
.metric-value {
  transition: color 0.4s ease;
}

/* Fidelity gauge — animated arc draw */
.fidelity-arc {
  stroke-dasharray: 283;
  stroke-dashoffset: 283;
  animation: drawArc 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
@keyframes drawArc {
  to { stroke-dashoffset: var(--offset); }
}
```

### Interaction Feedback
- Button press: `transform: scale(0.97)` for 120ms
- Loading states: skeleton shimmer using `--bg-subtle` → `--bg-overlay` gradient animation
- Analysis running: pulsing cyan dot beside "Analyzing…" label (not a spinner)
- Hover on data rows: `--bg-subtle` background, no color shift on text

### What NOT to Animate
- Don't animate layout shifts or grid rearrangements
- Don't use bounce or elastic easing — too playful for this context
- Don't animate decorative elements like borders or backgrounds

---

## Data Visualization Guidelines

Quantalab's core value is in its analysis outputs. Charts must be precise, readable, and scientifically honest.

### Chart Defaults
```javascript
// Recharts theme config for Quantalab
const chartTheme = {
  backgroundColor: 'transparent',
  fontFamily: 'JetBrains Mono, monospace',
  fontSize: 11,
  colors: ['#00e5ff', '#7c3aed', '#f59e0b', '#10b981', '#f43f5e'],
  gridColor: '#1e2a45',
  axisColor: '#4a5a7a',
  tooltipBackground: '#0f1629',
  tooltipBorder: '#253354',
};
```

### Chart-Specific Rules
- **Probability distributions** → Vertical bar chart, cyan bars, labeled x-axis with binary strings
- **Noise comparison** → Grouped bars, ideal (`--data-1`) vs noisy (`--data-5`), legend always shown
- **Fidelity over time** → Line chart, smooth curve, reference line at 1.0 in `--border-bright`
- **Gate distribution** → Horizontal bar or donut, one color per gate type from the data palette
- **Scalability risk** → Radar/spider chart OR ranked list with inline bars — never pie charts
- Always include axis labels and units. No unlabeled axes.
- Tooltips: dark background, mono font, include exact numeric values with 4 decimal places for scientific outputs

---

## Page-Specific Guidance

### Landing Page
- Full-viewport dark hero with subtle animated quantum grid or waveform background
- Headline: large, bold `font-body`, white — short and authoritative ("Deterministic Quantum Debugging")
- Subhead: `--text-secondary`, lighter weight
- CTA button: cyan filled, mono font, all-caps label ("GET STARTED" / "VIEW DOCS")
- Feature grid: 3-column, icon + title + 2-line description, icon in cyan on dark chip

### Dashboard (Main)
- Left sidebar + top bar + main content area
- Project cards: `--bg-raised`, hover lifts with subtle shadow, status dot (colored by last run state)
- Quick stats bar at top: 4–5 key metrics in a horizontal strip, mono values

### Quantum Debugger View
- Split pane: QASM input (left 40%) + Analysis results (right 60%)
- Results organized in collapsible sections: Structural / Noise / Scalability / Behavioral
- Each section has a summary badge (pass/warn/fail) visible when collapsed

### Research Sandbox View
- Experiment list with version history in left column
- Active experiment canvas in main area
- Export panel as a right drawer: QASM, Qiskit Object, Metrics Report options as card buttons

---

## Accessibility & Professionalism

- **Contrast**: All text must meet WCAG AA (4.5:1) at minimum. Cyan on `--bg-base` passes; verify amber text on dark panels.
- **Focus states**: Visible focus rings using `outline: 2px solid var(--accent-cyan); outline-offset: 2px`
- **Loading**: Always show loading states for async analysis operations. Never leave the user with a frozen UI.
- **Empty states**: Use structured placeholders ("No experiments yet — create one to begin") with a subtle illustration or icon, not just blank space
- **Error messages**: Show inline, use `--accent-rose`, include actionable next steps — never just "Error"
- **Code blocks**: Syntax-highlighted, copyable, with filename label when applicable

---

## Anti-Patterns to Avoid

| ❌ Avoid | ✅ Do Instead |
|---|---|
| White/light backgrounds | Dark surfaces only (`--bg-base` and above) |
| Purple gradient hero sections | Subtle grid or waveform animation on `--bg-void` |
| Rounded pill buttons everywhere | Slightly rounded (radius 4–6px), precise edges |
| Rainbow color data charts | Use the defined 5-color data palette consistently |
| Generic loader spinners | Pulsing dot or skeleton shimmer |
| Oversized hero typography (display fonts) | Measured, confident sizing — never gigantic |
| Card shadows that look "floaty" | Tight, directional shadows or none at all |
| Emoji or decorative icons | Lucide icons or custom SVG — clean, line-weight consistent |
| Confetti / success animations | Single flash of color change on success metric |
| Unlabeled charts or missing units | Always label axes, always show units for scientific values |

---

## Quick Reference Checklist

Before shipping any Quantalab UI component or page, verify:

- [ ] Dark background — no white or light-mode surfaces
- [ ] Metric values in monospace font
- [ ] Color used semantically (cyan = active, amber = warn, rose = error, emerald = success)
- [ ] Charts use the defined data palette and include labeled axes
- [ ] Loading and empty states are handled
- [ ] Motion is purposeful, not decorative
- [ ] Typography hierarchy is clear: header → label → value → caption
- [ ] Borders/dividers use `--border-dim` or `--border-default` — never harsh white lines
- [ ] All interactive elements have hover and focus states

---

*Built for deterministic quantum research and reproducible experimentation.*
