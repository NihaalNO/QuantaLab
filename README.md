
# Quantalab  
## Quantum Debugger & Research Sandbox

<p align="center">
  <a href="https://Quantalab.io">
    <img src="https://img.shields.io/badge/Version-1.0.0-blue" alt="Version">
  </a>
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
  </a>
  <a href="https://github.com/Quantalab/Quantalab/stargazers">
    <img src="https://img.shields.io/github/stars/Quantalab/Quantalab" alt="Stars">
  </a>
</p>

**Quantalab** is a professional-grade quantum computing platform engineered for deterministic debugging, reproducible experimentation, and research-grade output generation. It provides intelligent tooling for quantum circuit analysis, structured noise simulation, scalability assessment, and experiment lifecycle management.

Designed for researchers, quantum engineers, and advanced students, Quantalab bridges development, experimentation, and analytical validation in a single integrated environment. The platform features a highly-optimized **Scientific Dark Lab** interface designed for data-dense workflows.

---

## Table of Contents

- [Overview](#overview)
- [Core Capabilities](#core-capabilities)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Operational Configuration](#operational-configuration)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Overview

Quantalab enables:

- Deterministic quantum circuit debugging
- Noise sensitivity modeling and fidelity analysis
- Version-controlled experiment management
- Backend benchmarking and reproducibility guarantees
- Structured exports for research and publication

The platform combines a modern frontend with a high-performance Python backend powered by **Qiskit**, enabling advanced circuit analysis and simulation workflows.

---

## Core Capabilities

### 1. Quantum Debugger

A deterministic analysis engine for deep circuit inspection.

**Structural Analysis**
- Circuit depth computation
- Gate distribution metrics
- Multi-qubit gate density
- Redundancy detection
- Idle qubit identification
- DAG-based QASM traversal

**Noise Sensitivity Simulation**
- Ideal statevector simulation
- Depolarizing noise modeling
- Amplitude damping simulation
- Phase damping simulation
- Fidelity computation between ideal and noisy states

**Scalability Assessment**
- Multi-qubit gate ratio evaluation
- Depth growth rate estimation
- Transpilation cost heuristics
- Scalability risk scoring

**Behavioral Mismatch Detection**
- Expected vs empirical distribution comparison
- KL-divergence-based anomaly detection

---

### 2. Quantum Research Sandbox

A reproducible research environment for controlled experimentation.

- Versioned experiment snapshots
- Deterministic seed-controlled runs
- Multi-backend benchmarking with Recharts comparative histograms
- In-situ Noise Simulation Analysis panel
- Structured export (QASM, Qiskit objects, metrics reports)

---

### 3. Core Platform Infrastructure

- Project management and collaboration framework
- Secure file storage
- Real-time updates
- Role-based authentication
- Scalable backend services

---

## System Architecture

```

Frontend (React + TypeScript + Vite)
│
▼
Backend (FastAPI + Qiskit)
│
▼
Data Layer (Supabase PostgreSQL + Firebase Auth + Storage)

````

### Frontend
- Landing interface
- Dashboard
- Quantum circuit editor
- Analytics and visualization modules

### Backend
- Debugger Service
- Sandbox Service
- API layer
- Experiment management engine

### Data Layer
- PostgreSQL (via Supabase)
- Authentication (Firebase)
- Object storage buckets
- Realtime event streaming

---

## Technology Stack

### Frontend

| Technology | Purpose |
|------------|----------|
| React 18 | UI framework |
| TypeScript | Static type safety |
| Vite | Build tooling |
| Tailwind CSS | Styling system |
| Redux Toolkit | Centralized state |
| Zustand | Lightweight state |
| Monaco Editor | Code editor |
| Recharts | Data visualization |
| Supabase Client | Database integration |

---

### Backend

| Technology | Purpose |
|------------|----------|
| FastAPI | High-performance API framework |
| Qiskit | Quantum simulation and circuit analysis |
| Supabase Python | Database access |
| Google Gemini API | AI-assisted tooling |

---

### Infrastructure

| Service | Role |
|----------|------|
| Supabase | Database, storage, realtime |
| Firebase | Authentication |
| Google Cloud | AI/ML services |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Python 3.9+
- Supabase project
- Firebase project
- (Optional) Google Gemini API key

---

### Clone the Repository

```bash
git clone https://github.com/Quantalab/Quantalab.git
cd Quantalab
````

---

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend API runs at:

```
http://localhost:8000
```

---

## Environment Configuration

### Frontend `.env`

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
```

### Backend `.env`

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_key
GEMINI_API_KEY=your_gemini_api_key
FIREBASE_ADMIN_CREDENTIALS=path_to_firebase_credentials
```

---

## Project Structure

```
Quantalab/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── store/
│   │   └── types/
│   ├── public/
│   └── dist/
│
├── backend/
│   ├── services/
│   ├── models/
│   ├── routers/
│   └── venv/
│
├── docs/
│   ├── database_schema.sql
│   ├── ENVIRONMENT_VARIABLES.md
│   └── SETUP.md
│
├── PRD.md
├── algo.md
└── README.md
```

---

## API Reference

### Authentication

| Method | Endpoint                 | Description           |
| ------ | ------------------------ | --------------------- |
| POST   | `/api/auth/register`     | Create user profile   |
| GET    | `/api/auth/me`           | Retrieve current user |
| POST   | `/api/auth/verify-token` | Verify Firebase token |

---

### Projects

| Method | Endpoint                  | Description         |
| ------ | ------------------------- | ------------------- |
| GET    | `/api/projects`           | List projects       |
| POST   | `/api/projects`           | Create project      |
| GET    | `/api/projects/:id`       | Retrieve project    |
| PATCH  | `/api/projects/:id`       | Update project      |
| DELETE | `/api/projects/:id`       | Delete project      |
| POST   | `/api/projects/:id/star`  | Star/unstar project |
| POST   | `/api/projects/:id/files` | Upload file         |

---

### Quantum Debugger

| Method | Endpoint                    | Description                  |
| ------ | --------------------------- | ---------------------------- |
| POST   | `/api/debugger/analyze`     | Circuit structural analysis  |
| POST   | `/api/debugger/noise-sim`   | Noise sensitivity simulation |
| POST   | `/api/debugger/scalability` | Scalability assessment       |

---

### Research Sandbox

| Method | Endpoint                       | Description               |
| ------ | ------------------------------ | ------------------------- |
| POST   | `/api/sandbox/experiments`     | Create experiment         |
| GET    | `/api/sandbox/experiments/:id` | Retrieve experiment       |
| POST   | `/api/sandbox/benchmark`       | Run backend benchmark     |
| GET    | `/api/sandbox/export`          | Export experiment results |

---

## Operational Configuration

### Database Schema

Execute `docs/database_schema.sql` inside your Supabase SQL editor.

### Enable Realtime For

* `comments`
* `posts`
* `reactions`
* `notifications`

### Storage Buckets

Create:

* `project-files`
* `avatars`

---

## Roadmap

### Phase 1 — Core Platform

* ✔ Project management
* ✔ Authentication
* ✔ Base frontend infrastructure

### Phase 2 — Quantum Debugger

* QASM parser integration
* Structural analysis pipeline
* Noise modeling framework
* Scalability heuristics engine

### Phase 3 — Research Sandbox

* Experiment version control
* Backend benchmarking framework
* Export pipeline (QASM, Qiskit)

### Phase 4 — Advanced Capabilities

* AI-powered circuit optimization
* Collaborative editing
* Advanced analytics dashboard

---

## Contributing

We welcome contributions from researchers and developers.

1. Fork the repository
2. Create a feature branch
3. Commit changes with clear messages
4. Submit a pull request

Please ensure code quality, documentation updates, and test coverage where applicable.

---

## License

This project is licensed under the **MIT License**.
See the `LICENSE` file for full details.

---

## Acknowledgments

* Qiskit — Quantum computing framework
* Supabase — Backend infrastructure
* Firebase — Authentication services

---

<p align="center">
Built for deterministic quantum research and reproducible experimentation.
</p>
