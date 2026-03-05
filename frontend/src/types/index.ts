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
