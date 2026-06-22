---
name: quantum-circuit-visualizer
description: >
  Use this skill to build and integrate the Quantum Circuit Visualizer feature in Quantalab.
  Covers interactive circuit canvas (drag-and-drop gates), GatePalette UI, Recharts histograms,
  statevector/amplitude charts, Bloch sphere (Three.js), noise fidelity overlays, QASM serialization,
  FastAPI+Qiskit backend integration, Supabase circuit storage, and Redux/Zustand state wiring.
  Also handles connecting the Visualizer to Quantalab's Debugger (/api/debugger/analyze, noise-sim)
  and Research Sandbox (/api/sandbox/experiments, benchmark) pipelines.

  Trigger whenever the user asks to: build circuit visualization in Quantalab, add gate drag-and-drop,
  render simulation results (probabilities, amplitudes), create Bloch sphere or fidelity charts,
  save/load circuits from Supabase, wire the Visualizer into Debugger or Sandbox, or work on any
  CircuitCanvas, GatePalette, ResultsPanel, or CircuitToolbar component in the Quantalab codebase.
---

# Quantum Circuit Visualizer — Quantalab Skill

This skill guides building the **Quantum Circuit Visualizer** feature end-to-end in the Quantalab platform: an interactive frontend canvas where users compose quantum circuits by placing gates, then simulate and visualize results in real time with attractive, research-grade charts.

---

## Architecture Overview

The Visualizer sits between the existing Quantum Debugger and Research Sandbox features:

```
User (drag-and-drop gate palette)
        ↓
CircuitCanvas (React component)
        ↓
QASM serializer → FastAPI /api/debugger/analyze  OR  /api/sandbox/benchmark
        ↓
Qiskit statevector / noise simulation
        ↓
ResultsPanel: Histogram | StatevectorChart | BlochSphere | NoiseOverlay
```

State flows through **Redux Toolkit** (persistent circuit state, saved experiments) and **Zustand** (transient UI state — drag ghost, hovered gate, hover tooltips).

---

## Component Breakdown

### 1. `CircuitCanvas`
The main interactive grid. Think of it as a spreadsheet: rows = qubits, columns = time steps (moments).

**Key responsibilities:**
- Render qubit wires as horizontal lines
- Render gate cells in a grid layout
- Accept drop events from `GatePalette`
- Highlight invalid placements in red
- Show gate connections (CNOT control-target lines, SWAP wires)
- Support selecting and deleting gates

**Implementation approach:**
- Use a `circuitMatrix: GateCell[][]` structure — `circuitMatrix[qubitIndex][momentIndex]`
- Render with CSS Grid or SVG (SVG is preferred for clean wires and gate connections)
- Use Tailwind for chrome (toolbar, labels) but raw SVG for the circuit itself

**Example `GateCell` type:**
```typescript
type GateCell = {
  gateId: string;           // 'H', 'X', 'CNOT', 'RZ', etc.
  label: string;
  params?: number[];        // rotation angles for parameterized gates
  controlQubit?: number;    // for CNOT, CZ, Toffoli
  targetQubit?: number;
  color: string;            // gate category color
} | null;
```

---

### 2. `GatePalette`
A sidebar panel listing available quantum gates, grouped by category.

**Gate categories:**
| Category | Gates |
|----------|-------|
| Single-qubit | H, X, Y, Z, S, T, I |
| Rotations | RX(θ), RY(θ), RZ(θ), U3 |
| Two-qubit | CNOT, CZ, SWAP, iSWAP |
| Three-qubit | Toffoli (CCX), Fredkin (CSWAP) |
| Measurement | Measure, Reset |

Each gate tile should show: gate symbol, color badge, short description on hover.

Implement drag-and-drop using the HTML5 Drag and Drop API (or `@dnd-kit/core` if already in the project):
```typescript
// On drag start from palette:
e.dataTransfer.setData('gateId', gate.id);

// On drop onto CircuitCanvas cell:
const gateId = e.dataTransfer.getData('gateId');
dispatch(placeGate({ qubit, moment, gateId }));
```

---

### 3. `ResultsPanel`
Displays simulation output after the circuit is sent to the backend. Contains tabs:

#### a. Probability Histogram
Use **Recharts** `BarChart` (already in Quantalab stack):
```tsx
<BarChart data={probabilityData}>
  <XAxis dataKey="state" label="Basis state |ψ⟩" />
  <YAxis domain={[0, 1]} label="Probability" />
  <Bar dataKey="probability" fill="#6366f1" radius={[4,4,0,0]} />
  <Tooltip formatter={(v) => `${(v * 100).toFixed(2)}%`} />
</BarChart>
```

#### b. Statevector Amplitude Chart
Dual bar chart: real and imaginary parts of each amplitude.
```tsx
<BarChart data={amplitudeData}>
  <Bar dataKey="real" fill="#818cf8" name="Re(α)" />
  <Bar dataKey="imag" fill="#f472b6" name="Im(α)" />
</BarChart>
```

#### c. Bloch Sphere (optional, Phase 2)
Use **Three.js** (r128, available in the stack) to render a 3D unit sphere with a state vector arrow. This is valuable for single-qubit circuits.

#### d. Noise Fidelity Overlay
Show a fidelity score badge and a comparison bar:
```
Ideal ████████████████ 100%
Noisy ████████████░░░░  82%  (Fidelity: 0.82)
```
Pull data from `/api/debugger/noise-sim` response fields: `ideal_statevector`, `noisy_statevector`, `fidelity`.

---

### 4. `CircuitToolbar`
Action bar above the canvas:

| Button | Action |
|--------|--------|
| ▶ Run | Serialize circuit → POST to backend → populate ResultsPanel |
| 🐛 Debug | Send to `/api/debugger/analyze` → open DebuggerPanel |
| 💾 Save | Serialize to QASM → POST to Supabase `project-files` bucket |
| 📂 Load | Fetch QASM from Supabase → parse → populate `circuitMatrix` |
| 🔄 Clear | Reset `circuitMatrix` to empty |
| + Add Qubit | Append a new row to `circuitMatrix` |

---

## State Management

### Redux slice: `circuitSlice`
Handles the persistent circuit data:
```typescript
interface CircuitState {
  qubits: number;
  moments: number;
  circuitMatrix: (GateCell | null)[][];
  savedCircuits: SavedCircuit[];
  simulationResult: SimulationResult | null;
  isSimulating: boolean;
}
```

Key actions:
- `placeGate({ qubit, moment, gate })`
- `removeGate({ qubit, moment })`
- `addQubit()` / `removeQubit()`
- `addMoment()` / `removeMoment()`
- `setSimulationResult(result)`
- `clearCircuit()`

### Zustand store: `useCircuitUIStore`
Transient UI state only:
```typescript
interface CircuitUIStore {
  hoveredCell: { qubit: number; moment: number } | null;
  draggedGate: string | null;
  selectedCell: { qubit: number; moment: number } | null;
  setHoveredCell: (cell) => void;
  setDraggedGate: (gateId) => void;
}
```

---

## Backend Integration

### Serializing the circuit to QASM
Before sending to the backend, convert `circuitMatrix` to OpenQASM 2.0:

```typescript
function toQASM(matrix: (GateCell | null)[][], numQubits: number): string {
  const lines = [
    'OPENQASM 2.0;',
    'include "qelib1.inc";',
    `qreg q[${numQubits}];`,
    `creg c[${numQubits}];`,
  ];

  for (let m = 0; m < matrix[0].length; m++) {
    for (let q = 0; q < numQubits; q++) {
      const cell = matrix[q][m];
      if (!cell) continue;
      switch (cell.gateId) {
        case 'H': lines.push(`h q[${q}];`); break;
        case 'X': lines.push(`x q[${q}];`); break;
        case 'CNOT': lines.push(`cx q[${cell.controlQubit}], q[${cell.targetQubit}];`); break;
        case 'RZ': lines.push(`rz(${cell.params?.[0] ?? 0}) q[${q}];`); break;
        // ... add more gates as needed
      }
    }
  }
  lines.push(`measure q -> c;`);
  return lines.join('\n');
}
```

### API calls
```typescript
// Structural analysis (Debugger integration)
const debugResult = await api.post('/api/debugger/analyze', { qasm_circuit: qasmString });

// Noise simulation
const noiseResult = await api.post('/api/debugger/noise-sim', {
  qasm_circuit: qasmString,
  noise_model: 'depolarizing',
  noise_param: 0.01,
});

// Sandbox: run and benchmark
const benchmarkResult = await api.post('/api/sandbox/benchmark', {
  qasm_circuit: qasmString,
  backends: ['statevector_simulator', 'qasm_simulator'],
  shots: 1024,
});
```

---

## Saving to Supabase

Store circuits in the `project-files` bucket as `.qasm` files and index them in the PostgreSQL `experiments` table.

```typescript
// Upload QASM file
const { data, error } = await supabase.storage
  .from('project-files')
  .upload(`circuits/${projectId}/${circuitName}.qasm`, qasmBlob, {
    contentType: 'text/plain',
    upsert: true,
  });

// Save metadata to DB
await supabase.from('experiments').insert({
  project_id: projectId,
  name: circuitName,
  qasm_path: data.path,
  num_qubits: numQubits,
  gate_count: gateCount,
  created_at: new Date().toISOString(),
});
```

---

## Visual Design (Scientific Dark Lab)

Quantalab uses a **Scientific Dark Lab** aesthetic: dark background, glowing neon highlights, and data-dense layouts. Match this in all visualizer components.

**Color palette for gates:**
| Gate Category | Color |
|--------------|-------|
| Single-qubit | `#6366f1` (indigo) |
| Rotations | `#8b5cf6` (violet) |
| Two-qubit | `#06b6d4` (cyan) |
| Measurement | `#f59e0b` (amber) |
| Error/invalid | `#ef4444` (red) |

**Canvas style:**
- Background: `#0f172a` (slate-950)
- Wire color: `#334155` (slate-700)
- Wire width: 1.5px
- Gate cell size: 48×48px
- Gate border radius: 8px
- Font: monospace for gate labels, `Inter` for chrome UI

**Animate the Run button** with a subtle pulse while simulating:
```css
@keyframes simulate-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(99, 102, 241, 0); }
}
```

---

## Integration Checklist

When adding the Visualizer to the Quantalab project, confirm these integration points:

- [ ] Route: add `/visualizer` route in the React Router config
- [ ] Nav: add "Circuit Visualizer" entry to the Dashboard sidebar
- [ ] Redux: register `circuitSlice` in the root store
- [ ] Supabase: ensure `project-files` bucket exists (per README setup)
- [ ] Realtime: subscribe to `experiments` table updates for collaborative sessions
- [ ] Auth: gate the route with Firebase auth check (same pattern as Debugger and Sandbox pages)
- [ ] Export: wire the "Save to Sandbox" button to create a versioned experiment snapshot in `/api/sandbox/experiments`

---

## Reference Files

- `references/gate-library.md` — Full gate matrix definitions, QASM syntax, and Qiskit equivalents
- `references/api-contracts.md` — Exact request/response shapes for all Quantalab API endpoints used by the Visualizer

Read these when you need precise specs for a gate or API field.