import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ForgotPassword() {
  const { user, isLoading, isConfigured, sendPasswordResetEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [redirectTo, setRedirectTo] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isConfigured) {
      setError('Supabase is not configured. Add your Supabase URL and anon key to continue.')
    }
  }, [isConfigured])

  if (!isLoading && user) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setStatus('')

    if (!email.trim()) {
      setError('Enter your email address.')
      return
    }

    setIsSubmitting(true)
    const result = await sendPasswordResetEmail(email.trim())

    if (result.error) {
      setError(result.error)
    } else {
      setRedirectTo(result.redirectTo || '')
      setStatus('Password reset email sent. Check your inbox for the recovery link.')
    }

    setIsSubmitting(false)
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
            <div className="ql-eyebrow mb-2">Password recovery</div>
            <h1 className="text-2xl font-normal tracking-[-0.03em] text-white">Reset your password</h1>
            <p className="mt-3 text-sm leading-6 text-text-secondary">
              Enter your email and we will send a Supabase recovery link to your inbox.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-md border border-accent-rose/30 bg-accent-rose/10 p-4 text-sm text-accent-rose">
              {error}
            </div>
          )}

          {status && (
            <div className="mb-5 rounded-md border border-accent-green/30 bg-accent-green/10 p-4 text-sm text-accent-green">
              {status}
              {redirectTo && <div className="mt-2 font-mono text-[11px] text-text-muted">Redirect URL: {redirectTo}</div>}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="recovery-email" className="mb-2 block text-sm font-medium text-text-secondary">Email</label>
              <input
                id="recovery-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="ql-input"
                placeholder="researcher@gmail.com"
                autoComplete="email"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isLoading || !isConfigured}
              className="ql-button-primary w-full"
            >
              {isSubmitting ? 'Sending reset link...' : 'Send reset link'}
            </button>
          </form>

          <Link to="/login" className="mt-5 inline-flex text-sm text-text-muted transition hover:text-accent-green">
            Back to login
          </Link>
        </section>
      </div>
    </div>
  )
}
