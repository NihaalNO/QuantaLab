const stack = [
  ['Frontend', 'React, TypeScript, Tailwind, Recharts, Zustand, Redux Toolkit'],
  ['Backend', 'FastAPI, Qiskit, Supabase Auth, Supabase Postgres'],
  ['Research layer', 'OpenQASM, reproducible seeds, backend benchmarks, export artifacts'],
]

export default function About() {
  return (
    <div className="ql-page">
      <div className="ql-container max-w-5xl">
        <div className="mb-10 border-b border-dashed border-border-default pb-8">
          <div className="ql-eyebrow mb-3">Documentation</div>
          <h1 className="ql-title">About QuantaLab</h1>
          <p className="ql-subtitle mt-4">
            QuantaLab is a quantum tooling platform focused on deterministic debugging and reproducible quantum experimentation.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <section className="ql-card-soft">
            <h2 className="mb-3 text-2xl font-normal tracking-[-0.02em] text-white">Mission</h2>
            <p className="text-text-secondary">
              Empower quantum developers and researchers with tools for circuit failure diagnosis, experiment versioning,
              backend benchmarking, and research-grade reporting.
            </p>
          </section>

          <section className="ql-card-soft">
            <h2 className="mb-3 text-2xl font-normal tracking-[-0.02em] text-white">What We Offer</h2>
            <ul className="space-y-2 text-text-secondary">
              <li>Quantum debugger with structural, noise, scalability, and behavior analysis.</li>
              <li>Research sandbox with seed-controlled reproducible runs.</li>
              <li>Backend benchmarking and QASM, Qiskit, JSON exports.</li>
            </ul>
          </section>
        </div>

        <section className="ql-section">
          <div className="mb-6">
            <div className="ql-eyebrow mb-3">System architecture</div>
            <h2 className="text-3xl font-normal tracking-[-0.03em] text-white">Built for inspectable research workflows</h2>
          </div>
          <div className="grid gap-px overflow-hidden rounded-md border border-border-default bg-border-dim">
            {stack.map(([title, description]) => (
              <div key={title} className="bg-base p-5 md:grid md:grid-cols-[180px_1fr] md:gap-6">
                <div className="font-mono text-xs uppercase tracking-[0.16em] text-accent-green">{title}</div>
                <div className="mt-2 text-text-secondary md:mt-0">{description}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
