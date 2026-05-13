'use client'
import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'

function Field({
  label, type = 'text', value, onChange, placeholder, required, minLength,
}: {
  label: string; type?: string; value: string
  onChange: (v: string) => void; placeholder?: string
  required?: boolean; minLength?: number
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <label
        className="block text-xs font-medium mb-1.5"
        style={{ color: '#2A2A33', fontFamily: 'var(--font-geist-mono)' }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
        style={{
          background: '#F4F1EA',
          border: `1px solid ${focused ? '#5B3FF9' : '#DEDAD0'}`,
          color: '#15151B',
          fontFamily: 'var(--font-geist-sans)',
        }}
      />
    </div>
  )
}

export default function LoginForm() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode]         = useState<'login' | 'signup'>('login')
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [busy, setBusy]         = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    if (mode === 'login') {
      const { error } = await signIn(email, password)
      if (error) setError(error)
    } else {
      if (!name.trim()) { setError('Please enter your name'); setBusy(false); return }
      const { error } = await signUp(email, password, name)
      if (error) setError(error)
      else setError('Check your email to confirm your account, then sign in.')
    }
    setBusy(false)
  }

  const isInfo = error?.includes('Check your email')

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ background: '#F4F1EA' }}>
      <div
        className="w-full max-w-sm rounded-2xl p-8"
        style={{ background: '#FBFAF6', border: '1px solid #DEDAD0', boxShadow: '0 4px 32px rgba(21,21,27,0.08)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center gap-0.5 shrink-0" style={{ background: '#14141A' }}>
            <div className="w-1 h-4 rounded-full" style={{ background: 'rgba(255,255,255,0.6)' }} />
            <div className="w-1 h-4 rounded-full" style={{ background: '#5B3FF9' }} />
          </div>
          <div>
            <p className="font-semibold text-sm leading-tight" style={{ color: '#15151B' }}>Cadence</p>
            <p className="text-xs" style={{ color: '#6B6B74' }}>Creative Media Platform</p>
          </div>
        </div>

        <h1
          className="text-2xl font-bold mb-1"
          style={{ color: '#15151B', fontFamily: 'var(--font-instrument-serif)', fontStyle: 'italic' }}
        >
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h1>
        <p className="text-sm mb-6" style={{ color: '#6B6B74' }}>
          {mode === 'login' ? 'Sign in to your workspace' : "Join your team's workspace"}
        </p>

        <form onSubmit={submit} className="space-y-4">
          {mode === 'signup' && (
            <Field label="FULL NAME" value={name} onChange={setName} placeholder="Alex Dupont" required />
          )}
          <Field label="EMAIL" type="email" value={email} onChange={setEmail} placeholder="you@agency.com" required />
          <Field label="PASSWORD" type="password" value={password} onChange={setPassword} placeholder="••••••••" required minLength={6} />

          {error && (
            <p
              className="text-xs px-3 py-2.5 rounded-xl"
              style={{
                background: isInfo ? 'rgba(43,165,111,0.1)' : 'rgba(208,74,59,0.1)',
                color:      isInfo ? '#2BA56F' : '#D04A3B',
                border:     `1px solid ${isInfo ? '#B6E2C8' : '#F0B8AB'}`,
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-opacity"
            style={{ background: '#5B3FF9', color: '#fff', opacity: busy ? 0.6 : 1 }}
          >
            {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="text-xs text-center mt-5" style={{ color: '#6B6B74' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError(null) }}
            className="font-medium transition-opacity hover:opacity-70"
            style={{ color: '#5B3FF9' }}
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
