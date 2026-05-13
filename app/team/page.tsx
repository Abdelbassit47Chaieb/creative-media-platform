'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { teamStore } from '@/lib/store'
import { TeamMember, MemberRole, PageKey, ActionKey, ROLE_DEFAULTS, AVATAR_COLORS } from '@/lib/types'
import { useAuth } from '@/lib/auth-context'
import { Plus, Pencil, Trash2, Users, Shield, ChevronDown, ChevronUp, Check } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/StatusPill'

const ROLES: MemberRole[] = ['Admin', 'Chief', 'Member']
const PAGES: { key: PageKey; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'briefs',    label: 'Creative Briefs' },
  { key: 'launches',  label: 'Launch Cards' },
  { key: 'kpi',       label: 'KPI Dashboard' },
  { key: 'reworks',   label: 'Rework Notices' },
  { key: 'reports',   label: 'Weekly Reports' },
  { key: 'team',      label: 'Team Management' },
]
const ACTIONS: ActionKey[] = ['view', 'create', 'edit', 'delete']

/** Matches deck slide 10 role badge styles */
function RoleBadge({ role }: { role: MemberRole }) {
  const styles: Record<MemberRole, React.CSSProperties> = {
    Admin:  { background: '#14141A', color: '#F2F1EC', border: '1px solid #14141A' },
    Chief:  { background: '#FBFAF6', color: '#2A2A33', border: '1px solid #DEDAD0' },
    Member: { background: '#FBFAF6', color: '#6B6B74', border: '1px solid #DEDAD0' },
  }
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium" style={{ fontFamily: 'var(--font-geist-mono)', ...styles[role] }}>
      {role}
    </span>
  )
}

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

const emptyMember = (): Omit<TeamMember, 'id' | 'createdAt'> => ({
  name: '',
  email: '',
  role: 'Member',
  jobTitle: '',
  department: '',
  permissions: ROLE_DEFAULTS['Member'],
  avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
})

export default function TeamPage() {
  const { user, can } = useAuth()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<TeamMember | null>(null)
  const [form, setForm] = useState(emptyMember())
  const [expandedPerms, setExpandedPerms] = useState<string | null>(null)

  const reload = () => setMembers(teamStore.getAll())
  useEffect(() => { reload() }, [])

  const isAdmin = user?.role === 'Admin'

  const openNew = () => { setEditing(null); setForm(emptyMember()); setOpen(true) }
  const openEdit = (m: TeamMember) => { setEditing(m); setForm({ ...m }); setOpen(true) }

  const handleRoleChange = (role: MemberRole) => {
    setForm(f => ({ ...f, role, permissions: ROLE_DEFAULTS[role].map(p => ({ ...p, actions: [...p.actions] })) }))
  }

  const toggleAction = (pageKey: PageKey, action: ActionKey) => {
    setForm(f => ({
      ...f,
      permissions: f.permissions.map(p => {
        if (p.page !== pageKey) return p
        const has = p.actions.includes(action)
        const next = has ? p.actions.filter(a => a !== action) : [...p.actions, action]
        if (action !== 'view' && next.includes('create') || next.includes('edit') || next.includes('delete')) {
          if (!next.includes('view')) next.push('view')
        }
        return { ...p, actions: next }
      }),
    }))
  }

  const hasAction = (pageKey: PageKey, action: ActionKey) =>
    form.permissions.find(p => p.page === pageKey)?.actions.includes(action) ?? false

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim() || !form.jobTitle.trim()) {
      toast.error('Name, email and job title are required.')
      return
    }
    if (editing) { teamStore.update(editing.id, form); toast.success('Member updated.') }
    else { teamStore.add(form); toast.success('Member added.') }
    setOpen(false); reload()
  }

  const handleDelete = (id: string) => {
    if (id === user?.id) { toast.error("You can't delete yourself."); return }
    teamStore.delete(id); toast.success('Member removed.'); reload()
  }

  const ensurePerms = () => {
    setForm(f => ({
      ...f,
      permissions: PAGES.map(p => f.permissions.find(pp => pp.page === p.key) ?? { page: p.key, actions: [] as ActionKey[] }),
    }))
  }

  const deptCounts = members.reduce<Record<string, number>>((acc, m) => {
    acc[m.department] = (acc[m.department] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <PageHeader eyebrow="Module 06" title="Team &amp; Permissions" subtitle="Role-based access with per-page action scopes — Admin, Chief, Member." />
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNew} style={{ background: '#5B3FF9', color: '#fff' }}>
                <Plus size={15} className="mr-2" /> Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{editing ? 'Edit Member' : 'Add New Member'}</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="space-y-1.5">
                  <Label>Full Name *</Label>
                  <Input placeholder="Alex K." value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Email *</Label>
                  <Input type="email" placeholder="alex@cadence.app" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Job Title *</Label>
                  <Input placeholder="e.g. Media Buyer, Video Editor, Creative Director…" value={form.jobTitle} onChange={e => setForm(f => ({ ...f, jobTitle: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Department</Label>
                  <Input placeholder="e.g. Creative, Media Buying…" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Role</Label>
                  <Select value={form.role} onValueChange={v => handleRoleChange(v as MemberRole)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ROLES.map(r => (
                        <SelectItem key={r} value={r}>
                          <span className="font-medium">{r}</span>
                          <span className="text-xs ml-2" style={{ color: '#9A9AA1' }}>
                            {r === 'Admin' ? '— Full access + team mgmt' : r === 'Chief' ? '— Department head, all actions' : '— Standard access, view only by default'}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Avatar Color</Label>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {AVATAR_COLORS.map(c => (
                      <button key={c} onClick={() => setForm(f => ({ ...f, avatarColor: c }))}
                        className={`w-7 h-7 rounded-full ${c} flex items-center justify-center transition-transform ${form.avatarColor === c ? 'ring-2 ring-offset-2 ring-slate-700 scale-110' : 'hover:scale-105'}`}>
                        {form.avatarColor === c && <Check size={12} className="text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Permissions grid */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold flex items-center gap-1.5" style={{ color: '#15151B' }}><Shield size={13} /> Page Permissions</p>
                  <button onClick={ensurePerms} className="text-xs hover:underline" style={{ color: '#5B3FF9' }}>Reset to role defaults</button>
                </div>
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #DEDAD0' }}>
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ background: '#F4F1EA', borderBottom: '1px solid #DEDAD0' }}>
                        <th className="text-left px-3 py-2 font-medium" style={{ color: '#6B6B74', fontFamily: 'var(--font-geist-mono)' }}>Page</th>
                        {ACTIONS.map(a => (
                          <th key={a} className="px-3 py-2 font-medium text-center capitalize" style={{ color: '#6B6B74', fontFamily: 'var(--font-geist-mono)' }}>{a}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {PAGES.map(({ key, label }) => (
                        <tr key={key} style={{ borderBottom: '1px solid #DEDAD0' }}>
                          <td className="px-3 py-2 font-medium" style={{ color: '#2A2A33' }}>{label}</td>
                          {ACTIONS.map(action => (
                            <td key={action} className="px-3 py-2 text-center">
                              <button
                                onClick={() => toggleAction(key, action)}
                                className="w-5 h-5 rounded-md flex items-center justify-center mx-auto transition-colors"
                                style={hasAction(key, action)
                                  ? { background: '#5B3FF9', border: '2px solid #5B3FF9', color: '#fff' }
                                  : { border: '2px solid #DEDAD0' }
                                }
                              >
                                {hasAction(key, action) && <Check size={11} />}
                              </button>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} style={{ background: '#5B3FF9', color: '#fff' }}>
                  {editing ? 'Save Changes' : 'Add Member'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Dept summary */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: '#FBFAF6', border: '1px solid #DEDAD0' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(91,63,249,0.1)' }}>
            <Users size={18} style={{ color: '#5B3FF9' }} />
          </div>
          <div>
            <p className="text-xl font-bold" style={{ color: '#15151B', fontFamily: 'var(--font-geist-mono)' }}>{members.length}</p>
            <p className="text-xs" style={{ color: '#6B6B74' }}>Total Members</p>
          </div>
        </div>
        {Object.entries(deptCounts).slice(0, 3).map(([dept, count]) => (
          <div key={dept} className="rounded-2xl p-4" style={{ background: '#FBFAF6', border: '1px solid #DEDAD0' }}>
            <p className="text-xl font-bold" style={{ color: '#15151B', fontFamily: 'var(--font-geist-mono)' }}>{count}</p>
            <p className="text-xs" style={{ color: '#6B6B74' }}>{dept}</p>
          </div>
        ))}
      </div>

      {/* Team cards — matches deck slide 10 team & permissions layout */}
      <div className="grid grid-cols-3 gap-4">
        {members.map(m => (
          <div
            key={m.id}
            className="rounded-2xl p-5"
            style={{
              background: '#FBFAF6',
              border: m.id === user?.id ? '1px solid #5B3FF9' : '1px solid #DEDAD0',
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full ${m.avatarColor} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                  {initials(m.name)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: '#15151B' }}>
                    {m.name}
                    {m.id === user?.id && <span className="text-xs ml-1" style={{ color: '#5B3FF9' }}>(you)</span>}
                  </p>
                  <p className="text-xs truncate" style={{ color: '#9A9AA1' }}>{m.email}</p>
                </div>
              </div>
              {isAdmin && (
                <div className="flex gap-1 ml-2 shrink-0">
                  <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg transition-colors" style={{ color: '#9A9AA1' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#5B3FF9'; (e.currentTarget as HTMLElement).style.background = 'rgba(91,63,249,0.08)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#9A9AA1'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded-lg transition-colors" style={{ color: '#9A9AA1' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#D04A3B'; (e.currentTarget as HTMLElement).style.background = 'rgba(208,74,59,0.08)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#9A9AA1'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>

            {/* Role + job */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <RoleBadge role={m.role} />
              <span className="text-xs rounded-full px-2 py-0.5" style={{ background: '#F4F1EA', color: '#6B6B74', border: '1px solid #DEDAD0' }}>{m.jobTitle}</span>
              {m.department && <span className="text-xs" style={{ color: '#9A9AA1' }}>{m.department}</span>}
            </div>

            {/* Permissions expand */}
            <button
              onClick={() => setExpandedPerms(expandedPerms === m.id ? null : m.id)}
              className="mt-3 w-full flex items-center justify-between transition-colors"
              style={{ color: '#9A9AA1' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#6B6B74'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#9A9AA1'}
            >
              <span className="flex items-center gap-1 text-xs"><Shield size={11} /> Page access</span>
              {expandedPerms === m.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>

            {expandedPerms === m.id && (
              <div className="mt-2 space-y-1">
                {PAGES.map(({ key, label }) => {
                  const perm = m.permissions.find(p => p.page === key)
                  const actions = perm?.actions ?? []
                  if (actions.length === 0) return null
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: '#6B6B74' }}>{label}</span>
                      <div className="flex gap-1">
                        {ACTIONS.map(a => (
                          <span
                            key={a}
                            className="text-xs px-1 py-0.5 rounded"
                            style={actions.includes(a)
                              ? { background: 'rgba(91,63,249,0.1)', color: '#5B3FF9', fontFamily: 'var(--font-geist-mono)' }
                              : { background: '#F4F1EA', color: '#DEDAD0', fontFamily: 'var(--font-geist-mono)' }
                            }
                          >
                            {a[0].toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
