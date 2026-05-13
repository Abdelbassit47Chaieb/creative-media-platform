'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { fromProfile } from './db'
import { TeamMember } from './types'

interface AuthCtx {
  user: TeamMember | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
  can: (page: string, action: string) => boolean
  canView: (page: string) => boolean
}

const Ctx = createContext<AuthCtx>({
  user: null, session: null, loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  refreshUser: async () => {},
  can: () => false,
  canView: () => false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<TeamMember | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (data) setUser(fromProfile(data))
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        loadProfile(session.user.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      if (session?.user) {
        await loadProfile(session.user.id)
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    return { error: error?.message ?? null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
  }

  const refreshUser = async () => {
    if (session?.user) await loadProfile(session.user.id)
  }

  const can = (page: string, action: string) => {
    if (!user) return false
    const perm = user.permissions.find(p => p.page === page)
    return perm?.actions.includes(action as never) ?? false
  }

  const canView = (page: string) => can(page, 'view')

  return (
    <Ctx.Provider value={{ user, session, loading, signIn, signUp, signOut, refreshUser, can, canView }}>
      {children}
    </Ctx.Provider>
  )
}

export function useAuth() { return useContext(Ctx) }
