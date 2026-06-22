import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, trackUserActivity } from '../lib/supabase/client'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState('')

  useEffect(() => {
    const completeAuth = async () => {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        if (exchangeError) {
          setError(exchangeError.message)
          return
        }
      }

      const { data } = await supabase.auth.getSession()
      if (data.session) {
        await trackUserActivity('login', { provider: 'google' })
        navigate('/dashboard', { replace: true })
      } else {
        setError('Authentication session was not found. Please try signing in again.')
      }
    }

    completeAuth()
  }, [navigate])

  return (
    <div className="ql-page grid min-h-screen place-items-center px-4">
      <div className="ql-card-soft w-full max-w-md text-center">
        {error ? (
          <>
            <div className="ql-eyebrow mb-3 text-accent-rose">Auth error</div>
            <p className="text-text-secondary">{error}</p>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-t-2 border-accent-green" />
            <div className="ql-eyebrow mb-3">Completing sign in</div>
            <p className="text-text-secondary">Preparing your QuantaLab dashboard.</p>
          </>
        )}
      </div>
    </div>
  )
}
