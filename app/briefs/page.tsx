'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { briefStore, teamStore } from '@/lib/db'
import { CreativeBrief, BriefStatus, CreativeFormat, PRODUCTS } from '@/lib/types'
import { useAuth } from '@/lib/auth-context'
import { Plus, Pencil, Trash2, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { StatusPill, FilterTab, TH, PageHeader } from '@/components/StatusPill'

const STATUSES: BriefStatus[] = ['Draft', 'In Production', 'Under Review', 'Approved', 'Rework']
const FORMATS: CreativeFormat[] = ['Video 15s', 'Video 30s', 'Static Image', 'Carousel']

const empty = (members: string[], buyers: string[]): Omit<CreativeBrief, 'id' | 'createdAt'> => ({
  product: PRODUCTS[0].name,
  marketingAngle: '',
  buyerPersona: '',
  format: 'Video 30s',
  hook: '',
  cta: '',
  landingPageUrl: '',
  assignedTo: members[0] ?? '',
  dueDate: '',
  mediaBuyerOwner: buyers[0] ?? '',
  status: 'Draft',
})

export default function BriefsPage() {
  const { can } = useAuth()
  const [briefs, setBriefs] = useState<CreativeBrief[]>([])
  const [teamNames, setTeamNames] = useState<string[]>([])
  const [buyerNames, setBuyerNames] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<CreativeBrief | null>(null)
  const [form, setForm] = useState(empty([], []))
  const [filter, setFilter] = useState<string>('All')

  const reload = async () => {
    const [all, team] = await Promise.all([briefStore.getAll(), teamStore.getAll()])
    setBriefs(all)
    setTeamNames(team.map(m => m.name))
    setBuyerNames(team.filter(m => m.jobTitle.toLowerCase().includes('media buyer') || m.role === 'Admin' || m.role === 'Chief').map(m => m.name))
  }
  useEffect(() => { reload() }, [])

  const openNew = () => { setEditing(null); setForm(empty(teamNames, buyerNames)); setOpen(true) }
  const openEdit = (b: CreativeBrief) => { setEditing(b); setForm({ ...b }); setOpen(true) }

  const handleSave = async () => {
    if (!form.marketingAngle || !form.dueDate) { toast.error('Marketing Angle and Due Date are required.'); return }
    if (editing) { await briefStore.update(editing.id, form); toast.success('Brief updated.') }
    else { await briefStore.add(form); toast.success('Brief created.') }
    setOpen(false); reload()
  }

  const handleDelete = async (id: string) => { await briefStore.delete(id); toast.success('Brief deleted.'); reload() }
  const filtered = filter === 'All' ? briefs : briefs.filter(b => b.status === filter)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <PageHeader eyebrow="Module 01" title="Creative Briefs" subtitle="Structured records — angle, persona, format, hook, CTA" />
        {can('briefs', 'create') && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNew} style={{ background: '#5B3FF9', color: '#fff' }}>
                <Plus size={15} className="mr-2" /> New Brief
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{editing ? 'Edit Brief' : 'New Creative Brief'}</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="space-y-1.5">
                  <Label>Product</Label>
                  <Select value={form.product} onValueChange={v => setForm(f => ({ ...f, product: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{PRODUCTS.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as BriefStatus }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Marketing Angle *</Label>
                  <Input placeholder='e.g. "Sleep without the next-day fog"' value={form.marketingAngle} onChange={e => setForm(f => ({ ...f, marketingAngle: e.target.value }))} />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Buyer Persona</Label>
                  <Input placeholder="e.g. 35–54, light sleepers" value={form.buyerPersona} onChange={e => setForm(f => ({ ...f, buyerPersona: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Creative Format</Label>
                  <Select value={form.format} onValueChange={v => setForm(f => ({ ...f, format: v as CreativeFormat }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{FORMATS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Assigned To</Label>
                  <Select value={form.assignedTo} onValueChange={v => setForm(f => ({ ...f, assignedTo: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{teamNames.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Hook (Opening 3-second concept)</Label>
                  <Input placeholder="e.g. Three nights in, my sleep tracker noticed before I did." value={form.hook} onChange={e => setForm(f => ({ ...f, hook: e.target.value }))} />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>CTA</Label>
                  <Input placeholder="e.g. Shop tonight · Free returns 60 days" value={form.cta} onChange={e => setForm(f => ({ ...f, cta: e.target.value }))} />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Landing Page URL</Label>
                  <Input placeholder="https://example.com/lp-v3" value={form.landingPageUrl} onChange={e => setForm(f => ({ ...f, landingPageUrl: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Media Buyer Owner</Label>
                  <Select value={form.mediaBuyerOwner} onValueChange={v => setForm(f => ({ ...f, mediaBuyerOwner: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{buyerNames.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Due Date *</Label>
                  <Input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} style={{ background: '#5B3FF9', color: '#fff' }}>Save Brief</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {['All', ...STATUSES].map(s => (
          <FilterTab key={s} label={s} active={filter === s} onClick={() => setFilter(s)} />
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#FBFAF6', border: '1px solid #DEDAD0' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #DEDAD0', background: '#F4F1EA' }}>
              <TH>Angle / Product</TH>
              <TH>Persona</TH>
              <TH>Format</TH>
              <TH>Assigned To</TH>
              <TH>MB Owner</TH>
              <TH>Due</TH>
              <TH>Status</TH>
              <th className="py-3 px-4" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-14" style={{ color: '#9A9AA1' }}>
                  <FileText size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No briefs found. Create your first brief.</p>
                </td>
              </tr>
            )}
            {filtered.map(b => (
              <tr
                key={b.id}
                className="transition-colors"
                style={{ borderBottom: '1px solid #DEDAD0' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F4F1EA'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                <td className="px-4 py-4">
                  <p className="font-medium text-sm" style={{ color: '#15151B' }}>{b.marketingAngle}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#9A9AA1' }}>{b.product}</p>
                </td>
                <td className="px-4 py-4 max-w-[160px]">
                  <p className="text-xs truncate" style={{ color: '#6B6B74' }}>{b.buyerPersona}</p>
                </td>
                <td className="px-4 py-4 text-xs" style={{ color: '#6B6B74', fontFamily: 'var(--font-geist-mono)' }}>{b.format}</td>
                <td className="px-4 py-4 text-xs" style={{ color: '#6B6B74' }}>{b.assignedTo}</td>
                <td className="px-4 py-4 text-xs" style={{ color: '#6B6B74' }}>{b.mediaBuyerOwner}</td>
                <td className="px-4 py-4 text-xs" style={{ color: '#6B6B74', fontFamily: 'var(--font-geist-mono)' }}>{b.dueDate}</td>
                <td className="px-4 py-4"><StatusPill status={b.status} /></td>
                <td className="px-4 py-4">
                  <div className="flex gap-1">
                    {can('briefs', 'edit') && (
                      <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg transition-colors" style={{ color: '#9A9AA1' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#5B3FF9'; (e.currentTarget as HTMLElement).style.background = 'rgba(91,63,249,0.08)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#9A9AA1'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                        <Pencil size={13} />
                      </button>
                    )}
                    {can('briefs', 'delete') && (
                      <button onClick={() => handleDelete(b.id)} className="p-1.5 rounded-lg transition-colors" style={{ color: '#9A9AA1' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#D04A3B'; (e.currentTarget as HTMLElement).style.background = 'rgba(208,74,59,0.08)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#9A9AA1'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Review Checklist */}
      <div className="rounded-2xl mt-6 overflow-hidden" style={{ background: '#FBFAF6', border: '1px solid #DEDAD0' }}>
        <div className="px-6 py-4" style={{ borderBottom: '1px solid #DEDAD0' }}>
          <p className="text-sm font-semibold" style={{ color: '#15151B' }}>Media Buyer Review Checklist</p>
        </div>
        <div className="p-5 grid grid-cols-2 gap-2">
          {[
            'Angle matches the brief',
            'Persona is correctly targeted',
            'Hook lands in first 3 seconds',
            'CTA is present and clear',
            'Landing page matches creative promise',
            'No missing brainstorming element',
            'File name follows convention',
            'Technical quality (no blurry frames, audio issues)',
          ].map(item => (
            <div key={item} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs" style={{ border: '1px solid #DEDAD0', color: '#6B6B74' }}>
              <div className="w-4 h-4 rounded-md shrink-0" style={{ border: '2px solid #DEDAD0' }} />
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
