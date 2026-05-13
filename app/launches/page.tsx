'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { launchStore, teamStore } from '@/lib/store'
import { LaunchCard, PRODUCTS } from '@/lib/types'
import { useAuth } from '@/lib/auth-context'
import { Plus, Pencil, Trash2, Rocket, DollarSign, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { StatusPill, FilterTab, TH, PageHeader } from '@/components/StatusPill'

const STATUSES = ['Pending', 'Live', 'Ended', 'Killed'] as const
const PLACEMENTS = ['Feed + Reels only', 'Feed only', 'Reels only', 'Stories only', 'All Placements']

const emptyLaunch = (firstBuyer = ''): Omit<LaunchCard, 'id'> => ({
  creativeFiles: '',
  product: PRODUCTS[0].name,
  marketingAngle: '',
  mediaBuyer: firstBuyer,
  adAccount: '',
  campaignName: '',
  adSetName: '',
  facebookPage: '',
  adCopyVersion: '',
  landingPageUrl: '',
  dailyBudget: 20,
  testDuration: 3,
  launchDate: '',
  killDate: '',
  audienceTargeting: 'Broad, US',
  placement: 'Feed + Reels only',
  status: 'Pending',
})

export default function LaunchesPage() {
  const { can } = useAuth()
  const [launches, setLaunches] = useState<LaunchCard[]>([])
  const [buyers, setBuyers] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<LaunchCard | null>(null)
  const [form, setForm] = useState(emptyLaunch())
  const [filter, setFilter] = useState('All')

  const reload = () => {
    setLaunches(launchStore.getAll())
    const all = teamStore.getAll()
    setBuyers(all.filter(m => m.jobTitle.toLowerCase().includes('media buyer') || m.role === 'Admin' || m.role === 'Chief').map(m => m.name))
  }
  useEffect(() => { reload() }, [])

  const openNew = () => { setEditing(null); setForm(emptyLaunch(buyers[0] ?? '')); setOpen(true) }
  const openEdit = (l: LaunchCard) => { setEditing(l); setForm({ ...l }); setOpen(true) }

  const handleSave = () => {
    if (!form.creativeFiles || !form.launchDate) { toast.error('Creative Files and Launch Date are required.'); return }
    if (editing) { launchStore.update(editing.id, form); toast.success('Launch Card updated.') }
    else { launchStore.add(form); toast.success('Launch Card created.') }
    setOpen(false); reload()
  }

  const handleDelete = (id: string) => { launchStore.delete(id); toast.success('Launch Card deleted.'); reload() }

  const filtered = filter === 'All' ? launches : launches.filter(l => l.status === filter)
  const totalBudget = launches.filter(l => l.status === 'Live').reduce((s, l) => s + l.dailyBudget, 0)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <PageHeader eyebrow="Module 02" title="Test Launch Cards" subtitle="Every test on the record — before the money goes out." />
        {can('launches', 'create') && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNew} style={{ background: '#5B3FF9', color: '#fff' }}>
                <Plus size={15} className="mr-2" /> New Launch Card
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{editing ? 'Edit Launch Card' : 'New Test Launch Card'}</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="col-span-2 space-y-1.5">
                  <Label>Creative File(s) *</Label>
                  <Input placeholder="e.g. PA · Sleep-Fog · v3 · Wide" value={form.creativeFiles} onChange={e => setForm(f => ({ ...f, creativeFiles: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Product</Label>
                  <Select value={form.product} onValueChange={v => setForm(f => ({ ...f, product: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{PRODUCTS.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Media Buyer</Label>
                  <Select value={form.mediaBuyer} onValueChange={v => setForm(f => ({ ...f, mediaBuyer: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{buyers.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Marketing Angle</Label>
                  <Input placeholder="e.g. PA · Sleep-Fog — hook rework angle" value={form.marketingAngle} onChange={e => setForm(f => ({ ...f, marketingAngle: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Ad Account ID</Label>
                  <Input placeholder="act_123456789" value={form.adAccount} onChange={e => setForm(f => ({ ...f, adAccount: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Facebook Page</Label>
                  <Input placeholder="Product A Official" value={form.facebookPage} onChange={e => setForm(f => ({ ...f, facebookPage: e.target.value }))} />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Campaign Name</Label>
                  <Input placeholder="MB1_ProductA_Testing_May2026" value={form.campaignName} onChange={e => setForm(f => ({ ...f, campaignName: e.target.value }))} />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Ad Set Name</Label>
                  <Input placeholder="ANGLE_SleepFog_35-54_TEST" value={form.adSetName} onChange={e => setForm(f => ({ ...f, adSetName: e.target.value }))} />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Ad Copy Version</Label>
                  <Input placeholder="Copy v3 — specificity angle" value={form.adCopyVersion} onChange={e => setForm(f => ({ ...f, adCopyVersion: e.target.value }))} />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Landing Page URL</Label>
                  <Input placeholder="https://example.com/lp-v1" value={form.landingPageUrl} onChange={e => setForm(f => ({ ...f, landingPageUrl: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Daily Budget ($)</Label>
                  <Input type="number" min={0} value={form.dailyBudget} onChange={e => setForm(f => ({ ...f, dailyBudget: Number(e.target.value) }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Test Duration (days)</Label>
                  <Input type="number" min={1} value={form.testDuration} onChange={e => setForm(f => ({ ...f, testDuration: Number(e.target.value) }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Launch Date *</Label>
                  <Input type="date" value={form.launchDate} onChange={e => setForm(f => ({ ...f, launchDate: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Kill Date</Label>
                  <Input type="date" value={form.killDate} onChange={e => setForm(f => ({ ...f, killDate: e.target.value }))} />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Audience Targeting</Label>
                  <Input placeholder="Broad, US · 35–54" value={form.audienceTargeting} onChange={e => setForm(f => ({ ...f, audienceTargeting: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Placement</Label>
                  <Select value={form.placement} onValueChange={v => setForm(f => ({ ...f, placement: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{PLACEMENTS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as LaunchCard['status'] }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} style={{ background: '#5B3FF9', color: '#fff' }}>Save Launch Card</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Live Now', value: `${launches.filter(l => l.status === 'Live').length}`, icon: Rocket, color: '#2BA56F' },
          { label: 'Active Daily Budget', value: `$${totalBudget}/day`, icon: DollarSign, color: '#5B3FF9' },
          { label: 'Total Launches', value: `${launches.length}`, icon: Calendar, color: '#6B6B74' },
        ].map(card => (
          <div key={card.label} className="rounded-2xl p-4 flex items-center gap-3" style={{ background: '#FBFAF6', border: '1px solid #DEDAD0' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${card.color}18` }}>
              <card.icon size={16} style={{ color: card.color }} />
            </div>
            <div>
              <p className="text-xl font-bold" style={{ color: '#15151B', fontFamily: 'var(--font-geist-mono)' }}>{card.value}</p>
              <p className="text-xs mt-0.5" style={{ color: '#6B6B74' }}>{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {['All', ...STATUSES].map(s => (
          <FilterTab key={s} label={s} active={filter === s} onClick={() => setFilter(s)} />
        ))}
      </div>

      {/* Launch table — matches deck slide 06 */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#FBFAF6', border: '1px solid #DEDAD0' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #DEDAD0', background: '#F4F1EA' }}>
              <TH>Status</TH>
              <TH>Campaign / Angle</TH>
              <TH>Buyer</TH>
              <TH right>Daily $</TH>
              <TH right>Duration</TH>
              <TH right>Kill Date</TH>
              <th className="py-3 px-4" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-14" style={{ color: '#9A9AA1' }}>
                  <Rocket size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No launch cards found. Document your first launch.</p>
                </td>
              </tr>
            )}
            {filtered.map(l => (
              <tr
                key={l.id}
                className="transition-colors"
                style={{ borderBottom: '1px solid #DEDAD0' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F4F1EA'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                <td className="px-4 py-4"><StatusPill status={l.status} /></td>
                <td className="px-4 py-4">
                  <p className="text-sm font-medium" style={{ color: '#15151B' }}>{l.creativeFiles}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#9A9AA1' }}>{l.marketingAngle}</p>
                </td>
                <td className="px-4 py-4 text-xs" style={{ color: '#6B6B74' }}>{l.mediaBuyer}</td>
                <td className="px-4 py-4 text-xs text-right font-medium" style={{ color: '#15151B', fontFamily: 'var(--font-geist-mono)' }}>${l.dailyBudget}</td>
                <td className="px-4 py-4 text-xs text-right" style={{ color: '#6B6B74', fontFamily: 'var(--font-geist-mono)' }}>{l.testDuration}d</td>
                <td className="px-4 py-4 text-xs text-right" style={{ color: '#6B6B74', fontFamily: 'var(--font-geist-mono)' }}>{l.killDate || '—'}</td>
                <td className="px-4 py-4">
                  <div className="flex gap-1 justify-end">
                    {can('launches', 'edit') && (
                      <button onClick={() => openEdit(l)} className="p-1.5 rounded-lg transition-colors" style={{ color: '#9A9AA1' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#5B3FF9'; (e.currentTarget as HTMLElement).style.background = 'rgba(91,63,249,0.08)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#9A9AA1'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                        <Pencil size={13} />
                      </button>
                    )}
                    {can('launches', 'delete') && (
                      <button onClick={() => handleDelete(l.id)} className="p-1.5 rounded-lg transition-colors" style={{ color: '#9A9AA1' }}
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

      {/* Budget guidelines */}
      <div className="rounded-2xl mt-6 overflow-hidden" style={{ background: '#FBFAF6', border: '1px solid #DEDAD0' }}>
        <div className="px-6 py-4" style={{ borderBottom: '1px solid #DEDAD0' }}>
          <p className="text-sm font-semibold" style={{ color: '#15151B' }}>Budget Guidelines</p>
        </div>
        <div className="p-5 grid grid-cols-4 gap-3">
          {[
            { stage: 'New product', budget: '$15–$20/day' },
            { stage: 'Established product, new angle', budget: '$20–$30/day' },
            { stage: 'Scaled product (winner found)', budget: '$30–$50/day' },
            { stage: 'Rework test (v1 vs v2)', budget: 'Match original' },
          ].map(g => (
            <div key={g.stage} className="rounded-xl p-3" style={{ background: '#F4F1EA', border: '1px solid #DEDAD0' }}>
              <p className="text-sm font-bold" style={{ color: '#15151B', fontFamily: 'var(--font-geist-mono)' }}>{g.budget}</p>
              <p className="text-xs mt-1" style={{ color: '#6B6B74' }}>{g.stage}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
