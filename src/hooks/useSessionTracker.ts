import { useEffect, useRef } from 'react'
import { db } from '../lib/supabase'

/**
 * Bumps lastSessionAt and numSessions on the current user's profile
 * once per app mount (i.e. once per browser session).
 */
export function useSessionTracker(userId: string | undefined) {
  const tracked = useRef(false)

  useEffect(() => {
    if (!userId || tracked.current) return
    tracked.current = true

      ; (async () => {
        const { error } = await db.rpc('track_session')
        if (error) console.warn('Session tracking failed:', error.message)
      })()
  }, [userId])
}
