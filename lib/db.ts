/**
 * Async data access layer backed by Supabase.
 * Replaces the synchronous localStorage store.
 * All functions return Promises and map snake_case DB columns → camelCase TS types.
 */

import { supabase } from './supabase'
import {
  CreativeBrief, LaunchCard, ReworkNotice, KPIReport,
  WeeklyReport, TeamMember, BriefStatus, CreativeFormat,
  MemberRole, ROLE_DEFAULTS, AVATAR_COLORS,
} from './types'

// ─── Row types (as returned by Supabase) ──────────────────────────────────────

interface BriefRow {
  id: string; product: string; marketing_angle: string; buyer_persona: string
  format: string; hook: string; cta: string; landing_page_url: string
  assigned_to: string; due_date: string; media_buyer_owner: string
  status: string; created_at: string
}
interface LaunchRow {
  id: string; brief_id?: string; creative_files: string; product: string
  marketing_angle: string; media_buyer: string; ad_account: string
  campaign_name: string; ad_set_name: string; facebook_page: string
  ad_copy_version: string; landing_page_url: string; daily_budget: number
  test_duration: number; launch_date: string; kill_date: string
  audience_targeting: string; placement: string; status: string
}
interface ReworkRow {
  id: string; brief_id: string; creative_file_name: string; rework_reason: string
  whats_missing: string; reference: string; priority: string
  new_version_due: string; media_buyer: string; status: string; created_at: string
}
interface KPIRow {
  id: string; launch_card_id: string; creative_file: string; product: string
  media_buyer: string; angle: string; spend: number; impressions: number
  cpm: number; hook_rate: number; outbound_ctr: number; lp_ctr: number
  add_to_cart_rate: number; roas: number; frequency: number
  scenario: string | null; reported_at: string
}
interface ReportRow {
  id: string; media_buyer: string; product: string; week_ending: string
  total_creatives_tested: number; total_spend: number; angle_summary: string
  winners: string; underperformers: string; rework_requests: string
  new_angle_recommendations: string; created_at: string
}
interface ProfileRow {
  id: string; name: string; email: string; role: string; job_title: string
  department: string; permissions: unknown; avatar_color: string; created_at: string
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

const fromBrief = (r: BriefRow): CreativeBrief => ({
  id: r.id, product: r.product, marketingAngle: r.marketing_angle,
  buyerPersona: r.buyer_persona, format: r.format as CreativeFormat,
  hook: r.hook, cta: r.cta, landingPageUrl: r.landing_page_url,
  assignedTo: r.assigned_to, dueDate: r.due_date,
  mediaBuyerOwner: r.media_buyer_owner, status: r.status as BriefStatus,
  createdAt: r.created_at,
})
const toBrief = (b: Omit<CreativeBrief, 'id' | 'createdAt'>) => ({
  product: b.product, marketing_angle: b.marketingAngle,
  buyer_persona: b.buyerPersona, format: b.format, hook: b.hook, cta: b.cta,
  landing_page_url: b.landingPageUrl, assigned_to: b.assignedTo,
  due_date: b.dueDate, media_buyer_owner: b.mediaBuyerOwner, status: b.status,
})

const fromLaunch = (r: LaunchRow): LaunchCard => ({
  id: r.id, briefId: r.brief_id, creativeFiles: r.creative_files,
  product: r.product, marketingAngle: r.marketing_angle, mediaBuyer: r.media_buyer,
  adAccount: r.ad_account, campaignName: r.campaign_name, adSetName: r.ad_set_name,
  facebookPage: r.facebook_page, adCopyVersion: r.ad_copy_version,
  landingPageUrl: r.landing_page_url, dailyBudget: r.daily_budget,
  testDuration: r.test_duration, launchDate: r.launch_date, killDate: r.kill_date,
  audienceTargeting: r.audience_targeting, placement: r.placement,
  status: r.status as LaunchCard['status'],
})
const toLaunch = (l: Omit<LaunchCard, 'id'>) => ({
  brief_id: l.briefId, creative_files: l.creativeFiles, product: l.product,
  marketing_angle: l.marketingAngle, media_buyer: l.mediaBuyer,
  ad_account: l.adAccount, campaign_name: l.campaignName, ad_set_name: l.adSetName,
  facebook_page: l.facebookPage, ad_copy_version: l.adCopyVersion,
  landing_page_url: l.landingPageUrl, daily_budget: l.dailyBudget,
  test_duration: l.testDuration, launch_date: l.launchDate, kill_date: l.killDate,
  audience_targeting: l.audienceTargeting, placement: l.placement, status: l.status,
})

const fromRework = (r: ReworkRow): ReworkNotice => ({
  id: r.id, briefId: r.brief_id, creativeFileName: r.creative_file_name,
  reworkReason: r.rework_reason, whatsMissing: r.whats_missing,
  reference: r.reference, priority: r.priority as ReworkNotice['priority'],
  newVersionDue: r.new_version_due, mediaBuyer: r.media_buyer,
  status: r.status as ReworkNotice['status'], createdAt: r.created_at,
})
const toRework = (r: Omit<ReworkNotice, 'id' | 'createdAt'>) => ({
  brief_id: r.briefId, creative_file_name: r.creativeFileName,
  rework_reason: r.reworkReason, whats_missing: r.whatsMissing,
  reference: r.reference, priority: r.priority, new_version_due: r.newVersionDue,
  media_buyer: r.mediaBuyer, status: r.status,
})

const fromKPI = (r: KPIRow): KPIReport => ({
  id: r.id, launchCardId: r.launch_card_id, creativeFile: r.creative_file,
  product: r.product, mediaBuyer: r.media_buyer, angle: r.angle,
  spend: r.spend, impressions: r.impressions, cpm: r.cpm,
  hookRate: r.hook_rate, outboundCtr: r.outbound_ctr, lpCtr: r.lp_ctr,
  addToCartRate: r.add_to_cart_rate, roas: r.roas, frequency: r.frequency,
  scenario: r.scenario as KPIReport['scenario'], reportedAt: r.reported_at,
})
const toKPI = (k: Omit<KPIReport, 'id' | 'reportedAt'>) => ({
  launch_card_id: k.launchCardId, creative_file: k.creativeFile,
  product: k.product, media_buyer: k.mediaBuyer, angle: k.angle,
  spend: k.spend, impressions: k.impressions, cpm: k.cpm,
  hook_rate: k.hookRate, outbound_ctr: k.outboundCtr, lp_ctr: k.lpCtr,
  add_to_cart_rate: k.addToCartRate, roas: k.roas, frequency: k.frequency,
  scenario: k.scenario,
})

const fromReport = (r: ReportRow): WeeklyReport => ({
  id: r.id, mediaBuyer: r.media_buyer, product: r.product,
  weekEnding: r.week_ending, totalCreativesTested: r.total_creatives_tested,
  totalSpend: r.total_spend, angleSummary: r.angle_summary,
  winners: r.winners, underperformers: r.underperformers,
  reworkRequests: r.rework_requests,
  newAngleRecommendations: r.new_angle_recommendations, createdAt: r.created_at,
})
const toReport = (r: Omit<WeeklyReport, 'id' | 'createdAt'>) => ({
  media_buyer: r.mediaBuyer, product: r.product, week_ending: r.weekEnding,
  total_creatives_tested: r.totalCreativesTested, total_spend: r.totalSpend,
  angle_summary: r.angleSummary, winners: r.winners,
  underperformers: r.underperformers, rework_requests: r.reworkRequests,
  new_angle_recommendations: r.newAngleRecommendations,
})

export const fromProfile = (r: ProfileRow): TeamMember => ({
  id: r.id, name: r.name, email: r.email, role: r.role as MemberRole,
  jobTitle: r.job_title, department: r.department,
  permissions: r.permissions as TeamMember['permissions'],
  avatarColor: r.avatar_color, createdAt: r.created_at,
})

// ─── Data stores ──────────────────────────────────────────────────────────────

export const briefStore = {
  getAll: async (): Promise<CreativeBrief[]> => {
    const { data } = await supabase.from('briefs').select('*').order('created_at', { ascending: false })
    return (data as BriefRow[] ?? []).map(fromBrief)
  },
  add: async (b: Omit<CreativeBrief, 'id' | 'createdAt'>): Promise<CreativeBrief> => {
    const { data } = await supabase.from('briefs').insert(toBrief(b)).select().single()
    return fromBrief(data as BriefRow)
  },
  update: async (id: string, patch: Partial<CreativeBrief>): Promise<void> => {
    const row: Record<string, unknown> = {}
    if (patch.product !== undefined)          row.product            = patch.product
    if (patch.marketingAngle !== undefined)   row.marketing_angle    = patch.marketingAngle
    if (patch.buyerPersona !== undefined)     row.buyer_persona      = patch.buyerPersona
    if (patch.format !== undefined)           row.format             = patch.format
    if (patch.hook !== undefined)             row.hook               = patch.hook
    if (patch.cta !== undefined)              row.cta                = patch.cta
    if (patch.landingPageUrl !== undefined)   row.landing_page_url   = patch.landingPageUrl
    if (patch.assignedTo !== undefined)       row.assigned_to        = patch.assignedTo
    if (patch.dueDate !== undefined)          row.due_date           = patch.dueDate
    if (patch.mediaBuyerOwner !== undefined)  row.media_buyer_owner  = patch.mediaBuyerOwner
    if (patch.status !== undefined)           row.status             = patch.status
    await supabase.from('briefs').update(row).eq('id', id)
  },
  delete: async (id: string): Promise<void> => {
    await supabase.from('briefs').delete().eq('id', id)
  },
}

export const launchStore = {
  getAll: async (): Promise<LaunchCard[]> => {
    const { data } = await supabase.from('launches').select('*').order('launch_date', { ascending: false })
    return (data as LaunchRow[] ?? []).map(fromLaunch)
  },
  add: async (l: Omit<LaunchCard, 'id'>): Promise<LaunchCard> => {
    const { data } = await supabase.from('launches').insert(toLaunch(l)).select().single()
    return fromLaunch(data as LaunchRow)
  },
  update: async (id: string, patch: Partial<LaunchCard>): Promise<void> => {
    const row: Record<string, unknown> = {}
    if (patch.status !== undefined)            row.status             = patch.status
    if (patch.dailyBudget !== undefined)       row.daily_budget       = patch.dailyBudget
    if (patch.killDate !== undefined)          row.kill_date          = patch.killDate
    if (patch.mediaBuyer !== undefined)        row.media_buyer        = patch.mediaBuyer
    if (patch.product !== undefined)           row.product            = patch.product
    if (patch.marketingAngle !== undefined)    row.marketing_angle    = patch.marketingAngle
    if (patch.adAccount !== undefined)         row.ad_account         = patch.adAccount
    if (patch.campaignName !== undefined)      row.campaign_name      = patch.campaignName
    if (patch.adSetName !== undefined)         row.ad_set_name        = patch.adSetName
    if (patch.facebookPage !== undefined)      row.facebook_page      = patch.facebookPage
    if (patch.adCopyVersion !== undefined)     row.ad_copy_version    = patch.adCopyVersion
    if (patch.landingPageUrl !== undefined)    row.landing_page_url   = patch.landingPageUrl
    if (patch.testDuration !== undefined)      row.test_duration      = patch.testDuration
    if (patch.launchDate !== undefined)        row.launch_date        = patch.launchDate
    if (patch.audienceTargeting !== undefined) row.audience_targeting = patch.audienceTargeting
    if (patch.placement !== undefined)         row.placement          = patch.placement
    if (patch.creativeFiles !== undefined)     row.creative_files     = patch.creativeFiles
    await supabase.from('launches').update(row).eq('id', id)
  },
  delete: async (id: string): Promise<void> => {
    await supabase.from('launches').delete().eq('id', id)
  },
}

export const reworkStore = {
  getAll: async (): Promise<ReworkNotice[]> => {
    const { data } = await supabase.from('reworks').select('*').order('created_at', { ascending: false })
    return (data as ReworkRow[] ?? []).map(fromRework)
  },
  add: async (r: Omit<ReworkNotice, 'id' | 'createdAt'>): Promise<ReworkNotice> => {
    const { data } = await supabase.from('reworks').insert(toRework(r)).select().single()
    return fromRework(data as ReworkRow)
  },
  update: async (id: string, patch: Partial<ReworkNotice>): Promise<void> => {
    const row: Record<string, unknown> = {}
    if (patch.status !== undefined)          row.status              = patch.status
    if (patch.priority !== undefined)        row.priority            = patch.priority
    if (patch.reworkReason !== undefined)    row.rework_reason       = patch.reworkReason
    if (patch.whatsMissing !== undefined)    row.whats_missing       = patch.whatsMissing
    if (patch.newVersionDue !== undefined)   row.new_version_due     = patch.newVersionDue
    if (patch.mediaBuyer !== undefined)      row.media_buyer         = patch.mediaBuyer
    if (patch.reference !== undefined)       row.reference           = patch.reference
    if (patch.creativeFileName !== undefined) row.creative_file_name = patch.creativeFileName
    await supabase.from('reworks').update(row).eq('id', id)
  },
  delete: async (id: string): Promise<void> => {
    await supabase.from('reworks').delete().eq('id', id)
  },
}

export const kpiStore = {
  getAll: async (): Promise<KPIReport[]> => {
    const { data } = await supabase.from('kpi_reports').select('*').order('reported_at', { ascending: false })
    return (data as KPIRow[] ?? []).map(fromKPI)
  },
  add: async (k: Omit<KPIReport, 'id' | 'reportedAt'>): Promise<KPIReport> => {
    const { data } = await supabase.from('kpi_reports').insert(toKPI(k)).select().single()
    return fromKPI(data as KPIRow)
  },
  update: async (id: string, patch: Partial<KPIReport>): Promise<void> => {
    const row: Record<string, unknown> = {}
    if (patch.scenario !== undefined)       row.scenario        = patch.scenario
    if (patch.spend !== undefined)          row.spend           = patch.spend
    if (patch.impressions !== undefined)    row.impressions     = patch.impressions
    if (patch.cpm !== undefined)            row.cpm             = patch.cpm
    if (patch.hookRate !== undefined)       row.hook_rate       = patch.hookRate
    if (patch.outboundCtr !== undefined)    row.outbound_ctr    = patch.outboundCtr
    if (patch.lpCtr !== undefined)          row.lp_ctr          = patch.lpCtr
    if (patch.addToCartRate !== undefined)  row.add_to_cart_rate = patch.addToCartRate
    if (patch.roas !== undefined)           row.roas            = patch.roas
    if (patch.frequency !== undefined)      row.frequency       = patch.frequency
    await supabase.from('kpi_reports').update(row).eq('id', id)
  },
  delete: async (id: string): Promise<void> => {
    await supabase.from('kpi_reports').delete().eq('id', id)
  },
}

export const reportStore = {
  getAll: async (): Promise<WeeklyReport[]> => {
    const { data } = await supabase.from('weekly_reports').select('*').order('created_at', { ascending: false })
    return (data as ReportRow[] ?? []).map(fromReport)
  },
  add: async (r: Omit<WeeklyReport, 'id' | 'createdAt'>): Promise<WeeklyReport> => {
    const { data } = await supabase.from('weekly_reports').insert(toReport(r)).select().single()
    return fromReport(data as ReportRow)
  },
  delete: async (id: string): Promise<void> => {
    await supabase.from('weekly_reports').delete().eq('id', id)
  },
}

export const teamStore = {
  getAll: async (): Promise<TeamMember[]> => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: true })
    return (data as ProfileRow[] ?? []).map(fromProfile)
  },
  update: async (id: string, patch: Partial<TeamMember>): Promise<void> => {
    const row: Record<string, unknown> = {}
    if (patch.name !== undefined)        row.name         = patch.name
    if (patch.role !== undefined)        row.role         = patch.role
    if (patch.jobTitle !== undefined)    row.job_title    = patch.jobTitle
    if (patch.department !== undefined)  row.department   = patch.department
    if (patch.permissions !== undefined) row.permissions  = patch.permissions
    if (patch.avatarColor !== undefined) row.avatar_color = patch.avatarColor
    await supabase.from('profiles').update(row).eq('id', id)
  },
  delete: async (id: string): Promise<void> => {
    await supabase.from('profiles').delete().eq('id', id)
  },
}

// Keep for backward compat
export function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export { ROLE_DEFAULTS, AVATAR_COLORS }
