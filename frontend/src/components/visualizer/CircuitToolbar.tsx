import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '../../store'
import {
  addQubit,
  removeQubit,
  addMoment,
  clearCircuit,
  setSimulationResult,
  setIsSimulating,
} from '../../store/circuitSlice'
import { toQASM } from '../../utils/qasm'
import api from '../../services/api'

export default function CircuitToolbar() {
  const dispatch = useDispatch()
  const { qubits, moments, circuitMatrix, isSimulating } = useSelector((state: RootState) => state.circuit)
  const gateCount = circuitMatrix.flat().filter(Boolean).length

  const handleRun = async () => {
    if (gateCount === 0) return

    dispatch(setIsSimulating(true))
    dispatch(setSimulationResult(null))

    try {
      const qasmStr = toQASM(circuitMatrix, qubits)
      const response = await api.post('/visualizer/simulate', {
        qasm_code: qasmStr,
        shots: 1024,
      })
      dispatch(setSimulationResult(response.data))
    } catch (err: any) {
      console.error('Simulation failed:', err)
    } finally {
      dispatch(setIsSimulating(false))
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-border-default bg-base px-4 py-2.5">
      <button
        onClick={handleRun}
        disabled={isSimulating || gateCount === 0}
        className={`flex min-h-10 items-center gap-2 rounded-md px-4 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest transition-all ${
          isSimulating
            ? 'bg-accent-violet text-white simulate-pulse'
            : gateCount === 0
            ? 'cursor-not-allowed bg-subtle text-text-muted'
            : 'bg-accent-green text-base hover:bg-[#2fd6a1]'
        }`}
      >
        {isSimulating && <span className="h-2 w-2 rounded-full bg-white/60 animate-pulse" />}
        {isSimulating ? 'Simulating...' : 'Run'}
      </button>

      <div className="h-5 w-px bg-border-dim" />

      <button
        onClick={() => dispatch(addQubit())}
        disabled={qubits >= 10}
        className="rounded-md border border-border-default bg-raised px-3 py-1.5 font-mono text-[10px] text-text-secondary transition hover:border-border-bright hover:text-text-primary disabled:opacity-30"
        title="Add qubit wire"
      >
        + Qubit
      </button>
      <button
        onClick={() => dispatch(removeQubit())}
        disabled={qubits <= 1}
        className="rounded-md border border-border-default bg-raised px-3 py-1.5 font-mono text-[10px] text-text-secondary transition hover:border-border-bright hover:text-text-primary disabled:opacity-30"
        title="Remove last qubit"
      >
        - Qubit
      </button>
      <button
        onClick={() => dispatch(addMoment())}
        disabled={moments >= 20}
        className="rounded-md border border-border-default bg-raised px-3 py-1.5 font-mono text-[10px] text-text-secondary transition hover:border-border-bright hover:text-text-primary disabled:opacity-30"
        title="Add time step"
      >
        + Moment
      </button>

      <div className="h-5 w-px bg-border-dim" />

      <button
        onClick={() => dispatch(clearCircuit())}
        className="rounded-md border border-border-default bg-raised px-3 py-1.5 font-mono text-[10px] text-accent-rose/80 transition hover:border-accent-rose/30 hover:text-accent-rose"
      >
        Clear
      </button>

      <div className="ml-auto flex items-center gap-4 font-mono text-[10px] text-text-muted">
        <span>{qubits} qubits</span>
        <span>{moments} moments</span>
        <span>{gateCount} gates</span>
      </div>
    </div>
  )
}
