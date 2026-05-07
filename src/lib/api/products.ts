import { supabase } from '@/lib/supabase'
import type { Product, Pitch, InvestorMessage } from '@/types'

// ─── Products ─────────────────────────────────────────────────────────────────

export async function fetchProducts(filters?: {
  seeking_investment?: boolean
  category?: string
  search?: string
}): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select(`
      *,
      idea:ideas(id, title, category, stage, tags),
      group:groups(id, name, members:group_members(profile:profiles!user_id(id, full_name, avatar_url)))
    `)
    .order('published_at', { ascending: false })

  if (filters?.seeking_investment) query = query.eq('seeking_investment', true)
  if (filters?.search) query = query.ilike('name', `%${filters.search}%`)

  const { data, error } = await query
  if (error) throw error
  return (data as Product[]) ?? []
}

export async function fetchProduct(id: string): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      idea:ideas(*, creator:profiles!creator_id(*)),
      group:groups(*, members:group_members(*, profile:profiles!user_id(*))),
      pitch:pitches(*)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Product
}

export async function publishProduct(
  groupId: string,
  ideaId: string,
  payload: {
    name: string
    tagline: string
    description: string
    pricing: string
    is_free: boolean
    seeking_investment: boolean
    live_url?: string
    github_url?: string
    docs_url?: string
  }
): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert({
      ...payload,
      group_id: groupId,
      idea_id: ideaId,
      screenshots: [],
      published_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data as Product
}

// ─── Pitches ──────────────────────────────────────────────────────────────────

export async function fetchPitches(): Promise<Pitch[]> {
  const { data, error } = await supabase
    .from('pitches')
    .select(`
      *,
      product:products(
        id, name, tagline, seeking_investment,
        idea:ideas(id, title, category, stage)
      )
    `)
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as Pitch[]) ?? []
}

export async function createPitch(
  productId: string,
  creatorId: string,
  payload: {
    headline: string
    elevator_pitch: string
    traction: string
    user_count: string
    revenue: string
    timeline: string
    ask_amount?: string
    equity_offered?: string
    use_of_funds?: string
    is_public: boolean
  }
): Promise<Pitch> {
  const { data, error } = await supabase
    .from('pitches')
    .insert({ ...payload, product_id: productId, creator_id: creatorId })
    .select()
    .single()

  if (error) throw error
  return data as Pitch
}

// ─── Investor messages ────────────────────────────────────────────────────────

export async function sendInvestorMessage(
  fromId: string,
  toId: string,
  productId: string,
  payload: { subject: string; body: string; check_size: string }
): Promise<InvestorMessage> {
  const { data, error } = await supabase
    .from('investor_messages')
    .insert({ ...payload, from_id: fromId, to_id: toId, product_id: productId })
    .select()
    .single()

  if (error) throw error
  return data as InvestorMessage
}

export async function fetchMyMessages(userId: string): Promise<InvestorMessage[]> {
  const { data, error } = await supabase
    .from('investor_messages')
    .select(`*, from:profiles!from_id(id, full_name, avatar_url), product:products(id, name)`)
    .eq('to_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as InvestorMessage[]) ?? []
}
