'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { reportStore, teamStore } from '@/lib/store'
import { WeeklyReport, PRODUCTS } from '@/lib/types'
import { useAuth } from '@/lib/auth-context'
import { Plus, Trash2, ClipboardList, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/StatusPill'

const emptyReport = (firstBuyer = ''): Omit<WeeklyReport, 'id' | 'createdAt'> => ({
  mediaBuyer: firstBuyer,
  product: PRODUCTS[0].name,
  weekEnding: '',
  totalCreativesTested: 0,
  totalSpend: 0,
  angleSummary: '',
  winners: '',
  underperformers: '',
  reworkRequests: '',
  newAngleRecommendations: '',
})

export default function ReportsPage() {
  const { can } = useAuth()
  const [reports, setReports] = useState<WeeklyReport[]>([])
  const [buyers, setBuyers] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyReport())
  const [expanded, setExpanded] = useState<string | null>(null)

  const reload = () => {
    setReports(reportStore.getAll())
    setBuyers(teamStore.getAll().filter(m => m.jobTitle.toLowerCase().includes('media buyer') || m.role === 'Admin' || m.role === 'Chief').map(m => m.name))
  }
  useEffect(() => { reload() }, [])

  const handleSave = () => {
    if (!form.weekEnding || !form.mediaBuyer) { toast.error('Week Ending and Media Buyer are required.'); return }
    reportStore.add(form)
    toast.success('Weekly report submitted.')
    setOpen(false); setForm(emptyReport()); reload()
  }

  const handleDelete = (id: string) => { reportStore.delete(id); toast.success('Report deleted.'); reload() }

  const s = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))
  const n = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [key]: Number(e.target.value) }))

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <PageHeader eyebrow="Module 05" title="Weekly Reports" subtitle="Weekly truth — submitted every Friday before the next brainstorm." />
        {can('reports', 'create') && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button style={{ background: '#5B3FF9', color: '#fff' }}><Plus size={15} className="mr-2" /> Submit Report</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Weekly Creative Performance Report</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="space-y-1.5">
                  <Label>Media Buyer</Label>
                  <Select value={form.mediaBuyer} onValueChange={v => setForm(f => ({ ...f, mediaBuyer: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{buyers.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Product</Label>
                  <Select value={form.product} onValueChange={v => setForm(f => ({ ...f, product: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{PRODUCTS.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Week Ending (Friday) *</Label>
                  <Input type="date" value={form.weekEnding} onChange={s('weekEnding')} />
                </div>
                <div className="space-y-1.5">
                  <Label>Total Creatives Tested</Label>
                  <Input type="number" min={0} value={form.totalCreativesTested} onChange={n('totalCreativesTested')} />
                </div>
                <div className="space-y-1.5">
                  <Label>Total Spend ($)</Label>
                  <Input type="number" step="0.01" min={0} value={form.totalSpend} onChange={n('totalSpend')} />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Angle Scoreboard</Label>
                  <Textarea placeholder="List each angle tested and rank by performance (ROAS or CTR funnel)" value={form.angleSummary} onChange={s('angleSummary')} className="resize-none h-20" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Winners</Label>
                  <Textarea placeholder="Angles with positive ROAS or strong CTR — what made them work?" value={form.winners} onChange={s('winners')} className="resize-none h-16" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Underperformers</Label>
                  <Textarea placeholder="Angles that failed — which Scenario (A–F) did they hit?" value={form.underperformers} onChange={s('underperformers')} className="resize-none h-16" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Rework Requests</Label>
                  <Textarea placeholder="Specific creatives needing changes with diagnosis attached" value={form.reworkRequests} onChange={s('reworkRequests')} className="resize-none h-16" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>New Angle Recommendations</Label>
                  <Textarea placeholder="Ideas triggered by the data for next brainstorming session" value={form.newAngleRecommendations} onChange={s('newAngleRecommendations')} className="resize-none h-16" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} style={{ background: '#5B3FF9', color: '#fff' }}>Submit Report</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Friday reminder */}
      <div className="flex items-center gap-3 rounded-xl px-4 py-3 mb-6" style={{ background: 'rgba(91,63,249,0.08)', border: '1px solid rgba(91,63,249,0.15)' }}>
        <ClipboardList size={15} style={{ color: '#5B3FF9' }} className="shrink-0" />
        <p className="text-sm" style={{ color: '#3F2DAD' }}>Every <strong>Friday</strong>, each media buyer must submit a weekly report before the next brainstorming session.</p>
      </div>

      {/* Empty state */}
      {reports.length === 0 && (
        <div className="text-center py-16" style={{ color: '#9A9AA1' }}>
          <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No reports submitted yet. Submit your first Friday report.</p>
        </div>
      )}

      {/* Reports — matches deck slide 10 weekly report layout */}
      <div className="space-y-4">
        {[...reports].sort((a, b) => b.weekEnding.localeCompare(a.weekEnding)).map(r => (
          <div key={r.id} className="rounded-2xl overflow-hidden" style={{ background: '#FBFAF6', border: '1px solid #DEDAD0' }}>
            {/* Header row */}
            <div
              className="flex items-center justify-between px-6 py-4 cursor-pointer transition-colors"
              style={{ borderBottom: expanded === r.id ? '1px solid #DEDAD0' : 'none' }}
              onClick={() => setExpanded(expanded === r.id ? null : r.id)}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F4F1EA'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(91,63,249,0.1)' }}>
                  <ClipboardList size={16} style={{ color: '#5B3FF9' }} />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: '#15151B' }}>{r.mediaBuyer} — {r.product}</p>
                  <p className="text-xs mt-0.5" style={{ fontFamily: 'var(--font-geist-mono)', color: '#9A9AA1' }}>
                    Week ending {r.weekEnding} · {r.totalCreativesTested} creatives · ${r.totalSpend} spend
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Stats summary */}
                <div className="flex gap-4 mr-2">
                  <span className="text-xs" style={{ color: '#6B6B74' }}>
                    <span className="font-bold" style={{ fontFamily: 'var(--font-geist-mono)', color: '#15151B' }}>{r.totalCreativesTested}</span> tested
                  </span>
                  <span className="text-xs" style={{ color: '#6B6B74' }}>
                    <span className="font-bold" style={{ fontFamily: 'var(--font-geist-mono)', color: '#15151B' }}>${r.totalSpend}</span> spend
                  </span>
                </div>
                {can('reports', 'delete') && (
                  <button onClick={e => { e.stopPropagation(); handleDelete(r.id) }} className="p-1.5 rounded-lg transition-colors" style={{ color: '#9A9AA1' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#D04A3B'; (e.currentTarget as HTMLElement).style.background = 'rgba(208,74,59,0.08)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#9A9AA1'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                    <Trash2 size={13} />
                  </button>
                )}
                {expanded === r.id
                  ? <ChevronUp size={15} style={{ color: '#9A9AA1' }} />
                  : <ChevronDown size={15} style={{ color: '#9A9AA1' }} />
                }
              </div>
            </div>

            {/* Expanded content */}
            {expanded === r.id && (
              <div className="px-6 pb-6 pt-4 grid grid-cols-2 gap-5">
                {[
                  { label: 'Angle Scoreboard', value: r.angleSummary, span: true },
                  { label: 'Winners', value: r.winners },
                  { label: 'Underperformers', value: r.underperformers },
                  { label: 'Rework Requests', value: r.reworkRequests },
                  { label: 'New Angle Recommendations', value: r.newAngleRecommendations, span: true },
                ].map(section => (
                  <div key={section.label} className={section.span ? 'col-span-2' : ''}>
                    <p className="text-xs font-medium uppercase tracking-wider mb-1.5" style={{ fontFamily: 'var(--font-geist-mono)', color: '#9A9AA1' }}>
                      {section.label}
                    </p>
                    <p className="text-sm whitespace-pre-line" style={{ color: '#2A2A33' }}>{section.value || '—'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Report structure guide */}
      <div className="rounded-2xl mt-8 overflow-hidden" style={{ background: '#FBFAF6', border: '1px solid #DEDAD0' }}>
        <div className="px-6 py-4" style={{ borderBottom: '1px solid #DEDAD0' }}>
          <p className="text-sm font-semibold" style={{ color: '#15151B' }}>Report Structure Guide</p>
        </div>
        <div className="p-5 grid grid-cols-3 gap-3">
          {[
            { section: 'Batch Summary', contents: 'How many creatives tested, total spend, test dates' },
            { section: 'Angle Scoreboard', contents: 'Each angle ranked by performance (ROAS or CTR funnel)' },
            { section: 'Winners', contents: 'Angles with positive ROAS or strong CTR — what made them work' },
            { section: 'Underperformers', contents: 'Angles that failed — which Scenario (A–F) they hit' },
            { section: 'Rework Requests', contents: 'Specific creatives needing changes with diagnosis attached' },
            { section: 'New Angle Recommendations', contents: 'Ideas triggered by the data for next brainstorming session' },
          ].map(s => (
            <div key={s.section} className="rounded-xl p-3" style={{ background: '#F4F1EA', border: '1px solid #DEDAD0' }}>
              <p className="text-xs font-semibold" style={{ color: '#15151B' }}>{s.section}</p>
              <p className="text-xs mt-1" style={{ color: '#6B6B74' }}>{s.contents}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
