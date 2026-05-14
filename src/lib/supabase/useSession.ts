'use client'

import { useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from './client'

export type AuthState =
  | { status: 'loading'; session: null; user: null }
  | { status: 'authenticated'; session: Session; user: User }
  | { status: 'unauthenticated'; session: null; user: null }

export function useSession(): AuthState {
  const [state, setState] = useState<AuthState>({ status: 'loading', session: null, user: null })

  useEffect(() => {
    const sb = supabase()
    let mounted = true

    sb.auth.getSession().then(({ data }) => {
      if (!mounted) return
      if (data.session) {
        setState({ status: 'authenticated', session: data.session, user: data.session.user })
      } else {
        setState({ status: 'unauthenticated', session: null, user: null })
      }
    })

    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      if (session) {
        setState({ status: 'authenticated', session, user: session.user })
      } else {
        setState({ status: 'unauthenticated', session: null, user: null })
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  return state
}

export async function signInWithGoogle(redirectTo?: string) {
  const sb = supabase()
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return sb.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}${redirectTo ?? '/'}`,
    },
  })
}

export async function signOut() {
  const sb = supabase()
  return sb.auth.signOut()
}
