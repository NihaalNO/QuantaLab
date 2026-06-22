import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { isSupabaseConfigured, supabase, trackUserActivity } from '../lib/supabase/client'

export default function Settings() {
  const { user } = useAuth()
  const [displayName, setDisplayName] = useState(user?.user_metadata?.full_name || '')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const saveProfile = async () => {
    setError('')
    setStatus('')
    setIsSaving(true)

    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase is not configured.')
      }

      const { error: updateError } = await supabase.auth.updateUser({
        data: { full_name: displayName },
      })
      if (updateError) throw updateError

      await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          email: user?.email,
          full_name: displayName,
          avatar_url: user?.user_metadata?.avatar_url || null,
        })

      await trackUserActivity('profile_updated')
      setStatus('Profile updated.')
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="ql-page">
      <div className="ql-container max-w-4xl">
        <div className="mb-8 border-b border-dashed border-border-default pb-6">
          <div className="ql-eyebrow mb-3">Settings</div>
          <h1 className="text-3xl font-normal tracking-[-0.03em] text-white md:text-4xl">User settings</h1>
          <p className="mt-3 max-w-2xl text-text-secondary">
            Manage profile metadata for your QuantaLab research workspace.
          </p>
        </div>

        <section className="ql-card-soft space-y-5">
          {status && <div className="rounded-md border border-accent-green/30 bg-accent-green/10 p-3 text-sm text-accent-green">{status}</div>}
          {error && <div className="rounded-md border border-accent-rose/30 bg-accent-rose/10 p-3 text-sm text-accent-rose">{error}</div>}

          <div>
            <label htmlFor="display-name" className="mb-2 block text-sm font-medium text-text-secondary">Display name</label>
            <input
              id="display-name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="ql-input"
              placeholder="Researcher name"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-text-secondary">Email</label>
            <div className="rounded-md border border-border-default bg-base px-4 py-3 text-sm text-text-muted">{user?.email}</div>
          </div>

          <button type="button" onClick={saveProfile} disabled={isSaving} className="ql-button-primary">
            {isSaving ? 'Saving...' : 'Save settings'}
          </button>
        </section>
      </div>
    </div>
  )
}
