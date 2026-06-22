import { useSelector } from 'react-redux'
import type { RootState } from '../../store'
import { useCircuitUIStore } from '../../store/useCircuitUIStore'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from 'recharts'

export default function ResultsPanel() {
  const { simulationResult, isSimulating } = useSelector((s: RootState) => s.circuit)
  const { activeResultTab, setActiveResultTab } = useCircuitUIStore()

  const tabs = [
    { id: 'probability' as const, label: 'Probabilities' },
    { id: 'amplitudes' as const, label: 'Amplitudes' },
    { id: 'fidelity' as const, label: 'Fidelity' },
  ]

  const getFidelityColor = (f: number) => {
    if (f >= 0.95) return 'text-accent-emerald'
    if (f >= 0.85) return 'text-accent-amber'
    return 'text-accent-rose'
  }

  const getFidelityBarColor = (f: number) => {
    if (f >= 0.95) return 'var(--accent-emerald)'
    if (f >= 0.85) return 'var(--accent-amber)'
    return 'var(--accent-rose)'
  }

  return (
    <div className="ql-card-soft flex h-full flex-col">
      {/* Header + Tabs */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-dim">
        <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
          Simulation Results
        </h3>
        {simulationResult && (
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveResultTab(tab.id)}
                className={`px-3 py-1 text-[10px] font-mono rounded transition-all ${
                  activeResultTab === tab.id
                    ? 'bg-accent-green/15 text-accent-green border border-accent-green/30'
                    : 'text-text-muted hover:text-text-secondary border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        {isSimulating && (
          <div className="h-48 flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 rounded-full border-t-2 border-accent-green animate-spin" />
            <div className="font-mono text-xs text-text-secondary space-y-1.5 bg-base p-3 border border-border-dim rounded">
              <p className="text-accent-green">OK QASM_SERIALIZED</p>
              <p className="text-text-primary animate-pulse">RUN STATEVECTOR_COMPUTING...</p>
              <p className="text-text-muted opacity-50">  NOISE_SIM_PENDING</p>
            </div>
          </div>
        )}

        {!simulationResult && !isSimulating && (
          <div className="h-48 flex flex-col items-center justify-center text-text-muted border border-border-dim border-dashed rounded-sm">
            <div className="font-mono text-xs mb-2">NO DATA</div>
            <p className="text-[11px]">Run a circuit to see simulation results.</p>
          </div>
        )}

        {simulationResult && !isSimulating && (
          <>
            {/* Probability Histogram */}
            {activeResultTab === 'probability' && (
              <div className="metric-card">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                    Basis State Probabilities
                  </span>
                  <span className="text-[10px] font-mono text-text-muted">
                    {simulationResult.probabilities.length} states
                  </span>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={simulationResult.probabilities} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-dim)" />
                      <XAxis
                        dataKey="state"
                        tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                        axisLine={{ stroke: 'var(--border-default)' }}
                        tickLine={{ stroke: 'var(--border-default)' }}
                      />
                      <YAxis
                        domain={[0, 1]}
                        tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                        axisLine={{ stroke: 'var(--border-default)' }}
                        tickLine={{ stroke: 'var(--border-default)' }}
                      />
                      <Tooltip
                        formatter={(v: number | string | undefined) => [`${(Number(v ?? 0) * 100).toFixed(2)}%`, 'Probability']}
                        contentStyle={{
                          backgroundColor: 'var(--bg-overlay)',
                          border: '1px solid var(--border-bright)',
                          borderRadius: 4,
                          fontSize: 11,
                          fontFamily: 'JetBrains Mono',
                          color: 'var(--text-primary)',
                        }}
                      />
                      <Bar dataKey="probability" radius={[4, 4, 0, 0]}>
                        {simulationResult.probabilities.map((_, idx) => (
                          <Cell key={idx} fill={idx % 2 === 0 ? '#6366f1' : '#818cf8'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Amplitude Chart */}
            {activeResultTab === 'amplitudes' && (
              <div className="metric-card">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                    Statevector Amplitudes
                  </span>
                  <div className="flex items-center gap-3 text-[9px] font-mono">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-sm" style={{ background: '#38e8ff' }} /> Real
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-sm" style={{ background: '#9b5cff' }} /> Imag
                    </span>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={simulationResult.amplitudes} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-dim)" />
                      <XAxis
                        dataKey="state"
                        tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                        axisLine={{ stroke: 'var(--border-default)' }}
                      />
                      <YAxis
                        domain={[-1, 1]}
                        tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                        axisLine={{ stroke: 'var(--border-default)' }}
                      />
                      <Tooltip
                        formatter={(v: number | string | undefined, name?: string) => [Number(v ?? 0).toFixed(4), name ?? '']}
                        contentStyle={{
                          backgroundColor: 'var(--bg-overlay)',
                          border: '1px solid var(--border-bright)',
                          borderRadius: 4,
                          fontSize: 11,
                          fontFamily: 'JetBrains Mono',
                          color: 'var(--text-primary)',
                        }}
                      />
                      <Bar dataKey="real" fill="#38e8ff" name="Real" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="imag" fill="#9b5cff" name="Imag" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Fidelity Tab */}
            {activeResultTab === 'fidelity' && (
              <div className="metric-card space-y-4">
                {/* Fidelity score badge */}
                <div className="bg-base border border-border-dim rounded-sm p-4">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                      Noise Fidelity (Depolarizing)
                    </span>
                    <span className={`font-mono text-3xl leading-none ${getFidelityColor(simulationResult.fidelity)}`}>
                      {(simulationResult.fidelity * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-border-dim h-2 rounded-full overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(simulationResult.fidelity * 100, 100)}%`,
                        backgroundColor: getFidelityBarColor(simulationResult.fidelity),
                        boxShadow: `0 0 8px ${getFidelityBarColor(simulationResult.fidelity)}66`,
                      }}
                    />
                  </div>
                </div>

                {/* Ideal vs Noisy bars */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-text-secondary w-12">Ideal</span>
                    <div className="flex-1 h-3 bg-border-dim rounded-full overflow-hidden">
                      <div className="h-3 bg-accent-emerald rounded-full" style={{ width: '100%' }} />
                    </div>
                    <span className="text-[10px] font-mono text-accent-emerald">100%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-text-secondary w-12">Noisy</span>
                    <div className="flex-1 h-3 bg-border-dim rounded-full overflow-hidden">
                      <div
                        className="h-3 rounded-full transition-all duration-700"
                        style={{
                          width: `${simulationResult.fidelity * 100}%`,
                          backgroundColor: getFidelityBarColor(simulationResult.fidelity),
                        }}
                      />
                    </div>
                    <span className={`text-[10px] font-mono ${getFidelityColor(simulationResult.fidelity)}`}>
                      {(simulationResult.fidelity * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Execution info */}
                {simulationResult.execution_time_ms && (
                  <div className="flex gap-px bg-border-dim border border-border-dim rounded-sm overflow-hidden mt-2">
                    <div className="bg-base p-3 flex-1">
                      <div className="text-[9px] text-text-muted uppercase mb-1">Execution Time</div>
                      <div className="text-sm font-mono text-text-primary">
                        {simulationResult.execution_time_ms.toFixed(1)} ms
                      </div>
                    </div>
                    <div className="bg-base p-3 flex-1">
                      <div className="text-[9px] text-text-muted uppercase mb-1">Qubits</div>
                      <div className="text-sm font-mono text-text-primary">
                        {simulationResult.num_qubits}
                      </div>
                    </div>
                    <div className="bg-base p-3 flex-1">
                      <div className="text-[9px] text-text-muted uppercase mb-1">Fidelity Score</div>
                      <div className={`text-sm font-mono ${getFidelityColor(simulationResult.fidelity)}`}>
                        {simulationResult.fidelity.toFixed(4)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
