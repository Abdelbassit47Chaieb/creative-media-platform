/**
 * Cadence status pill — exact colours from the design deck.
 * Use this instead of inline statusColor() functions in every page.
 */
import React from 'react'

export const STATUS_TOKENS: Record<string, { bg: string; border: string; color: string; dot: string }> = {
  // brief statuses
  Draft:           { bg: '#F4F1EA', border: '#DEDAD0', color: '#6B6B74',  dot: '#9A9AA1' },
  'In Production': { bg: '#FFF3D6', border: '#F0DAA0', color: '#6B4F00',  dot: '#E0A82E' },
  'Under Review':  { bg: '#FFF3D6', border: '#F0DAA0', color: '#6B4F00',  dot: '#E0A82E' },
  Approved:        { bg: '#E0F5E8', border: '#B6E2C8', color: '#1B6B3A',  dot: '#2BA56F' },
  Rework:          { bg: '#FBE5DF', border: '#F0B8AB', color: '#962C18',  dot: '#D04A3B' },
  // launch statuses
  Live:            { bg: '#E0F5E8', border: '#B6E2C8', color: '#1B6B3A',  dot: '#2BA56F' },
  Pending:         { bg: '#F1EEFF', border: '#D6CEFF', color: '#3F2DAD',  dot: '#5B3FF9' },
  Ended:           { bg: '#ECECEE', border: '#D6D6DA', color: '#4A4A52',  dot: '#9A9AA1' },
  Killed:          { bg: '#FBE5DF', border: '#F0B8AB', color: '#962C18',  dot: '#D04A3B' },
  // rework statuses & priorities
  Open:            { bg: '#FBE5DF', border: '#F0B8AB', color: '#962C18',  dot: '#D04A3B' },
  'In Progress':   { bg: '#FFF3D6', border: '#F0DAA0', color: '#6B4F00',  dot: '#E0A82E' },
  Resolved:        { bg: '#E0F5E8', border: '#B6E2C8', color: '#1B6B3A',  dot: '#2BA56F' },
  Urgent:          { bg: '#FBE5DF', border: '#F0B8AB', color: '#962C18',  dot: '#D04A3B' },
  Normal:          { bg: '#FFF3D6', border: '#F0DAA0', color: '#6B4F00',  dot: '#E0A82E' },
}

const FALLBACK = { bg: '#F4F1EA', border: '#DEDAD0', color: '#6B6B74', dot: '#9A9AA1' }

interface StatusPillProps {
  status: string
  className?: string
}

export function StatusPill({ status, className = '' }: StatusPillProps) {
  const t = STATUS_TOKENS[status] ?? FALLBACK
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${className}`}
      style={{
        fontFamily: 'var(--font-geist-mono)',
        background: t.bg,
        border: `1px solid ${t.border}`,
        color: t.color,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: t.dot }} />
      {status}
    </span>
  )
}

/** Cadence filter tab — active uses violet accent, inactive uses warm outline */
interface FilterTabProps {
  label: string
  active: boolean
  onClick: () => void
}

export function FilterTab({ label, active, onClick }: FilterTabProps) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
      style={active
        ? { background: '#5B3FF9', color: '#fff', fontFamily: 'var(--font-geist-mono)' }
        : {
            background: '#FBFAF6',
            color: '#6B6B74',
            border: '1px solid #DEDAD0',
            fontFamily: 'var(--font-geist-mono)',
          }
      }
    >
      {label}
    </button>
  )
}

/** Cadence table header cell */
export function TH({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th
      className={`py-3 px-4 text-xs font-medium uppercase tracking-wider ${right ? 'text-right' : 'text-left'}`}
      style={{ fontFamily: 'var(--font-geist-mono)', color: '#6B6B74' }}
    >
      {children}
    </th>
  )
}

/** Cadence page header */
export function PageHeader({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <div>
      {eyebrow && (
        <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ fontFamily: 'var(--font-geist-mono)', color: '#9A9AA1' }}>
          {eyebrow}
        </p>
      )}
      <h1 className="text-2xl font-semibold" style={{ color: '#15151B', letterSpacing: '-0.025em' }}>{title}</h1>
      {subtitle && <p className="text-sm mt-0.5" style={{ color: '#6B6B74' }}>{subtitle}</p>}
    </div>
  )
}
