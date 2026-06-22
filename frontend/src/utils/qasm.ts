import type { GateCell } from '../types'

/**
 * Convert a circuit matrix to OpenQASM 2.0 string.
 */
export function toQASM(matrix: (GateCell | null)[][], numQubits: number): string {
  const lines: string[] = [
    'OPENQASM 2.0;',
    'include "qelib1.inc";',
    `qreg q[${numQubits}];`,
    `creg c[${numQubits}];`,
  ]

  const numMoments = matrix[0]?.length ?? 0

  // Track which cells we've already processed (for multi-qubit gates)
  const processed = new Set<string>()

  for (let m = 0; m < numMoments; m++) {
    for (let q = 0; q < numQubits; q++) {
      const key = `${q},${m}`
      if (processed.has(key)) continue

      const cell = matrix[q][m]
      if (!cell) continue

      processed.add(key)

      switch (cell.gateId) {
        case 'H':
          lines.push(`h q[${q}];`)
          break
        case 'X':
          lines.push(`x q[${q}];`)
          break
        case 'Y':
          lines.push(`y q[${q}];`)
          break
        case 'Z':
          lines.push(`z q[${q}];`)
          break
        case 'S':
          lines.push(`s q[${q}];`)
          break
        case 'T':
          lines.push(`t q[${q}];`)
          break
        case 'I':
          lines.push(`id q[${q}];`)
          break
        case 'RX':
          lines.push(`rx(${cell.params?.[0] ?? 0}) q[${q}];`)
          break
        case 'RY':
          lines.push(`ry(${cell.params?.[0] ?? 0}) q[${q}];`)
          break
        case 'RZ':
          lines.push(`rz(${cell.params?.[0] ?? 0}) q[${q}];`)
          break
        case 'CNOT':
          if (cell.targetQubit !== undefined) {
            lines.push(`cx q[${q}], q[${cell.targetQubit}];`)
            processed.add(`${cell.targetQubit},${m}`)
          }
          break
        case 'CZ':
          if (cell.targetQubit !== undefined) {
            lines.push(`cz q[${q}], q[${cell.targetQubit}];`)
            processed.add(`${cell.targetQubit},${m}`)
          }
          break
        case 'SWAP':
          if (cell.targetQubit !== undefined) {
            lines.push(`swap q[${q}], q[${cell.targetQubit}];`)
            processed.add(`${cell.targetQubit},${m}`)
          }
          break
        case 'CCX':
          if (cell.controlQubit !== undefined && cell.targetQubit !== undefined) {
            lines.push(`ccx q[${q}], q[${cell.controlQubit}], q[${cell.targetQubit}];`)
            processed.add(`${cell.controlQubit},${m}`)
            processed.add(`${cell.targetQubit},${m}`)
          }
          break
        case 'M':
          lines.push(`measure q[${q}] -> c[${q}];`)
          break
      }
    }
  }

  // Add measurement at the end if no explicit measure gates
  const hasMeasure = matrix.some(row => row.some(cell => cell?.gateId === 'M'))
  if (!hasMeasure) {
    lines.push(`measure q -> c;`)
  }

  return lines.join('\n')
}
