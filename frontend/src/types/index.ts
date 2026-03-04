export interface User {
  id: string
  firebase_uid: string
  email: string
  username: string
  display_name: string | null
  bio: string | null
  profile_picture_url: string | null
  location: string | null
  website: string | null
  created_at: string
  updated_at: string
}

export interface Experiment {
  id: string
  user_id: string
  name: string
  description: string | null
  qasm_code: string
  seed: number | null
  backend: string
  shots: number
  version: number
  parent_version_id: string | null
  created_at: string
  updated_at: string
  user?: User
}

export interface ExperimentResult {
  id: string
  experiment_id: string
  backend: string
  shots: number
  seed: number | null
  counts: Record<string, number>
  statevector: number[] | null
  fidelity: number | null
  execution_time_ms: number
  created_at: string
}

export interface DebugReport {
  id: string
  experiment_id: string
  circuit_depth: number
  gate_distribution: Record<string, number>
  multi_qubit_gate_density: number
  redundancy_patterns: string[]
  idle_qubits: number[]
  noise_sensitivity_index: number
  depolarizing_fidelity: number
  amplitude_damping_fidelity: number
  phase_damping_fidelity: number
  scalability_risk: 'low' | 'medium' | 'high'
  transpilation_cost: number
  optimization_recommendations: string[]
  kl_divergence: number | null
  created_at: string
}

export interface BenchmarkResult {
  id: string
  experiment_id: string
  backends: string[]
  depth_comparison: Record<string, number>
  gate_count_comparison: Record<string, number>
  fidelity_comparison: Record<string, number>
  execution_time_comparison: Record<string, number>
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: 'comment_reply' | 'mention' | 'reaction' | 'upvote'
  content: string
  related_id: string
  is_read: boolean
  created_at: string
}
