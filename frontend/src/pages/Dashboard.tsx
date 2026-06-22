import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { isSupabaseConfigured, supabase } from '../lib/supabase/client'

type Activity = {
  id: string
  activity_type: string
  created_at: string
  metadata: Record<string, unknown> | null
}

const quickActions = [
  ['New Debug Session', '/dashboard/debugger', 'Analyze a circuit failure mode'],
  ['Open Circuit Visualizer', '/dashboard/circuit-visualizer', 'Compose and simulate a circuit'],
  ['Create Research Experiment', '/dashboard/sandbox', 'Start a reproducible experiment'],
  ['View History', '/dashboard', 'Review recent activity'],
]

export default function Dashboard() {
  const { user } = useAuth()
  const [activities, setActivities] = useState<Activity[]>([])
  const [counts, setCounts] = useState({
    experiments: 0,
    debuggerRuns: 0,
    simulations: 0,
    notes: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Researcher'
  const avatar = user?.user_metadata?.avatar_url as string | undefined
  const lastSignIn = user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'First session'

  useEffect(() => {
    const loadDashboard = async () => {
      if (!user || !isSupabaseConfigured) {
        setIsLoading(false)
        return
      }

      try {
        const [
          activityResult,
          experimentsResult,
          debuggerResult,
          simulationsResult,
          notesResult,
        ] = await Promise.all([
          supabase
            .from('user_activity')
            .select('id, activity_type, created_at, metadata')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(8),
          supabase.from('experiments').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('debugger_runs').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('circuit_simulations').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('research_notes').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        ])

        setActivities((activityResult.data as Activity[]) || [])
        setCounts({
          experiments: experimentsResult.count || 0,
          debuggerRuns: debuggerResult.count || 0,
          simulations: simulationsResult.count || 0,
          notes: notesResult.count || 0,
        })
      } catch (error) {
        console.error('Failed to load dashboard activity:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboard()
  }, [user])

  const stats = useMemo(() => [
    ['Experiments', counts.experiments, 'Saved projects and versions'],
    ['Debugger runs', counts.debuggerRuns, 'Failure analysis history'],
    ['Simulations', counts.simulations, 'Circuit execution records'],
    ['Research notes', counts.notes, 'Notebook-ready observations'],
  ], [counts])

  return (
    <div className="ql-page">
      <div className="ql-container">
        <div className="mb-8 flex flex-col justify-between gap-4 border-b border-dashed border-border-default pb-6 lg:flex-row lg:items-end">
          <div>
            <div className="ql-eyebrow mb-3">Dashboard</div>
            <h1 className="text-3xl font-normal tracking-[-0.03em] text-white md:text-4xl">Welcome back, {displayName}</h1>
            <p className="mt-3 max-w-3xl text-text-secondary">
              Your protected research workspace for experiments, debugger runs, circuit simulations, and activity history.
            </p>
          </div>
          <span className="ql-chip">Last login: {lastSignIn}</span>
        </div>

        <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
          <section className="ql-card-soft">
            <div className="flex items-center gap-4">
              {avatar ? (
                <img src={avatar} alt="" className="h-14 w-14 rounded-full border border-border-bright" />
              ) : (
                <div className="grid h-14 w-14 place-items-center rounded-full border border-border-bright bg-base font-mono text-accent-green">
                  {displayName.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold text-white">{displayName}</h2>
                <p className="truncate text-sm text-text-muted">{user?.email}</p>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <div className="rounded-md border border-border-default bg-base p-3">
                <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Supabase user ID</div>
                <div className="mt-1 break-all font-mono text-xs text-text-secondary">{user?.id}</div>
              </div>
              <Link to="/dashboard/settings" className="ql-button-secondary w-full">Open settings</Link>
            </div>
          </section>

          <section className="grid gap-px overflow-hidden rounded-md border border-border-default bg-border-dim md:grid-cols-4">
            {stats.map(([label, value, helper]) => (
              <div key={label} className="bg-base p-5">
                <div className="font-mono text-3xl text-white">{value}</div>
                <div className="mt-2 font-medium text-text-primary">{label}</div>
                <div className="mt-1 text-xs text-text-muted">{helper}</div>
              </div>
            ))}
          </section>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_420px]">
          <section className="ql-card-soft">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="ql-panel-title">Quick actions</h2>
              <span className="ql-chip">Protected tools</span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {quickActions.map(([label, href, helper]) => (
                <Link key={label} to={href} className="ql-card group">
                  <div className="mb-6 h-1 w-10 rounded-full bg-accent-green transition group-hover:w-16" />
                  <h3 className="font-semibold text-white">{label}</h3>
                  <p className="mt-2 text-sm text-text-muted">{helper}</p>
                </Link>
              ))}
            </div>
          </section>

          <section className="ql-card-soft">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="ql-panel-title">Activity timeline</h2>
              {isLoading && <span className="ql-chip">Loading</span>}
            </div>

            {!isLoading && activities.length === 0 ? (
              <div className="rounded-md border border-dashed border-border-default p-8 text-center">
                <div className="mx-auto mb-4 h-10 w-10 rounded-md border border-border-default bg-base" />
                <h3 className="font-medium text-white">No activity yet</h3>
                <p className="mt-2 text-sm text-text-muted">
                  Run a debugger session, simulate a circuit, or create an experiment to populate this timeline.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {(isLoading ? Array.from({ length: 4 }) : activities).map((activity, index) => {
                  if (isLoading) {
                    return <div key={index} className="h-16 animate-pulse rounded-md border border-border-default bg-base" />
                  }

                  const item = activity as Activity
                  return (
                    <div key={item.id} className="rounded-md border border-border-default bg-base p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-mono text-xs uppercase tracking-[0.14em] text-accent-green">{item.activity_type}</div>
                          <div className="mt-1 text-sm text-text-muted">User activity recorded for this workspace.</div>
                        </div>
                        <div className="shrink-0 font-mono text-[11px] text-text-muted">
                          {new Date(item.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
