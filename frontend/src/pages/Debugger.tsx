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

const timeline = ['Structural', 'Noise', 'Scalability', 'Behavior']

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
        qasm_code: qasmCode,
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
      default: return 'ql-chip'
    }
  }

  const getFidelityColor = (fidelity: number) => {
    if (fidelity >= 0.95) return 'text-accent-emerald'
    if (fidelity >= 0.85) return 'text-accent-amber'
    return 'text-accent-rose'
  }

  return (
    <div className="ql-page">
      <div className="ql-container">
        <div className="mb-8 flex flex-col justify-between gap-4 border-b border-dashed border-border-default pb-6 lg:flex-row lg:items-end">
          <div>
            <div className="ql-eyebrow mb-3">Quantum Debugger</div>
            <h1 className="text-3xl font-normal tracking-[-0.03em] text-white md:text-4xl">Professional circuit diagnostics</h1>
            <p className="mt-3 max-w-3xl text-text-secondary">
              Structural analysis, noise modeling, scalability assessment, and behavioral mismatch detection in a split-panel workspace.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="ql-chip">OpenQASM 2.0</span>
            <span className="ql-chip border-accent-green/30 bg-accent-green/10 text-accent-green">4-layer engine</span>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(420px,0.9fr)_minmax(0,1.35fr)]">
          <section className="ql-card-soft flex min-h-[680px] flex-col">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="ql-panel-title">QASM Definition</h2>
              <span className="font-mono text-[11px] text-text-muted">{qasmCode.split('\n').length} lines</span>
            </div>

            <div className="relative flex min-h-[460px] flex-1 overflow-hidden rounded-md border border-border-default bg-base">
              <div className="absolute inset-y-0 left-0 w-[3px] bg-accent-green" />
              <textarea
                value={qasmCode}
                onChange={(event) => setQasmCode(event.target.value)}
                className="h-full w-full resize-none bg-transparent p-5 pl-7 font-mono text-[13px] leading-6 text-text-code focus:outline-none"
                placeholder="Enter your OpenQASM 2.0 code here..."
                spellCheck="false"
              />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="flex flex-wrap gap-2">
                {timeline.map((item, index) => (
                  <span key={item} className="ql-chip">
                    <span className="font-mono text-accent-green">L{index + 1}</span>
                    {item}
                  </span>
                ))}
              </div>
              <button
                onClick={analyzeCircuit}
                disabled={isAnalyzing}
                className="ql-button-primary font-mono text-xs uppercase tracking-[0.16em]"
              >
                {isAnalyzing && <span className="h-2 w-2 rounded-full bg-base animate-pulse" />}
                {isAnalyzing ? 'Analyzing...' : 'Run diagnostics'}
              </button>
            </div>
          </section>

          <section className="ql-card-soft min-h-[680px]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="ql-panel-title">Diagnostic Telemetry</h2>
              {debugReport ? (
                <span className="ql-chip border-accent-green/30 bg-accent-green/10 text-accent-green">Analysis complete</span>
              ) : (
                <span className="ql-chip">Awaiting input</span>
              )}
            </div>

            {error && (
              <div className="mb-5 rounded-md border border-accent-rose/30 bg-accent-rose/10 p-4 font-mono text-sm text-accent-rose">
                ERR: {error}
              </div>
            )}

            {!debugReport && !isAnalyzing && !error && (
              <div className="grid min-h-[520px] place-items-center rounded-md border border-dashed border-border-default text-center">
                <div>
                  <div className="mx-auto mb-4 h-12 w-12 rounded-md border border-border-default bg-raised" />
                  <div className="font-mono text-xs uppercase tracking-[0.18em] text-text-muted">Awaiting input</div>
                  <p className="mt-2 text-sm text-text-secondary">Run diagnostics to populate the analysis panels.</p>
                </div>
              </div>
            )}

            {isAnalyzing && (
              <div className="grid min-h-[520px] place-items-center">
                <div className="w-full max-w-md rounded-md border border-border-default bg-base p-5">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="h-6 w-6 animate-spin rounded-full border-t-2 border-accent-green" />
                    <div>
                      <div className="font-medium text-white">Running diagnostic stack</div>
                      <div className="font-mono text-[11px] text-text-muted">statevector and noise layers queued</div>
                    </div>
                  </div>
                  <div className="space-y-2 font-mono text-xs">
                    <p className="text-accent-green">OK L1_STRUCTURAL_OK</p>
                    <p className="animate-pulse text-text-primary">RUN L2_NOISE_SIMULATING...</p>
                    <p className="text-text-muted">WAIT L3_SCALABILITY_PENDING</p>
                    <p className="text-text-muted">WAIT L4_BEHAVIORAL_PENDING</p>
                  </div>
                </div>
              </div>
            )}

            {debugReport && (
              <div className="max-h-[calc(100vh-210px)] space-y-5 overflow-y-auto pr-2 custom-scrollbar">
                <div className="grid gap-px overflow-hidden rounded-md border border-border-default bg-border-dim sm:grid-cols-4">
                  {[
                    ['Circuit Depth', debugReport.circuit_depth],
                    ['Qubits', debugReport.num_qubits],
                    ['Total Gates', debugReport.total_gates],
                    ['MQ Density', `${(debugReport.multi_qubit_gate_density * 100).toFixed(1)}%`],
                  ].map(([label, value]) => (
                    <div key={label} className="bg-base p-4">
                      <div className="text-[10px] uppercase tracking-[0.14em] text-text-muted">{label}</div>
                      <div className="mt-2 font-mono text-2xl text-white">{value}</div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="ql-card">
                    <div className="mb-3 flex items-center gap-3">
                      <span className="ql-code-chip text-accent-green">L1</span>
                      <h3 className="ql-panel-title">Structural Analysis</h3>
                    </div>
                    <div className="mb-4 flex flex-wrap gap-2">
                      {Object.entries(debugReport.gate_distribution).map(([gate, count]) => (
                        <span key={gate} className="ql-code-chip">
                          {gate}: <span className="ml-1 text-white">{count}</span>
                        </span>
                      ))}
                    </div>
                    {debugReport.idle_qubits?.length > 0 && (
                      <div className="rounded-md border border-accent-amber/30 bg-accent-amber/10 p-3 font-mono text-xs text-accent-amber">
                        Idle qubits detected: [{debugReport.idle_qubits.join(', ')}]
                      </div>
                    )}
                    {debugReport.redundancy_patterns?.length > 0 && (
                      <ul className="mt-3 space-y-2 text-sm text-text-secondary">
                        {debugReport.redundancy_patterns.map((pattern) => (
                          <li key={pattern}>- {pattern}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="ql-card">
                    <div className="mb-3 flex items-center gap-3">
                      <span className="ql-code-chip text-accent-green">L2</span>
                      <h3 className="ql-panel-title">Noise Sensitivity</h3>
                    </div>
                    <div className="mb-4 flex items-end justify-between">
                      <span className="text-sm text-text-secondary">Sensitivity index</span>
                      <span className={`font-mono text-3xl ${debugReport.noise_sensitivity_index < 0.3 ? 'text-accent-emerald' : debugReport.noise_sensitivity_index < 0.6 ? 'text-accent-amber' : 'text-accent-rose'}`}>
                        {(debugReport.noise_sensitivity_index * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-border-dim">
                      <div
                        className="h-full rounded-full bg-accent-green shadow-[0_0_12px_rgba(0,217,146,0.45)]"
                        style={{ width: `${Math.min(debugReport.noise_sensitivity_index * 100, 100)}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        ['Depol', debugReport.depolarizing_fidelity],
                        ['Amp', debugReport.amplitude_damping_fidelity],
                        ['Phase', debugReport.phase_damping_fidelity],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-md border border-border-default bg-raised p-3 text-center">
                          <div className="text-[10px] uppercase text-text-muted">{label}</div>
                          <div className={`mt-1 font-mono text-lg ${getFidelityColor(Number(value))}`}>
                            {(Number(value) * 100).toFixed(1)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="ql-card">
                    <div className="mb-3 flex items-center gap-3">
                      <span className="ql-code-chip text-accent-green">L3</span>
                      <h3 className="ql-panel-title">Scalability Assessment</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between rounded-md border border-border-default bg-raised p-3">
                        <span className="text-sm text-text-secondary">Scalability risk</span>
                        <span className={getRiskColorClass(debugReport.scalability_risk)}>{debugReport.scalability_risk.toUpperCase()}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-md border border-border-default bg-raised p-3">
                        <span className="text-sm text-text-secondary">Risk vector score</span>
                        <span className="font-mono text-white">{(debugReport.risk_score || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-md border border-border-default bg-raised p-3">
                        <span className="text-sm text-text-secondary">Transpilation cost</span>
                        <span className="font-mono text-accent-green">{debugReport.transpilation_cost.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="ql-card">
                    <div className="mb-3 flex items-center gap-3">
                      <span className="ql-code-chip text-accent-green">L4</span>
                      <h3 className="ql-panel-title">Behavioral Mismatch</h3>
                    </div>
                    {debugReport.kl_divergence !== null && debugReport.kl_divergence !== undefined ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between rounded-md border border-border-default bg-raised p-3">
                          <span className="text-sm text-text-secondary">KL divergence</span>
                          <span className={`font-mono ${debugReport.kl_divergence < 0.1 ? 'text-accent-emerald' : debugReport.kl_divergence < 0.5 ? 'text-accent-amber' : 'text-accent-rose'}`}>
                            {debugReport.kl_divergence.toFixed(4)}
                          </span>
                        </div>
                        {debugReport.kl_divergence_symmetrized !== null && (
                          <div className="flex items-center justify-between rounded-md border border-border-default bg-raised p-3">
                            <span className="text-sm text-text-secondary">Symmetrized KL</span>
                            <span className="font-mono text-white">{debugReport.kl_divergence_symmetrized.toFixed(4)}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-md border border-dashed border-border-default p-5 text-center font-mono text-xs text-text-muted">
                        KL divergence skipped for this circuit scale.
                      </div>
                    )}
                  </div>
                </div>

                {debugReport.recommendations?.length > 0 && (
                  <div className="ql-card border-accent-green/30 bg-accent-green/5">
                    <h3 className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-accent-green">Suggested fixes</h3>
                    <ul className="space-y-2">
                      {debugReport.recommendations.map((rec) => (
                        <li key={rec} className="flex items-start gap-2 text-sm text-text-primary">
                          <span className="mt-0.5 font-mono text-accent-green">&gt;</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
