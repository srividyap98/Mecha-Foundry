import { supabase } from '@/lib/supabase'
import type { Group, GroupUpdate, Milestone, MemberRole } from '@/types'

// ─── Fetch my groups ──────────────────────────────────────────────────────────
export async function fetchMyGroups(userId: string): Promise<Group[]> {
  const { data, error } = await supabase
    .from('group_members')
    .select(`
      group:groups(
        *,
        idea:ideas(id, title, stage, category),
        members:group_members(
          id, role, joined_at,
          profile:profiles!user_id(id, username, full_name, avatar_url)
        ),
        milestones(id, title, completed, order_index),
        recent_updates:group_updates(id, content, created_at, author:profiles!author_id(full_name, avatar_url))
      )
    `)
    .eq('user_id', userId)

  if (error) throw error
  return ((data ?? []).map((row: { group: unknown }) => row.group) as Group[]).filter(Boolean)
}

// ─── Fetch single group ───────────────────────────────────────────────────────
export async function fetchGroup(groupId: string): Promise<Group> {
  const { data, error } = await supabase
    .from('groups')
    .select(`
      *,
      idea:ideas(id, title, stage, category, problem, solution),
      members:group_members(
        id, role, joined_at,
        profile:profiles!user_id(id, username, full_name, avatar_url, bio, github_url)
      ),
      milestones(*, created_at),
      recent_updates:group_updates(
        *, author:profiles!author_id(id, full_name, avatar_url)
      )
    `)
    .eq('id', groupId)
    .single()

  if (error) throw error
  return data as Group
}

// ─── Post a group update ──────────────────────────────────────────────────────
export async function postGroupUpdate(
  groupId: string,
  authorId: string,
  content: string,
  attachments: string[] = []
): Promise<GroupUpdate> {
  const { data, error } = await supabase
    .from('group_updates')
    .insert({ group_id: groupId, author_id: authorId, content, attachments })
    .select(`*, author:profiles!author_id(id, full_name, avatar_url)`)
    .single()

  if (error) throw error
  return data as GroupUpdate
}

// ─── Add milestone ────────────────────────────────────────────────────────────
export async function addMilestone(
  groupId: string,
  title: string,
  description?: string,
  dueDate?: string
): Promise<Milestone> {
  const { data: existing } = await supabase
    .from('milestones')
    .select('order_index')
    .eq('group_id', groupId)
    .order('order_index', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextIndex = (existing?.order_index ?? 0) + 1

  const { data, error } = await supabase
    .from('milestones')
    .insert({ group_id: groupId, title, description: description ?? null, due_date: dueDate ?? null, order_index: nextIndex })
    .select()
    .single()

  if (error) throw error
  return data as Milestone
}

// ─── Toggle milestone complete ────────────────────────────────────────────────
export async function toggleMilestone(milestoneId: string, completed: boolean): Promise<void> {
  const { error } = await supabase
    .from('milestones')
    .update({ completed, completed_at: completed ? new Date().toISOString() : null })
    .eq('id', milestoneId)

  if (error) throw error
}

// ─── Update member role ───────────────────────────────────────────────────────
export async function updateMemberRole(memberId: string, role: MemberRole): Promise<void> {
  const { error } = await supabase.from('group_members').update({ role }).eq('id', memberId)
  if (error) throw error
}

// ─── Remove member ────────────────────────────────────────────────────────────
export async function removeMember(memberId: string): Promise<void> {
  const { error } = await supabase.from('group_members').delete().eq('id', memberId)
  if (error) throw error
}
