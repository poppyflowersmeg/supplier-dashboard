import { useState, useEffect } from 'react'
import type { Session } from '@supabase/supabase-js'
import { db } from '../lib/supabase'

const ALLOWED_EMAIL = 'meg@poppyflowers.com'

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)

  useEffect(() => {
    // Check initial session
    db.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email?.toLowerCase() !== ALLOWED_EMAIL) {
        if (session) db.auth.signOut()
        setSession(null)
        if (session) setAccessDenied(true)
      } else {
        setSession(session)
      }
      setLoading(false)
    })

    // Subscribe to ongoing auth changes; skip INITIAL_SESSION (handled above)
    const { data: { subscription } } = db.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') return
      if (session?.user?.email?.toLowerCase() !== ALLOWED_EMAIL) {
        if (session) db.auth.signOut()
        setSession(null)
        if (session) setAccessDenied(true)
      } else {
        setSession(session)
        setAccessDenied(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (): Promise<string | null> => {
    setAccessDenied(false)
    const { error } = await db.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + window.location.pathname },
    })
    return error?.message ?? null
  }

  const signOut = () => db.auth.signOut()

  return { session, loading, accessDenied, signIn, signOut }
}
