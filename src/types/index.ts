// ─── Auth & Users ───────────────────────────────────────────────────────────

export type UserRole = 'viewer' | 'creator' | 'investor'

export interface Profile {
  id: string
  email: string
  username: string
  full_name: string
  avatar_url: string | null
  bio: string | null
  role: UserRole
  location: string | null
  website: string | null
  github_url: string | null
  // Investor-specific
  investor_thesis: string | null
  investor_check_size: string | null
  investor_industries: string[] | null
  investor_verified: boolean
  created_at: string
  updated_at: string
}

// ─── Ideas ───────────────────────────────────────────────────────────────────

export type IdeaStage = 'concept' | 'mvp' | 'beta' | 'launched'
export type CollabSetting = 'open' | 'apply' | 'invite_only'
export type IdeaCategory =
  | 'ai'
  | 'fintech'
  | 'health'
  | 'education'
  | 'climate'
  | 'cybersecurity'
  | 'web3'
  | 'social'
  | 'productivity'
  | 'other'

export interface Idea {
  id: string
  creator_id: string
  title: string
  problem: string
  solution: string
  stage: IdeaStage
  category: IdeaCategory
  tags: string[]
  skills_needed: string[]
  tech_stack: string[]
  collab_setting: CollabSetting
  github_url: string | null
  figma_url: string | null
  demo_url: string | null
  doc_url: string | null
  upvote_count: number
  comment_count: number
  is_published: boolean
  created_at: string
  updated_at: string
  // Joined
  creator?: Profile
  user_has_upvoted?: boolean
  user_has_saved?: boolean
  user_application_status?: ApplicationStatus | null
}

export interface IdeaFormData {
  title: string
  problem: string
  solution: string
  stage: IdeaStage
  category: IdeaCategory
  tags: string[]
  skills_needed: string[]
  tech_stack: string[]
  collab_setting: CollabSetting
  github_url?: string
  figma_url?: string
  demo_url?: string
  doc_url?: string
}

// ─── Applications ────────────────────────────────────────────────────────────

export type ApplicationStatus = 'pending' | 'approved' | 'rejected'

export interface Application {
  id: string
  idea_id: string
  applicant_id: string
  role_offered: string
  message: string
  portfolio_url: string | null
  status: ApplicationStatus
  created_at: string
  updated_at: string
  // Joined
  idea?: Idea
  applicant?: Profile
}

// ─── Groups ──────────────────────────────────────────────────────────────────

export type MemberRole = 'creator' | 'developer' | 'designer' | 'marketer' | 'advisor' | 'other'

export interface Group {
  id: string
  idea_id: string
  name: string
  description: string | null
  is_private: boolean
  created_at: string
  updated_at: string
  // Joined
  idea?: Idea
  members?: GroupMember[]
  milestones?: Milestone[]
  recent_updates?: GroupUpdate[]
  member_count?: number
}

export interface GroupMember {
  id: string
  group_id: string
  user_id: string
  role: MemberRole
  joined_at: string
  // Joined
  profile?: Profile
}

export interface GroupUpdate {
  id: string
  group_id: string
  author_id: string
  content: string
  attachments: string[]
  created_at: string
  // Joined
  author?: Profile
}

export interface Milestone {
  id: string
  group_id: string
  title: string
  description: string | null
  due_date: string | null
  completed: boolean
  completed_at: string | null
  order_index: number
  created_at: string
}

// ─── Marketplace / Products ──────────────────────────────────────────────────

export interface Product {
  id: string
  group_id: string
  idea_id: string
  name: string
  tagline: string
  description: string
  screenshots: string[]
  demo_video_url: string | null
  live_url: string | null
  github_url: string | null
  app_store_url: string | null
  docs_url: string | null
  pricing: string | null
  is_free: boolean
  seeking_investment: boolean
  published_at: string
  created_at: string
  updated_at: string
  // Joined
  group?: Group
  idea?: Idea
  pitch?: Pitch
}

// ─── Investors ───────────────────────────────────────────────────────────────

export interface Pitch {
  id: string
  product_id: string
  creator_id: string
  headline: string
  elevator_pitch: string
  traction: string
  user_count: string
  revenue: string
  timeline: string
  ask_amount: string | null
  equity_offered: string | null
  use_of_funds: string | null
  is_public: boolean
  created_at: string
  updated_at: string
  // Joined
  product?: Product
}

export interface InvestorMessage {
  id: string
  from_id: string
  to_id: string
  product_id: string
  subject: string
  body: string
  check_size: string
  read: boolean
  created_at: string
  // Joined
  from?: Profile
  product?: Product
}

// ─── Comments ────────────────────────────────────────────────────────────────

export interface Comment {
  id: string
  idea_id: string
  author_id: string
  content: string
  parent_id: string | null
  created_at: string
  updated_at: string
  // Joined
  author?: Profile
  replies?: Comment[]
}

// ─── Notifications ────────────────────────────────────────────────────────────

export type NotificationType =
  | 'application_received'
  | 'application_approved'
  | 'application_rejected'
  | 'idea_upvote'
  | 'comment_received'
  | 'investor_message'
  | 'group_update'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string
  link: string | null
  read: boolean
  created_at: string
}

// ─── Pagination ──────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  per_page: number
  total_pages: number
}

export interface QueryFilters {
  category?: IdeaCategory
  stage?: IdeaStage
  search?: string
  page?: number
  per_page?: number
  sort?: 'newest' | 'top' | 'trending'
}
