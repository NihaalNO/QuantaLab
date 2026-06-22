export default function FAQ() {
  const faqs = [
    {
      question: 'What is QuantaLab?',
      answer: 'QuantaLab is a quantum research workspace for circuit debugging, simulation, experiment management, and backend benchmarking.',
    },
    {
      question: 'What does the debugger analyze?',
      answer: 'It evaluates circuit structure, noise sensitivity, scalability risk, and behavioral mismatch so researchers can isolate failure modes faster.',
    },
    {
      question: 'Can I reproduce experiment runs?',
      answer: 'Yes. Experiments support explicit seeds, shot counts, backend selection, version metadata, and exportable artifacts.',
    },
    {
      question: 'Which exports are supported?',
      answer: 'The sandbox supports QASM, Qiskit-oriented output, and structured JSON metadata for research records.',
    },
    {
      question: 'Does QuantaLab preserve existing API integrations?',
      answer: 'Yes. The frontend calls the existing FastAPI endpoints for analysis, experiments, benchmarks, exports, and contact messages.',
    },
    {
      question: 'Is QuantaLab open source?',
      answer: 'Yes. The project is MIT licensed and intended for quantum developers, researchers, and students.',
    },
  ]

  return (
    <div className="ql-page">
      <div className="ql-container max-w-5xl">
        <div className="mb-10 border-b border-dashed border-border-default pb-8">
          <div className="ql-eyebrow mb-3">FAQ</div>
          <h1 className="ql-title">Frequently asked questions</h1>
          <p className="ql-subtitle mt-4">Clear answers for researchers adopting QuantaLab in a lab or engineering workflow.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {faqs.map((faq) => (
            <article key={faq.question} className="ql-card">
              <h2 className="mb-3 text-lg font-semibold text-white">{faq.question}</h2>
              <p className="text-sm leading-6 text-text-secondary">{faq.answer}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
