'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { TeamMember } from './types'
import { activeUserStore, teamStore } from './store'

interface AuthCtx {
  user: TeamMember | null
  setUser: (m: TeamMember) => void
  can: (page: string, action: string) => boolean
  canView: (page: string) => boolean
}

const Ctx = createContext<AuthCtx>({
  user: null,
  setUser: () => {},
  can: () => false,
  canView: () => false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<TeamMember | null>(null)

  useEffect(() => {
    // hydrate from localStorage then keep in sync with team changes
    const stored = activeUserStore.get()
    if (stored) {
      // refresh from team store in case permissions were updated
      const fresh = teamStore.getAll().find(m => m.id === stored.id)
      setUserState(fresh ?? stored)
    } else {
      const first = teamStore.getAll()[0]
      if (first) { activeUserStore.set(first); setUserState(first) }
    }
  }, [])

  const setUser = (m: TeamMember) => {
    activeUserStore.set(m)
    setUserState(m)
  }

  const can = (page: string, action: string) => {
    if (!user) return false
    const perm = user.permissions.find(p => p.page === page)
    return perm?.actions.includes(action as never) ?? false
  }

  const canView = (page: string) => can(page, 'view')

  return <Ctx.Provider value={{ user, setUser, can, canView }}>{children}</Ctx.Provider>
}

export function useAuth() {
  return useContext(Ctx)
}
