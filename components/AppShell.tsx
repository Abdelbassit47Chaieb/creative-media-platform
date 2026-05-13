'use client'
import { useAuth } from '@/lib/auth-context'
import Sidebar from './Sidebar'
import LoginForm from './LoginForm'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#F4F1EA' }}>
        <div
          className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: '#5B3FF9', borderTopColor: 'transparent' }}
        />
      </div>
    )
  }

  if (!session) return <LoginForm />

  return (
    <>
      <Sidebar />
      <main className="flex-1 ml-60 min-h-screen overflow-y-auto">
        {children}
      </main>
    </>
  )
}
