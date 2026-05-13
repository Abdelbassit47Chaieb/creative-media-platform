'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { reworkStore, teamStore } from '@/lib/db'
import { ReworkNotice, Priority } from '@/lib/types'
import { useAuth } from '@/lib/auth-context'
import { Plus, Pencil, Trash2, RefreshCw, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { StatusPill, FilterTab, PageHeader } from '@/components/StatusPill'

const STATUSES = ['Open', 'In Progress', 'Resolved'] as const
const PRIORITIES: Priority[] = ['Urgent', 'Normal']

/** Left border colour by priority/status, from the deck */
function leftBorderColor(r: ReworkNotice): string {
  if (r.status === 'Resolved') return '#2BA56F'
  if (r.priority === 'Urgent') return '#D04A3B'
  return '#E0A82E'
}

const emptyRework = (firstBuyer = ''): Omit<ReworkNotice, 'id' | 'createdAt'> => ({
  briefId: '',
  creativeFileName: '',
  reworkReason: '',
  whatsMissing: '',
  reference: '',
  priority: 'Normal',
  newVersionDue: '',
  mediaBuyer: firstBuyer,
  status: 'Open',
})

export default function ReworksPage() {
  const { can } = useAuth()
  const [reworks, setReworks] = useState<ReworkNotice[]>([])
  const [buyers, setBuyers] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ReworkNotice | null>(null)
  const [form, setForm] = useState(emptyRework())
  const [filter, setFilter] = useState('All')

  const reload = async () => {
    const [all, team] = await Promise.all([reworkStore.getAll(), teamStore.getAll()])
    setReworks(all)
    setBuyers(team.filter(m => m.jobTitle.toLowerCase().includes('media buyer') || m.role === 'Admin' || m.role === 'Chief').map(m => m.name))
  }
  useEffect(() => { reload() }, [])

  const openNew = () => { setEditing(null); setForm(emptyRework(buyers[0] ?? '')); setOpen(true) }
  const openEdit = (r: ReworkNotice) => { setEditing(r); setForm({ ...r }); setOpen(true) }

  const handleSave = async () => {
    if (!form.creativeFileName || !form.reworkReason) {
      toast.error('Creative File Name and Rework Reason are required.')
      return
    }
    if (editing) { await reworkStore.update(editing.id, form); toast.success('Rework notice updated.') }
    else { await reworkStore.add(form); toast.success('Rework notice sent to creative team.') }
    setOpen(false); reload()
  }

  const handleDelete = async (id: string) => { await reworkStore.delete(id); toast.success('Rework notice deleted.'); reload() }

  const filtered = filter === 'All' ? reworks : reworks.filter(r => r.status === filter)
  const urgent = reworks.filter(r => r.priority === 'Urgent' && r.status === 'Open').length

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <PageHeader eyebrow="Module 04" title="Rework Notices" subtitle="Reworks with a reason — and a destination." />
        {can('reworks', 'create') && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNew} style={{ background: '#5B3FF9', color: '#fff' }}>
                <Plus size={15} className="mr-2" /> New Rework Notice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{editing ? 'Edit Rework Notice' : 'Send Rework Notice'}</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="col-span-2 space-y-1.5">
                  <Label>Creative File Name *</Label>
                  <Input placeholder="Sleep-Fog · v3 — hook is generic, no specificity" value={form.creativeFileName} onChange={e => setForm(f => ({ ...f, creativeFileName: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Media Buyer</Label>
                  <Select value={form.mediaBuyer} onValueChange={v => setForm(f => ({ ...f, mediaBuyer: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{buyers.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Priority</Label>
                  <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v as Priority }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Rework Reason *</Label>
                  <Textarea placeholder="Hook rate was 18% (below 30% benchmark) — opening 3 seconds need rework" value={form.reworkReason} onChange={e => setForm(f => ({ ...f, reworkReason: e.target.value }))} className="resize-none h-20" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>What&apos;s Missing</Label>
                  <Textarea placeholder="Hook is generic — no specificity, no tracker proof" value={form.whatsMissing} onChange={e => setForm(f => ({ ...f, whatsMissing: e.target.value }))} className="resize-none h-16" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Reference</Label>
                  <Input placeholder="PA · Sleep-Fog · v1 · reference hook" value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>New Version Due</Label>
                  <Input type="date" value={form.newVersionDue} onChange={e => setForm(f => ({ ...f, newVersionDue: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as ReworkNotice['status'] }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="rounded-xl p-3 mt-3" style={{ background: 'rgba(224,168,46,0.08)', border: '1px solid rgba(224,168,46,0.2)' }}>
                <p className="text-xs font-medium" style={{ color: '#B88A18' }}>Focus on KPI metrics: "Hook rate was 18% (below 30%)" — not personal judgments.</p>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} style={{ background: '#5B3FF9', color: '#fff' }}>Send Notice</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Urgent banner */}
      {urgent > 0 && (
        <div className="flex items-center gap-3 rounded-xl px-4 py-3 mb-5" style={{ background: 'rgba(208,74,59,0.08)', border: '1px solid rgba(208,74,59,0.2)' }}>
          <AlertTriangle size={15} style={{ color: '#D04A3B' }} className="shrink-0" />
          <p className="text-sm font-medium" style={{ color: '#962C18' }}>{urgent} urgent rework{urgent > 1 ? 's' : ''} pending — creative team action required.</p>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 mb-5">
        {['All', ...STATUSES].map(s => (
          <FilterTab key={s} label={s} active={filter === s} onClick={() => setFilter(s)} />
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-16" style={{ color: '#9A9AA1' }}>
          <RefreshCw size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No rework notices found.</p>
        </div>
      )}

      {/* Rework cards — coloured left border matching deck slide 09 */}
      <div className="grid grid-cols-2 gap-4">
        {filtered.map(r => (
          <div
            key={r.id}
            className="rounded-2xl p-5"
            style={{
              background: '#FBFAF6',
              border: '1px solid #DEDAD0',
              borderLeft: `4px solid ${leftBorderColor(r)}`,
            }}
          >
            {/* Card header */}
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium" style={{ fontFamily: 'var(--font-geist-mono)', color: '#9A9AA1' }}>
                {r.creativeFileName}
              </p>
              <div className="flex items-center gap-2 ml-3 shrink-0">
                <StatusPill status={r.priority} />
                <StatusPill status={r.status} />
              </div>
            </div>

            {/* Fields */}
            <div className="space-y-3">
              {r.reworkReason && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ fontFamily: 'var(--font-geist-mono)', color: '#9A9AA1' }}>Rework Reason</p>
                  <p className="text-sm" style={{ color: '#2A2A33' }}>{r.reworkReason}</p>
                </div>
              )}
              {r.whatsMissing && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ fontFamily: 'var(--font-geist-mono)', color: '#9A9AA1' }}>What&apos;s Missing</p>
                  <p className="text-xs" style={{ color: '#6B6B74' }}>{r.whatsMissing}</p>
                </div>
              )}
              {r.reference && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ fontFamily: 'var(--font-geist-mono)', color: '#9A9AA1' }}>Reference</p>
                  <p className="text-xs" style={{ fontFamily: 'var(--font-geist-mono)', color: '#6B6B74' }}>{r.reference}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: '1px solid #DEDAD0' }}>
              <p className="text-xs" style={{ color: '#9A9AA1' }}>Due: <span style={{ fontFamily: 'var(--font-geist-mono)' }}>{r.newVersionDue || '—'}</span></p>
              <div className="flex gap-1">
                {can('reworks', 'edit') && (
                  <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg transition-colors" style={{ color: '#9A9AA1' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#5B3FF9'; (e.currentTarget as HTMLElement).style.background = 'rgba(91,63,249,0.08)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#9A9AA1'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                    <Pencil size={13} />
                  </button>
                )}
                {can('reworks', 'delete') && (
                  <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded-lg transition-colors" style={{ color: '#9A9AA1' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#D04A3B'; (e.currentTarget as HTMLElement).style.background = 'rgba(208,74,59,0.08)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#9A9AA1'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Feedback language guide */}
      <div className="rounded-2xl mt-8 overflow-hidden" style={{ background: '#FBFAF6', border: '1px solid #DEDAD0' }}>
        <div className="px-6 py-4" style={{ borderBottom: '1px solid #DEDAD0' }}>
          <p className="text-sm font-semibold" style={{ color: '#15151B' }}>Feedback Language Guide</p>
        </div>
        <div className="p-5 space-y-2">
          {[
            { bad: '"This creative is bad"', good: '"Hook rate was 18% (below 30% benchmark) — the opening 3 seconds need rework"' },
            { bad: '"Nobody clicked"', good: '"Outbound CTR was 0.6% — the CTA or angle needs to be stronger"' },
            { bad: '"It just didn\'t work"', good: '"Scenario D: good CTR, no purchase — LP needs investigation, not the creative"' },
            { bad: '"The angle was wrong"', good: '"CPM was $28 and frequency hit 2.5 in 2 days — angle-audience mismatch, try different persona"' },
          ].map((g, i) => (
            <div key={i} className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl px-3 py-2.5" style={{ background: 'rgba(208,74,59,0.08)', color: '#962C18', border: '1px solid rgba(208,74,59,0.15)' }}>{g.bad}</div>
              <div className="rounded-xl px-3 py-2.5" style={{ background: 'rgba(43,165,111,0.08)', color: '#1B6B3A', border: '1px solid rgba(43,165,111,0.15)' }}>{g.good}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
