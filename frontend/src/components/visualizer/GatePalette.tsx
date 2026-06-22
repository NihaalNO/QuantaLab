import type { GateDefinition } from '../../types'
import { useCircuitUIStore } from '../../store/useCircuitUIStore'

const GATE_LIBRARY: GateDefinition[] = [
  { id: 'H', label: 'H', category: 'single', color: '#00d992', description: 'Hadamard - creates superposition', numQubits: 1 },
  { id: 'X', label: 'X', category: 'single', color: '#00d992', description: 'Pauli-X - bit flip', numQubits: 1 },
  { id: 'Y', label: 'Y', category: 'single', color: '#00d992', description: 'Pauli-Y', numQubits: 1 },
  { id: 'Z', label: 'Z', category: 'single', color: '#00d992', description: 'Pauli-Z - phase flip', numQubits: 1 },
  { id: 'S', label: 'S', category: 'single', color: '#00d992', description: 'S gate - pi/2 phase', numQubits: 1 },
  { id: 'T', label: 'T', category: 'single', color: '#00d992', description: 'T gate - pi/4 phase', numQubits: 1 },
  { id: 'I', label: 'I', category: 'single', color: '#00d992', description: 'Identity', numQubits: 1 },
  { id: 'RX', label: 'Rx', category: 'rotation', color: '#9b5cff', description: 'Rotation around X-axis', numQubits: 1, hasParams: true },
  { id: 'RY', label: 'Ry', category: 'rotation', color: '#9b5cff', description: 'Rotation around Y-axis', numQubits: 1, hasParams: true },
  { id: 'RZ', label: 'Rz', category: 'rotation', color: '#9b5cff', description: 'Rotation around Z-axis', numQubits: 1, hasParams: true },
  { id: 'CNOT', label: 'CX', category: 'multi', color: '#38e8ff', description: 'Controlled-NOT', numQubits: 2 },
  { id: 'CZ', label: 'CZ', category: 'multi', color: '#38e8ff', description: 'Controlled-Z', numQubits: 2 },
  { id: 'SWAP', label: 'SW', category: 'multi', color: '#38e8ff', description: 'SWAP gate', numQubits: 2 },
  { id: 'CCX', label: 'CCX', category: 'three', color: '#38e8ff', description: 'Toffoli - double-controlled X', numQubits: 3 },
  { id: 'M', label: 'M', category: 'measurement', color: '#f5b64b', description: 'Measure qubit', numQubits: 1 },
]

const CATEGORY_LABELS: Record<string, string> = {
  single: 'SINGLE-QUBIT',
  rotation: 'ROTATIONS',
  multi: 'TWO-QUBIT',
  three: 'THREE-QUBIT',
  measurement: 'MEASUREMENT',
}

export default function GatePalette() {
  const setDraggedGate = useCircuitUIStore((state) => state.setDraggedGate)

  const grouped = GATE_LIBRARY.reduce((acc, gate) => {
    if (!acc[gate.category]) acc[gate.category] = []
    acc[gate.category].push(gate)
    return acc
  }, {} as Record<string, GateDefinition[]>)

  const handleDragStart = (event: React.DragEvent, gate: GateDefinition) => {
    event.dataTransfer.setData('gateId', gate.id)
    event.dataTransfer.effectAllowed = 'copy'
    setDraggedGate(gate.id)
  }

  return (
    <div className="ql-card-soft h-full overflow-y-auto custom-scrollbar">
      <h3 className="ql-panel-title mb-4">Gate Palette</h3>

      {Object.entries(grouped).map(([category, gates]) => (
        <div key={category} className="mb-5">
          <div className="mb-2 flex items-center gap-2 pl-1 text-[9px] font-bold uppercase tracking-widest text-text-muted">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: gates[0].color }} />
            {CATEGORY_LABELS[category]}
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {gates.map((gate) => (
              <div
                key={gate.id}
                draggable
                onDragStart={(event) => handleDragStart(event, gate)}
                onDragEnd={() => setDraggedGate(null)}
                title={gate.description}
                className="group relative flex cursor-grab flex-col items-center justify-center rounded-md border border-border-default bg-base p-2 transition-all hover:border-border-bright hover:bg-raised active:cursor-grabbing"
              >
                <div className="mb-0.5 font-mono text-sm font-bold leading-none" style={{ color: gate.color }}>
                  {gate.label}
                </div>
                <div className="text-[8px] uppercase tracking-wider text-text-muted">{gate.id}</div>
                <div className="pointer-events-none absolute -top-8 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded border border-border-bright bg-overlay px-2 py-1 text-[9px] text-text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  {gate.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export { GATE_LIBRARY }
