import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { RealtimeProvider } from './components/RealtimeProvider'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Debugger from './pages/Debugger'
import Experiments from './pages/Experiments'
import About from './pages/About'
import Contact from './pages/Contact'
import FAQ from './pages/FAQ'

function App() {
  return (
    <AuthProvider>
      <RealtimeProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile/:username" element={<Profile />} />
              <Route path="/debugger" element={<Debugger />} />
              <Route path="/experiments" element={<Experiments />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
            </Routes>
          </Layout>
        </Router>
      </RealtimeProvider>
    </AuthProvider>
  )
}

export default App
