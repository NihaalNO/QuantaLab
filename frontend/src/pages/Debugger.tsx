import { useState } from 'react'
import api from '../services/api'
import type { DebugReport } from '../types'

const DEFAULT_QASM = `OPENQASM 2.0;
include "qelib1.inc";
qreg q[3];
creg c[3];
h q[0];
cx q[0], q[1];
cx q[1], q[2];
measure q[0] -> c[0];
measure q[1] -> c[1];
measure q[2] -> c[2];`

export default function Debugger() {
  const [qasmCode, setQasmCode] = useState(DEFAULT_QASM)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [debugReport, setDebugReport] = useState<DebugReport | null>(null)
  const [error, setError] = useState<string | null>(null)

  const analyzeCircuit = async () => {
    if (!qasmCode.trim()) {
      setError('Please enter QASM code')
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setDebugReport(null)

    try {
      const response = await api.post('/debugger/analyze', {
        qasm_code: qasmCode
      })
      setDebugReport(response.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to analyze circuit')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getRiskColorClass = (risk: string) => {
    switch (risk) {
      case 'low': return 'badge-low'
      case 'medium': return 'badge-medium'
      case 'high': return 'badge-high'
      default: return 'bg-raised border-border-dim text-text-secondary rounded px-2 py-0.5 text-xs'
    }
  }

  const getFidelityColor = (fidelity: number) => {
    if (fidelity >= 0.95) return 'text-accent-emerald'
    if (fidelity >= 0.85) return 'text-accent-amber'
    return 'text-accent-rose'
  }

  return (
    <div className="p-6 md:p-8 bg-void min-h-screen font-body text-text-primary max-w-7xl mx-auto">
      <div className="mb-8 border-b border-border-dim pb-4">
        <h1 className="text-2xl font-bold mb-1 tracking-wide uppercase">Quantum Debugger</h1>
        <p className="text-text-secondary text-sm">
          Algorithmic failure detection with 4-layer analysis: Structural, Noise, Scalability, and Behavioral.
        </p>
      </div>

      <div className="dashboard-grid border border-border-dim rounded-sm overflow-hidden">
        {/* QASM Input */}
        <div className="panel col-span-1 md:col-span-5 flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold tracking-wide text-text-primary uppercase">QASM Definition</h2>
          </div>

          <div className="relative flex-grow flex flex-col border border-border-default bg-[#0d1224] rounded-sm overflow-hidden">
            {/* decorative wire */}
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent-cyan/50"></div>

            <textarea
              value={qasmCode}
              onChange={(e) => setQasmCode(e.target.value)}
              className="w-full flex-grow font-mono text-xs p-4 pl-6 bg-transparent text-text-code focus:outline-none resize-none"
              placeholder="Enter your OpenQASM 2.0 code here..."
              spellCheck="false"
            />
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={analyzeCircuit}
              disabled={isAnalyzing}
              className="px-6 py-2 bg-accent-cyan text-void rounded-[4px] font-mono tracking-widest text-xs font-bold hover:bg-accent-cyan/90 disabled:opacity-50 transition active:scale-95 flex items-center gap-2 uppercase"
            >
              {isAnalyzing && (
                <span className="w-2 h-2 rounded-full bg-void animate-pulse"></span>
              )}
              {isAnalyzing ? 'Analyzing...' : 'Run Diagnostics'}
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="panel col-span-1 md:col-span-7 bg-base">
          <h2 className="text-sm font-semibold tracking-wide text-text-primary uppercase mb-6 flex justify-between">
            <span>Diagnostic Telemetry</span>
            {debugReport && <span className="font-mono text-accent-emerald text-xs">STATUS: IDLE</span>}
          </h2>

          {error && (
            <div className="bg-accent-rose/10 border-l-[3px] border-accent-rose p-3 mb-6 text-sm font-mono text-accent-rose">
              ERR: {error}
            </div>
          )}

          {!debugReport && !isAnalyzing && !error && (
            <div className="h-64 flex flex-col items-center justify-center text-text-muted border border-border-dim border-dashed rounded-sm">
              <div className="font-mono text-xs mb-2">AWAITING INPUT...</div>
              <p className="text-sm">Initiate diagnostics to populate telemetry panels.</p>
            </div>
          )}

          {isAnalyzing && (
            <div className="h-64 flex flex-col items-center justify-center">
              <div className="w-6 h-6 rounded-full border-t-2 border-accent-cyan animate-spin mb-4"></div>
              <div className="font-mono text-xs text-text-secondary space-y-2 text-left bg-raised p-4 border border-border-dim rounded">
                <p className="text-accent-emerald">✓ L1_STRUCTURAL_OK</p>
                <p className="text-text-primary animate-pulse">→ L2_NOISE_SIMULATING...</p>
                <p className="text-text-muted opacity-50">  L3_SCALABILITY_PENDING</p>
                <p className="text-text-muted opacity-50">  L4_BEHAVIORAL_PENDING</p>
              </div>
            </div>
          )}

          {debugReport && (
            <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar" style={{ maxHeight: 'calc(100vh - 250px)' }}>
              {/* Summary */}
              <div className="bg-[#0f1629] border-l-[3px] border-accent-violet p-4 hidden">
                <p className="text-text-primary text-sm leading-relaxed">{debugReport.summary}</p>
              </div>

              {/* Layer 1: Structural Analysis */}
              <div className="metric-card">
                <div className="flex items-center gap-3 mb-3 border-b border-border-dim pb-2">
                  <span className="font-mono text-[10px] bg-border-default text-text-primary px-1.5 py-0.5 rounded">L1</span>
                  <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest">Structural Analysis</h3>
                </div>

                <div className="grid grid-cols-4 gap-px bg-border-dim border border-border-dim rounded-sm overflow-hidden mb-3">
                  <div className="bg-raised p-3 flex flex-col justify-between">
                    <div className="text-[10px] text-text-muted uppercase mb-1 whitespace-nowrap overflow-hidden text-ellipsis">Circuit Depth</div>
                    <div className="text-xl font-mono text-text-primary">{debugReport.circuit_depth}</div>
                  </div>
                  <div className="bg-raised p-3 flex flex-col justify-between">
                    <div className="text-[10px] text-text-muted uppercase mb-1">Qubits</div>
                    <div className="text-xl font-mono text-text-primary">{debugReport.num_qubits}</div>
                  </div>
                  <div className="bg-raised p-3 flex flex-col justify-between">
                    <div className="text-[10px] text-text-muted uppercase mb-1">Total Gates</div>
                    <div className="text-xl font-mono text-text-primary">{debugReport.total_gates}</div>
                  </div>
                  <div className="bg-raised p-3 flex flex-col justify-between">
                    <div className="text-[10px] text-text-muted uppercase mb-1 whitespace-nowrap overflow-hidden text-ellipsis">MQ Density</div>
                    <div className="text-xl font-mono text-accent-cyan">
                      {(debugReport.multi_qubit_gate_density * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Gate Distribution */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-[10px] text-text-muted uppercase self-center w-16">Dist:</span>
                  {Object.entries(debugReport.gate_distribution).map(([gate, count]) => (
                    <span
                      key={gate}
                      className="px-2 py-0.5 bg-subtle border border-border-default text-text-secondary font-mono text-[11px] rounded-sm"
                    >
                      {gate}:<span className="text-white ml-1">{count}</span>
                    </span>
                  ))}
                </div>

                {/* Idle Qubits */}
                {debugReport.idle_qubits && debugReport.idle_qubits.length > 0 && (
                  <div className="bg-[#2d1f05] border-l-[3px] border-accent-amber p-2 pl-3">
                    <div className="font-mono text-[11px] text-accent-amber">WARN: Idle Qubits detected: [{debugReport.idle_qubits.join(', ')}]</div>
                  </div>
                )}

                {/* Redundancy Patterns */}
                {debugReport.redundancy_patterns && debugReport.redundancy_patterns.length > 0 && (
                  <div className="bg-[#2d1f05] border-l-[3px] border-accent-amber p-2 pl-3 mt-2">
                    <div className="font-mono text-[11px] text-accent-amber mb-1">WARN: Redundancy Patterns Detected:</div>
                    <ul className="text-[11px] text-[#d4993a] list-disc list-inside font-mono">
                      {debugReport.redundancy_patterns.map((pattern, idx) => (
                        <li key={idx}>{pattern}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Layer 2: Noise Sensitivity */}
              <div className="metric-card">
                <div className="flex items-center gap-3 mb-3 border-b border-border-dim pb-2">
                  <span className="font-mono text-[10px] bg-border-default text-text-primary px-1.5 py-0.5 rounded">L2</span>
                  <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest">Noise Sensitivity</h3>
                </div>

                <div className="bg-raised border border-border-dim p-4 rounded-sm mb-3">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Sensitivity Index</span>
                    <span className={`font-mono text-2xl leading-none ${debugReport.noise_sensitivity_index < 0.3 ? 'text-accent-emerald' :
                        debugReport.noise_sensitivity_index < 0.6 ? 'text-accent-amber' : 'text-accent-rose'
                      }`}>
                      {(debugReport.noise_sensitivity_index * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-border-dim h-[3px]">
                    <div
                      className={`h-[3px] shadow-[0_0_8px_rgba(0,229,255,0.4)] ${debugReport.noise_sensitivity_index < 0.3 ? 'bg-accent-emerald' :
                          debugReport.noise_sensitivity_index < 0.6 ? 'bg-accent-amber' : 'bg-accent-rose'
                        }`}
                      style={{ width: `${Math.min(debugReport.noise_sensitivity_index * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-px bg-border-dim border border-border-dim rounded-sm overflow-hidden">
                  <div className="bg-raised p-3 text-center">
                    <div className="text-[10px] text-text-muted uppercase mb-1">Depolarizing</div>
                    <div className={`font-mono text-lg metric-value ${getFidelityColor(debugReport.depolarizing_fidelity)}`}>
                      {(debugReport.depolarizing_fidelity * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-raised p-3 text-center">
                    <div className="text-[10px] text-text-muted uppercase mb-1 truncate">Amp. Damping</div>
                    <div className={`font-mono text-lg metric-value ${getFidelityColor(debugReport.amplitude_damping_fidelity)}`}>
                      {(debugReport.amplitude_damping_fidelity * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-raised p-3 text-center">
                    <div className="text-[10px] text-text-muted uppercase mb-1 truncate">Phase Damping</div>
                    <div className={`font-mono text-lg metric-value ${getFidelityColor(debugReport.phase_damping_fidelity)}`}>
                      {(debugReport.phase_damping_fidelity * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Layer 3: Scalability */}
              <div className="metric-card">
                <div className="flex items-center gap-3 mb-3 border-b border-border-dim pb-2">
                  <span className="font-mono text-[10px] bg-border-default text-text-primary px-1.5 py-0.5 rounded">L3</span>
                  <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest">Scalability Assessment</h3>
                </div>

                <div className="flex flex-col gap-px bg-border-dim border border-border-dim rounded-sm">
                  <div className="flex justify-between items-center py-2 px-4 bg-raised">
                    <span className="text-xs text-text-secondary uppercase tracking-wide">Scalability Risk</span>
                    <span className={getRiskColorClass(debugReport.scalability_risk)}>
                      {debugReport.scalability_risk.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-4 bg-raised">
                    <span className="text-xs text-text-secondary uppercase tracking-wide">Risk Vector Score</span>
                    <span className="font-mono text-sm text-text-primary">{(debugReport.risk_score || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 px-4 bg-raised">
                    <span className="text-xs text-text-secondary uppercase tracking-wide">Transpilation Cost</span>
                    <span className="font-mono text-sm text-accent-cyan">{debugReport.transpilation_cost.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Layer 4: Behavioral Mismatch */}
              <div className="metric-card">
                <div className="flex items-center gap-3 mb-3 border-b border-border-dim pb-2">
                  <span className="font-mono text-[10px] bg-border-default text-text-primary px-1.5 py-0.5 rounded">L4</span>
                  <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest">Behavioral Mismatch</h3>
                </div>

                {debugReport.kl_divergence !== null && debugReport.kl_divergence !== undefined ? (
                  <div className="flex flex-col gap-px bg-border-dim border border-border-dim rounded-sm">
                    <div className="flex justify-between items-center py-2 px-4 bg-raised">
                      <span className="text-xs text-text-secondary uppercase tracking-wide">KV Divergence</span>
                      <span className={`font-mono text-sm ${debugReport.kl_divergence < 0.1 ? 'text-accent-emerald' :
                          debugReport.kl_divergence < 0.5 ? 'text-accent-amber' : 'text-accent-rose'
                        }`}>
                        {debugReport.kl_divergence.toFixed(4)}
                      </span>
                    </div>
                    {debugReport.kl_divergence_symmetrized !== null && (
                      <div className="flex justify-between items-center py-2 px-4 bg-raised">
                        <span className="text-xs text-text-secondary uppercase tracking-wide">Symmetrized KL</span>
                        <span className="font-mono text-sm text-text-primary">{debugReport.kl_divergence_symmetrized.toFixed(4)}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-3 border border-border-dim bg-raised text-text-muted text-[11px] font-mono">
                    KL DIVERGENCE SKIPPED (CIRCUIT SCALE OUT OF BOUNDS)
                  </div>
                )}
              </div>

              {/* Fix Recommendations */}
              {debugReport.recommendations && debugReport.recommendations.length > 0 && (
                <div className="metric-card mt-6 border border-border-bright bg-[#0a1429] p-4 rounded-sm">
                  <h3 className="font-mono text-xs text-accent-cyan mb-3 tracking-widest">// RECOMMENDED OPTIMIZATIONS</h3>
                  <ul className="space-y-2">
                    {debugReport.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-text-primary">
                        <span className="text-accent-cyan font-mono leading-tight mt-0.5">»</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
