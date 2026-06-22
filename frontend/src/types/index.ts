export interface Experiment {
  id: string
  name: string
  description: string | null
  qasm_code: string
  seed: number
  backend: string
  shots: number
  current_version: number
  created_at: string
  updated_at?: string
}

export interface ExperimentVersion {
  id: string
  experiment_id: string
  version: number
  qasm_code: string
  seed: number
  backend: string
  shots: number
  created_at: string
  circuit_depth: number
  num_qubits: number
  total_gates: number
}

export interface ExperimentResult {
  experiment_id: string
  version: number
  backend: string
  shots: number
  seed: number
  counts: Record<string, number>
  fidelity: number | null
  execution_time_ms: number
  circuit_depth: number
  num_qubits: number
}

export interface BenchmarkResult {
  backends: string[]
  depth: number
  gates: number
  comparisons: Record<string, {
    fidelity: number
    execution_time_ms: number
    depth: number
    gate_count: number
  }>
}

export interface DebugReport {
  // Structural Analysis (Layer 1)
  circuit_depth: number
  num_qubits: number
  total_gates: number
  gate_distribution: Record<string, number>
  multi_qubit_gate_density: number
  idle_qubits: number[]
  redundancy_patterns: string[]

  // Noise Sensitivity (Layer 2)
  noise_sensitivity_index: number
  depolarizing_fidelity: number
  amplitude_damping_fidelity: number
  phase_damping_fidelity: number

  // Scalability (Layer 3)
  transpilation_cost: number
  scalability_risk: 'low' | 'medium' | 'high'
  risk_score: number
  risk_factors: string[]

  // Behavioral Mismatch (Layer 4)
  kl_divergence: number | null
  kl_divergence_symmetrized: number | null

  // Summary
  summary: string
  recommendations: string[]
}

// ==================== CIRCUIT VISUALIZER TYPES ====================

export type GateCategory = 'single' | 'rotation' | 'multi' | 'three' | 'measurement'

export interface GateDefinition {
  id: string
  label: string
  category: GateCategory
  color: string
  description: string
  numQubits: number
  hasParams?: boolean
}

export interface GateCell {
  gateId: string
  label: string
  params?: number[]
  controlQubit?: number
  targetQubit?: number
  color: string
  category: GateCategory
}

export interface SimulationResult {
  probabilities: { state: string; probability: number }[]
  amplitudes: { state: string; real: number; imag: number }[]
  counts: Record<string, number>
  fidelity: number
  num_qubits: number
  execution_time_ms?: number
}
