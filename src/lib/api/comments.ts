import { supabase } from '@/lib/supabase'
import type { Comment } from '@/types'

export async function fetchComments(ideaId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select(`*, author:profiles!author_id(id, username, full_name, avatar_url)`)
    .eq('idea_id', ideaId)
    .is('parent_id', null)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data as Comment[]) ?? []
}

export async function postComment(
  ideaId: string,
  authorId: string,
  content: string,
  parentId?: string
): Promise<Comment> {
  const { data, error } = await supabase
    .from('comments')
    .insert({ idea_id: ideaId, author_id: authorId, content, parent_id: parentId ?? null })
    .select(`*, author:profiles!author_id(id, username, full_name, avatar_url)`)
    .single()

  if (error) throw error
  return data as Comment
}

export async function deleteComment(commentId: string): Promise<void> {
  const { error } = await supabase.from('comments').delete().eq('id', commentId)
  if (error) throw error
}

export async function fetchStats(): Promise<{ builders: number; collaborations: number }> {
  const [{ count: builders }, { count: collaborations }] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('applications').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
  ])
  return { builders: builders ?? 0, collaborations: collaborations ?? 0 }
}
