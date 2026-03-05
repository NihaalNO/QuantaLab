import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="bg-void min-h-screen text-text-primary font-body">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-24">
        <div className="absolute inset-0 z-0 opacity-20">
          {/* Subtle Grid overlay for scientific feel */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e2a45_1px,transparent_1px),linear-gradient(to_bottom,#1e2a45_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl font-medium tracking-wide mb-6 text-white">
              Deterministic Quantum Debugging
            </h1>
            <p className="text-xl mb-10 text-text-secondary font-light max-w-2xl mx-auto">
              Algorithmic failure detection and reproducible quantum experimentation designed for researchers, built for precision.
            </p>
            <div className="flex justify-center space-x-6">
              <Link
                to="/debugger"
                className="px-8 py-3 bg-accent-cyan text-void rounded-[4px] font-mono tracking-widest font-semibold hover:bg-accent-cyan/90 transition hover:scale-95 active:scale-95 uppercase"
              >
                START DEBUGGING
              </Link>
              <Link
                to="/experiments"
                className="px-8 py-3 bg-raised border border-border-default text-text-primary rounded-[4px] font-mono tracking-widest font-semibold hover:bg-subtle transition hover:scale-95 active:scale-95 uppercase"
              >
                VIEW SANDBOX
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-base border-t border-border-dim">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1 bg-border-dim border border-border-dim">
            <div className="bg-raised p-10 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-subtle rounded flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
              </div>
              <h3 className="text-lg font-medium mb-3 text-text-primary uppercase tracking-wide">Quantum Debugger</h3>
              <p className="text-text-secondary text-sm leading-relaxed max-w-sm">
                Deep structural analysis, accurate noise modeling, and state distribution evaluation isolated in an intuitive interface.
              </p>
            </div>
            <div className="bg-raised p-10 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-subtle rounded flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-accent-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              </div>
              <h3 className="text-lg font-medium mb-3 text-text-primary uppercase tracking-wide">Research Sandbox</h3>
              <p className="text-text-secondary text-sm leading-relaxed max-w-sm">
                Reproducible logic execution spanning custom seed injection to strict benchmark reporting mapping exact execution states.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Export Section */}
      <section className="py-24 bg-void border-t border-border-dim">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-sm font-mono tracking-[0.2em] text-accent-amber mb-4">DATA INTEGRITY</h2>
            <h2 className="text-3xl font-medium tracking-wide mb-6">Research-Ready Exports</h2>
            <p className="text-text-secondary font-light max-w-xl mx-auto">
              Preserve strict experimental context when exporting to QASM outputs or structured scientific metadata JSON. No arbitrary data mutation.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
