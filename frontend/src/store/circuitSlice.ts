import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { GateCell, SimulationResult } from '../types'

export interface CircuitState {
  qubits: number
  moments: number
  circuitMatrix: (GateCell | null)[][]
  simulationResult: SimulationResult | null
  isSimulating: boolean
}

function createEmptyMatrix(qubits: number, moments: number): (GateCell | null)[][] {
  return Array.from({ length: qubits }, () =>
    Array.from({ length: moments }, () => null)
  )
}

const initialState: CircuitState = {
  qubits: 3,
  moments: 8,
  circuitMatrix: createEmptyMatrix(3, 8),
  simulationResult: null,
  isSimulating: false,
}

const circuitSlice = createSlice({
  name: 'circuit',
  initialState,
  reducers: {
    placeGate(state, action: PayloadAction<{ qubit: number; moment: number; gate: GateCell }>) {
      const { qubit, moment, gate } = action.payload
      if (qubit >= 0 && qubit < state.qubits && moment >= 0 && moment < state.moments) {
        state.circuitMatrix[qubit][moment] = gate
      }
    },
    removeGate(state, action: PayloadAction<{ qubit: number; moment: number }>) {
      const { qubit, moment } = action.payload
      if (qubit >= 0 && qubit < state.qubits && moment >= 0 && moment < state.moments) {
        state.circuitMatrix[qubit][moment] = null
      }
    },
    addQubit(state) {
      if (state.qubits < 10) {
        state.qubits += 1
        state.circuitMatrix.push(Array.from({ length: state.moments }, () => null))
      }
    },
    removeQubit(state) {
      if (state.qubits > 1) {
        state.qubits -= 1
        state.circuitMatrix.pop()
      }
    },
    addMoment(state) {
      if (state.moments < 20) {
        state.moments += 1
        state.circuitMatrix.forEach(row => row.push(null))
      }
    },
    clearCircuit(state) {
      state.circuitMatrix = createEmptyMatrix(state.qubits, state.moments)
      state.simulationResult = null
    },
    setSimulationResult(state, action: PayloadAction<SimulationResult | null>) {
      state.simulationResult = action.payload
    },
    setIsSimulating(state, action: PayloadAction<boolean>) {
      state.isSimulating = action.payload
    },
  },
})

export const {
  placeGate,
  removeGate,
  addQubit,
  removeQubit,
  addMoment,
  clearCircuit,
  setSimulationResult,
  setIsSimulating,
} = circuitSlice.actions

export default circuitSlice.reducer
