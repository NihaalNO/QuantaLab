import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase, trackUserActivity } from '../lib/supabase/client'

interface AuthContextValue {
  user: User | null
  session: Session | null
  isLoading: boolean
  isConfigured: boolean
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>
  signUpWithEmail: (email: string, password: string, fullName?: string) => Promise<{ error?: string; needsEmailConfirmation?: boolean }>
  signInWithGoogle: () => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const loadSession = async () => {
      if (!isSupabaseConfigured) {
        setIsLoading(false)
        return
      }

      const { data } = await supabase.auth.getSession()
      if (mounted) {
        setSession(data.session)
        setIsLoading(false)
      }
    }

    loadSession()

    if (!isSupabaseConfigured) {
      return () => {
        mounted = false
      }
    }

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setIsLoading(false)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user: session?.user ?? null,
    session,
    isLoading,
    isConfigured: isSupabaseConfigured,
    signInWithEmail: async (email: string, password: string) => {
      if (!isSupabaseConfigured) {
        return { error: 'Supabase is not configured. Add your Supabase URL and anon key to the frontend environment.' }
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      return error ? { error: error.message } : {}
    },
    signUpWithEmail: async (email: string, password: string, fullName?: string) => {
      if (!isSupabaseConfigured) {
        return { error: 'Supabase is not configured. Add your Supabase URL and anon key to the frontend environment.' }
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) return { error: error.message }

      return { needsEmailConfirmation: !data.session }
    },
    signInWithGoogle: async () => {
      if (!isSupabaseConfigured) {
        return { error: 'Supabase is not configured. Add your Supabase URL and anon key to the frontend environment.' }
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      return error ? { error: error.message } : {}
    },
    signOut: async () => {
      await trackUserActivity('logout')
      await supabase.auth.signOut()
    },
  }), [isLoading, session])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
