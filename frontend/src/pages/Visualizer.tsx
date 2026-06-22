import { Provider } from 'react-redux'
import { store } from '../store'
import GatePalette from '../components/visualizer/GatePalette'
import CircuitCanvas from '../components/visualizer/CircuitCanvas'
import CircuitToolbar from '../components/visualizer/CircuitToolbar'
import ResultsPanel from '../components/visualizer/ResultsPanel'

export default function Visualizer() {
  return (
    <Provider store={store}>
      <div className="ql-page">
        <div className="ql-container max-w-[1600px]">
          <div className="mb-6 border-b border-dashed border-border-default pb-6">
            <div className="ql-eyebrow mb-3">Circuit Visualizer</div>
            <h1 className="text-3xl font-normal tracking-[-0.03em] text-white md:text-4xl">Interactive quantum circuit workspace</h1>
            <p className="mt-3 max-w-3xl text-text-secondary">
              Drag quantum gates onto the canvas, run simulations, and visualize results in real time.
            </p>
          </div>

          <div className="mb-4">
            <CircuitToolbar />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="order-2 lg:order-1 lg:col-span-2">
              <GatePalette />
            </div>
            <div className="order-1 lg:order-2 lg:col-span-6">
              <CircuitCanvas />
            </div>
            <div className="order-3 lg:col-span-4">
              <ResultsPanel />
            </div>
          </div>
        </div>
      </div>
    </Provider>
  )
}
