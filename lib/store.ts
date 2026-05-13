import { CreativeBrief, LaunchCard, ReworkNotice, KPIReport, WeeklyReport, TeamMember, ROLE_DEFAULTS, AVATAR_COLORS } from './types'

const KEYS = {
  briefs:        'cmp_briefs',
  launches:      'cmp_launches',
  reworks:       'cmp_reworks',
  kpis:          'cmp_kpis',
  reports:       'cmp_reports',
  team:          'cmp_team',
  activeUser:    'cmp_active_user',
}

function load<T>(key: string, seed: T[]): T[] {
  if (typeof window === 'undefined') return seed
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw) as T[]
  } catch {}
  return seed
}

function save<T>(key: string, data: T[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(data))
}

function loadOne<T>(key: string, seed: T | null): T | null {
  if (typeof window === 'undefined') return seed
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw) as T
  } catch {}
  return seed
}

export function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// ─── Seed team ────────────────────────────────────────────────────────────────

const seedTeam: TeamMember[] = [
  {
    id: 'admin-1',
    name: 'Alex Dupont',
    email: 'alex@agency.com',
    role: 'Admin',
    jobTitle: 'Creative Director',
    department: 'Management',
    permissions: ROLE_DEFAULTS['Admin'],
    avatarColor: AVATAR_COLORS[0],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'chief-1',
    name: 'Sarah Martin',
    email: 'sarah@agency.com',
    role: 'Chief',
    jobTitle: 'Video Editor',
    department: 'Creative',
    permissions: ROLE_DEFAULTS['Chief'],
    avatarColor: AVATAR_COLORS[4],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mb-1',
    name: 'James Okafor',
    email: 'james@agency.com',
    role: 'Member',
    jobTitle: 'Media Buyer',
    department: 'Media Buying',
    permissions: ROLE_DEFAULTS['Member'],
    avatarColor: AVATAR_COLORS[2],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mb-2',
    name: 'Lena Russo',
    email: 'lena@agency.com',
    role: 'Member',
    jobTitle: 'Media Buyer',
    department: 'Media Buying',
    permissions: ROLE_DEFAULTS['Member'],
    avatarColor: AVATAR_COLORS[3],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'copy-1',
    name: 'Tom Nguyen',
    email: 'tom@agency.com',
    role: 'Member',
    jobTitle: 'Copywriter',
    department: 'Creative',
    permissions: ROLE_DEFAULTS['Member'],
    avatarColor: AVATAR_COLORS[5],
    createdAt: new Date().toISOString(),
  },
]

const seedBriefs: CreativeBrief[] = [
  {
    id: uid(),
    product: 'Product A',
    marketingAngle: 'Social Proof — Before & After',
    buyerPersona: 'Women 30–45, post-pregnancy weight loss',
    format: 'Video 30s',
    hook: 'Shocking transformation clip opening',
    cta: 'Try it risk-free — link in bio',
    landingPageUrl: 'https://example.com/lp-v3',
    assignedTo: 'Sarah Martin',
    dueDate: '2026-05-20',
    mediaBuyerOwner: 'James Okafor',
    status: 'In Production',
    createdAt: new Date().toISOString(),
  },
  {
    id: uid(),
    product: 'Product B',
    marketingAngle: 'Authority — Doctor Endorsement',
    buyerPersona: 'Men 40+, struggling with energy levels',
    format: 'Video 30s',
    hook: 'Doctor speaking directly to camera',
    cta: 'See why 10k+ doctors recommend this',
    landingPageUrl: 'https://example.com/lp-authority-v1',
    assignedTo: 'Tom Nguyen',
    dueDate: '2026-05-22',
    mediaBuyerOwner: 'Lena Russo',
    status: 'Approved',
    createdAt: new Date().toISOString(),
  },
]

const seedLaunches: LaunchCard[] = [
  {
    id: uid(),
    creativeFiles: 'authority-doctor_men40+_video30s_v1.mp4',
    product: 'Product B',
    marketingAngle: 'Authority — Doctor Endorsement',
    mediaBuyer: 'Lena Russo',
    adAccount: 'act_123456789',
    campaignName: 'MB2_ProductB_Testing_May2026',
    adSetName: 'ANGLE_AuthorityDoctor_Men40+_TEST',
    facebookPage: 'Product B Official',
    adCopyVersion: 'Copy v2 — doctor trust angle',
    landingPageUrl: 'https://example.com/lp-authority-v1',
    dailyBudget: 20,
    testDuration: 3,
    launchDate: '2026-05-13',
    killDate: '2026-05-16',
    audienceTargeting: 'Broad, Men 30–55, US',
    placement: 'Feed + Reels only',
    status: 'Live',
  },
]

// ─── Team store ───────────────────────────────────────────────────────────────

export const teamStore = {
  getAll: () => load<TeamMember>(KEYS.team, seedTeam),
  add: (m: Omit<TeamMember, 'id' | 'createdAt'>) => {
    const all = teamStore.getAll()
    const item: TeamMember = { ...m, id: uid(), createdAt: new Date().toISOString() }
    save(KEYS.team, [...all, item])
    return item
  },
  update: (id: string, patch: Partial<TeamMember>) => {
    const all = teamStore.getAll().map(m => m.id === id ? { ...m, ...patch } : m)
    save(KEYS.team, all)
  },
  delete: (id: string) => {
    save(KEYS.team, teamStore.getAll().filter(m => m.id !== id))
  },
}

// ─── Active user store (simulates session) ────────────────────────────────────

export const activeUserStore = {
  get: (): TeamMember | null => loadOne<TeamMember>(KEYS.activeUser, seedTeam[0]),
  set: (member: TeamMember) => {
    if (typeof window === 'undefined') return
    localStorage.setItem(KEYS.activeUser, JSON.stringify(member))
  },
  clear: () => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(KEYS.activeUser)
  },
}

// ─── Permission helpers ───────────────────────────────────────────────────────

export function can(member: TeamMember | null, page: string, action: string): boolean {
  if (!member) return false
  const pagePerm = member.permissions.find(p => p.page === page)
  return pagePerm?.actions.includes(action as never) ?? false
}

export function canView(member: TeamMember | null, page: string): boolean {
  return can(member, page, 'view')
}

// ─── Data stores ──────────────────────────────────────────────────────────────

export const briefStore = {
  getAll: () => load<CreativeBrief>(KEYS.briefs, seedBriefs),
  add: (b: Omit<CreativeBrief, 'id' | 'createdAt'>) => {
    const all = briefStore.getAll()
    const item: CreativeBrief = { ...b, id: uid(), createdAt: new Date().toISOString() }
    save(KEYS.briefs, [...all, item])
    return item
  },
  update: (id: string, patch: Partial<CreativeBrief>) => {
    const all = briefStore.getAll().map(b => b.id === id ? { ...b, ...patch } : b)
    save(KEYS.briefs, all)
  },
  delete: (id: string) => {
    save(KEYS.briefs, briefStore.getAll().filter(b => b.id !== id))
  },
}

export const launchStore = {
  getAll: () => load<LaunchCard>(KEYS.launches, seedLaunches),
  add: (l: Omit<LaunchCard, 'id'>) => {
    const all = launchStore.getAll()
    const item: LaunchCard = { ...l, id: uid() }
    save(KEYS.launches, [...all, item])
    return item
  },
  update: (id: string, patch: Partial<LaunchCard>) => {
    const all = launchStore.getAll().map(l => l.id === id ? { ...l, ...patch } : l)
    save(KEYS.launches, all)
  },
  delete: (id: string) => {
    save(KEYS.launches, launchStore.getAll().filter(l => l.id !== id))
  },
}

export const reworkStore = {
  getAll: () => load<ReworkNotice>(KEYS.reworks, []),
  add: (r: Omit<ReworkNotice, 'id' | 'createdAt'>) => {
    const all = reworkStore.getAll()
    const item: ReworkNotice = { ...r, id: uid(), createdAt: new Date().toISOString() }
    save(KEYS.reworks, [...all, item])
    return item
  },
  update: (id: string, patch: Partial<ReworkNotice>) => {
    const all = reworkStore.getAll().map(r => r.id === id ? { ...r, ...patch } : r)
    save(KEYS.reworks, all)
  },
  delete: (id: string) => {
    save(KEYS.reworks, reworkStore.getAll().filter(r => r.id !== id))
  },
}

export const kpiStore = {
  getAll: () => load<KPIReport>(KEYS.kpis, []),
  add: (k: Omit<KPIReport, 'id' | 'reportedAt'>) => {
    const all = kpiStore.getAll()
    const item: KPIReport = { ...k, id: uid(), reportedAt: new Date().toISOString() }
    save(KEYS.kpis, [...all, item])
    return item
  },
  update: (id: string, patch: Partial<KPIReport>) => {
    const all = kpiStore.getAll().map(k => k.id === id ? { ...k, ...patch } : k)
    save(KEYS.kpis, all)
  },
  delete: (id: string) => {
    save(KEYS.kpis, kpiStore.getAll().filter(k => k.id !== id))
  },
}

export const reportStore = {
  getAll: () => load<WeeklyReport>(KEYS.reports, []),
  add: (r: Omit<WeeklyReport, 'id' | 'createdAt'>) => {
    const all = reportStore.getAll()
    const item: WeeklyReport = { ...r, id: uid(), createdAt: new Date().toISOString() }
    save(KEYS.reports, [...all, item])
    return item
  },
  delete: (id: string) => {
    save(KEYS.reports, reportStore.getAll().filter(r => r.id !== id))
  },
}
