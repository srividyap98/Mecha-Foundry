import React from 'react'
import { ArrowUp, MessageSquare, Bookmark, Github, Figma, ExternalLink, Users } from 'lucide-react'
import { Avatar, Badge, Button } from '@/components/ui'
import { cn, stageBadgeClass, stageLabel, categoryBadgeClass, categoryLabel, timeAgo, formatCount } from '@/lib/utils'
import { useToggleUpvote, useToggleSave } from '@/hooks/useIdeas'
import { useAuthStore } from '@/store/auth.store'
import type { Idea } from '@/types'

interface IdeaCardProps {
  idea: Idea
  onApply?: (idea: Idea) => void
  onView?:  (idea: Idea) => void
  compact?: boolean
}

export function IdeaCard({ idea, onApply, onView, compact }: IdeaCardProps) {
  const { profile } = useAuthStore()
  const toggleUpvote = useToggleUpvote()
  const toggleSave   = useToggleSave()

  const isOwner  = profile?.id === idea.creator_id
  const canApply = !isOwner
    && idea.collab_setting !== 'invite_only'
    && !idea.user_application_status

  function handleUpvote(e: React.MouseEvent) {
    e.stopPropagation()
    if (!profile) return
    toggleUpvote.mutate({ ideaId: idea.id, hasUpvoted: !!idea.user_has_upvoted })
  }

  function handleSave(e: React.MouseEvent) {
    e.stopPropagation()
    if (!profile) return
    toggleSave.mutate({ ideaId: idea.id, hasSaved: !!idea.user_has_saved })
  }

  return (
    <div
      className={cn('card p-4 flex flex-col gap-3 cursor-pointer animate-fade-in')}
      onClick={() => onView?.(idea)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-primary text-[15px] leading-snug mb-1.5">{idea.title}</h3>
          <div className="flex items-center gap-2">
            {idea.creator && (
              <>
                <Avatar name={idea.creator.full_name} src={idea.creator.avatar_url} size="xs" />
                <span className="text-xs text-secondary">{idea.creator.full_name}</span>
              </>
            )}
            <span className="text-xs text-muted">· {timeAgo(idea.created_at)}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <Badge variant={stageBadgeClass(idea.stage) as 'blue' | 'green' | 'amber' | 'purple' | 'red' | 'default'}>
            {stageLabel(idea.stage)}
          </Badge>
          <Badge variant={categoryBadgeClass(idea.category) as 'blue' | 'green' | 'amber' | 'purple' | 'red' | 'default'}>
            {categoryLabel(idea.category)}
          </Badge>
        </div>
      </div>

      {/* Body */}
      {!compact && (
        <div className="flex flex-col gap-1.5 text-sm text-secondary">
          <p><span className="text-[11px] font-medium text-muted uppercase tracking-wide">Problem</span><br />{idea.problem}</p>
          <p><span className="text-[11px] font-medium text-muted uppercase tracking-wide">Solution</span><br />{idea.solution}</p>
        </div>
      )}

      {/* Tags */}
      {idea.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {idea.tags.map(tag => <Badge key={tag} variant="default">{tag}</Badge>)}
        </div>
      )}

      {/* Skills */}
      {idea.skills_needed.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted">Looking for:</span>
          {idea.skills_needed.slice(0, 3).map(skill => (
            <span key={skill} className="text-xs text-secondary flex items-center gap-1">
              <span style={{ color: 'var(--accent)' }}>🔧</span> {skill}
            </span>
          ))}
          {idea.skills_needed.length > 3 && <span className="text-xs text-muted">+{idea.skills_needed.length - 3} more</span>}
        </div>
      )}

      {/* Divider */}
      <div className="divider" />

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {/* Upvote */}
          <button
            onClick={handleUpvote}
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-all',
              idea.user_has_upvoted
                ? 'text-accent bg-accent/10'
                : 'text-muted hover:text-secondary hover:bg-tertiary'
            )}
            style={idea.user_has_upvoted ? { color: 'var(--accent)', background: 'rgba(88,166,255,0.1)' } : undefined}
          >
            <ArrowUp size={13} />
            {formatCount(idea.upvote_count)}
          </button>

          {/* Comments */}
          <button className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs text-muted hover:text-secondary hover:bg-tertiary transition-all">
            <MessageSquare size={13} />
            {idea.comment_count}
          </button>

          {/* Save */}
          <button
            onClick={handleSave}
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-all',
              idea.user_has_saved ? 'text-amber-400' : 'text-muted hover:text-secondary hover:bg-tertiary'
            )}
            style={idea.user_has_saved ? { color: 'var(--warning)' } : undefined}
          >
            <Bookmark size={13} fill={idea.user_has_saved ? 'currentColor' : 'none'} />
            {idea.user_has_saved ? 'Saved' : 'Save'}
          </button>
        </div>

        <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
          {idea.github_url && (
            <a href={idea.github_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-secondary py-0.5 px-2">
              <Github size={12} />
            </a>
          )}
          {idea.figma_url && (
            <a href={idea.figma_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-secondary py-0.5 px-2">
              <Figma size={12} />
            </a>
          )}
          {idea.demo_url && (
            <a href={idea.demo_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-secondary py-0.5 px-2">
              <ExternalLink size={12} />
            </a>
          )}

          {isOwner && (
            <Badge variant="green" className="text-[10px]">Your Idea</Badge>
          )}
          {idea.user_application_status && !isOwner && (
            <Badge variant={idea.user_application_status === 'approved' ? 'green' : idea.user_application_status === 'rejected' ? 'red' : 'amber'}>
              {idea.user_application_status === 'pending' ? '⏳ Applied' : idea.user_application_status === 'approved' ? '✅ Accepted' : '❌ Passed'}
            </Badge>
          )}
          {canApply && (
            <Button
              size="sm"
              variant="accent"
              onClick={(e) => { e.stopPropagation(); onApply?.(idea) }}
            >
              <Users size={12} /> Collaborate
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
