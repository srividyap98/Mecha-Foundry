import { supabase } from '@/lib/supabase'
import type { Application, ApplicationStatus } from '@/types'

// ─── Apply to an idea ─────────────────────────────────────────────────────────
export async function applyToIdea(
  ideaId: string,
  applicantId: string,
  payload: { role_offered: string; message: string; portfolio_url?: string }
): Promise<Application> {
  const { data, error } = await supabase
    .from('applications')
    .insert({
      idea_id: ideaId,
      applicant_id: applicantId,
      role_offered: payload.role_offered,
      message: payload.message,
      portfolio_url: payload.portfolio_url ?? null,
    })
    .select(`*, applicant:profiles!applicant_id(id, username, full_name, avatar_url)`)
    .single()

  if (error) throw error
  return data as Application
}

// ─── Fetch applications for an idea (creator view) ───────────────────────────
export async function fetchApplicationsForIdea(ideaId: string): Promise<Application[]> {
  const { data, error } = await supabase
    .from('applications')
    .select(`*, applicant:profiles!applicant_id(id, username, full_name, avatar_url, bio, github_url)`)
    .eq('idea_id', ideaId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as Application[]) ?? []
}

// ─── Fetch my applications ────────────────────────────────────────────────────
export async function fetchMyApplications(userId: string): Promise<Application[]> {
  const { data, error } = await supabase
    .from('applications')
    .select(`*, idea:ideas(id, title, stage, category, creator:profiles!creator_id(full_name, avatar_url))`)
    .eq('applicant_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as Application[]) ?? []
}

// ─── Update application status ────────────────────────────────────────────────
export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
  ideaId: string
): Promise<Application> {
  const { data, error } = await supabase
    .from('applications')
    .update({ status })
    .eq('id', applicationId)
    .select()
    .single()

  if (error) throw error

  // If approved, auto-create or find the project group and add member
  if (status === 'approved') {
    const app = data as Application

    // Find or create group for this idea
    let { data: group } = await supabase
      .from('groups')
      .select('id')
      .eq('idea_id', ideaId)
      .maybeSingle()

    if (!group) {
      const { data: idea } = await supabase.from('ideas').select('title').eq('id', ideaId).single()
      const { data: newGroup } = await supabase
        .from('groups')
        .insert({ idea_id: ideaId, name: idea?.title ?? 'Project Group', is_private: true })
        .select()
        .single()
      group = newGroup
    }

    if (group) {
      await supabase.from('group_members').upsert({
        group_id: group.id,
        user_id: app.applicant_id,
        role: 'developer',
      })
    }
  }

  return data as Application
}
