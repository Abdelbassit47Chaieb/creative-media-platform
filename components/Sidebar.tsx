'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, FileText, Rocket, BarChart2,
  RefreshCw, ClipboardList, Users, LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { MemberRole } from '@/lib/types'

const ALL_NAV = [
  { href: '/',         label: 'Dashboard',       icon: LayoutDashboard, page: 'dashboard' },
  { href: '/briefs',   label: 'Creative Briefs',  icon: FileText,        page: 'briefs'    },
  { href: '/launches', label: 'Launch Cards',     icon: Rocket,          page: 'launches'  },
  { href: '/kpi',      label: 'KPI Dashboard',    icon: BarChart2,       page: 'kpi'       },
  { href: '/reworks',  label: 'Rework Notices',   icon: RefreshCw,       page: 'reworks'   },
  { href: '/reports',  label: 'Weekly Reports',   icon: ClipboardList,   page: 'reports'   },
  { href: '/team',     label: 'Team',             icon: Users,           page: 'team'      },
]

function roleBadgeStyle(role: MemberRole) {
  if (role === 'Admin')  return { bg: 'rgba(91,63,249,0.25)',  color: '#9B8FFF' }
  if (role === 'Chief')  return { bg: 'rgba(255,106,61,0.2)',  color: '#FF8F6A' }
  return                        { bg: 'rgba(255,255,255,0.08)', color: '#9CA3AF' }
}

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

export default function Sidebar() {
  const path = usePathname()
  const { user, signOut, canView } = useAuth()

  const nav = ALL_NAV.filter(n => canView(n.page))

  return (
    <aside
      className="fixed top-0 left-0 h-full w-60 flex flex-col z-40"
      style={{ background: '#14141A' }}
    >
      {/* Brand */}
      <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center gap-0.5 shrink-0"
            style={{ background: '#1E1E26' }}
          >
            <div className="w-1 h-4 rounded-full" style={{ background: 'rgba(255,255,255,0.6)' }} />
            <div className="w-1 h-4 rounded-full" style={{ background: '#5B3FF9' }} />
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm leading-tight tracking-tight truncate">Cadence</p>
            <p className="text-xs truncate" style={{ color: '#6B6B74' }}>Creative Media Platform</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? path === '/' : path.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active ? 'text-white' : 'hover:text-white'
              )}
              style={active ? { background: '#5B3FF9', color: '#fff' } : { color: '#6B6B74' }}
            >
              <Icon size={15} className="shrink-0" />
              <span className="flex-1 truncate">{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        {user && (
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1"
            style={{ background: '#1E1E26' }}
          >
            <div
              className={`w-8 h-8 rounded-full ${user.avatarColor} flex items-center justify-center text-white text-xs font-bold shrink-0`}
            >
              {initials(user.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user.name}</p>
              <p className="text-xs truncate" style={{ color: '#6B6B74' }}>{user.jobTitle || user.email}</p>
            </div>
            <span
              className="text-xs px-1.5 py-0.5 rounded-md font-medium shrink-0"
              style={{ background: roleBadgeStyle(user.role).bg, color: roleBadgeStyle(user.role).color }}
            >
              {user.role}
            </span>
          </div>
        )}

        <button
          onClick={signOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors"
          style={{ color: '#6B6B74' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#1E1E26'; (e.currentTarget as HTMLElement).style.color = '#fff' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#6B6B74' }}
        >
          <LogOut size={14} />
          <span>Sign out</span>
        </button>

        <p className="text-xs px-3 mt-1" style={{ color: '#3A3A44' }}>SOP v1.0 · Internal</p>
      </div>
    </aside>
  )
}
