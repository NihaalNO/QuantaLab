import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import type { Experiment, ExperimentResult, BenchmarkResult } from '../types'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'

// Recharts theme config for Quantalab
const chartColors = ['#00e5ff', '#7c3aed', '#f59e0b', '#10b981', '#f43f5e', '#38bdf8']
const chartTheme = {
  backgroundColor: 'transparent',
  fontFamily: 'JetBrains Mono, monospace',
  fontSize: 11,
  colors: chartColors,
  gridColor: '#1e2a45',
  axisColor: '#4a5a7a',
  tooltipBackground: '#0f1629',
  tooltipBorder: '#253354',
}

const DEFAULT_QASM = `OPENQASM 2.0;
include "qelib1.inc";
qreg q[2];
creg c[2];
h q[0];
cx q[0], q[1];
measure q[0] -> c[0];
measure q[1] -> c[1];`

const formatError = (err: any, defaultMsg: string): string => {
  const detail = err.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map((d: any) => `${d.loc?.join('.')}: ${d.msg}`).join(', ');
  return err.message || defaultMsg;
};

export default function Experiments() {
  const currentUser = true
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null)
  const [results, setResults] = useState<ExperimentResult[]>([])
  const [benchmarkResult, setBenchmarkResult] = useState<BenchmarkResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [newExperiment, setNewExperiment] = useState<{
    name: string;
    description: string;
    qasm_code: string;
    seed: number | null;
    backend: string;
    shots: number;
  }>({
    name: '',
    description: '',
    qasm_code: DEFAULT_QASM,
    seed: 42,
    backend: 'qasm_simulator',
    shots: 1024
  })
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'run'>('list')

  useEffect(() => {
    if (currentUser) {
      fetchExperiments()
    }
  }, [currentUser])

  const fetchExperiments = async () => {
    try {
      const response = await api.get('/experiments')
      const data = response.data.experiments || []
      setExperiments(data)
    } catch (err) {
      console.error('Failed to fetch experiments:', err)
      setExperiments([])
    }
  }

  const createExperiment = async () => {
    if (!newExperiment.name.trim()) {
      setError('Experiment name is required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await api.post('/experiments', newExperiment)
      setExperiments([response.data.experiment, ...experiments])
      setNewExperiment({
        name: '',
        description: '',
        qasm_code: DEFAULT_QASM,
        seed: 42,
        backend: 'qasm_simulator',
        shots: 1024
      })
    } catch (err: any) {
      setError(formatError(err, 'Failed to create experiment'))
    } finally {
      setIsLoading(false)
    }
  }

  const runExperiment = async (experiment: Experiment) => {
    setIsLoading(true)
    setError(null)
    setSelectedExperiment(experiment)

    try {
      const response = await api.post(`/experiments/${experiment.id}/run`, {
        experiment_id: experiment.id,
        backend: experiment.backend,
        shots: experiment.shots,
        seed: experiment.seed
      })
      setResults([response.data])
      setBenchmarkResult(null)
      setActiveTab('run')
    } catch (err: any) {
      setError(formatError(err, 'Failed to run experiment'))
    } finally {
      setIsLoading(false)
    }
  }

  const runBenchmark = async (experiment: Experiment) => {
    setIsLoading(true)
    setError(null)
    setSelectedExperiment(experiment)

    try {
      const response = await api.post(`/benchmark`, {
        qasm_code: experiment.qasm_code,
        backends: ['qasm_simulator', 'aer_simulator', 'statevector_simulator'],
        shots: experiment.shots,
        seed: experiment.seed
      })
      setBenchmarkResult(response.data)
      setResults([])
      setActiveTab('run')
    } catch (err: any) {
      setError(formatError(err, 'Failed to run benchmark'))
    } finally {
      setIsLoading(false)
    }
  }

  const exportExperiment = async (experiment: Experiment, format: 'qasm' | 'qiskit' | 'json') => {
    try {
      const response = await api.get(`/experiments/${experiment.id}/export`, {
        params: { format },
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${experiment.name}.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err: any) {
      setError(formatError(err, 'Failed to export experiment'))
    }
  }

  return (
    <div className="p-6 md:p-8 bg-void min-h-screen font-body text-text-primary max-w-[1400px] mx-auto">
      <div className="mb-8 border-b border-border-dim pb-4">
        <h1 className="text-2xl font-bold mb-1 tracking-wide uppercase">Quantum Research Sandbox</h1>
        <p className="text-text-secondary text-sm">
          Create versioned experiments, run reproducible simulations, and compare backends.
        </p>
      </div>

      {!currentUser && (
        <div className="bg-[#1f190f] border border-accent-amber border-opacity-30 rounded-sm p-4 mb-6">
          <p className="text-accent-amber font-mono text-sm">
            Sign in to create and manage experiments.
          </p>
        </div>
      )}

      {error && (
        <div className="bg-[#1a0f14] border border-accent-rose border-opacity-30 rounded-sm p-4 mb-6">
          <p className="text-accent-rose font-mono text-sm">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-border-dim">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 font-mono text-xs uppercase tracking-widest transition ${activeTab === 'list'
            ? 'text-accent-cyan border-b-2 border-accent-cyan'
            : 'text-text-secondary hover:text-text-primary border-b-2 border-transparent'
            }`}
        >
          My Experiments
        </button>
        {currentUser && (
          <>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 font-mono text-xs uppercase tracking-widest transition ${activeTab === 'create'
                ? 'text-accent-cyan border-b-2 border-accent-cyan'
                : 'text-text-secondary hover:text-text-primary border-b-2 border-transparent'
                }`}
            >
              Create New
            </button>
            {selectedExperiment && activeTab === 'run' && (
              <button
                onClick={() => setActiveTab('run')}
                className={`px-4 py-2 font-mono text-xs uppercase tracking-widest transition ${activeTab === 'run'
                  ? 'text-accent-cyan border-b-2 border-accent-cyan'
                  : 'text-text-secondary hover:text-text-primary border-b-2 border-transparent'
                  }`}
              >
                Run Results
              </button>
            )}
          </>
        )}
      </div>

      {/* List Tab */}
      {activeTab === 'list' && (
        <div>
          {currentUser ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-semibold tracking-wide uppercase text-text-primary">Your Experiments</h2>
                <button
                  onClick={() => setActiveTab('create')}
                  className="px-4 py-1.5 bg-accent-cyan text-void rounded-sm font-mono text-xs font-bold hover:bg-accent-cyan/90 transition uppercase"
                >
                  New Experiment
                </button>
              </div>

              {experiments.length === 0 ? (
                <div className="text-center py-12 bg-base border border-border-dim border-dashed rounded-sm panel">
                  <p className="text-text-muted mb-4 text-sm font-mono uppercase">No experiments yet.</p>
                  <Link
                    to="/experiments"
                    onClick={() => setActiveTab('create')}
                    className="text-accent-cyan hover:underline text-sm font-mono uppercase"
                  >
                    Create Experiment →
                  </Link>
                </div>
              ) : (
                <div className="dashboard-grid">
                  {experiments.map((experiment) => (
                    <div key={experiment.id} className="col-span-1 md:col-span-6 lg:col-span-4 bg-raised rounded-sm border border-border-dim p-6 hover:border-accent-cyan/50 transition panel">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-full">
                          <h3 className="text-lg font-bold text-text-primary mb-1">{experiment.name}</h3>
                          <p className="text-text-secondary text-sm h-10 overflow-hidden line-clamp-2">
                            {experiment.description || 'No description provided.'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4 mb-6 text-xs font-mono">
                        <span className="px-2 py-1 bg-border-dim text-text-primary rounded-sm border border-border-default">v{experiment.current_version}</span>
                        <span className="px-2 py-1 bg-void text-text-secondary rounded-sm border border-border-default">{experiment.backend}</span>
                        <span className="px-2 py-1 bg-void text-text-secondary rounded-sm border border-border-default">{experiment.shots} shots</span>
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                        <div className="text-[10px] text-text-muted font-mono">
                          {new Date(experiment.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => runExperiment(experiment)}
                            disabled={isLoading}
                            className="px-3 py-1 bg-accent-cyan text-void text-xs font-mono font-bold rounded-sm hover:bg-accent-cyan/90 disabled:opacity-50"
                          >
                            RUN
                          </button>
                          <button
                            onClick={() => runBenchmark(experiment)}
                            disabled={isLoading}
                            className="px-3 py-1 bg-base border border-border-default text-text-primary text-xs font-mono rounded-sm hover:bg-subtle disabled:opacity-50"
                          >
                            BENCHMARK
                          </button>

                          <div className="relative group">
                            <button className="px-3 py-1 bg-void border border-border-default text-text-secondary hover:text-text-primary text-xs font-mono rounded-sm transition">
                              ↓
                            </button>
                            <div className="absolute right-0 bottom-full mb-1 w-32 bg-raised border border-border-dim rounded-sm shadow-xl hidden group-hover:block z-10">
                              <button
                                onClick={() => exportExperiment(experiment, 'qasm')}
                                className="block w-full text-left px-4 py-2 text-xs font-mono text-text-secondary hover:bg-subtle hover:text-text-primary transition"
                              >
                                QASM
                              </button>
                              <button
                                onClick={() => exportExperiment(experiment, 'qiskit')}
                                className="block w-full text-left px-4 py-2 text-xs font-mono text-text-secondary hover:bg-subtle hover:text-text-primary transition"
                              >
                                Qiskit
                              </button>
                              <button
                                onClick={() => exportExperiment(experiment, 'json')}
                                className="block w-full text-left px-4 py-2 text-xs font-mono text-text-secondary hover:bg-subtle hover:text-text-primary transition"
                              >
                                JSON
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-base border border-border-dim border-dashed rounded-sm">
              <p className="text-text-muted font-mono mb-2">PLEASE SIGN IN TO VIEW EXPERIMENTS</p>
              <Link to="/login" className="text-accent-cyan hover:underline text-sm uppercase">
                Sign In →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Create Tab */}
      {activeTab === 'create' && currentUser && (
        <div className="dashboard-grid">
          <div className="col-span-1 lg:col-span-8 bg-raised rounded-sm border border-border-dim p-6 panel">
            <h2 className="text-[13px] font-bold tracking-widest text-text-muted uppercase border-b border-border-dim pb-3 mb-6">Create New Experiment</h2>

            <div className="grid gap-5">
              <div>
                <label className="block text-xs font-mono text-text-secondary mb-1.5 uppercase">
                  Experiment Name *
                </label>
                <input
                  type="text"
                  value={newExperiment.name}
                  onChange={(e) => setNewExperiment({ ...newExperiment, name: e.target.value })}
                  className="w-full px-3 py-2 bg-void border border-border-default rounded-sm focus:outline-none focus:border-accent-cyan text-sm text-text-primary font-mono"
                  placeholder="My Quantum Experiment"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-text-secondary mb-1.5 uppercase">
                  Description
                </label>
                <textarea
                  value={newExperiment.description}
                  onChange={(e) => setNewExperiment({ ...newExperiment, description: e.target.value })}
                  className="w-full px-3 py-2 bg-void border border-border-default rounded-sm focus:outline-none focus:border-accent-cyan text-sm text-text-primary resize-none"
                  rows={3}
                  placeholder="Optional description..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono text-text-secondary mb-1.5 uppercase">
                    Backend
                  </label>
                  <select
                    value={newExperiment.backend}
                    onChange={(e) => setNewExperiment({ ...newExperiment, backend: e.target.value })}
                    className="w-full px-3 py-2 bg-void border border-border-default rounded-sm focus:outline-none focus:border-accent-cyan text-sm text-text-primary font-mono"
                  >
                    <option value="qasm_simulator">QASM Simulator</option>
                    <option value="aer_simulator">Aer Simulator</option>
                    <option value="statevector_simulator">Statevector Simulator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-text-secondary mb-1.5 uppercase">
                    Shots
                  </label>
                  <input
                    type="number"
                    value={newExperiment.shots}
                    onChange={(e) => setNewExperiment({ ...newExperiment, shots: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-void border border-border-default rounded-sm focus:outline-none focus:border-accent-cyan text-sm text-text-primary font-mono"
                    min={1}
                    max={100000}
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-text-secondary mb-1.5 uppercase">
                    Seed (optional)
                  </label>
                  <input
                    type="number"
                    value={newExperiment.seed || ''}
                    onChange={(e) => setNewExperiment({ ...newExperiment, seed: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-3 py-2 bg-void border border-border-default rounded-sm focus:outline-none focus:border-accent-cyan text-sm text-text-primary font-mono"
                    placeholder="Random"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-text-secondary mb-1.5 uppercase flex justify-between">
                  <span>QASM Code</span>
                  <span className="text-text-muted">OPENQASM 2.0</span>
                </label>
                <div className="relative border border-border-dim rounded-sm overflow-hidden bg-void">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-border-default"></div>
                  <textarea
                    value={newExperiment.qasm_code}
                    onChange={(e) => setNewExperiment({ ...newExperiment, qasm_code: e.target.value })}
                    className="w-full h-48 font-mono text-[13px] pl-4 pr-3 py-3 bg-transparent focus:outline-none text-text-code resize-none leading-relaxed tracking-tight"
                    spellCheck="false"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border-dim">
                <button
                  onClick={() => setActiveTab('list')}
                  className="px-5 py-2 bg-base border border-border-default text-text-primary rounded-sm font-mono text-xs uppercase hover:bg-subtle transition"
                >
                  Cancel
                </button>
                <button
                  onClick={createExperiment}
                  disabled={isLoading}
                  className="px-5 py-2 bg-accent-cyan text-void font-bold rounded-sm font-mono text-xs uppercase hover:bg-accent-cyan/90 disabled:opacity-50 transition"
                >
                  {isLoading ? 'Creating...' : 'Create Experiment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Run Results Tab */}
      {activeTab === 'run' && selectedExperiment && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 p-4 bg-raised border border-border-dim rounded-sm">
            <div>
              <p className="text-xs font-mono text-accent-cyan mb-1 uppercase tracking-widest">Execute / Benchmark Results</p>
              <h2 className="text-xl font-bold text-text-primary">{selectedExperiment.name}</h2>
            </div>
            <button
              onClick={() => setActiveTab('list')}
              className="text-text-secondary hover:text-text-primary font-mono text-xs uppercase flex items-center gap-2"
            >
              <span className="text-lg leading-none">←</span> Back to Experiments
            </button>
          </div>

          {isLoading && (
            <div className="text-center py-16 bg-base border border-border-dim border-dashed rounded-sm">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-cyan mx-auto mb-4"></div>
              <p className="text-text-secondary font-mono text-sm uppercase">Processing execution telemetry...</p>
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <div className="dashboard-grid">
              {/* Telemetry Metrics */}
              <div className="col-span-1 lg:col-span-4 space-y-4">
                <div className="metric-card bg-raised border border-border-dim rounded-sm p-5 pb-6 panel">
                  <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-4">// EXECUTION SUMMARY</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-void p-2 border border-border-default rounded-sm">
                      <span className="text-xs text-text-secondary uppercase">Backend</span>
                      <span className="font-mono text-sm text-text-primary">{results[0].backend}</span>
                    </div>
                    <div className="flex justify-between items-center bg-void p-2 border border-border-default rounded-sm">
                      <span className="text-xs text-text-secondary uppercase">Shots</span>
                      <span className="font-mono text-sm text-text-primary">{results[0].shots}</span>
                    </div>
                    <div className="flex justify-between items-center bg-void p-2 border border-border-default rounded-sm">
                      <span className="text-xs text-text-secondary uppercase">Execution Time</span>
                      <span className="font-mono text-sm text-text-primary">{results[0].execution_time_ms.toFixed(2)} ms</span>
                    </div>
                    {results[0].fidelity !== null && (
                      <div className="flex justify-between items-center bg-void p-2 border border-accent-emerald border-opacity-30 rounded-sm">
                        <span className="text-xs text-text-secondary uppercase">Fidelity</span>
                        <span className="font-mono text-lg font-bold text-accent-emerald">
                          {(results[0].fidelity * 100).toFixed(2)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* State Distribution Chart */}
              <div className="col-span-1 lg:col-span-8 metric-card bg-raised border border-border-dim rounded-sm p-5 panel">
                <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-4">// STATE COUNT DISTRIBUTION</h3>

                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={Object.entries(results[0].counts).map(([state, count]) => ({ state, count }))}>
                      <CartesianGrid strokeDasharray="2 2" vertical={false} stroke={chartTheme.gridColor} />
                      <XAxis
                        dataKey="state"
                        tick={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fill: '#8896b3' }}
                        tickLine={{ stroke: chartTheme.axisColor }}
                        axisLine={{ stroke: chartTheme.axisColor }}
                      />
                      <YAxis
                        tick={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fill: '#8896b3' }}
                        tickLine={{ stroke: chartTheme.axisColor }}
                        axisLine={{ stroke: chartTheme.axisColor }}
                      />
                      <RechartsTooltip
                        cursor={{ fill: 'var(--bg-subtle)' }}
                        contentStyle={{
                          backgroundColor: chartTheme.tooltipBackground,
                          borderColor: chartTheme.tooltipBorder,
                          borderRadius: '2px',
                          fontFamily: 'JetBrains Mono, monospace',
                          color: '#e2e8f7'
                        }}
                      />
                      <Bar dataKey="count" fill={chartColors[0]} radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Raw State Counts Boxes */}
                <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mt-4 pt-4 border-t border-border-dim">
                  {Object.entries(results[0].counts).map(([state, count]) => (
                    <div key={state} className="bg-void border border-border-default rounded-sm p-2 text-center hover:border-accent-cyan/50 transition">
                      <div className="font-mono text-[10px] text-text-muted mb-1">|{state}⟩</div>
                      <div className="text-sm font-bold text-accent-cyan font-mono">{count}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!isLoading && benchmarkResult && (
            <div className="metric-card bg-raised border border-border-dim rounded-sm p-6 panel overflow-hidden">
              <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-4">// BACKEND BENCHMARK COMPARISON</h3>

              <div className="overflow-x-auto custom-scrollbar pb-2">
                <table className="w-full text-sm font-mono text-text-primary text-left">
                  <thead>
                    <tr className="border-b border-border-dim text-text-secondary text-[11px] uppercase tracking-widest bg-void">
                      <th className="py-3 px-4 font-normal">Metric</th>
                      {benchmarkResult.backends.map((backend) => (
                        <th key={backend} className="py-3 px-4 font-normal border-l border-border-dim">{backend}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-dim">
                    <tr className="hover:bg-subtle transition-colors">
                      <td className="py-3 px-4 text-text-muted">Circuit Depth</td>
                      {benchmarkResult.backends.map((backend) => (
                        <td key={backend} className="py-3 px-4 border-l border-border-dim">
                          {benchmarkResult.comparisons[backend]?.depth || '-'}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-subtle transition-colors">
                      <td className="py-3 px-4 text-text-muted">Gate Count</td>
                      {benchmarkResult.backends.map((backend) => (
                        <td key={backend} className="py-3 px-4 border-l border-border-dim">
                          {benchmarkResult.comparisons[backend]?.gate_count || '-'}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-subtle transition-colors bg-void bg-opacity-30">
                      <td className="py-3 px-4 text-text-muted">Fidelity</td>
                      {benchmarkResult.backends.map((backend) => {
                        const val = benchmarkResult.comparisons[backend]?.fidelity
                        return (
                          <td key={backend} className={`py-3 px-4 border-l border-border-dim font-bold ${!val ? 'text-text-secondary' : val >= 0.95 ? 'text-accent-emerald' : val >= 0.85 ? 'text-accent-amber' : 'text-accent-rose'
                            }`}>
                            {val ? `${(val * 100).toFixed(2)}%` : '-'}
                          </td>
                        )
                      })}
                    </tr>
                    <tr className="hover:bg-subtle transition-colors">
                      <td className="py-3 px-4 text-text-muted">Execution Time (ms)</td>
                      {benchmarkResult.backends.map((backend) => (
                        <td key={backend} className="py-3 px-4 border-l border-border-dim text-accent-indigo">
                          {benchmarkResult.comparisons[backend]?.execution_time_ms
                            ? benchmarkResult.comparisons[backend].execution_time_ms.toFixed(2)
                            : '-'}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
