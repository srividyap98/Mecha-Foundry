import React from 'react'
import { IdeaCard } from '@/components/ideas/IdeaCard'
import { ApplyModal } from '@/components/ideas/ApplyModal'
import { CommentsPanel } from '@/components/ideas/CommentsPanel'
import { EmptyState, Spinner } from '@/components/ui'
import { useSavedIdeas } from '@/hooks/useIdeas'
import type { Idea } from '@/types'

export function SavedPage() {
  const { data: ideas = [], isLoading } = useSavedIdeas()
  const [applyTarget,   setApplyTarget]   = React.useState<Idea | null>(null)
  const [commentTarget, setCommentTarget] = React.useState<Idea | null>(null)

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-5">
        <h1 className="text-lg font-semibold text-primary">🔖 Saved Ideas</h1>
        <p className="text-xs text-muted mt-0.5">{ideas.length} saved</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size={24} /></div>
      ) : ideas.length === 0 ? (
        <EmptyState
          icon="🔖"
          title="Nothing saved yet"
          body="Bookmark ideas from the feed to find them here later."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {ideas.map(idea => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onApply={setApplyTarget}
              onComment={setCommentTarget}
              onView={() => {}}
            />
          ))}
        </div>
      )}

      <ApplyModal idea={applyTarget} open={!!applyTarget} onClose={() => setApplyTarget(null)} />
      <CommentsPanel idea={commentTarget} open={!!commentTarget} onClose={() => setCommentTarget(null)} />
    </div>
  )
}
