# X-Repo: Quantum Debugger & Research Sandbox

<p align="center">
  <a href="https://x-repo.io">
    <img src="https://img.shields.io/badge/Version-1.0.0-blue" alt="Version">
  </a>
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
  </a>
  <a href="https://github.com/x-repo/x-repo/stargazers">
    <img src="https://img.shields.io/github/stars/x-repo/x-repo" alt="Stars">
  </a>
</p>

X-Repo is a professional-grade quantum computing platform designed for deterministic debugging, reproducible experimentation, and research-grade outputs. It provides intelligent tooling for quantum circuit analysis, noise sensitivity simulation, and experiment version management.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Configuration](#configuration)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Quantum Debugger

- **Structural Analysis**: Compute circuit depth, gate distribution, multi-qubit gate density, redundancy patterns, and idle qubit detection using DAG traversal of parsed QASM
- **Noise Sensitivity Simulation**: Simulate ideal statevector and noisy variants (depolarizing, amplitude damping, phase damping) with fidelity computation
- **Scalability Assessment**: Estimate scalability limits using multi-qubit gate ratio, depth growth rate, and transpilation cost heuristics
- **Behavioral Mismatch Detection**: Compare expected vs empirical probability distributions using KL divergence

### Quantum Research Sandbox

- **Versioned Experiment Snapshots**: Track and manage multiple versions of quantum experiments
- **Seed-Controlled Reproducible Runs**: Ensure reproducibility with deterministic seed control
- **Backend Benchmarking**: Compare performance across multiple quantum backends
- **Research Exports**: Export circuits in QASM, Qiskit formats with comprehensive metrics reports

### Core Platform Features

- **Project Management**: Create, organize, and share quantum projects
- **File Storage**: Upload and organize project files and circuits
- **Real-time Updates**: Live notifications and collaborative features
- **User Authentication**: Secure authentication via Firebase with multiple providers

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend                                │
│  React 18 + TypeScript + Tailwind CSS + Vite                    │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ Landing  │  │ Dashboard │  │  Editor   │  │   Analytics  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Backend                                 │
│  FastAPI (Python) + Qiskit                                      │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐                     │
│  │ Debugger Service │  │  Sandbox Service │                     │
│  └──────────────────┘  └──────────────────┘                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Data Layer                                 │
│  Supabase (PostgreSQL) + Firebase Auth + Storage               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI Framework |
| TypeScript | 5.x | Type Safety |
| Vite | 7.x | Build Tool |
| Tailwind CSS | 3.x | Styling |
| Redux Toolkit | 2.x | State Management |
| Zustand | 5.x | Lightweight State |
| Monaco Editor | 0.55.x | Code Editor |
| Recharts | 3.x | Data Visualization |
| Supabase Client | 2.x | Database Client |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| FastAPI | Latest | Web Framework |
| Qiskit | Latest | Quantum Computing |
| Supabase Python | Latest | Database Client |
| Google Gemini API | Latest | AI Assistance |

### Infrastructure

| Service | Purpose |
|---------|---------|
| Supabase | Database, Storage, Realtime |
| Firebase | Authentication |
| Google Cloud | AI/ML Services |

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- Supabase account
- Firebase project
- Google Gemini API key (optional)

### Clone the Repository

```bash
git clone https://github.com/x-repo/x-repo.git
cd x-repo
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
```

Create a `.env` file in the backend directory:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_key
GEMINI_API_KEY=your_gemini_api_key
FIREBASE_ADMIN_CREDENTIALS=path_to_firebase_credentials
```

---

## Project Structure

```
x-repo/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API and service modules
│   │   ├── store/          # State management
│   │   └── types/          # TypeScript definitions
│   ├── public/             # Static assets
│   └── dist/               # Production build
│
├── backend/                  # FastAPI backend
│   ├── services/           # Business logic
│   ├── models/             # Data models
│   ├── routers/            # API routes
│   └── venv/               # Python virtual environment
│
├── docs/                    # Documentation
│   ├── database_schema.sql # Database schema
│   ├── ENVIRONMENT_VARIABLES.md
│   └── SETUP.md
│
├── PRD.md                   # Product Requirements
├── algo.md                  # Algorithm specifications
└── README.md                # This file
```

---

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create user profile |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/verify-token` | Verify Firebase token |

### Project Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project details |
| PATCH | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| POST | `/api/projects/:id/star` | Star/unstar project |
| POST | `/api/projects/:id/files` | Upload file |

### Quantum Debugger Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/debugger/analyze` | Analyze quantum circuit |
| POST | `/api/debugger/noise-sim` | Run noise simulation |
| POST | `/api/debugger/scalability` | Assess scalability |

### Research Sandbox Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sandbox/experiments` | Create experiment |
| GET | `/api/sandbox/experiments/:id` | Get experiment |
| POST | `/api/sandbox/benchmark` | Run backend benchmark |
| GET | `/api/sandbox/export` | Export results |

---

## Configuration

### Database Schema

The application uses Supabase PostgreSQL. Run the schema from `docs/database_schema.sql` in your Supabase SQL editor.

### Supabase Realtime

Enable Realtime for the following tables:
- `comments`
- `posts`
- `reactions`
- `notifications`

### Storage Buckets

Create the following storage buckets:
- `project-files`: For project file storage
- `avatars`: For user profile images

---

## Roadmap

### Phase 1: Core Platform (Current)
- [x] Project management system
- [x] User authentication
- [x] Basic frontend infrastructure

### Phase 2: Quantum Debugger
- [ ] QASM parser integration
- [ ] Structural analysis pipeline
- [ ] Noise sensitivity simulation
- [ ] Scalability risk assessment

### Phase 3: Research Sandbox
- [ ] Experiment versioning system
- [ ] Backend benchmarking
- [ ] Export functionality (QASM, Qiskit)

### Phase 4: Advanced Features
- [ ] AI-powered circuit optimization
- [ ] Collaborative editing
- [ ] Advanced analytics dashboard

---

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [Qiskit](https://qiskit.org/) for quantum computing framework
- [Supabase](https://supabase.io/) for backend infrastructure
- [Firebase](https://firebase.google.com/) for authentication

---

<p align="center">Built with ⚛️ and 🧬</p>
