import { useState, useEffect } from 'react'
import type { Session } from '@supabase/supabase-js'
import { db } from '../lib/supabase'

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check initial session
    db.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Subscribe to ongoing auth changes; skip INITIAL_SESSION (handled above)
    const { data: { subscription } } = db.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') return
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (): Promise<string | null> => {
    const { error } = await db.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + window.location.pathname },
    })
    return error?.message ?? null
  }

  const signOut = () => db.auth.signOut()

  return { session, loading, signIn, signOut }
}
