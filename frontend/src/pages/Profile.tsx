import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'
import type { User, Experiment } from '../types'

export default function Profile() {
  const { username } = useParams<{ username: string }>()
  const [user, setUser] = useState<User | null>(null)
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'experiments' | 'info'>('experiments')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [userRes, experimentsRes] = await Promise.all([
          api.get(`/users/${username}`),
          api.get(`/users/${username}/experiments`)
        ])
        setUser(userRes.data)
        setExperiments(experimentsRes.data.experiments || [])
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      } finally {
        setLoading(false)
      }
    }

    if (username) {
      fetchProfile()
    }
  }, [username])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center text-red-600">User not found</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-start space-x-6">
          <div className="w-24 h-24 rounded-full bg-primary-200 flex items-center justify-center text-3xl font-bold text-primary-600">
            {user.display_name?.[0] || user.username[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{user.display_name || user.username}</h1>
            <p className="text-gray-600 mb-2">@{user.username}</p>
            {user.bio && <p className="text-gray-700 mb-4">{user.bio}</p>}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {user.location && <span>📍 {user.location}</span>}
              {user.website && (
                <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                  🔗 Website
                </a>
              )}
              <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-primary-600">{experiments.length}</div>
          <div className="text-sm text-gray-600">Experiments</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-primary-600">
            {experiments.reduce((sum, e) => sum + e.version, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Versions</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-primary-600">
            {experiments.filter(e => e.seed !== null).length}
          </div>
          <div className="text-sm text-gray-600">Reproducible Runs</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('experiments')}
              className={`px-6 py-4 text-sm font-medium ${activeTab === 'experiments'
                ? 'border-b-2 border-primary-500 text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Experiments ({experiments.length})
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`px-6 py-4 text-sm font-medium ${activeTab === 'info'
                ? 'border-b-2 border-primary-500 text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Info
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'experiments' && (
            <div className="space-y-4">
              {experiments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No experiments yet</p>
              ) : (
                experiments.map((experiment) => (
                  <div
                    key={experiment.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{experiment.name}</h3>
                        {experiment.description && (
                          <p className="text-gray-600 text-sm mb-2">{experiment.description}</p>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <span>Version {experiment.version}</span>
                          <span>Backend: {experiment.backend}</span>
                          <span>Shots: {experiment.shots}</span>
                          {experiment.seed && <span>Seed: {experiment.seed}</span>}
                          <span>{new Date(experiment.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Link
                        to="/experiments"
                        className="ml-4 px-3 py-1 bg-primary-100 text-primary-700 rounded hover:bg-primary-200 text-sm"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Email</div>
                  <div className="font-medium">{user.email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Member Since</div>
                  <div className="font-medium">{new Date(user.created_at).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Display Name</div>
                  <div className="font-medium">{user.display_name || 'Not set'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Location</div>
                  <div className="font-medium">{user.location || 'Not set'}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
