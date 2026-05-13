'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { kpiStore, teamStore } from '@/lib/db'
import { KPIReport, KPI_BENCHMARKS, DIAGNOSTIC_SCENARIOS, PRODUCTS, DiagnosticScenario } from '@/lib/types'
import { useAuth } from '@/lib/auth-context'
import { Plus, Trash2, TrendingUp, Trophy } from 'lucide-react'
import { toast } from 'sonner'
import { FilterTab, TH, PageHeader } from '@/components/StatusPill'

function kpiStatus(key: keyof typeof KPI_BENCHMARKS, value: number): 'good' | 'poor' | 'neutral' {
  const b = KPI_BENCHMARKS[key]
  if (b.lowerIsBetter) {
    if (value <= b.good) return 'good'
    if (value >= b.poor) return 'poor'
    return 'neutral'
  } else {
    if (value >= b.good) return 'good'
    if (value <= b.poor) return 'poor'
    return 'neutral'
  }
}

const KPI_COLORS = {
  good:    { color: '#2BA56F', bg: 'rgba(43,165,111,0.1)',  border: 'rgba(43,165,111,0.25)', dot: '#2BA56F' },
  poor:    { color: '#D04A3B', bg: 'rgba(208,74,59,0.1)',   border: 'rgba(208,74,59,0.25)',  dot: '#D04A3B' },
  neutral: { color: '#B88A18', bg: 'rgba(224,168,46,0.1)',  border: 'rgba(224,168,46,0.25)', dot: '#E0A82E' },
}

function KPIBadge({ status }: { status: 'good' | 'poor' | 'neutral' }) {
  const t = KPI_COLORS[status]
  const label = status === 'good' ? 'Good' : status === 'poor' ? 'Poor' : 'Fair'
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ fontFamily: 'var(--font-geist-mono)', background: t.bg, border: `1px solid ${t.border}`, color: t.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: t.dot }} />
      {label}
    </span>
  )
}

function KPICell({ value, bKey, unit }: { value: number; bKey: keyof typeof KPI_BENCHMARKS; unit: string }) {
  const status = kpiStatus(bKey, value)
  return <span style={{ color: KPI_COLORS[status].color, fontFamily: 'var(--font-geist-mono)', fontWeight: 500 }}>{value}{unit}</span>
}

function diagnoseBenchmarks(kpi: Omit<KPIReport, 'id' | 'reportedAt' | 'scenario'>): DiagnosticScenario {
  const goodCPM = kpi.cpm <= 15
  const goodHook = kpi.hookRate >= 30
  const goodCTR = kpi.outboundCtr >= 1.5
  const goodROAS = kpi.roas > 1
  if (goodROAS) return 'G'
  if (!goodCPM) return 'A'
  if (!goodHook) return 'B'
  if (!goodCTR) return 'C'
  if (goodCTR && kpi.addToCartRate >= 8 && !goodROAS) return 'E'
  if (goodCTR && !goodROAS) return 'D'
  return 'F'
}

const emptyKPI = (): Omit<KPIReport, 'id' | 'reportedAt' | 'scenario'> => ({
  launchCardId: '', creativeFile: '', product: PRODUCTS[0].name, mediaBuyer: '', angle: '',
  spend: 0, impressions: 0, cpm: 0, hookRate: 0, outboundCtr: 0, lpCtr: 0, addToCartRate: 0, roas: 0, frequency: 0,
})

export default function KPIPage() {
  const { can } = useAuth()
  const [kpis, setKpis] = useState<KPIReport[]>([])
  const [buyers, setBuyers] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyKPI())
  const [filter, setFilter] = useState('All')

  const reload = async () => {
    const [all, team] = await Promise.all([kpiStore.getAll(), teamStore.getAll()])
    setKpis(all)
    setBuyers(team.filter(m => m.jobTitle.toLowerCase().includes('media buyer') || m.role === 'Admin' || m.role === 'Chief').map(m => m.name))
  }
  useEffect(() => { reload() }, [])

  const handleSave = async () => {
    if (!form.creativeFile) { toast.error('Creative File is required.'); return }
    const scenario = diagnoseBenchmarks(form)
    await kpiStore.add({ ...form, scenario })
    toast.success(`Saved. Diagnosis: Scenario ${scenario} — ${DIAGNOSTIC_SCENARIOS[scenario].label}`)
    setOpen(false); setForm(emptyKPI()); reload()
  }
  const handleDelete = async (id: string) => { await kpiStore.delete(id); toast.success('Report deleted.'); reload() }

  const filtered = filter === 'All' ? kpis : kpis.filter(k => k.mediaBuyer === filter)
  const winners = kpis.filter(k => k.scenario === 'G')
  const n = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [key]: Number(e.target.value) }))
  const s = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [key]: e.target.value }))

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <PageHeader eyebrow="Module 03" title="KPI Diagnostics" subtitle="Auto-scored against six benchmarks, mapped to one of seven scenarios." />
        {can('kpi', 'create') && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button style={{ background: '#5B3FF9', color: '#fff' }}><Plus size={15} className="mr-2" /> Log KPI Report</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Log KPI Report</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="col-span-2 space-y-1.5">
                  <Label>Creative File *</Label>
                  <Input placeholder="PA · Sleep-Fog · v3 · Wide" value={form.creativeFile} onChange={s('creativeFile')} />
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
                  <Input placeholder="Sleep-Fog specificity angle" value={form.angle} onChange={s('angle')} />
                </div>
                <div className="space-y-1.5"><Label>Spend ($)</Label><Input type="number" step="0.01" value={form.spend} onChange={n('spend')} /></div>
                <div className="space-y-1.5"><Label>Impressions</Label><Input type="number" value={form.impressions} onChange={n('impressions')} /></div>
                <div className="space-y-1.5"><Label>CPM ($) — target &lt;$15</Label><Input type="number" step="0.01" value={form.cpm} onChange={n('cpm')} /></div>
                <div className="space-y-1.5"><Label>Hook Rate (%) — target &gt;30%</Label><Input type="number" step="0.1" value={form.hookRate} onChange={n('hookRate')} /></div>
                <div className="space-y-1.5"><Label>Outbound CTR (%) — target &gt;1.5%</Label><Input type="number" step="0.01" value={form.outboundCtr} onChange={n('outboundCtr')} /></div>
                <div className="space-y-1.5"><Label>LP Click-through (%) — target &gt;60%</Label><Input type="number" step="0.1" value={form.lpCtr} onChange={n('lpCtr')} /></div>
                <div className="space-y-1.5"><Label>Add to Cart Rate (%) — target &gt;8%</Label><Input type="number" step="0.1" value={form.addToCartRate} onChange={n('addToCartRate')} /></div>
                <div className="space-y-1.5"><Label>ROAS — &gt;1 = profitable</Label><Input type="number" step="0.01" value={form.roas} onChange={n('roas')} /></div>
                <div className="space-y-1.5"><Label>Frequency — target &lt;2.0</Label><Input type="number" step="0.01" value={form.frequency} onChange={n('frequency')} /></div>
              </div>
              <div className="rounded-xl p-3 mt-2" style={{ background: 'rgba(91,63,249,0.08)', border: '1px solid rgba(91,63,249,0.2)' }}>
                <p className="text-xs font-medium" style={{ color: '#5B3FF9' }}>Diagnosis will be auto-calculated from your KPI values when you save.</p>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} style={{ background: '#5B3FF9', color: '#fff' }}>Save & Diagnose</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* KPI Benchmark tiles */}
      <div className="grid grid-cols-6 gap-3 mb-6">
        {Object.entries(KPI_BENCHMARKS).map(([key, b]) => (
          <div key={key} className="rounded-2xl p-3 text-center" style={{ background: '#FBFAF6', border: '1px solid #DEDAD0' }}>
            <p className="text-xs mb-1" style={{ fontFamily: 'var(--font-geist-mono)', color: '#9A9AA1' }}>{b.label}</p>
            <p className="text-lg font-bold" style={{ color: '#15151B', fontFamily: 'var(--font-geist-mono)' }}>{b.lowerIsBetter ? '<' : '>'}{b.good}{b.unit}</p>
            <p className="text-xs mt-0.5" style={{ color: '#2BA56F' }}>Target</p>
          </div>
        ))}
      </div>

      {/* Diagnostic Scenarios — matches deck slide 08 */}
      <div className="rounded-2xl mb-6 overflow-hidden" style={{ background: '#FBFAF6', border: '1px solid #DEDAD0' }}>
        <div className="px-6 py-4" style={{ borderBottom: '1px solid #DEDAD0' }}>
          <p className="text-sm font-semibold" style={{ color: '#15151B' }}>The Diagnostic Playbook — Seven Scenarios</p>
          <p className="text-xs mt-0.5" style={{ color: '#6B6B74' }}>One owner each. No more "whose fault is the ad?"</p>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid #DEDAD0', background: '#F4F1EA' }}>
              <TH>ID</TH>
              <TH>Scenario</TH>
              <TH>Symptoms</TH>
              <TH>Action</TH>
              <TH>Owner</TH>
            </tr>
          </thead>
          <tbody>
            {Object.entries(DIAGNOSTIC_SCENARIOS).map(([key, sc]) => (
              <tr
                key={key}
                style={{
                  borderBottom: '1px solid #DEDAD0',
                  background: key === 'G' ? 'linear-gradient(90deg, rgba(91,63,249,0.04), transparent)' : 'transparent',
                }}
              >
                <td className="px-4 py-3 font-bold" style={{ fontFamily: 'var(--font-geist-mono)', color: '#5B3FF9' }}>{key}</td>
                <td className="px-4 py-3 font-semibold text-sm" style={{ color: key === 'G' ? '#5B3FF9' : '#15151B' }}>
                  {sc.label}{key === 'G' && <Trophy size={12} className="inline ml-1 mb-0.5" style={{ color: '#2BA56F' }} />}
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: '#6B6B74' }}>{sc.symptoms}</td>
                <td className="px-4 py-3 text-xs" style={{ color: '#6B6B74' }}>{sc.action}</td>
                <td className="px-4 py-3 text-xs" style={{ fontFamily: 'var(--font-geist-mono)', color: '#2A2A33' }}>{sc.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Winners banner */}
      {winners.length > 0 && (
        <div className="flex items-center gap-3 rounded-xl px-4 py-3 mb-5" style={{ background: 'rgba(43,165,111,0.1)', border: '1px solid rgba(43,165,111,0.25)' }}>
          <Trophy size={15} style={{ color: '#2BA56F' }} className="shrink-0" />
          <p className="text-sm font-medium" style={{ color: '#1B6B3A' }}>{winners.length} winner{winners.length > 1 ? 's' : ''} found — ready to scale!</p>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {['All', ...buyers].map(b => (
          <FilterTab key={b} label={b} active={filter === b} onClick={() => setFilter(b)} />
        ))}
      </div>

      {/* KPI results table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#FBFAF6', border: '1px solid #DEDAD0' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #DEDAD0', background: '#F4F1EA' }}>
              <TH>Creative</TH>
              <TH>MB</TH>
              <TH right>CPM</TH>
              <TH right>Hook</TH>
              <TH right>CTR</TH>
              <TH right>LP CTR</TH>
              <TH right>ATC</TH>
              <TH right>ROAS</TH>
              <TH right>Freq</TH>
              <TH>Diagnosis</TH>
              <th className="py-3 px-4" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={11} className="text-center py-14" style={{ color: '#9A9AA1' }}>
                  <TrendingUp size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No KPI reports yet. Log your first result.</p>
                </td>
              </tr>
            )}
            {filtered.map(k => {
              const sc = k.scenario ? DIAGNOSTIC_SCENARIOS[k.scenario] : null
              const isWinner = k.scenario === 'G'
              return (
                <tr
                  key={k.id}
                  className="transition-colors"
                  style={{
                    borderBottom: '1px solid #DEDAD0',
                    background: isWinner ? 'rgba(43,165,111,0.04)' : 'transparent',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F4F1EA'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = isWinner ? 'rgba(43,165,111,0.04)' : 'transparent'}
                >
                  <td className="px-4 py-3">
                    <p className="text-xs font-medium truncate max-w-[140px]" style={{ color: '#15151B' }}>{k.creativeFile}</p>
                    <p className="text-xs" style={{ color: '#9A9AA1' }}>{k.product}</p>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#6B6B74' }}>{k.mediaBuyer}</td>
                  <td className="px-4 py-3 text-right text-xs"><KPICell value={k.cpm} bKey="cpm" unit="$" /></td>
                  <td className="px-4 py-3 text-right text-xs"><KPICell value={k.hookRate} bKey="hookRate" unit="%" /></td>
                  <td className="px-4 py-3 text-right text-xs"><KPICell value={k.outboundCtr} bKey="outboundCtr" unit="%" /></td>
                  <td className="px-4 py-3 text-right text-xs"><KPICell value={k.lpCtr} bKey="lpCtr" unit="%" /></td>
                  <td className="px-4 py-3 text-right text-xs"><KPICell value={k.addToCartRate} bKey="addToCartRate" unit="%" /></td>
                  <td className="px-4 py-3 text-right text-xs font-medium" style={{ fontFamily: 'var(--font-geist-mono)', color: '#15151B' }}>{k.roas}x</td>
                  <td className="px-4 py-3 text-right text-xs"><KPICell value={k.frequency} bKey="frequency" unit="x" /></td>
                  <td className="px-4 py-3">
                    {sc && (
                      <span
                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          fontFamily: 'var(--font-geist-mono)',
                          background: isWinner ? 'rgba(43,165,111,0.12)' : 'rgba(255,106,61,0.1)',
                          color: isWinner ? '#1B6B3A' : '#C04020',
                          border: `1px solid ${isWinner ? 'rgba(43,165,111,0.25)' : 'rgba(255,106,61,0.2)'}`,
                        }}
                      >
                        {isWinner ? <Trophy size={10} /> : <TrendingUp size={10} />}
                        {k.scenario}: {sc.label}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {can('kpi', 'delete') && (
                      <button onClick={() => handleDelete(k.id)} className="p-1.5 rounded-lg transition-colors" style={{ color: '#9A9AA1' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#D04A3B'; (e.currentTarget as HTMLElement).style.background = 'rgba(208,74,59,0.08)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#9A9AA1'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                        <Trash2 size={13} />
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
