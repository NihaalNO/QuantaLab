---
name: quantum-research-sandbox
description: Build and maintain the Quantum Research Sandbox system for reproducible quantum circuit experimentation.
---

# System Overview

The Quantum Research Sandbox is a reproducible quantum experiment platform.

Stack:

Frontend:
- Vite
- React
- TypeScript
- Tailwind
- Monaco Editor

Backend:
- Appwrite
- Appwrite Database
- Appwrite Functions
- Appwrite Auth

Compute Layer:
- Python
- Qiskit
- FastAPI

---

# Responsibilities

Claude should assist with:

1. Experiment versioning systems
2. QASM circuit management
3. Benchmark comparison tools
4. Experiment reproducibility
5. Quantum execution pipeline

---

# Database Collections

experiments
experiment_versions
experiment_results

---

# Coding Guidelines

Frontend:
- Modular components
- Strict TypeScript
- Functional React patterns
- Zustand or React Query state

Backend:
- Appwrite SDK
- Input validation
- Immutable version storage

Python Compute:
- QASM parsing via Qiskit
- Noise simulation
- Fidelity computation
- Metrics export

---

# Key Features

Experiment creation
Experiment versioning
Benchmark comparison
Noise simulation
Metrics visualization

---

# Important Rules

Experiments must be reproducible.

All versions are immutable.

Execution metrics must be stored with each version.

Never modify historical experiment results.

---

# Expected Claude Tasks

Generate:

- frontend components
- Appwrite schema
- API handlers
- Qiskit execution scripts
- benchmarking utilities