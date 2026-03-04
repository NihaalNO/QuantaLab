import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              X-Repo: Quantum Debugger & Research Sandbox
            </h1>
            <p className="text-xl mb-8 text-primary-100">
              Deterministic debugging and reproducible quantum experimentation for researchers and developers.
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                to="/debugger"
                className="px-8 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition"
              >
                Start Debugging
              </Link>
              <Link
                to="/experiments"
                className="px-8 py-3 bg-primary-700 text-white rounded-lg font-semibold hover:bg-primary-600 transition"
              >
                Manage Experiments
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Core Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">Quantum Debugger</h3>
              <p className="text-gray-600">
                Analyze circuit structure, detect failures, and quantify noise sensitivity with deterministic diagnostics.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🧪</div>
              <h3 className="text-xl font-semibold mb-2">Research Sandbox</h3>
              <p className="text-gray-600">
                Versioned experiments with seed-controlled reproducibility and backend benchmarking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quantum Debugger Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Quantum Debugger</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-primary-600 mb-2">1</div>
              <h3 className="text-lg font-semibold mb-2">Structural Analysis</h3>
              <p className="text-gray-600 text-sm">
                Compute circuit depth, gate distribution, and detect redundancy patterns.
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-primary-600 mb-2">2</div>
              <h3 className="text-lg font-semibold mb-2">Noise Simulation</h3>
              <p className="text-gray-600 text-sm">
                Simulate depolarizing, amplitude damping, and phase damping noise models.
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-primary-600 mb-2">3</div>
              <h3 className="text-lg font-semibold mb-2">Scalability Assessment</h3>
              <p className="text-gray-600 text-sm">
                Estimate scalability limits using multi-qubit gate ratio and transpilation heuristics.
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-2xl font-bold text-primary-600 mb-2">4</div>
              <h3 className="text-lg font-semibold mb-2">Behavioral Mismatch</h3>
              <p className="text-gray-600 text-sm">
                Compare expected vs empirical distributions using KL divergence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Research Sandbox Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Research Sandbox</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-xl font-semibold mb-2">Versioned Experiments</h3>
              <p className="text-gray-600">
                Snapshot and version your experiments for reproducible research.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">Seed-Controlled Runs</h3>
              <p className="text-gray-600">
                Use seeds for deterministic, reproducible experiment execution.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Backend Benchmarking</h3>
              <p className="text-gray-600">
                Compare results across different quantum backends.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Export Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Research-Ready Exports</h2>
          <div className="text-center">
            <p className="text-gray-600 max-w-2xl mx-auto">
              Export your experiments in multiple formats including QASM, Qiskit code, and comprehensive metrics reports for publication and further analysis.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
