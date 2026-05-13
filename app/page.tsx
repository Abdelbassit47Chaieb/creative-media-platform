'use client'
import { useEffect, useState } from 'react'
import { briefStore, launchStore, reworkStore, kpiStore } from '@/lib/store'
import { CreativeBrief, LaunchCard, ReworkNotice, KPIReport } from '@/lib/types'
import { FileText, Rocket, RefreshCw, TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  Draft:           { bg: 'rgba(107,107,116,0.12)', color: '#6B6B74' },
  'In Production': { bg: 'rgba(91,63,249,0.12)',   color: '#5B3FF9' },
  'Under Review':  { bg: 'rgba(224,168,46,0.12)',  color: '#B88A18' },
  Approved:        { bg: 'rgba(43,165,111,0.12)',   color: '#2BA56F' },
  Rework:          { bg: 'rgba(208,74,59,0.12)',    color: '#D04A3B' },
  Live:            { bg: 'rgba(43,165,111,0.12)',   color: '#2BA56F' },
  Pending:         { bg: 'rgba(91,63,249,0.12)',    color: '#5B3FF9' },
  Ended:           { bg: 'rgba(107,107,116,0.12)', color: '#6B6B74' },
  Killed:          { bg: 'rgba(208,74,59,0.12)',    color: '#D04A3B' },
  Open:            { bg: 'rgba(208,74,59,0.12)',    color: '#D04A3B' },
  'In Progress':   { bg: 'rgba(224,168,46,0.12)',  color: '#B88A18' },
  Resolved:        { bg: 'rgba(43,165,111,0.12)',   color: '#2BA56F' },
}

function StatusPill({ status }: { status: string }) {
  const s = STATUS_STYLE[status] ?? { bg: 'rgba(107,107,116,0.12)', color: '#6B6B74' }
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ fontFamily: 'var(--font-geist-mono)', background: s.bg, color: s.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.color }} />
      {status}
    </span>
  )
}

function StatCard({ icon: Icon, label, value, sub, accent }: {
  icon: React.ElementType; label: string; value: number | string; sub?: string; accent: string
}) {
  return (
    <div
      className="rounded-2xl p-5 flex items-start gap-4"
      style={{ background: '#FBFAF6', border: '1px solid #DEDAD0' }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${accent}18` }}
      >
        <Icon size={18} style={{ color: accent }} />
      </div>
      <div>
        <p className="text-2xl font-bold" style={{ color: '#15151B', fontFamily: 'var(--font-geist-sans)' }}>{value}</p>
        <p className="text-sm font-medium mt-0.5" style={{ color: '#2A2A33' }}>{label}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: '#6B6B74' }}>{sub}</p>}
      </div>
    </div>
  )
}

function SectionCard({ title, linkHref, linkLabel, children }: {
  title: string; linkHref: string; linkLabel: string; children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#FBFAF6', border: '1px solid #DEDAD0' }}>
      <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #DEDAD0' }}>
        <p className="text-sm font-semibold" style={{ color: '#15151B' }}>{title}</p>
        <Link href={linkHref} className="text-xs font-medium transition-opacity hover:opacity-70" style={{ color: '#5B3FF9' }}>{linkLabel} →</Link>
      </div>
      {children}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [briefs, setBriefs] = useState<CreativeBrief[]>([])
  const [launches, setLaunches] = useState<LaunchCard[]>([])
  const [reworks, setReworks] = useState<ReworkNotice[]>([])
  const [kpis, setKpis] = useState<KPIReport[]>([])

  useEffect(() => {
    setBriefs(briefStore.getAll())
    setLaunches(launchStore.getAll())
    setReworks(reworkStore.getAll())
    setKpis(kpiStore.getAll())
  }, [])

  const liveLaunches  = launches.filter(l => l.status === 'Live').length
  const openReworks   = reworks.filter(r => r.status === 'Open').length
  const winners       = kpis.filter(k => k.scenario === 'G').length
  const inProduction  = briefs.filter(b => b.status === 'In Production').length

  const recentBriefs   = [...briefs].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5)
  const activeLaunches = launches.filter(l => l.status === 'Live').slice(0, 5)

  const greeting = user ? `Good day, ${user.name.split(' ')[0]}` : 'Dashboard'

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: '#15151B', fontFamily: 'var(--font-instrument-serif)', fontStyle: 'italic' }}>
          {greeting}
        </h1>
        <p className="text-sm mt-1" style={{ color: '#6B6B74' }}>Creative-to-Media Buyer SOP Overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard icon={FileText}   label="In Production"  value={inProduction} sub={`${briefs.length} total briefs`}    accent="#5B3FF9" />
        <StatCard icon={Rocket}     label="Live Campaigns" value={liveLaunches} sub={`${launches.length} total launches`} accent="#2BA56F" />
        <StatCard icon={RefreshCw}  label="Open Reworks"   value={openReworks}  sub="needs creative attention"            accent="#D04A3B" />
        <StatCard icon={TrendingUp} label="Winners Found"  value={winners}      sub="positive ROAS achieved"              accent="#FF6A3D" />
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Recent Briefs */}
        <SectionCard title="Recent Creative Briefs" linkHref="/briefs" linkLabel="View all">
          {recentBriefs.length === 0
            ? <p className="text-sm px-6 py-4" style={{ color: '#6B6B74' }}>No briefs yet.</p>
            : <div>
                {recentBriefs.map(b => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between px-6 py-3 transition-colors"
                    style={{ borderBottom: '1px solid #DEDAD0' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F4F1EA'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: '#15151B' }}>{b.marketingAngle}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#6B6B74' }}>{b.product} · {b.mediaBuyerOwner}</p>
                    </div>
                    <StatusPill status={b.status} />
                  </div>
                ))}
              </div>
          }
        </SectionCard>

        {/* Active Launches */}
        <SectionCard title="Active Launch Cards" linkHref="/launches" linkLabel="View all">
          {activeLaunches.length === 0
            ? <p className="text-sm px-6 py-4" style={{ color: '#6B6B74' }}>No active launches.</p>
            : <div>
                {activeLaunches.map(l => (
                  <div
                    key={l.id}
                    className="flex items-center justify-between px-6 py-3 transition-colors"
                    style={{ borderBottom: '1px solid #DEDAD0' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F4F1EA'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: '#15151B' }}>{l.marketingAngle}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#6B6B74' }}>{l.product} · ${l.dailyBudget}/day · {l.testDuration}d</p>
                    </div>
                    <StatusPill status={l.status} />
                  </div>
                ))}
              </div>
          }
        </SectionCard>
      </div>

      {/* SOP Workflow */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#FBFAF6', border: '1px solid #DEDAD0' }}>
        <div className="px-6 py-4" style={{ borderBottom: '1px solid #DEDAD0' }}>
          <p className="text-sm font-semibold" style={{ color: '#15151B' }}>SOP Workflow — 9-Step Loop</p>
          <p className="text-xs mt-0.5" style={{ color: '#6B6B74' }}>From brainstorm to iteration — the creative production cycle</p>
        </div>
        <div className="p-5 grid grid-cols-3 gap-3">
          {[
            { step: '1', label: 'BRAINSTORM', desc: 'Joint session — agree on angles, personas, hooks', icon: FileText,    href: '/briefs'   },
            { step: '2', label: 'CREATE',     desc: 'Creative team produces assets, files to Drive',    icon: FileText,    href: '/briefs'   },
            { step: '3', label: 'REVIEW',     desc: 'Media buyer checks creative against brief',        icon: CheckCircle, href: '/briefs'   },
            { step: '4', label: 'REWORK',     desc: 'If rejected, creative team revises and delivers',  icon: RefreshCw,   href: '/reworks'  },
            { step: '5', label: 'LAUNCH',     desc: 'Fill Test Launch Card, document all parameters',   icon: Rocket,      href: '/launches' },
            { step: '6', label: 'TEST',       desc: 'Run for agreed duration — do not kill early',      icon: Clock,       href: '/launches' },
            { step: '7', label: 'DIAGNOSE',   desc: 'Apply KPI Diagnostic Framework (Section 6)',       icon: TrendingUp,  href: '/kpi'      },
            { step: '8', label: 'REPORT',     desc: 'Weekly Creative Performance Report — every Friday',icon: AlertCircle, href: '/reports'  },
            { step: '9', label: 'ITERATE',    desc: 'Use data to improve angles in next session',       icon: RefreshCw,   href: '/briefs'   },
          ].map(s => (
            <Link
              key={s.step}
              href={s.href}
              className="flex items-start gap-3 p-3.5 rounded-xl transition-all group"
              style={{ border: '1px solid #DEDAD0', background: '#F4F1EA' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#5B3FF9'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = '#DEDAD0'}
            >
              <div
                className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: '#5B3FF9', fontFamily: 'var(--font-geist-mono)' }}
              >
                {s.step}
              </div>
              <div>
                <p className="text-xs font-bold tracking-wider" style={{ color: '#15151B', fontFamily: 'var(--font-geist-mono)' }}>{s.label}</p>
                <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#6B6B74' }}>{s.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
