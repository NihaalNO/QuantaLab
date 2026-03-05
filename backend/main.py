from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.routing import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid
import json
import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from debugger import QuantumDebugger

app = FastAPI(
    title="QuantaLab API",
    description="Quantum Debugger & Research Platform API",
    version="1.0.0"
)

# Create API router with /api prefix
api_router = APIRouter(prefix="/api")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# In-memory storage (for demo - would use Appwrite in production)
experiments_db: dict = {}
experiment_versions_db: dict = {}  # experiment_id -> list of versions

class AnalyzeRequest(BaseModel):
    qasm_code: str
    shots: Optional[int] = 1024


class CreateExperimentRequest(BaseModel):
    name: str
    description: Optional[str] = None
    qasm_code: str
    seed: int = 42
    backend: str = "qasm_simulator"
    shots: int = 1024


class RunExperimentRequest(BaseModel):
    experiment_id: str
    backend: Optional[str] = None
    shots: Optional[int] = None
    seed: Optional[int] = None


class BenchmarkRequest(BaseModel):
    qasm_code: str
    backends: List[str]
    shots: int = 1024
    seed: int = 42


@api_router.get("/")
async def root():
    return {"message": "QuantaLab API", "version": "1.0.0"}


@api_router.get("/health")
async def health_check():
    return {"status": "healthy"}


@api_router.post("/debugger/analyze")
async def analyze_circuit(request: AnalyzeRequest):
    """
    Analyze a quantum circuit for structural issues, noise sensitivity,
    scalability risks, and behavioral mismatches.
    """
    try:
        debugger = QuantumDebugger(request.qasm_code)
        report = debugger.analyze()
        return report
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@api_router.get("/debugger/validate")
async def validate_qasm(qasm: str):
    """
    Validate QASM code and return basic circuit info.
    """
    try:
        debugger = QuantumDebugger(qasm)
        structural = debugger.analyzer.analyze_structure()
        return {
            "valid": True,
            "circuit_depth": structural['circuit_depth'],
            "num_qubits": structural['num_qubits'],
            "total_gates": structural['total_gates'],
            "gate_distribution": structural['gate_distribution']
        }
    except Exception as e:
        return {
            "valid": False,
            "error": str(e)
        }


# ==================== EXPERIMENT ENDPOINTS ====================

@api_router.post("/experiments")
async def create_experiment(request: CreateExperimentRequest):
    """
    Create a new experiment with immutable QASM snapshot.
    """
    try:
        # Validate QASM code
        debugger = QuantumDebugger(request.qasm_code)
        structural = debugger.analyzer.analyze_structure()

        # Generate experiment ID and first version
        experiment_id = str(uuid.uuid4())
        version_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat()

        # Create experiment
        experiment = {
            "id": experiment_id,
            "name": request.name,
            "description": request.description,
            "qasm_code": request.qasm_code,
            "seed": request.seed,
            "backend": request.backend,
            "shots": request.shots,
            "current_version": 1,
            "created_at": timestamp,
            "updated_at": timestamp
        }

        # Create first version (immutable snapshot)
        version = {
            "id": version_id,
            "experiment_id": experiment_id,
            "version": 1,
            "qasm_code": request.qasm_code,
            "seed": request.seed,
            "backend": request.backend,
            "shots": request.shots,
            "created_at": timestamp,
            "circuit_depth": structural['circuit_depth'],
            "num_qubits": structural['num_qubits'],
            "total_gates": structural['total_gates']
        }

        experiments_db[experiment_id] = experiment
        experiment_versions_db[experiment_id] = [version]

        return {
            "experiment": experiment,
            "version": version
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@api_router.get("/experiments")
async def list_experiments():
    """
    List all experiments.
    """
    experiments = list(experiments_db.values())
    # Sort by updated_at descending
    experiments.sort(key=lambda x: x.get('updated_at', ''), reverse=True)
    return {"experiments": experiments}


@api_router.get("/experiments/{experiment_id}")
async def get_experiment(experiment_id: str):
    """
    Get experiment details.
    """
    if experiment_id not in experiments_db:
        raise HTTPException(status_code=404, detail="Experiment not found")

    experiment = experiments_db[experiment_id]
    versions = experiment_versions_db.get(experiment_id, [])

    return {
        "experiment": experiment,
        "versions": versions
    }


@api_router.post("/experiments/{experiment_id}/versions")
async def create_version(experiment_id: str, request: CreateExperimentRequest):
    """
    Create a new version of an experiment (append-only).
    """
    if experiment_id not in experiments_db:
        raise HTTPException(status_code=404, detail="Experiment not found")

    try:
        # Validate QASM code
        debugger = QuantumDebugger(request.qasm_code)
        structural = debugger.analyzer.analyze_structure()

        experiment = experiments_db[experiment_id]
        versions = experiment_versions_db[experiment_id]

        # Create new version
        new_version_num = len(versions) + 1
        version_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat()

        version = {
            "id": version_id,
            "experiment_id": experiment_id,
            "version": new_version_num,
            "qasm_code": request.qasm_code,
            "seed": request.seed,
            "backend": request.backend,
            "shots": request.shots,
            "created_at": timestamp,
            "circuit_depth": structural['circuit_depth'],
            "num_qubits": structural['num_qubits'],
            "total_gates": structural['total_gates']
        }

        # Update experiment (immutable - creates new version)
        experiment['qasm_code'] = request.qasm_code
        experiment['seed'] = request.seed
        experiment['backend'] = request.backend
        experiment['shots'] = request.shots
        experiment['current_version'] = new_version_num
        experiment['updated_at'] = timestamp

        experiment_versions_db[experiment_id].append(version)

        return {
            "experiment": experiment,
            "version": version
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@api_router.get("/experiments/{experiment_id}/versions")
async def get_version_history(experiment_id: str):
    """
    Get version history for an experiment (append-only).
    """
    if experiment_id not in experiments_db:
        raise HTTPException(status_code=404, detail="Experiment not found")

    versions = experiment_versions_db.get(experiment_id, [])
    return {"versions": versions}


@api_router.get("/experiments/{experiment_id}/versions/{version_num}")
async def get_version(experiment_id: str, version_num: int):
    """
    Get a specific version of an experiment.
    """
    if experiment_id not in experiments_db:
        raise HTTPException(status_code=404, detail="Experiment not found")

    versions = experiment_versions_db.get(experiment_id, [])
    version = next((v for v in versions if v['version'] == version_num), None)

    if not version:
        raise HTTPException(status_code=404, detail="Version not found")

    return {"version": version}


@api_router.post("/experiments/{experiment_id}/run")
async def run_experiment(experiment_id: str, request: RunExperimentRequest):
    """
    Run an experiment and return results.
    """
    if experiment_id not in experiments_db:
        raise HTTPException(status_code=404, detail="Experiment not found")

    experiment = experiments_db[experiment_id]
    versions = experiment_versions_db[experiment_id]
    current_version = versions[-1]  # Get latest version

    # Use request params or fall back to experiment defaults
    backend = request.backend or experiment['backend']
    shots = request.shots or experiment['shots']
    seed = request.seed or experiment['seed']

    try:
        # Run analysis (simulate execution)
        debugger = QuantumDebugger(current_version['qasm_code'])
        report = debugger.analyze()

        import time
        start_time = time.time()

        # Simulate execution results (in production, would run on actual backend)
        execution_time_ms = (time.time() - start_time) * 1000 + 50  # Base time + simulated

        # Generate simulated counts based on circuit
        result = {
            "experiment_id": experiment_id,
            "version": current_version['version'],
            "backend": backend,
            "shots": shots,
            "seed": seed,
            "counts": {"00": shots // 2, "11": shots // 2},  # Simplified
            "fidelity": report.get('depolarizing_fidelity', 0.95),
            "execution_time_ms": execution_time_ms,
            "circuit_depth": current_version['circuit_depth'],
            "num_qubits": current_version['num_qubits']
        }

        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@api_router.post("/benchmark")
async def benchmark_circuits(request: BenchmarkRequest):
    """
    Benchmark a circuit across multiple backends.
    """
    try:
        # Validate and analyze the circuit
        debugger = QuantumDebugger(request.qasm_code)
        structural = debugger.analyzer.analyze_structure()
        report = debugger.analyze()

        import time
        results = {
            "backends": request.backends,
            "depth": structural['circuit_depth'],
            "gates": structural['total_gates'],
            "comparisons": {}
        }

        for backend in request.backends:
            start_time = time.time()

            # Simulate backend-specific execution
            # In production, would execute on actual backends
            execution_time = (time.time() - start_time) * 1000 + 100

            # Simulate different fidelities per backend
            backend_fidelities = {
                "qasm_simulator": 0.95,
                "aer_simulator": 0.92,
                "ibmq_qasm_simulator": 0.88,
                "statevector_simulator": 0.97
            }

            fidelity = backend_fidelities.get(backend, 0.90)

            results["comparisons"][backend] = {
                "fidelity": fidelity,
                "execution_time_ms": execution_time,
                "depth": structural['circuit_depth'],
                "gate_count": structural['total_gates']
            }

        return results
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@api_router.get("/experiments/{experiment_id}/export")
async def export_experiment(experiment_id: str, format: str = "json"):
    """
    Export experiment with QASM and metadata.
    """
    if experiment_id not in experiments_db:
        raise HTTPException(status_code=404, detail="Experiment not found")

    experiment = experiments_db[experiment_id]
    versions = experiment_versions_db.get(experiment_id, [])

    if format == "qasm":
        # Return raw QASM
        return {
            "qasm_code": experiment['qasm_code'],
            "name": experiment['name'],
            "version": experiment['current_version']
        }
    else:
        # Return full JSON with metadata
        return {
            "experiment": experiment,
            "versions": versions,
            "exported_at": datetime.utcnow().isoformat()
        }


@api_router.delete("/experiments/{experiment_id}")
async def delete_experiment(experiment_id: str):
    """
    Delete an experiment and all its versions.
    """
    if experiment_id not in experiments_db:
        raise HTTPException(status_code=404, detail="Experiment not found")

    del experiments_db[experiment_id]
    if experiment_id in experiment_versions_db:
        del experiment_versions_db[experiment_id]

    return {"message": "Experiment deleted successfully"}


# Include the router AFTER all endpoints are defined
app.include_router(api_router)
