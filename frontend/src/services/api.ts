import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ==================== EXPERIMENTS API ====================

export interface CreateExperimentRequest {
  name: string
  description?: string
  qasm_code: string
  seed?: number
  backend?: string
  shots?: number
}

export interface RunExperimentRequest {
  experiment_id: string
  backend?: string
  shots?: number
  seed?: number
}

export interface BenchmarkRequest {
  qasm_code: string
  backends: string[]
  shots?: number
  seed?: number
}

export const experimentsApi = {
  create: (data: CreateExperimentRequest) =>
    api.post('/experiments', data),

  list: () =>
    api.get('/experiments'),

  get: (experimentId: string) =>
    api.get(`/experiments/${experimentId}`),

  createVersion: (experimentId: string, data: CreateExperimentRequest) =>
    api.post(`/experiments/${experimentId}/versions`, data),

  getVersions: (experimentId: string) =>
    api.get(`/experiments/${experimentId}/versions`),

  getVersion: (experimentId: string, versionNum: number) =>
    api.get(`/experiments/${experimentId}/versions/${versionNum}`),

  run: (experimentId: string, data: RunExperimentRequest) =>
    api.post(`/experiments/${experimentId}/run`, data),

  benchmark: (data: BenchmarkRequest) =>
    api.post('/benchmark', data),

  export: (experimentId: string, format: string = 'json') =>
    api.get(`/experiments/${experimentId}/export`, { params: { format } }),

  delete: (experimentId: string) =>
    api.delete(`/experiments/${experimentId}`),
}

export default api
