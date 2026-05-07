import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { fetchIdeas, fetchIdea, createIdea, updateIdea, deleteIdea, toggleUpvote, toggleSave, fetchMyIdeas, fetchSavedIdeas } from '@/lib/api/ideas'
import type { IdeaFormData, QueryFilters } from '@/types'
import { useAuthStore } from '@/store/auth.store'

export const ideaKeys = {
  all:     ['ideas'] as const,
  lists:   () => [...ideaKeys.all, 'list'] as const,
  list:    (filters: QueryFilters) => [...ideaKeys.lists(), filters] as const,
  detail:  (id: string) => [...ideaKeys.all, 'detail', id] as const,
  mine:    (userId: string) => [...ideaKeys.all, 'mine', userId] as const,
  saved:   (userId: string) => [...ideaKeys.all, 'saved', userId] as const,
}

export function useIdeas(filters: QueryFilters = {}) {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: ideaKeys.list(filters),
    queryFn: () => fetchIdeas(filters, user?.id),
    staleTime: 30_000,
  })
}

export function useInfiniteIdeas(filters: QueryFilters = {}) {
  const { user } = useAuthStore()
  return useInfiniteQuery({
    queryKey: [...ideaKeys.lists(), 'infinite', filters],
    queryFn: ({ pageParam = 1 }) => fetchIdeas({ ...filters, page: pageParam as number }, user?.id),
    getNextPageParam: (last) => last.page < last.total_pages ? last.page + 1 : undefined,
    initialPageParam: 1,
  })
}

export function useIdea(id: string) {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: ideaKeys.detail(id),
    queryFn: () => fetchIdea(id, user?.id),
    enabled: !!id,
  })
}

export function useMyIdeas() {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: ideaKeys.mine(user?.id ?? ''),
    queryFn: () => fetchMyIdeas(user!.id),
    enabled: !!user,
  })
}

export function useSavedIdeas() {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: ideaKeys.saved(user?.id ?? ''),
    queryFn: () => fetchSavedIdeas(user!.id),
    enabled: !!user,
  })
}

export function useCreateIdea() {
  const qc = useQueryClient()
  const { user } = useAuthStore()
  return useMutation({
    mutationFn: (data: IdeaFormData) => createIdea(data, user!.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ideaKeys.lists() }),
  })
}

export function useUpdateIdea(ideaId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<IdeaFormData>) => updateIdea(ideaId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ideaKeys.detail(ideaId) })
      qc.invalidateQueries({ queryKey: ideaKeys.lists() })
    },
  })
}

export function useDeleteIdea() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteIdea(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ideaKeys.lists() }),
  })
}

export function useToggleUpvote() {
  const qc = useQueryClient()
  const { user } = useAuthStore()
  return useMutation({
    mutationFn: ({ ideaId, hasUpvoted }: { ideaId: string; hasUpvoted: boolean }) =>
      toggleUpvote(ideaId, user!.id, hasUpvoted),
    onSuccess: (_data, { ideaId }) => {
      qc.invalidateQueries({ queryKey: ideaKeys.detail(ideaId) })
      qc.invalidateQueries({ queryKey: ideaKeys.lists() })
    },
  })
}

export function useToggleSave() {
  const qc = useQueryClient()
  const { user } = useAuthStore()
  return useMutation({
    mutationFn: ({ ideaId, hasSaved }: { ideaId: string; hasSaved: boolean }) =>
      toggleSave(ideaId, user!.id, hasSaved),
    onSuccess: (_data, { ideaId }) => {
      qc.invalidateQueries({ queryKey: ideaKeys.detail(ideaId) })
      qc.invalidateQueries({ queryKey: ideaKeys.lists() })
      if (user) qc.invalidateQueries({ queryKey: ideaKeys.saved(user.id) })
    },
  })
}
