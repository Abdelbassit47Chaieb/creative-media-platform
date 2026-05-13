'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard, FileText, Rocket, BarChart2,
  RefreshCw, ClipboardList, Users, ChevronDown, Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { teamStore } from '@/lib/store'
import { TeamMember, MemberRole } from '@/lib/types'

const ALL_NAV = [
  { href: '/',         label: 'Dashboard',      icon: LayoutDashboard, page: 'dashboard' },
  { href: '/briefs',   label: 'Creative Briefs', icon: FileText,        page: 'briefs'    },
  { href: '/launches', label: 'Launch Cards',    icon: Rocket,          page: 'launches'  },
  { href: '/kpi',      label: 'KPI Dashboard',   icon: BarChart2,       page: 'kpi'       },
  { href: '/reworks',  label: 'Rework Notices',  icon: RefreshCw,       page: 'reworks'   },
  { href: '/reports',  label: 'Weekly Reports',  icon: ClipboardList,   page: 'reports'   },
  { href: '/team',     label: 'Team',            icon: Users,           page: 'team'      },
]

function roleBadgeStyle(role: MemberRole): string {
  if (role === 'Admin') return 'rgba(91,63,249,0.25)'
  if (role === 'Chief') return 'rgba(255,106,61,0.2)'
  return 'rgba(255,255,255,0.08)'
}

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

export default function Sidebar() {
  const path = usePathname()
  const { user, setUser, canView } = useAuth()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [switcherOpen, setSwitcherOpen] = useState(false)

  useEffect(() => { setMembers(teamStore.getAll()) }, [])

  const nav = ALL_NAV.filter(n => canView(n.page))

  return (
    <aside
      className="fixed top-0 left-0 h-full w-60 flex flex-col z-40"
      style={{ background: '#14141A' }}
    >
      {/* Brand mark */}
      <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-3">
          {/* Logo: dark square + two vertical bars (second bar violet) */}
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
        {nav.map(({ href, label, icon: Icon, page }) => {
          const active = href === '/' ? path === '/' : path.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active
                  ? 'text-white'
                  : 'hover:text-white transition-colors'
              )}
              style={active
                ? { background: '#5B3FF9', color: '#fff' }
                : { color: '#6B6B74' }
              }
            >
              <Icon size={15} className="shrink-0" />
              <span className="flex-1 truncate">{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User switcher */}
      <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <button
          onClick={() => setSwitcherOpen(o => !o)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors"
          style={{ background: switcherOpen ? '#1E1E26' : 'transparent' }}
          onMouseEnter={e => { if (!switcherOpen) (e.currentTarget as HTMLElement).style.background = '#1E1E26' }}
          onMouseLeave={e => { if (!switcherOpen) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
        >
          {user ? (
            <>
              <div
                className={`w-8 h-8 rounded-full ${user.avatarColor} flex items-center justify-center text-white text-xs font-bold shrink-0`}
              >
                {initials(user.name)}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-white text-xs font-semibold truncate">{user.name}</p>
                <p className="text-xs truncate" style={{ color: '#6B6B74' }}>{user.jobTitle}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className="text-xs px-1.5 py-0.5 rounded-md font-medium"
                  style={{ background: roleBadgeStyle(user.role), color: user.role === 'Admin' ? '#9B8FFF' : user.role === 'Chief' ? '#FF8F6A' : '#9CA3AF' }}
                >
                  {user.role}
                </span>
                <ChevronDown
                  size={12}
                  style={{ color: '#6B6B74', transform: switcherOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
                />
              </div>
            </>
          ) : (
            <span className="text-sm" style={{ color: '#6B6B74' }}>No user selected</span>
          )}
        </button>

        {/* Dropdown */}
        {switcherOpen && (
          <div
            className="mt-1 rounded-xl overflow-hidden"
            style={{ background: '#1E1E26', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="px-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-xs font-medium uppercase tracking-widest" style={{ color: '#6B6B74' }}>Switch account</p>
            </div>
            <div className="max-h-52 overflow-y-auto">
              {members.map(m => (
                <button
                  key={m.id}
                  onClick={() => { setUser(m); setSwitcherOpen(false) }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  <div className={`w-7 h-7 rounded-full ${m.avatarColor} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                    {initials(m.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">{m.name}</p>
                    <p className="text-xs truncate" style={{ color: '#6B6B74' }}>{m.jobTitle}</p>
                  </div>
                  {user?.id === m.id && <Check size={12} style={{ color: '#5B3FF9' }} className="shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs px-3 mt-2.5" style={{ color: '#3A3A44' }}>SOP v1.0 · Internal</p>
      </div>
    </aside>
  )
}
