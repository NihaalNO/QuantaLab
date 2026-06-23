import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '../../store'
import { placeGate, removeGate } from '../../store/circuitSlice'
import { useCircuitUIStore } from '../../store/useCircuitUIStore'
import { GATE_LIBRARY } from './GatePalette'
import type { GateCell } from '../../types'

const CELL_SIZE = 48
const WIRE_PADDING = 24
const LABEL_WIDTH = 48

export default function CircuitCanvas() {
  const dispatch = useDispatch()
  const { qubits, moments, circuitMatrix } = useSelector((s: RootState) => s.circuit)
  const { hoveredCell, selectedCell, placedCell, draggedGate, setHoveredCell, setSelectedCell, setPlacedCell } = useCircuitUIStore()

  const svgWidth = LABEL_WIDTH + moments * CELL_SIZE + WIRE_PADDING
  const svgHeight = qubits * CELL_SIZE + WIRE_PADDING * 2

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  const handleDrop = (e: React.DragEvent, qubit: number, moment: number) => {
    e.preventDefault()
    const gateId = e.dataTransfer.getData('gateId')
    if (!gateId) return

    const gateDef = GATE_LIBRARY.find((g) => g.id === gateId)
    if (!gateDef) return

    const cell: GateCell = {
      gateId: gateDef.id,
      label: gateDef.label,
      color: gateDef.color,
      category: gateDef.category,
      params: gateDef.hasParams ? [Math.PI / 4] : undefined,
    }

    // For multi-qubit gates, set target to next qubit
    if (gateDef.numQubits === 2 && qubit < qubits - 1) {
      cell.targetQubit = qubit + 1
    }
    if (gateDef.numQubits === 3 && qubit < qubits - 2) {
      cell.controlQubit = qubit + 1
      cell.targetQubit = qubit + 2
    }

    dispatch(placeGate({ qubit, moment, gate: cell }))
    setPlacedCell({ qubit, moment })
    window.setTimeout(() => {
      useCircuitUIStore.getState().setPlacedCell(null)
    }, 520)
    useCircuitUIStore.getState().setDraggedGate(null)
  }

  const handleCellClick = (qubit: number, moment: number) => {
    const current = circuitMatrix[qubit]?.[moment]
    if (selectedCell?.qubit === qubit && selectedCell?.moment === moment) {
      // Deselect
      setSelectedCell(null)
    } else if (current) {
      setSelectedCell({ qubit, moment })
    } else {
      setSelectedCell(null)
    }
  }

  const handleDelete = () => {
    if (selectedCell) {
      dispatch(removeGate({ qubit: selectedCell.qubit, moment: selectedCell.moment }))
      setSelectedCell(null)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedCell) {
      handleDelete()
    }
  }

  return (
    <div
      className="bg-[#0a0f1e] border border-border-dim rounded-sm overflow-auto custom-scrollbar"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Delete hint */}
      {selectedCell && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#1a0a2e] border-b border-border-dim">
          <span className="text-[10px] text-accent-violet font-mono">
            SELECTED: q[{selectedCell.qubit}] @ m{selectedCell.moment}
          </span>
          <button
            onClick={handleDelete}
            className="text-[10px] font-mono text-accent-rose hover:text-white transition px-2 py-0.5 border border-accent-rose/30 rounded"
          >
            DELETE
          </button>
        </div>
      )}

      <svg
        width={svgWidth}
        height={svgHeight}
        className="block"
        style={{ minWidth: svgWidth, minHeight: svgHeight }}
      >
        {/* Background grid lines */}
        {Array.from({ length: moments + 1 }, (_, m) => (
          <line
            key={`vgrid-${m}`}
            x1={LABEL_WIDTH + m * CELL_SIZE}
            y1={WIRE_PADDING}
            x2={LABEL_WIDTH + m * CELL_SIZE}
            y2={svgHeight - WIRE_PADDING}
            stroke="var(--border-dim)"
            strokeWidth="0.5"
            strokeDasharray="2,4"
          />
        ))}

        {/* Qubit wires */}
        {Array.from({ length: qubits }, (_, q) => {
          const y = WIRE_PADDING + q * CELL_SIZE + CELL_SIZE / 2
          return (
            <g key={`wire-${q}`}>
              {/* Qubit label */}
              <text
                x={LABEL_WIDTH - 8}
                y={y + 1}
                textAnchor="end"
                className="text-[11px] font-mono"
                fill="var(--text-secondary)"
              >
                q[{q}]
              </text>
              {/* Wire */}
              <line
                x1={LABEL_WIDTH}
                y1={y}
                x2={LABEL_WIDTH + moments * CELL_SIZE}
                y2={y}
                stroke="var(--border-default)"
                strokeWidth="1.5"
              />
            </g>
          )
        })}

        {/* Gate cells and drop targets */}
        {Array.from({ length: qubits }, (_, q) =>
          Array.from({ length: moments }, (_, m) => {
            const x = LABEL_WIDTH + m * CELL_SIZE
            const y = WIRE_PADDING + q * CELL_SIZE
            const cell = circuitMatrix[q]?.[m]
            const isHovered = hoveredCell?.qubit === q && hoveredCell?.moment === m
            const isSelected = selectedCell?.qubit === q && selectedCell?.moment === m
            const isPlaced = placedCell?.qubit === q && placedCell?.moment === m
            const isDropReady = Boolean(draggedGate && isHovered)

            return (
              <g key={`cell-${q}-${m}`}>
                {isDropReady && (
                  <g className="circuit-drop-target">
                    <rect
                      x={x + 5}
                      y={y + 5}
                      width={CELL_SIZE - 10}
                      height={CELL_SIZE - 10}
                      rx="8"
                      fill="rgba(0,217,146,0.09)"
                      stroke="var(--accent-green)"
                      strokeWidth="1.2"
                      strokeDasharray="4,3"
                    />
                    <circle
                      cx={x + CELL_SIZE / 2}
                      cy={y + CELL_SIZE / 2}
                      r="15"
                      fill="none"
                      stroke="var(--accent-green)"
                      strokeOpacity="0.45"
                      strokeWidth="1"
                    />
                  </g>
                )}

                {/* Drop target (invisible rect) */}
                <rect
                  x={x + 2}
                  y={y + 2}
                  width={CELL_SIZE - 4}
                  height={CELL_SIZE - 4}
                  fill={isHovered ? 'rgba(0, 217, 146, 0.08)' : 'transparent'}
                  stroke={isHovered ? 'rgba(0, 217, 146, 0.3)' : 'transparent'}
                  strokeWidth="1"
                  rx="4"
                  className="cursor-pointer"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, q, m)}
                  onMouseEnter={() => setHoveredCell({ qubit: q, moment: m })}
                  onMouseLeave={() => setHoveredCell(null)}
                  onClick={() => handleCellClick(q, m)}
                />

                {/* Gate rendering */}
                {cell && (
                  <g onClick={() => handleCellClick(q, m)} className={`cursor-pointer ${isPlaced ? 'circuit-gate-placed' : ''}`}>
                    {isPlaced && (
                      <>
                        <circle
                          cx={x + CELL_SIZE / 2}
                          cy={y + CELL_SIZE / 2}
                          r="21"
                          fill="none"
                          stroke={cell.color}
                          strokeOpacity="0.55"
                          strokeWidth="1"
                          className="gate-impact-ring"
                        />
                        <rect
                          x={x + 3}
                          y={y + 3}
                          width={CELL_SIZE - 6}
                          height={CELL_SIZE - 6}
                          rx="9"
                          fill={`${cell.color}12`}
                          stroke={cell.color}
                          strokeOpacity="0.45"
                          className="gate-impact-halo"
                        />
                      </>
                    )}
                    <rect
                      x={x + 6}
                      y={y + 6}
                      width={CELL_SIZE - 12}
                      height={CELL_SIZE - 12}
                      rx="6"
                      fill={isSelected ? `${cell.color}33` : `${cell.color}1a`}
                      stroke={isSelected ? cell.color : `${cell.color}66`}
                      strokeWidth={isSelected ? 2 : 1}
                      className="gate-node transition-all"
                    />
                    <text
                      x={x + CELL_SIZE / 2}
                      y={y + CELL_SIZE / 2 + 1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-[11px] font-mono font-bold pointer-events-none"
                      fill={cell.color}
                    >
                      {cell.label}
                    </text>
                  </g>
                )}

                {/* Multi-qubit connection line */}
                {cell && cell.targetQubit !== undefined && cell.targetQubit > q && (
                  <line
                    x1={x + CELL_SIZE / 2}
                    y1={y + CELL_SIZE - 6}
                    x2={x + CELL_SIZE / 2}
                    y2={WIRE_PADDING + cell.targetQubit * CELL_SIZE + 6}
                    stroke={cell.color}
                    strokeWidth="2"
                    strokeDasharray="3,3"
                    opacity="0.5"
                  />
                )}
              </g>
            )
          })
        )}

        {/* Moment labels at top */}
        {Array.from({ length: moments }, (_, m) => (
          <text
            key={`mlabel-${m}`}
            x={LABEL_WIDTH + m * CELL_SIZE + CELL_SIZE / 2}
            y={14}
            textAnchor="middle"
            className="text-[8px] font-mono"
            fill="var(--text-muted)"
          >
            {m}
          </text>
        ))}
      </svg>
    </div>
  )
}
