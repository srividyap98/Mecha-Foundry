import React from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth.store'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setSession, fetchProfile, setLoading, setInitialized } = useAuthStore()

  React.useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => {
          setLoading(false)
          setInitialized(true)
        })
      } else {
        setLoading(false)
        setInitialized(true)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [setUser, setSession, fetchProfile, setLoading, setInitialized])

  return <>{children}</>
}
