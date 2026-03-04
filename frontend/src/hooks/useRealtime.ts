import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import type { Experiment, ExperimentResult } from '../types'

export function useRealtimeExperiment(experimentId: string) {
  const [experiment, setExperiment] = useState<Experiment | null>(null)
  const [results, setResults] = useState<ExperimentResult[]>([])

  useEffect(() => {
    // Subscribe to experiment updates
    const experimentChannel = supabase
      .channel(`experiment:${experimentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'experiments',
          filter: `id=eq.${experimentId}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE' && payload.new) {
            setExperiment(payload.new as Experiment)
          }
        }
      )
      .subscribe()

    // Subscribe to experiment result updates
    const resultsChannel = supabase
      .channel(`experiment-results:${experimentId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'experiment_results',
          filter: `experiment_id=eq.${experimentId}`,
        },
        (payload) => {
          setResults((prev) => [...prev, payload.new as ExperimentResult])
        }
      )
      .subscribe()

    return () => {
      experimentChannel.unsubscribe()
      resultsChannel.unsubscribe()
    }
  }, [experimentId])

  return { experiment, results, setExperiment, setResults }
}

export function useRealtimeExperiments(userId?: string) {
  const [experiments, setExperiments] = useState<Experiment[]>([])

  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`user-experiments:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'experiments',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setExperiments((prev) => [payload.new as Experiment, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setExperiments((prev) =>
              prev.map((e) => (e.id === payload.new.id ? (payload.new as Experiment) : e))
            )
          } else if (payload.eventType === 'DELETE') {
            setExperiments((prev) => prev.filter((e) => e.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [userId])

  return { experiments, setExperiments }
}
