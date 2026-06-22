import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const metrics = [
  { label: 'Active experiments', value: '128', delta: '+18%' },
  { label: 'Avg. fidelity', value: '97.4%', delta: '+2.1%' },
  { label: 'Backend runs', value: '4.8k', delta: '24h' },
  { label: 'Failure patterns', value: '36', delta: 'mapped' },
]

const capabilities = [
  {
    title: 'Quantum Debugger',
    body: 'Four-layer diagnostics for structural issues, noise sensitivity, scalability risk, and behavioral mismatch.',
    href: '/dashboard/debugger',
    accent: 'var(--accent-green)',
  },
  {
    title: 'Research Sandbox',
    body: 'Versioned experiments with seed-controlled runs, reproducible backend comparisons, and exportable evidence.',
    href: '/dashboard/sandbox',
    accent: 'var(--accent-violet)',
  },
  {
    title: 'Circuit Visualization',
    body: 'Drag gates onto a responsive quantum canvas, simulate state distributions, and inspect fidelity trends.',
    href: '/dashboard/circuit-visualizer',
    accent: 'var(--accent-cyan)',
  },
  {
    title: 'Experiment Tracking',
    body: 'Track research activity, saved projects, analysis history, and collaboration-ready experiment records.',
    href: '/dashboard',
    accent: 'var(--accent-blue)',
  },
]

function QuantumVisualization() {
  return (
    <div className="ql-card relative min-h-[420px] overflow-hidden p-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,217,146,0.14),transparent_34%),linear-gradient(rgba(61,58,57,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(61,58,57,0.18)_1px,transparent_1px)] bg-[size:auto,40px_40px,40px_40px]" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 520 420" fill="none" aria-hidden="true">
        <g className="quantum-orbit" opacity="0.9">
          <ellipse cx="260" cy="210" rx="176" ry="56" stroke="var(--accent-green)" strokeOpacity="0.55" />
          <ellipse cx="260" cy="210" rx="176" ry="56" stroke="var(--accent-cyan)" strokeOpacity="0.3" transform="rotate(60 260 210)" />
        </g>
        <g className="quantum-orbit-slow" opacity="0.8">
          <ellipse cx="260" cy="210" rx="138" ry="96" stroke="var(--accent-violet)" strokeOpacity="0.42" transform="rotate(128 260 210)" />
          <ellipse cx="260" cy="210" rx="210" ry="76" stroke="var(--accent-blue)" strokeOpacity="0.24" transform="rotate(22 260 210)" />
        </g>
        <circle cx="260" cy="210" r="34" fill="var(--bg-base)" stroke="var(--accent-green)" />
        <circle cx="260" cy="210" r="6" fill="var(--accent-green)" />
        <circle cx="104" cy="158" r="5" fill="var(--accent-cyan)" />
        <circle cx="413" cy="263" r="5" fill="var(--accent-violet)" />
        <circle cx="350" cy="108" r="4" fill="var(--accent-blue)" />
      </svg>
      <div className="relative z-10 flex h-full min-h-[420px] flex-col justify-between p-6">
        <div className="flex items-center justify-between">
          <span className="ql-chip border-accent-green/30 bg-accent-green/10 text-accent-green">Live simulation fabric</span>
          <span className="font-mono text-[11px] text-text-muted">latency 18ms</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {metrics.slice(0, 2).map((metric) => (
            <div key={metric.label} className="rounded-md border border-border-default bg-base/85 p-4 backdrop-blur">
              <div className="font-mono text-2xl text-white">{metric.value}</div>
              <div className="mt-1 text-xs text-text-muted">{metric.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const { user, isLoading } = useAuth()
  const startHref = !isLoading && user ? '/dashboard' : '/login'

  return (
    <div className="ql-page">
      <section className="ql-container grid items-center gap-8 pt-10 lg:grid-cols-[1fr_520px] lg:pt-14">
        <div className="space-y-7">
          <div className="space-y-4">
            <div className="ql-eyebrow">Quantum research platform</div>
            <h1 className="ql-title max-w-4xl">
              Deterministic quantum debugging for serious research teams.
            </h1>
            <p className="ql-subtitle">
              QuantaLab turns circuits, simulations, benchmarks, and failure analysis into one production-grade
              workspace for reproducible quantum experimentation.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to={startHref} className="ql-button-primary">Get Started</Link>
            <Link to="/about" className="ql-button-secondary">View Documentation</Link>
            <Link to={startHref} className="ql-button-ghost">Start debugging</Link>
          </div>

          <div className="grid gap-px overflow-hidden rounded-md border border-border-default bg-border-dim sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <div key={metric.label} className="bg-base p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-mono text-2xl text-white">{metric.value}</div>
                    <div className="mt-1 text-xs text-text-muted">{metric.label}</div>
                  </div>
                  <span className="ql-code-chip text-accent-green">{metric.delta}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <QuantumVisualization />
      </section>

      <section className="ql-container ql-section">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="ql-eyebrow mb-3">Everything connected</div>
            <h2 className="text-3xl font-normal tracking-[-0.03em] text-white">A complete quantum workflow</h2>
          </div>
          <p className="max-w-2xl text-text-secondary">
            Build circuits, diagnose risks, run simulations, compare backends, and preserve the full context for papers,
            notebooks, and engineering reviews.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {capabilities.map((capability) => (
            <Link key={capability.title} to={user ? capability.href : '/login'} className="ql-card group min-h-[220px]">
              <div className="mb-8 h-1 w-12 rounded-full transition group-hover:w-20" style={{ backgroundColor: capability.accent }} />
              <h3 className="mb-3 text-xl font-semibold text-white">{capability.title}</h3>
              <p className="text-sm leading-6 text-text-secondary">{capability.body}</p>
              <div className="mt-8 font-mono text-xs uppercase tracking-[0.16em] text-accent-green">
                {user ? 'Open module' : 'Sign in to use'}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="ql-container ql-section grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="ql-card-soft">
          <div className="ql-eyebrow mb-4">Research pipeline</div>
          <div className="space-y-4">
            {['Define circuit and dataset', 'Run deterministic simulations', 'Analyze failures and fidelity', 'Export reproducible artifacts'].map((step, index) => (
              <div key={step} className="flex gap-4 rounded-md border border-border-default bg-base p-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-accent-green/30 bg-accent-green/10 font-mono text-xs text-accent-green">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="font-medium text-white">{step}</h3>
                  <p className="text-sm text-text-muted">Structured, inspectable, and ready for collaboration.</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="ql-card-soft">
          <div className="ql-eyebrow mb-4">Platform foundations</div>
          <div className="space-y-3">
            {['Supabase Auth with Google provider', 'Row-level secured activity tables', 'Protected dashboard and research tools'].map((item) => (
              <div key={item} className="rounded-md border border-border-default bg-base p-4">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-accent-green" />
                  <div className="text-sm text-text-secondary">{item}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="ql-container border-t border-border-default py-8 text-sm text-text-muted">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <span>QuantaLab research workspace</span>
          <span className="font-mono">debugger / visualizer / sandbox / analytics</span>
        </div>
      </footer>
    </div>
  )
}
