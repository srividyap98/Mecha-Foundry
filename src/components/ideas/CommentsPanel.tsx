import React from 'react'
import { Send, Trash2 } from 'lucide-react'
import { Modal, Avatar, Button, Spinner, EmptyState } from '@/components/ui'
import { useComments, usePostComment, useDeleteComment } from '@/hooks/useIdeas'
import { useAuthStore } from '@/store/auth.store'
import { timeAgo } from '@/lib/utils'
import type { Idea } from '@/types'

interface CommentsPanelProps {
  idea: Idea | null
  open: boolean
  onClose: () => void
}

export function CommentsPanel({ idea, open, onClose }: CommentsPanelProps) {
  const { profile } = useAuthStore()
  const [text, setText] = React.useState('')
  const bottomRef = React.useRef<HTMLDivElement>(null)

  const { data: comments = [], isLoading } = useComments(idea?.id ?? '')
  const postComment  = usePostComment(idea?.id ?? '')
  const deleteComment = useDeleteComment(idea?.id ?? '')

  React.useEffect(() => {
    if (open) setText('')
  }, [open, idea?.id])

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comments.length])

  async function handlePost() {
    if (!text.trim() || !idea) return
    await postComment.mutateAsync({ content: text.trim() })
    setText('')
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handlePost()
  }

  return (
    <Modal open={open} onClose={onClose} title={`💬 Comments · ${idea?.title ?? ''}`} size="md">
      <div className="flex flex-col" style={{ height: '60vh' }}>
        {/* Comments list */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1 mb-4">
          {isLoading ? (
            <div className="flex justify-center py-8"><Spinner size={20} /></div>
          ) : comments.length === 0 ? (
            <EmptyState icon="💬" title="No comments yet" body="Be the first to leave a comment." />
          ) : (
            comments.map(comment => (
              <div key={comment.id} className="flex gap-3 group">
                <Avatar
                  name={comment.author?.full_name ?? 'User'}
                  src={comment.author?.avatar_url ?? null}
                  size="sm"
                  className="shrink-0 mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-primary">{comment.author?.full_name}</span>
                    <span className="text-xs text-muted">@{comment.author?.username}</span>
                    <span className="text-xs text-muted">· {timeAgo(comment.created_at)}</span>
                    {comment.author_id === profile?.id && (
                      <button
                        onClick={() => deleteComment.mutate(comment.id)}
                        className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-muted hover:text-danger"
                        style={{ color: 'var(--danger)' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-secondary leading-relaxed">{comment.content}</p>
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        {profile && (
          <div className="flex gap-2 pt-3 border-t border-default">
            <Avatar name={profile.full_name} src={profile.avatar_url} size="sm" className="shrink-0 mt-1" />
            <div className="flex-1 flex gap-2">
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Write a comment… (⌘+Enter to send)"
                rows={2}
                className="input flex-1 resize-none text-sm py-2"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handlePost}
                loading={postComment.isPending}
                disabled={!text.trim()}
                className="self-end"
              >
                <Send size={13} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
