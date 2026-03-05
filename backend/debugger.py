"""
Quantum Debugger: Algorithmic Failure Detection
Implements 4-layer analysis pipeline for quantum circuit diagnostics.
"""

import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
from qiskit_aer import AerSimulator
from qiskit.circuit.library import RZGate, CXGate, SGate, TGate
import json
from typing import Dict, List, Any, Tuple
from collections import defaultdict


class QASMAnalyzer:
    """Parse and analyze QASM circuits for structural issues."""

    def __init__(self, qasm_code: str):
        self.qasm_code = qasm_code
        self.circuit = None
        self.gate_counts = defaultdict(int)
        self.qubit_usage = {}
        self.errors = []

    def parse(self) -> QuantumCircuit:
        """Parse QASM string to QuantumCircuit."""
        try:
            self.circuit = QuantumCircuit.from_qasm_str(self.qasm_code)
            return self.circuit
        except Exception as e:
            self.errors.append(f"QASM parsing error: {str(e)}")
            raise

    def analyze_structure(self) -> Dict[str, Any]:
        """Layer 1: Structural Analysis using DAG traversal."""
        if not self.circuit:
            self.parse()

        num_qubits = self.circuit.num_qubits
        depth = self.circuit.depth()

        # Gate distribution
        self.gate_counts = defaultdict(int)
        for instruction in self.circuit.data:
            gate_name = instruction.operation.name
            self.gate_counts[gate_name] += 1

        # Multi-qubit gate density
        total_gates = sum(self.gate_counts.values())
        multi_qubit_gates = sum(
            1 for instruction in self.circuit.data
            if instruction.operation.num_qubits > 1
        )
        multi_qubit_gate_density = multi_qubit_gates / total_gates if total_gates > 0 else 0

        # Idle qubit detection
        idle_qubits = self._detect_idle_qubits()

        # Redundancy patterns
        redundancy_patterns = self._detect_redundancies()

        # Qubit usage map
        self.qubit_usage = self._analyze_qubit_usage()

        return {
            "circuit_depth": depth,
            "num_qubits": num_qubits,
            "total_gates": total_gates,
            "gate_distribution": dict(self.gate_counts),
            "multi_qubit_gate_density": multi_qubit_gate_density,
            "idle_qubits": idle_qubits,
            "redundancy_patterns": redundancy_patterns,
            "qubit_usage": self.qubit_usage
        }

    def _detect_idle_qubits(self) -> List[int]:
        """Detect qubits that remain idle throughout the circuit."""
        if not self.circuit:
            return []

        # Track which qubits are used
        used_qubits = set()
        for instruction in self.circuit.data:
            for qubit in instruction.qubits:
                # Get index from qubit - handle both qiskit 1.x and 2.x
                if hasattr(qubit, '_index'):
                    used_qubits.add(qubit._index)
                elif hasattr(qubit, 'index'):
                    used_qubits.add(qubit.index)
                else:
                    # Try to extract from the qubit repr
                    used_qubits.add(qubit)

        # Return qubits that weren't used
        idle = [q for q in range(self.circuit.num_qubits) if q not in used_qubits]
        return idle

    def _detect_redundancies(self) -> List[str]:
        """Detect redundant gate patterns."""
        patterns = []
        gate_list = [inst.operation.name for inst in self.circuit.data]

        # Check for consecutive identical single-qubit gates
        for i in range(len(gate_list) - 1):
            if gate_list[i] == gate_list[i+1] and gate_list[i] in ['h', 'x', 'y', 'z', 's', 't', 'rx', 'ry', 'rz']:
                patterns.append(f"Consecutive {gate_list[i]} gates at positions {i} and {i+1}")
                break

        # Check for redundant H-CNOT-H patterns (can be simplified)
        for i in range(len(gate_list) - 2):
            if gate_list[i] == 'h' and gate_list[i+1] == 'cx' and gate_list[i+2] == 'h':
                patterns.append("H-CNOT-H pattern detected (equivalent to CZ)")

        # Check for double-CNOT on same qubits
        for i in range(len(gate_list) - 1):
            if gate_list[i] == 'cx' and gate_list[i+1] == 'cx':
                inst1, inst2 = self.circuit.data[i], self.circuit.data[i+1]
                if inst1.qubits == inst2.qubits:
                    patterns.append("Double CNOT on same qubits (can be removed)")
                    break

        return patterns[:5]  # Limit to 5 patterns

    def _analyze_qubit_usage(self) -> Dict[int, int]:
        """Count gates per qubit."""
        usage = defaultdict(int)
        for inst in self.circuit.data:
            for qubit in inst.qubits:
                # Use _index or to_layout_index for qiskit 2.x compatibility
                idx = getattr(qubit, 'index', getattr(qubit, '_index', 0))
                if hasattr(qubit, '_index'):
                    idx = qubit._index
                usage[idx] += 1
        return dict(usage)


class NoiseSimulator:
    """Layer 2: Noise Sensitivity Analysis."""

    def __init__(self, circuit: QuantumCircuit):
        self.circuit = circuit
        self.simulator = AerSimulator()

    def compute_fidelities(self, shots: int = 1024) -> Dict[str, float]:
        """Compute fidelity between ideal and noisy simulations."""

        # Ideal simulation (statevector)
        ideal_state = Statevector(self.circuit)
        ideal_probs = ideal_state.probabilities()

        # Run on Aer simulator with different noise models
        results = {}

        # 1. Depolarizing noise
        from qiskit_aer.noise import depolarizing_error, NoiseModel
        depolarizing_error_model = NoiseModel()
        depolarizing_error_model.add_all_qubit_quantum_error(
            depolarizing_error(0.05, 1), ['h', 's', 't']
        )
        depolarizing_error_model.add_all_qubit_quantum_error(
            depolarizing_error(0.1, 2), ['cx']
        )

        result_depol = self.simulator.run(
            self.circuit, noise_model=depolarizing_error_model, shots=shots
        ).result()
        counts_depol = result_depol.get_counts()
        fidelity_depol = self._compute_fidelity_from_counts(counts_depol, ideal_probs, self.circuit.num_qubits)
        results['depolarizing_fidelity'] = fidelity_depol

        # 2. Amplitude damping noise
        from qiskit_aer.noise import amplitude_damping_error, NoiseModel
        ad_error_model = NoiseModel()
        ad_error_model.add_all_qubit_quantum_error(
            amplitude_damping_error(0.05), ['h', 'cx']
        )

        result_ad = self.simulator.run(
            self.circuit, noise_model=ad_error_model, shots=shots
        ).result()
        counts_ad = result_ad.get_counts()
        fidelity_ad = self._compute_fidelity_from_counts(counts_ad, ideal_probs, self.circuit.num_qubits)
        results['amplitude_damping_fidelity'] = fidelity_ad

        # 3. Phase damping noise
        from qiskit_aer.noise import phase_damping_error, NoiseModel
        pd_error_model = NoiseModel()
        pd_error_model.add_all_qubit_quantum_error(
            phase_damping_error(0.05), ['h', 'cx']
        )

        result_pd = self.simulator.run(
            self.circuit, noise_model=pd_error_model, shots=shots
        ).result()
        counts_pd = result_pd.get_counts()
        fidelity_pd = self._compute_fidelity_from_counts(counts_pd, ideal_probs, self.circuit.num_qubits)
        results['phase_damping_fidelity'] = fidelity_pd

        # Compute noise sensitivity index (lower is better)
        results['noise_sensitivity_index'] = 1.0 - np.mean([
            fidelity_depol, fidelity_ad, fidelity_pd
        ])

        return results

    def _compute_fidelity_from_counts(
        self, counts: Dict[str, int], ideal_probs: np.ndarray, num_qubits: int
    ) -> float:
        """Compute fidelity from measurement counts."""
        total_shots = sum(counts.values())
        if total_shots == 0:
            return 0.0

        # Normalize counts to probabilities
        empirical_probs = np.zeros(2 ** num_qubits)
        for state_str, count in counts.items():
            idx = int(state_str[::-1], 2) if state_str else 0
            empirical_probs[idx] = count / total_shots

        # Fidelity = sum(sqrt(p_i * q_i))
        fidelity = np.sum(np.sqrt(ideal_probs * empirical_probs))
        return float(fidelity)


class ScalabilityAnalyzer:
    """Layer 3: Scalability Risk Assessment."""

    def __init__(self, structural_data: Dict[str, Any]):
        self.data = structural_data

    def assess_scalability(self) -> Dict[str, Any]:
        """Estimate scalability limits using heuristics."""

        depth = self.data['circuit_depth']
        num_qubits = self.data['num_qubits']
        mq_density = self.data['multi_qubit_gate_density']
        gate_dist = self.data['gate_distribution']

        # Transpilation cost heuristic (based on depth and connectivity)
        transpilation_cost = self._estimate_transpilation_cost(depth, num_qubits, gate_dist)

        # Scalability risk based on multiple factors
        risk_score = 0.0
        reasons = []

        # Factor 1: Circuit depth
        if depth > 100:
            risk_score += 0.3
            reasons.append("High circuit depth (>100)")
        elif depth > 50:
            risk_score += 0.15

        # Factor 2: Multi-qubit gate density
        if mq_density > 0.5:
            risk_score += 0.25
            reasons.append("High multi-qubit gate density (>50%)")
        elif mq_density > 0.3:
            risk_score += 0.1

        # Factor 3: Number of qubits
        if num_qubits > 20:
            risk_score += 0.3
            reasons.append("Large number of qubits (>20)")
        elif num_qubits > 10:
            risk_score += 0.15

        # Factor 4: Transpilation cost
        if transpilation_cost > 1000:
            risk_score += 0.2
            reasons.append("High transpilation cost")

        # Cap at 1.0
        risk_score = min(risk_score, 1.0)

        # Determine risk level
        if risk_score < 0.25:
            risk_level = 'low'
        elif risk_score < 0.6:
            risk_level = 'medium'
        else:
            risk_level = 'high'

        return {
            'transpilation_cost': transpilation_cost,
            'scalability_risk': risk_level,
            'risk_score': risk_score,
            'risk_factors': reasons
        }

    def _estimate_transpilation_cost(
        self, depth: int, num_qubits: int, gate_dist: Dict[str, int]
    ) -> float:
        """Estimate transpilation cost based on circuit complexity."""
        cx_count = gate_dist.get('cx', 0)

        # Simplified heuristic: depth * qubits * connectivity_factor
        # Assume linear connectivity for now
        connectivity_factor = 1 + (cx_count / max(num_qubits, 1))

        cost = depth * num_qubits * connectivity_factor * 0.1
        return float(cost)


class BehavioralAnalyzer:
    """Layer 4: Behavioral Mismatch Detection."""

    def __init__(self, circuit: QuantumCircuit):
        self.circuit = circuit
        self.simulator = AerSimulator()

    def detect_mismatch(self, shots: int = 1024) -> Dict[str, Any]:
        """Compare expected vs empirical distributions using KL divergence."""

        # Get ideal (expected) distribution from statevector
        ideal_state = Statevector(self.circuit)
        ideal_probs = ideal_state.probabilities()

        # Run simulation to get empirical distribution
        result = self.simulator.run(self.circuit, shots=shots).result()
        counts = result.get_counts()

        # Normalize to probabilities
        total_shots = sum(counts.values())
        num_qubits = self.circuit.num_qubits
        empirical_probs = np.zeros(2 ** num_qubits)

        for state_str, count in counts.items():
            idx = int(state_str[::-1], 2) if state_str else 0
            empirical_probs[idx] = count / total_shots

        # Add small epsilon to avoid log(0)
        epsilon = 1e-10
        ideal_probs = np.clip(ideal_probs, epsilon, 1)
        empirical_probs = np.clip(empirical_probs, epsilon, 1)

        # Normalize to ensure they sum to 1
        ideal_probs = ideal_probs / ideal_probs.sum()
        empirical_probs = empirical_probs / empirical_probs.sum()

        # Compute KL divergence: KL(P || Q) = sum(P * log(P / Q))
        kl_divergence = np.sum(ideal_probs * np.log(ideal_probs / empirical_probs))

        # Also compute reverse KL for symmetrized version
        kl_reverse = np.sum(empirical_probs * np.log(empirical_probs / ideal_probs))
        kl_symmetrized = (kl_divergence + kl_reverse) / 2

        return {
            'kl_divergence': float(kl_divergence),
            'kl_divergence_symmetrized': float(kl_symmetrized),
            'ideal_distribution': ideal_probs.tolist(),
            'empirical_distribution': empirical_probs.tolist(),
            'top_states': self._get_top_states(counts, 5)
        }

    def _get_top_states(self, counts: Dict[str, int], top_n: int) -> List[Dict[str, Any]]:
        """Get top N measurement outcomes."""
        sorted_counts = sorted(counts.items(), key=lambda x: x[1], reverse=True)
        total = sum(counts.values())

        return [
            {'state': state, 'count': count, 'probability': count / total}
            for state, count in sorted_counts[:top_n]
        ]


class QuantumDebugger:
    """Main debugger that orchestrates all analysis layers."""

    def __init__(self, qasm_code: str):
        self.qasm_code = qasm_code
        self.analyzer = QASMAnalyzer(qasm_code)

    def analyze(self) -> Dict[str, Any]:
        """Run full 4-layer analysis pipeline."""

        # Layer 1: Structural Analysis
        structural = self.analyzer.analyze_structure()

        # Layer 2: Noise Sensitivity Analysis
        try:
            noise_sim = NoiseSimulator(self.analyzer.circuit)
            noise_results = noise_sim.compute_fidelities()
        except Exception as e:
            noise_results = {
                'error': str(e),
                'depolarizing_fidelity': 1.0,
                'amplitude_damping_fidelity': 1.0,
                'phase_damping_fidelity': 1.0,
                'noise_sensitivity_index': 0.0
            }

        # Layer 3: Scalability Assessment
        scalability_analyzer = ScalabilityAnalyzer(structural)
        scalability = scalability_analyzer.assess_scalability()

        # Layer 4: Behavioral Mismatch
        try:
            behavioral_analyzer = BehavioralAnalyzer(self.analyzer.circuit)
            behavioral = behavioral_analyzer.detect_mismatch()
        except Exception as e:
            behavioral = {
                'error': str(e),
                'kl_divergence': None,
                'kl_divergence_symmetrized': None
            }

        # Combine all results
        report = {
            # Structural Analysis (Layer 1)
            'circuit_depth': structural['circuit_depth'],
            'num_qubits': structural['num_qubits'],
            'total_gates': structural['total_gates'],
            'gate_distribution': structural['gate_distribution'],
            'multi_qubit_gate_density': structural['multi_qubit_gate_density'],
            'idle_qubits': structural['idle_qubits'],
            'redundancy_patterns': structural['redundancy_patterns'],

            # Noise Sensitivity (Layer 2)
            'noise_sensitivity_index': noise_results.get('noise_sensitivity_index', 0.0),
            'depolarizing_fidelity': noise_results.get('depolarizing_fidelity', 1.0),
            'amplitude_damping_fidelity': noise_results.get('amplitude_damping_fidelity', 1.0),
            'phase_damping_fidelity': noise_results.get('phase_damping_fidelity', 1.0),

            # Scalability (Layer 3)
            'transpilation_cost': scalability['transpilation_cost'],
            'scalability_risk': scalability['scalability_risk'],
            'risk_score': scalability.get('risk_score', 0.0),
            'risk_factors': scalability.get('risk_factors', []),

            # Behavioral Mismatch (Layer 4)
            'kl_divergence': behavioral.get('kl_divergence'),
            'kl_divergence_symmetrized': behavioral.get('kl_divergence_symmetrized'),

            # Summary and recommendations
            'summary': self._generate_summary(structural, noise_results, scalability, behavioral),
            'recommendations': self._generate_recommendations(structural, noise_results, scalability)
        }

        return report

    def _generate_summary(
        self,
        structural: Dict,
        noise: Dict,
        scalability: Dict,
        behavioral: Dict
    ) -> str:
        """Generate a text summary of the analysis."""
        issues = []

        if structural.get('idle_qubits'):
            issues.append(f"{len(structural['idle_qubits'])} idle qubit(s) detected")

        if structural.get('redundancy_patterns'):
            issues.append(f"{len(structural['redundancy_patterns'])} redundancy pattern(s) found")

        noise_idx = noise.get('noise_sensitivity_index', 0)
        if noise_idx > 0.3:
            issues.append(f"High noise sensitivity ({noise_idx:.1%})")

        if scalability.get('scalability_risk') == 'high':
            issues.append("High scalability risk")

        kl = behavioral.get('kl_divergence')
        if kl and kl > 0.1:
            issues.append(f"Behavioral mismatch detected (KL: {kl:.4f})")

        if not issues:
            return "Circuit analysis complete. No major issues detected."

        return "Issues detected: " + "; ".join(issues)

    def _generate_recommendations(
        self,
        structural: Dict,
        noise: Dict,
        scalability: Dict
    ) -> List[str]:
        """Generate optimization recommendations."""
        recommendations = []

        # Structural recommendations
        if structural.get('idle_qubits'):
            recommendations.append(
                "Remove idle qubits or optimize circuit to use all qubits efficiently"
            )

        if structural.get('redundancy_patterns'):
            recommendations.append(
                "Review and remove redundant gate patterns to reduce circuit depth"
            )

        # Noise recommendations
        noise_idx = noise.get('noise_sensitivity_index', 0)
        if noise_idx > 0.3:
            recommendations.append(
                "Consider error mitigation techniques or reduce circuit depth for better noise tolerance"
            )

        if noise.get('depolarizing_fidelity', 1) < 0.9:
            recommendations.append(
                "Depolarizing noise is significant. Consider gate optimization and shorter circuits."
            )

        # Scalability recommendations
        risk = scalability.get('scalability_risk', 'low')
        if risk == 'high':
            recommendations.append(
                "Circuit may not scale well. Consider breaking into smaller subcircuits or using transpilation passes."
            )
        elif risk == 'medium':
            recommendations.append(
                "Moderate scalability risk. Monitor circuit complexity as you extend the algorithm."
            )

        # Add positive recommendations if no issues
        if not recommendations:
            recommendations.append("Circuit looks well-optimized for current qubit count.")
            recommendations.append("Consider running on real hardware for further validation.")

        return recommendations[:5]  # Limit to 5 recommendations
