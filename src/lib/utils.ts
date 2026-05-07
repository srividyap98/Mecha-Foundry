import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format } from 'date-fns'
import type { IdeaStage, IdeaCategory, CollabSetting, ApplicationStatus, MemberRole } from '@/types'

// ─── Class utility ────────────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Date formatters ──────────────────────────────────────────────────────────
export function timeAgo(date: string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatDate(date: string) {
  return format(new Date(date), 'MMM d, yyyy')
}

// ─── Stage badge ─────────────────────────────────────────────────────────────
export function stageBadgeClass(stage: IdeaStage): string {
  return {
    concept: 'badge-amber',
    mvp:     'badge-blue',
    beta:    'badge-green',
    launched:'badge-purple',
  }[stage]
}

export function stageLabel(stage: IdeaStage): string {
  return { concept: 'Concept', mvp: 'MVP', beta: 'Beta', launched: 'Launched' }[stage]
}

// ─── Category badge ───────────────────────────────────────────────────────────
export function categoryBadgeClass(cat: IdeaCategory): string {
  return {
    ai:           'badge-blue',
    fintech:      'badge-amber',
    health:       'badge-green',
    education:    'badge-purple',
    climate:      'badge-green',
    cybersecurity:'badge-red',
    web3:         'badge-purple',
    social:       'badge-blue',
    productivity: 'badge-default',
    other:        'badge-default',
  }[cat]
}

export function categoryLabel(cat: IdeaCategory): string {
  return {
    ai: 'AI / ML', fintech: 'Fintech', health: 'Health',
    education: 'Education', climate: 'Climate', cybersecurity: 'Security',
    web3: 'Web3', social: 'Social', productivity: 'Productivity', other: 'Other',
  }[cat]
}

// ─── Collab setting ───────────────────────────────────────────────────────────
export function collabLabel(setting: CollabSetting): string {
  return {
    open:        'Open to collaborators',
    apply:       'Apply to collaborate',
    invite_only: 'Invite only',
  }[setting]
}

// ─── Application status ───────────────────────────────────────────────────────
export function applicationBadgeClass(status: ApplicationStatus): string {
  return { pending: 'badge-amber', approved: 'badge-green', rejected: 'badge-red' }[status]
}

// ─── Member role ──────────────────────────────────────────────────────────────
export function memberRoleLabel(role: MemberRole): string {
  return {
    creator:   'Creator',
    developer: 'Developer',
    designer:  'Designer',
    marketer:  'Marketer',
    advisor:   'Advisor',
    other:     'Member',
  }[role]
}

// ─── Avatar initials + color ──────────────────────────────────────────────────
const AVATAR_COLORS = [
  '#1f6feb', '#238636', '#9e6a03', '#6e40c9', '#b62324',
  '#0550ae', '#0969da', '#cf222e', '#8250df', '#2da44e',
]

export function getAvatarColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// ─── String helpers ───────────────────────────────────────────────────────────
export function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n) + '…' : str
}

export function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
}

// ─── Number formatting ────────────────────────────────────────────────────────
export function formatCount(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}
