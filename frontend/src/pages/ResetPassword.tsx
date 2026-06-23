import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase/client'
import { useAuth } from '../contexts/AuthContext'

export default function ResetPassword() {
  const navigate = useNavigate()
  const { isConfigured, updatePassword } = useAuth()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [isReady, setIsReady] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isConfigured) {
      setError('Supabase is not configured. Add your Supabase URL and anon key to continue.')
      setIsCheckingSession(false)
      return
    }

    let mounted = true

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return

      if (data.session) {
        setIsReady(true)
      } else {
        setError('Recovery session not found. Open the reset link from your email or request a new one.')
      }

      setIsCheckingSession(false)
    }

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) {
        setIsReady(true)
        setError('')
        setIsCheckingSession(false)
      }
    })

    checkSession()

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [isConfigured])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setStatus('')

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    const result = await updatePassword(newPassword)

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
      return
    }

    setStatus('Password updated successfully. Redirecting to login...')
    await supabase.auth.signOut()
    window.setTimeout(() => {
      navigate('/login', { replace: true })
    }, 1400)
  }

  return (
    <div className="ql-page flex min-h-screen items-center justify-center px-4 py-6">
      <div className="w-full max-w-[460px] overflow-hidden rounded-md border border-border-default bg-base shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
        <section className="p-5 sm:p-6">
          <div className="mb-6">
            <Link to="/" className="flex min-w-0 items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-md border border-accent-green/40 bg-accent-green/10 text-accent-green">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M13 2 5 13h6l-1 9 9-13h-6l1-7Z" fill="currentColor" />
                </svg>
              </span>
              <span className="truncate text-xl font-semibold text-white">QuantaLab</span>
            </Link>
          </div>

          <div className="mb-5">
            <div className="ql-eyebrow mb-2">New password</div>
            <h1 className="text-2xl font-normal tracking-[-0.03em] text-white">Create a new password</h1>
            <p className="mt-3 text-sm leading-6 text-text-secondary">
              Enter and confirm your new password to restore account access.
            </p>
          </div>

          {isCheckingSession && (
            <div className="mb-5 rounded-md border border-border-default bg-raised p-4 text-sm text-text-muted">
              Checking recovery session...
            </div>
          )}

          {error && (
            <div className="mb-5 rounded-md border border-accent-rose/30 bg-accent-rose/10 p-4 text-sm text-accent-rose">
              {error}
            </div>
          )}

          {status && (
            <div className="mb-5 rounded-md border border-accent-green/30 bg-accent-green/10 p-4 text-sm text-accent-green">
              {status}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="new-password" className="mb-2 block text-sm font-medium text-text-secondary">New password</label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="ql-input"
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
                disabled={!isReady || isSubmitting}
                required
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="mb-2 block text-sm font-medium text-text-secondary">Confirm password</label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="ql-input"
                placeholder="Repeat new password"
                autoComplete="new-password"
                disabled={!isReady || isSubmitting}
                required
              />
            </div>

            <button
              type="submit"
              disabled={!isReady || isSubmitting || !isConfigured}
              className="ql-button-primary w-full"
            >
              {isSubmitting ? 'Updating password...' : 'Update password'}
            </button>
          </form>

          <Link to="/forgot-password" className="mt-5 inline-flex text-sm text-text-muted transition hover:text-accent-green">
            Request a new reset link
          </Link>
        </section>
      </div>
    </div>
  )
}
