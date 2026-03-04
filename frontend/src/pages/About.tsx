export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6">About X-Repo</h1>
      <div className="prose prose-lg max-w-none">
        <p className="text-lg text-gray-700 mb-6">
          X-Repo is a quantum tooling platform focused on deterministic debugging and reproducible quantum experimentation. We provide intelligent tools that explain circuit failure, quantify noise sensitivity, and enable research-grade experiment management.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">Our Mission</h2>
        <p className="text-gray-700 mb-6">
          Empower quantum developers and researchers with tools for deterministic circuit failure diagnosis, reproducible experiment versioning, and backend benchmarking.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">What We Offer</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
          <li><strong>Quantum Debugger:</strong> Structural analysis, noise sensitivity simulation, and scalability assessment for quantum circuits.</li>
          <li><strong>Research Sandbox:</strong> Versioned experiments with seed-controlled reproducible runs.</li>
          <li><strong>Backend Benchmarking:</strong> Compare results across different quantum backends.</li>
          <li><strong>Research Exports:</strong> Export QASM, Qiskit code, and metrics reports.</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">Technology Stack</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="font-semibold mb-2">Frontend</h3>
            <ul className="list-disc list-inside text-sm text-gray-600">
              <li>React 18 + TypeScript</li>
              <li>Tailwind CSS</li>
              <li>Firebase Authentication</li>
              <li>Supabase Realtime</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Backend</h3>
            <ul className="list-disc list-inside text-sm text-gray-600">
              <li>FastAPI (Python)</li>
              <li>Qiskit</li>
              <li>Supabase (PostgreSQL)</li>
              <li>Firebase Admin SDK</li>
            </ul>
          </div>
        </div>

        <h2 className="text-2xl font-bold mt-8 mb-4">Open Source</h2>
        <p className="text-gray-700 mb-4">
          X-Repo is open source and available under the MIT License. We welcome contributions from the quantum computing community!
        </p>
        <p className="text-gray-700">
          Whether you're a quantum researcher, algorithm developer, or student learning quantum computing, X-Repo provides the tools you need for rigorous experimentation and analysis.
        </p>
      </div>
    </div>
  )
}
