import { supabase } from '@/lib/supabase'
import type { Idea, IdeaFormData, QueryFilters, PaginatedResponse } from '@/types'

const PER_PAGE = 20

// ─── Fetch ideas (feed) ───────────────────────────────────────────────────────
export async function fetchIdeas(
  filters: QueryFilters = {},
  userId?: string
): Promise<PaginatedResponse<Idea>> {
  const { category, stage, search, page = 1, per_page = PER_PAGE, sort = 'newest' } = filters

  let query = supabase
    .from('ideas')
    .select(
      `*, creator:profiles!creator_id(id, username, full_name, avatar_url, role)`,
      { count: 'exact' }
    )
    .eq('is_published', true)
    .range((page - 1) * per_page, page * per_page - 1)

  if (category) query = query.eq('category', category)
  if (stage)    query = query.eq('stage', stage)
  if (search)   query = query.ilike('title', `%${search}%`)

  switch (sort) {
    case 'top':      query = query.order('upvote_count', { ascending: false }); break
    case 'trending': query = query.order('comment_count', { ascending: false }); break
    default:         query = query.order('created_at', { ascending: false })
  }

  const { data, error, count } = await query
  if (error) throw error

  // Attach user-specific flags
  let ideas = (data as Idea[]) ?? []
  if (userId && ideas.length > 0) {
    const ids = ideas.map(i => i.id)

    const [{ data: upvotes }, { data: saved }, { data: applications }] = await Promise.all([
      supabase.from('upvotes').select('idea_id').eq('user_id', userId).in('idea_id', ids),
      supabase.from('saved_ideas').select('idea_id').eq('user_id', userId).in('idea_id', ids),
      supabase.from('applications').select('idea_id, status').eq('applicant_id', userId).in('idea_id', ids),
    ])

    const upvotedSet = new Set((upvotes ?? []).map(u => u.idea_id))
    const savedSet   = new Set((saved ?? []).map(s => s.idea_id))
    const appMap     = new Map((applications ?? []).map(a => [a.idea_id, a.status]))

    ideas = ideas.map(idea => ({
      ...idea,
      user_has_upvoted: upvotedSet.has(idea.id),
      user_has_saved:   savedSet.has(idea.id),
      user_application_status: appMap.get(idea.id) ?? null,
    }))
  }

  return {
    data: ideas,
    count: count ?? 0,
    page,
    per_page,
    total_pages: Math.ceil((count ?? 0) / per_page),
  }
}

// ─── Fetch single idea ────────────────────────────────────────────────────────
export async function fetchIdea(id: string, userId?: string): Promise<Idea> {
  const { data, error } = await supabase
    .from('ideas')
    .select(`*, creator:profiles!creator_id(*)`)
    .eq('id', id)
    .single()

  if (error) throw error

  let idea = data as Idea
  if (userId) {
    const [{ data: upvote }, { data: savedRow }, { data: app }] = await Promise.all([
      supabase.from('upvotes').select('id').eq('user_id', userId).eq('idea_id', id).maybeSingle(),
      supabase.from('saved_ideas').select('id').eq('user_id', userId).eq('idea_id', id).maybeSingle(),
      supabase.from('applications').select('status').eq('applicant_id', userId).eq('idea_id', id).maybeSingle(),
    ])
    idea = {
      ...idea,
      user_has_upvoted: !!upvote,
      user_has_saved:   !!savedRow,
      user_application_status: app?.status ?? null,
    }
  }
  return idea
}

// ─── Create idea ──────────────────────────────────────────────────────────────
export async function createIdea(data: IdeaFormData, creatorId: string): Promise<Idea> {
  const { data: idea, error } = await supabase
    .from('ideas')
    .insert({ ...data, creator_id: creatorId, is_published: true })
    .select(`*, creator:profiles!creator_id(id, username, full_name, avatar_url, role)`)
    .single()

  if (error) throw error

  // Auto-create a project group so the idea shows up in My Projects immediately
  const { data: group } = await supabase
    .from('groups')
    .insert({ idea_id: (idea as Idea).id, name: (idea as Idea).title, is_private: false })
    .select('id')
    .single()

  if (group) {
    await supabase.from('group_members').insert({ group_id: group.id, user_id: creatorId, role: 'creator' })
  }

  return idea as Idea
}

// ─── Update idea ──────────────────────────────────────────────────────────────
export async function updateIdea(id: string, data: Partial<IdeaFormData>): Promise<Idea> {
  const { data: idea, error } = await supabase
    .from('ideas')
    .update(data)
    .eq('id', id)
    .select(`*, creator:profiles!creator_id(id, username, full_name, avatar_url, role)`)
    .single()

  if (error) throw error
  return idea as Idea
}

// ─── Delete idea ──────────────────────────────────────────────────────────────
export async function deleteIdea(id: string): Promise<void> {
  const { error } = await supabase.from('ideas').delete().eq('id', id)
  if (error) throw error
}

// ─── Toggle upvote ────────────────────────────────────────────────────────────
export async function toggleUpvote(ideaId: string, userId: string, hasUpvoted: boolean): Promise<void> {
  if (hasUpvoted) {
    await supabase.from('upvotes').delete().eq('idea_id', ideaId).eq('user_id', userId)
    await supabase.from('ideas').update({ upvote_count: supabase.rpc as never }).eq('id', ideaId)
    // Use RPC for atomic decrement
    await supabase.rpc('decrement_upvote', { idea_id: ideaId })
  } else {
    await supabase.from('upvotes').insert({ idea_id: ideaId, user_id: userId })
    await supabase.rpc('increment_upvote', { idea_id: ideaId })
  }
}

// ─── Toggle save ──────────────────────────────────────────────────────────────
export async function toggleSave(ideaId: string, userId: string, hasSaved: boolean): Promise<void> {
  if (hasSaved) {
    await supabase.from('saved_ideas').delete().eq('idea_id', ideaId).eq('user_id', userId)
  } else {
    await supabase.from('saved_ideas').insert({ idea_id: ideaId, user_id: userId })
  }
}

// ─── Fetch my ideas ───────────────────────────────────────────────────────────
export async function fetchMyIdeas(userId: string): Promise<Idea[]> {
  const { data, error } = await supabase
    .from('ideas')
    .select(`*, creator:profiles!creator_id(id, username, full_name, avatar_url, role)`)
    .eq('creator_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as Idea[]) ?? []
}

// ─── Fetch saved ideas ────────────────────────────────────────────────────────
export async function fetchSavedIdeas(userId: string): Promise<Idea[]> {
  const { data, error } = await supabase
    .from('saved_ideas')
    .select(`idea:ideas(*, creator:profiles!creator_id(id, username, full_name, avatar_url, role))`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return ((data ?? []).map((row: { idea: unknown }) => row.idea) as Idea[])
}
