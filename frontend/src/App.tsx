import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import AuthCallback from './pages/AuthCallback'
import Dashboard from './pages/Dashboard'
import Debugger from './pages/Debugger'
import Experiments from './pages/Experiments'
import Visualizer from './pages/Visualizer'
import Settings from './pages/Settings'
import About from './pages/About'
import Contact from './pages/Contact'
import FAQ from './pages/FAQ'

function ProtectedShell({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  )
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />

            <Route path="/dashboard" element={<ProtectedShell><Dashboard /></ProtectedShell>} />
            <Route path="/dashboard/debugger" element={<ProtectedShell><Debugger /></ProtectedShell>} />
            <Route path="/dashboard/sandbox" element={<ProtectedShell><Experiments /></ProtectedShell>} />
            <Route path="/dashboard/circuit-visualizer" element={<ProtectedShell><Visualizer /></ProtectedShell>} />
            <Route path="/dashboard/settings" element={<ProtectedShell><Settings /></ProtectedShell>} />

            <Route path="/debugger" element={<Navigate to="/dashboard/debugger" replace />} />
            <Route path="/experiments" element={<Navigate to="/dashboard/sandbox" replace />} />
            <Route path="/visualizer" element={<Navigate to="/dashboard/circuit-visualizer" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  )
}

export default App
