import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import type { Experiment, ExperimentResult, BenchmarkResult } from '../types'

const DEFAULT_QASM = `OPENQASM 2.0;
include "qelib1.inc";
qreg q[2];
creg c[2];
h q[0];
cx q[0], q[1];
measure q[0] -> c[0];
measure q[1] -> c[1];`

export default function Experiments() {
  const { currentUser } = useAuth()
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null)
  const [results, setResults] = useState<ExperimentResult[]>([])
  const [benchmarkResult, setBenchmarkResult] = useState<BenchmarkResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newExperiment, setNewExperiment] = useState({
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
      const response = await api.get('/experiments/')
      setExperiments(response.data)
    } catch (err) {
      console.error('Failed to fetch experiments:', err)
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
      const response = await api.post('/experiments/', newExperiment)
      setExperiments([response.data, ...experiments])
      setShowNewForm(false)
      setNewExperiment({
        name: '',
        description: '',
        qasm_code: DEFAULT_QASM,
        seed: 42,
        backend: 'qasm_simulator',
        shots: 1024
      })
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create experiment')
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
        backend: experiment.backend,
        shots: experiment.shots,
        seed: experiment.seed
      })
      setResults(response.data.results)
      setBenchmarkResult(null)
      setActiveTab('run')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to run experiment')
    } finally {
      setIsLoading(false)
    }
  }

  const runBenchmark = async (experiment: Experiment) => {
    setIsLoading(true)
    setError(null)
    setSelectedExperiment(experiment)

    try {
      const response = await api.post(`/experiments/${experiment.id}/benchmark`, {
        backends: ['qasm_simulator', 'aer_simulator', 'statevector_simulator'],
        shots: experiment.shots
      })
      setBenchmarkResult(response.data)
      setResults([])
      setActiveTab('run')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to run benchmark')
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
      setError(err.response?.data?.detail || 'Failed to export experiment')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Quantum Research Sandbox</h1>
        <p className="text-gray-600">
          Create versioned experiments, run reproducible simulations, and compare backends.
        </p>
      </div>

      {!currentUser && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">
            Sign in to create and manage experiments.
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === 'list'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          My Experiments
        </button>
        {currentUser && (
          <>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 font-medium border-b-2 transition ${
                activeTab === 'create'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Create New
            </button>
            {selectedExperiment && activeTab === 'run' && (
              <button
                onClick={() => setActiveTab('run')}
                className={`px-4 py-2 font-medium border-b-2 transition ${
                  activeTab === 'run'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
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
                <h2 className="text-xl font-semibold">Your Experiments</h2>
                <button
                  onClick={() => setActiveTab('create')}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  New Experiment
                </button>
              </div>

              {experiments.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border">
                  <p className="text-gray-500 mb-4">No experiments yet. Create your first experiment to get started.</p>
                  <Link
                    to="/experiments"
                    onClick={() => setActiveTab('create')}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    Create Experiment →
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4">
                  {experiments.map((experiment) => (
                    <div key={experiment.id} className="bg-white rounded-lg border p-6 hover:shadow-md transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold">{experiment.name}</h3>
                          <p className="text-gray-600 text-sm mt-1">
                            {experiment.description || 'No description'}
                          </p>
                          <div className="flex gap-4 mt-3 text-sm text-gray-500">
                            <span>Version {experiment.version}</span>
                            <span>Backend: {experiment.backend}</span>
                            <span>Shots: {experiment.shots}</span>
                            {experiment.seed && <span>Seed: {experiment.seed}</span>}
                            <span>Created: {new Date(experiment.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => runExperiment(experiment)}
                            disabled={isLoading}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            Run
                          </button>
                          <button
                            onClick={() => runBenchmark(experiment)}
                            disabled={isLoading}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                          >
                            Benchmark
                          </button>
                          <div className="relative group">
                            <button className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                              Export
                            </button>
                            <div className="absolute right-0 mt-1 w-32 bg-white border rounded-lg shadow-lg hidden group-hover:block z-10">
                              <button
                                onClick={() => exportExperiment(experiment, 'qasm')}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-50"
                              >
                                QASM
                              </button>
                              <button
                                onClick={() => exportExperiment(experiment, 'qiskit')}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-50"
                              >
                                Qiskit
                              </button>
                              <button
                                onClick={() => exportExperiment(experiment, 'json')}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-50"
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
            <div className="text-center py-12 bg-white rounded-lg border">
              <p className="text-gray-500">Please sign in to view and manage your experiments.</p>
              <Link to="/login" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
                Sign In →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Create Tab */}
      {activeTab === 'create' && currentUser && (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-6">Create New Experiment</h2>

          <div className="grid gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experiment Name *
              </label>
              <input
                type="text"
                value={newExperiment.name}
                onChange={(e) => setNewExperiment({ ...newExperiment, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="My Quantum Experiment"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={newExperiment.description}
                onChange={(e) => setNewExperiment({ ...newExperiment, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                rows={3}
                placeholder="Optional description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                QASM Code
              </label>
              <textarea
                value={newExperiment.qasm_code}
                onChange={(e) => setNewExperiment({ ...newExperiment, qasm_code: e.target.value })}
                className="w-full h-48 font-mono text-sm p-4 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-primary-500"
                placeholder="OPENQASM 2.0; ..."
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Backend
                </label>
                <select
                  value={newExperiment.backend}
                  onChange={(e) => setNewExperiment({ ...newExperiment, backend: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="qasm_simulator">QASM Simulator</option>
                  <option value="aer_simulator">Aer Simulator</option>
                  <option value="statevector_simulator">Statevector Simulator</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shots
                </label>
                <input
                  type="number"
                  value={newExperiment.shots}
                  onChange={(e) => setNewExperiment({ ...newExperiment, shots: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  min={1}
                  max={100000}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seed (optional)
                </label>
                <input
                  type="number"
                  value={newExperiment.seed || ''}
                  onChange={(e) => setNewExperiment({ ...newExperiment, seed: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Random"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setActiveTab('list')}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={createExperiment}
                disabled={isLoading}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Experiment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Run Results Tab */}
      {activeTab === 'run' && selectedExperiment && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">{selectedExperiment.name}</h2>
              <p className="text-gray-600">Run Results</p>
            </div>
            <button
              onClick={() => setActiveTab('list')}
              className="text-primary-600 hover:text-primary-700"
            >
              ← Back to Experiments
            </button>
          </div>

          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Running experiment...</p>
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Execution Results</h3>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Backend</div>
                  <div className="font-semibold">{results[0].backend}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Execution Time</div>
                  <div className="font-semibold">{results[0].execution_time_ms.toFixed(2)} ms</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Shots</div>
                  <div className="font-semibold">{results[0].shots}</div>
                </div>
                {results[0].fidelity !== null && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600">Fidelity</div>
                    <div className="font-semibold text-green-600">
                      {(results[0].fidelity * 100).toFixed(2)}%
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-medium mb-3">Measurement Counts</h4>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(results[0].counts).map(([state, count]) => (
                    <div key={state} className="bg-gray-50 rounded p-3 text-center">
                      <div className="font-mono text-sm">|{state}⟩</div>
                      <div className="text-lg font-bold text-primary-600">{count}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!isLoading && benchmarkResult && (
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Backend Benchmark Comparison</h3>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Metric</th>
                      {benchmarkResult.backends.map((backend) => (
                        <th key={backend} className="text-right py-3 px-4">{backend}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Circuit Depth</td>
                      {benchmarkResult.backends.map((backend) => (
                        <td key={backend} className="text-right py-3 px-4">
                          {benchmarkResult.depth_comparison[backend] || '-'}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Gate Count</td>
                      {benchmarkResult.backends.map((backend) => (
                        <td key={backend} className="text-right py-3 px-4">
                          {benchmarkResult.gate_count_comparison[backend] || '-'}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Fidelity</td>
                      {benchmarkResult.backends.map((backend) => (
                        <td key={backend} className="text-right py-3 px-4">
                          {benchmarkResult.fidelity_comparison[backend]
                            ? `${(benchmarkResult.fidelity_comparison[backend] * 100).toFixed(2)}%`
                            : '-'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">Execution Time (ms)</td>
                      {benchmarkResult.backends.map((backend) => (
                        <td key={backend} className="text-right py-3 px-4">
                          {benchmarkResult.execution_time_comparison[backend]
                            ? benchmarkResult.execution_time_comparison[backend].toFixed(2)
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
