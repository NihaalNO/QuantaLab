import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
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
  const { currentUser } = useAuth()
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
      setError(err.response?.data?.detail || 'Failed to analyze circuit')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getScalabilityColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'high': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Quantum Debugger</h1>
        <p className="text-gray-600">
          Analyze quantum circuits for structural issues, noise sensitivity, and scalability risks.
        </p>
      </div>

      {!currentUser && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">
            Sign in to save your experiments and access advanced features.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QASM Input */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">QASM Code Input</h2>
          <textarea
            value={qasmCode}
            onChange={(e) => setQasmCode(e.target.value)}
            className="w-full h-96 font-mono text-sm p-4 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter your OpenQASM 2.0 code here..."
          />
          <div className="mt-4 flex justify-end">
            <button
              onClick={analyzeCircuit}
              disabled={isAnalyzing}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Circuit'}
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Diagnostic Report</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {!debugReport && !isAnalyzing && !error && (
            <div className="text-center py-12 text-gray-500">
              <p>Enter QASM code and click "Analyze Circuit" to generate a diagnostic report.</p>
            </div>
          )}

          {isAnalyzing && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Running diagnostic analysis...</p>
            </div>
          )}

          {debugReport && (
            <div className="space-y-6">
              {/* Structural Analysis */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Structural Analysis</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600">Circuit Depth</div>
                    <div className="text-2xl font-bold text-primary-600">{debugReport.circuit_depth}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600">Multi-Qubit Gate Density</div>
                    <div className="text-2xl font-bold text-primary-600">
                      {(debugReport.multi_qubit_gate_density * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                {debugReport.idle_qubits.length > 0 && (
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="text-sm font-medium text-yellow-800 mb-1">Idle Qubits Detected</div>
                    <div className="text-yellow-700">
                      Qubits {debugReport.idle_qubits.join(', ')} are idle throughout the circuit.
                    </div>
                  </div>
                )}

                {debugReport.redundancy_patterns.length > 0 && (
                  <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="text-sm font-medium text-orange-800 mb-2">Redundancy Patterns</div>
                    <ul className="list-disc list-inside text-orange-700">
                      {debugReport.redundancy_patterns.map((pattern, idx) => (
                        <li key={idx}>{pattern}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Gate Distribution */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Gate Distribution</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(debugReport.gate_distribution).map(([gate, count]) => (
                    <span
                      key={gate}
                      className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                    >
                      {gate}: {count}
                    </span>
                  ))}
                </div>
              </div>

              {/* Noise Sensitivity */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Noise Sensitivity Analysis</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Noise Sensitivity Index</span>
                    <span className={`font-semibold ${
                      debugReport.noise_sensitivity_index < 0.3 ? 'text-green-600' :
                      debugReport.noise_sensitivity_index < 0.7 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {debugReport.noise_sensitivity_index.toFixed(3)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-600">Depolarizing</div>
                      <div className="font-semibold text-green-600">
                        {(debugReport.depolarizing_fidelity * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-600">Amplitude Damping</div>
                      <div className="font-semibold text-green-600">
                        {(debugReport.amplitude_damping_fidelity * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-600">Phase Damping</div>
                      <div className="font-semibold text-green-600">
                        {(debugReport.phase_damping_fidelity * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scalability Assessment */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Scalability Assessment</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Scalability Risk</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScalabilityColor(debugReport.scalability_risk)}`}>
                      {debugReport.scalability_risk.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Transpilation Cost</span>
                    <span className="font-semibold">{debugReport.transpilation_cost.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Optimization Recommendations */}
              {debugReport.optimization_recommendations.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Optimization Recommendations</h3>
                  <ul className="space-y-2">
                    {debugReport.optimization_recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                        <span className="text-blue-600 mt-0.5">💡</span>
                        <span className="text-blue-800">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Behavioral Mismatch */}
              {debugReport.kl_divergence !== null && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Behavioral Mismatch Detection</h3>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">KL Divergence</span>
                    <span className={`font-semibold ${
                      debugReport.kl_divergence < 0.1 ? 'text-green-600' :
                      debugReport.kl_divergence < 0.5 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {debugReport.kl_divergence.toFixed(4)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Lower KL divergence indicates closer match between expected and empirical distributions.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
