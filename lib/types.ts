export type BriefStatus = 'Draft' | 'In Production' | 'Under Review' | 'Approved' | 'Rework'
export type CreativeFormat = 'Video 15s' | 'Video 30s' | 'Static Image' | 'Carousel'
export type Priority = 'Urgent' | 'Normal'
export type DiagnosticScenario = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'

// ─── Team & Permissions ───────────────────────────────────────────────────────

export type MemberRole = 'Admin' | 'Chief' | 'Member'

// Pages a member can access
export type PageKey = 'dashboard' | 'briefs' | 'launches' | 'kpi' | 'reworks' | 'reports' | 'team'

// Actions a member can perform (scoped per page)
export type ActionKey = 'create' | 'edit' | 'delete' | 'view'

export interface PagePermission {
  page: PageKey
  actions: ActionKey[]
}

// Default permissions per role — can be overridden per member
export const ROLE_DEFAULTS: Record<MemberRole, PagePermission[]> = {
  Admin: [
    { page: 'dashboard', actions: ['view', 'create', 'edit', 'delete'] },
    { page: 'briefs',    actions: ['view', 'create', 'edit', 'delete'] },
    { page: 'launches',  actions: ['view', 'create', 'edit', 'delete'] },
    { page: 'kpi',       actions: ['view', 'create', 'edit', 'delete'] },
    { page: 'reworks',   actions: ['view', 'create', 'edit', 'delete'] },
    { page: 'reports',   actions: ['view', 'create', 'edit', 'delete'] },
    { page: 'team',      actions: ['view', 'create', 'edit', 'delete'] },
  ],
  Chief: [
    { page: 'dashboard', actions: ['view'] },
    { page: 'briefs',    actions: ['view', 'create', 'edit', 'delete'] },
    { page: 'launches',  actions: ['view', 'create', 'edit', 'delete'] },
    { page: 'kpi',       actions: ['view', 'create', 'edit', 'delete'] },
    { page: 'reworks',   actions: ['view', 'create', 'edit', 'delete'] },
    { page: 'reports',   actions: ['view', 'create', 'edit', 'delete'] },
    { page: 'team',      actions: ['view'] },
  ],
  Member: [
    { page: 'dashboard', actions: ['view'] },
    { page: 'briefs',    actions: ['view', 'create'] },
    { page: 'launches',  actions: ['view'] },
    { page: 'kpi',       actions: ['view'] },
    { page: 'reworks',   actions: ['view', 'create'] },
    { page: 'reports',   actions: ['view'] },
    { page: 'team',      actions: [] },
  ],
}

export interface TeamMember {
  id: string
  name: string
  email: string
  role: MemberRole
  jobTitle: string        // free text — "Media Buyer", "Video Editor", "Copywriter", etc.
  department: string      // free text — "Creative", "Media Buying", "Development", etc.
  permissions: PagePermission[]  // starts from role defaults, can be customised
  avatarColor: string     // for avatar display
  createdAt: string
}

// ─── Original types ───────────────────────────────────────────────────────────

export interface Product {
  id: string
  name: string
  buyerName: string
  stage: 'New' | 'Established' | 'Scaled'
}

export interface CreativeBrief {
  id: string
  product: string
  marketingAngle: string
  buyerPersona: string
  format: CreativeFormat
  hook: string
  cta: string
  landingPageUrl: string
  assignedTo: string
  dueDate: string
  mediaBuyerOwner: string
  status: BriefStatus
  createdAt: string
}

export interface LaunchCard {
  id: string
  briefId?: string
  creativeFiles: string
  product: string
  marketingAngle: string
  mediaBuyer: string
  adAccount: string
  campaignName: string
  adSetName: string
  facebookPage: string
  adCopyVersion: string
  landingPageUrl: string
  dailyBudget: number
  testDuration: number
  launchDate: string
  killDate: string
  audienceTargeting: string
  placement: string
  status: 'Pending' | 'Live' | 'Ended' | 'Killed'
}

export interface ReworkNotice {
  id: string
  briefId: string
  creativeFileName: string
  reworkReason: string
  whatsMissing: string
  reference: string
  priority: Priority
  newVersionDue: string
  mediaBuyer: string
  status: 'Open' | 'In Progress' | 'Resolved'
  createdAt: string
}

export interface KPIReport {
  id: string
  launchCardId: string
  creativeFile: string
  product: string
  mediaBuyer: string
  angle: string
  spend: number
  impressions: number
  cpm: number
  hookRate: number
  outboundCtr: number
  lpCtr: number
  addToCartRate: number
  roas: number
  frequency: number
  scenario: DiagnosticScenario | null
  reportedAt: string
}

export interface WeeklyReport {
  id: string
  mediaBuyer: string
  product: string
  weekEnding: string
  totalCreativesTested: number
  totalSpend: number
  angleSummary: string
  winners: string
  underperformers: string
  reworkRequests: string
  newAngleRecommendations: string
  createdAt: string
}

// ─── KPI config ───────────────────────────────────────────────────────────────

export const KPI_BENCHMARKS = {
  cpm:          { good: 15,  poor: 25,  unit: '$', label: 'CPM',             lowerIsBetter: true  },
  hookRate:     { good: 30,  poor: 20,  unit: '%', label: 'Hook Rate (3s)',   lowerIsBetter: false },
  outboundCtr:  { good: 1.5, poor: 0.8, unit: '%', label: 'Outbound CTR',    lowerIsBetter: false },
  lpCtr:        { good: 60,  poor: 40,  unit: '%', label: 'LP Click-through', lowerIsBetter: false },
  addToCartRate:{ good: 8,   poor: 4,   unit: '%', label: 'Add to Cart Rate', lowerIsBetter: false },
  frequency:    { good: 2,   poor: 2,   unit: 'x', label: 'Frequency',       lowerIsBetter: true  },
}

export const DIAGNOSTIC_SCENARIOS: Record<DiagnosticScenario, { label: string; symptoms: string; diagnosis: string; action: string; owner: string }> = {
  A: { label: 'Audience Problem',    symptoms: 'High CPM + Low everything else',          diagnosis: 'Audience or relevance problem',              action: 'Try new targeting or different angle',          owner: 'Media Buyer'   },
  B: { label: 'Bad Hook',            symptoms: 'Good CPM + Low Hook Rate',                diagnosis: 'First 3 seconds failing',                    action: 'Creative rework — new hook needed',             owner: 'Creative Team' },
  C: { label: 'Weak CTA/Angle',      symptoms: 'Good Hook Rate + Low Outbound CTR',       diagnosis: 'Creative watchable but not convincing',       action: 'Rework the angle or CTA',                       owner: 'Creative Team' },
  D: { label: 'LP Problem',          symptoms: 'Good Outbound CTR + No Purchases',        diagnosis: 'Ad is working, LP is the problem',            action: 'Escalate to LP owner — NOT creative team',      owner: 'LP Owner'      },
  E: { label: 'Checkout Friction',   symptoms: 'Good CTR + Good ATC + No Purchase',       diagnosis: 'Checkout friction',                          action: 'Payment, trust badges, or price issue',          owner: 'LP Owner'      },
  F: { label: 'Weak Creative',       symptoms: 'Low CPM + Low CTR',                       diagnosis: 'Cheap impressions but creative not engaging', action: 'Rework creative content, keep audience',         owner: 'Creative Team' },
  G: { label: 'WINNER',              symptoms: 'All KPIs good + Positive ROAS',           diagnosis: 'Winner found',                               action: 'Scale budget. Document angle. Share with all MBs.', owner: 'Media Buyer' },
}

export const PRODUCTS: Product[] = [
  { id: '1', name: 'Product A', buyerName: 'Media Buyer #1', stage: 'New' },
  { id: '2', name: 'Product B', buyerName: 'Media Buyer #2', stage: 'Established' },
  { id: '3', name: 'Product C', buyerName: 'Media Buyer #3', stage: 'Scaled' },
]

// legacy — used in dropdowns before team system; kept for backward compat
export const TEAM_MEMBERS = [
  'Creative Director',
  'Sarah (Video Editor)',
  'James (Designer)',
  'Alex (Creative Strategist)',
  'Media Buyer #1',
  'Media Buyer #2',
  'Media Buyer #3',
]

export const AVATAR_COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500',
  'bg-pink-500', 'bg-teal-500', 'bg-red-500', 'bg-indigo-500',
]
