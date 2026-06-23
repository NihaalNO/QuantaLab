import { create } from 'zustand'

interface CircuitUIStore {
  hoveredCell: { qubit: number; moment: number } | null
  draggedGate: string | null
  placedCell: { qubit: number; moment: number } | null
  selectedCell: { qubit: number; moment: number } | null
  activeResultTab: 'probability' | 'amplitudes' | 'fidelity'
  setHoveredCell: (cell: { qubit: number; moment: number } | null) => void
  setDraggedGate: (gateId: string | null) => void
  setPlacedCell: (cell: { qubit: number; moment: number } | null) => void
  setSelectedCell: (cell: { qubit: number; moment: number } | null) => void
  setActiveResultTab: (tab: 'probability' | 'amplitudes' | 'fidelity') => void
}

export const useCircuitUIStore = create<CircuitUIStore>((set) => ({
  hoveredCell: null,
  draggedGate: null,
  placedCell: null,
  selectedCell: null,
  activeResultTab: 'probability',
  setHoveredCell: (cell) => set({ hoveredCell: cell }),
  setDraggedGate: (gateId) => set({ draggedGate: gateId }),
  setPlacedCell: (cell) => set({ placedCell: cell }),
  setSelectedCell: (cell) => set({ selectedCell: cell }),
  setActiveResultTab: (tab) => set({ activeResultTab: tab }),
}))
