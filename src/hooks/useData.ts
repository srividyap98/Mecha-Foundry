import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { applyToIdea, fetchApplicationsForIdea, fetchMyApplications, updateApplicationStatus } from '@/lib/api/applications'
import { fetchMyGroups, fetchGroup, postGroupUpdate, addMilestone, toggleMilestone } from '@/lib/api/groups'
import { fetchProducts, fetchPitches, sendInvestorMessage } from '@/lib/api/products'
import type { ApplicationStatus } from '@/types'
import { useAuthStore } from '@/store/auth.store'

// ─── Application hooks ────────────────────────────────────────────────────────
export function useApplicationsForIdea(ideaId: string) {
  return useQuery({
    queryKey: ['applications', 'idea', ideaId],
    queryFn: () => fetchApplicationsForIdea(ideaId),
    enabled: !!ideaId,
  })
}

export function useMyApplications() {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: ['applications', 'mine', user?.id],
    queryFn: () => fetchMyApplications(user!.id),
    enabled: !!user,
  })
}

export function useApplyToIdea() {
  const qc = useQueryClient()
  const { user } = useAuthStore()
  return useMutation({
    mutationFn: (payload: { ideaId: string; role_offered: string; message: string; portfolio_url?: string }) =>
      applyToIdea(payload.ideaId, user!.id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['applications'] }),
  })
}

export function useUpdateApplicationStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, ideaId }: { id: string; status: ApplicationStatus; ideaId: string }) =>
      updateApplicationStatus(id, status, ideaId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applications'] })
      qc.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}

// ─── Group hooks ──────────────────────────────────────────────────────────────
export function useMyGroups() {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: ['groups', 'mine', user?.id],
    queryFn: () => fetchMyGroups(user!.id),
    enabled: !!user,
  })
}

export function useGroup(groupId: string) {
  return useQuery({
    queryKey: ['groups', groupId],
    queryFn: () => fetchGroup(groupId),
    enabled: !!groupId,
  })
}

export function usePostGroupUpdate(groupId: string) {
  const qc = useQueryClient()
  const { user } = useAuthStore()
  return useMutation({
    mutationFn: (content: string) => postGroupUpdate(groupId, user!.id, content),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groups', groupId] }),
  })
}

export function useAddMilestone(groupId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ title, description, dueDate }: { title: string; description?: string; dueDate?: string }) =>
      addMilestone(groupId, title, description, dueDate),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groups', groupId] }),
  })
}

export function useToggleMilestone(groupId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) => toggleMilestone(id, completed),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groups', groupId] }),
  })
}

// ─── Product hooks ────────────────────────────────────────────────────────────
export function useProducts(filters?: { seeking_investment?: boolean; search?: string }) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => fetchProducts(filters),
    staleTime: 60_000,
  })
}

export function usePitches() {
  return useQuery({
    queryKey: ['pitches'],
    queryFn: fetchPitches,
    staleTime: 60_000,
  })
}

export function useSendInvestorMessage() {
  const { user } = useAuthStore()
  return useMutation({
    mutationFn: (payload: { toId: string; productId: string; subject: string; body: string; check_size: string }) =>
      sendInvestorMessage(user!.id, payload.toId, payload.productId, payload),
  })
}
