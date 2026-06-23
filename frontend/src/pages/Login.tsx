import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

type AuthMode = 'signin' | 'signup'

function GoogleLogo() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z" />
    </svg>
  )
}

export default function Login() {
  const location = useLocation()
  const {
    user,
    isLoading,
    isConfigured,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
  } = useAuth()
  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isConfigured) {
      setError('Supabase is not configured. Add your Supabase URL and anon key to continue.')
    }
  }, [isConfigured])

  if (!isLoading && user) {
    return <Navigate to="/dashboard" replace />
  }

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname

  const resetFeedback = () => {
    setError('')
    setStatus('')
  }

  const handleEmailAuth = async (event: React.FormEvent) => {
    event.preventDefault()
    resetFeedback()

    if (!email.trim()) {
      setError('Enter your email address.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setIsSubmitting(true)
    const result = mode === 'signin'
      ? await signInWithEmail(email.trim(), password)
      : await signUpWithEmail(email.trim(), password)

    if (result.error) {
      setError(result.error)
    } else if ('needsEmailConfirmation' in result && result.needsEmailConfirmation) {
      setStatus('Account created. Check your email to confirm your account before signing in.')
      setMode('signin')
    } else {
      setStatus(mode === 'signin' ? 'Signed in successfully.' : 'Account created successfully.')
    }

    setIsSubmitting(false)
  }

  const handleGoogleSignIn = async () => {
    resetFeedback()
    setIsSubmitting(true)
    const result = await signInWithGoogle()
    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="ql-page flex min-h-screen items-center justify-center px-4 py-6">
      <div className="w-full max-w-[460px] overflow-hidden rounded-md border border-border-default bg-base shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
        <section className="p-5 sm:p-6">
          <div className="mb-6 flex items-center gap-3">
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
            <div className="ql-eyebrow mb-2">{mode === 'signin' ? 'Sign in' : 'Sign up'}</div>
            <h2 className="text-2xl font-normal tracking-[-0.03em] text-white">
              {mode === 'signin' ? 'Access your dashboard' : 'Create an account'}
            </h2>
            <p className="mt-3 text-sm leading-6 text-text-secondary">
              {from ? `Continue to ${from}.` : 'Enter your email and password or use Google authentication.'}
            </p>
          </div>

          <div className="mb-5 flex rounded-md border border-border-default bg-base p-1">
            {(['signin', 'signup'] as AuthMode[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setMode(item)
                  resetFeedback()
                }}
                className={`min-h-10 flex-1 rounded px-3 py-2 text-sm font-semibold transition ${
                  mode === item
                    ? 'bg-accent-green text-base'
                    : 'text-text-muted hover:bg-raised hover:text-text-primary'
                }`}
              >
                {item === 'signin' ? 'Sign in' : 'Sign up'}
              </button>
            ))}
          </div>

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

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-text-secondary">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="ql-input"
                placeholder="researcher@gmail.com"
                autoComplete={mode === 'signin' ? 'email' : 'username'}
                required
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label htmlFor="password" className="block text-sm font-medium text-text-secondary">Password</label>
                {mode === 'signin' && (
                  <Link to="/forgot-password" className="text-xs font-medium text-accent-green transition hover:text-[#2fd6a1]">
                    Forgot password?
                  </Link>
                )}
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="ql-input"
                placeholder="Minimum 6 characters"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isLoading || !isConfigured}
              className="ql-button-primary w-full"
            >
              {isSubmitting
                ? (mode === 'signin' ? 'Signing in...' : 'Creating account...')
                : (mode === 'signin' ? 'Sign in with email' : 'Sign up with email')}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border-default" />
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-text-muted">or</span>
            <div className="h-px flex-1 bg-border-default" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting || isLoading || !isConfigured}
            className="ql-button-secondary w-full"
          >
            <GoogleLogo />
            {mode === 'signin' ? 'Sign in with Google' : 'Sign up with Google'}
          </button>

          <div className="mt-5 rounded-md border border-border-default bg-raised p-3 text-xs leading-5 text-text-muted">
            Authentication is handled by Supabase Auth. No password recovery flow is exposed in QuantaLab.
          </div>

          <Link to="/" className="mt-5 inline-flex text-sm text-text-muted transition hover:text-accent-green">
            Back to landing page
          </Link>
        </section>
      </div>
    </div>
  )
}
