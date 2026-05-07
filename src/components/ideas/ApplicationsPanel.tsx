import { Modal, Avatar, Button, Badge, Spinner, EmptyState } from '@/components/ui'
import { useApplicationsForIdea, useUpdateApplicationStatus } from '@/hooks/useData'
import { useMyIdeas } from '@/hooks/useIdeas'
import { timeAgo } from '@/lib/utils'
import type { Application } from '@/types'
import { ExternalLink } from 'lucide-react'

interface Props { open: boolean; onClose: () => void }

export function ApplicationsPanel({ open, onClose }: Props) {
  const { data: myIdeas = [], isLoading: ideasLoading } = useMyIdeas()
  const firstIdeaId = myIdeas[0]?.id ?? ''
  const { data: applications = [], isLoading: appsLoading } = useApplicationsForIdea(firstIdeaId)
  const updateStatus = useUpdateApplicationStatus()

  async function handle(app: Application, status: 'approved' | 'rejected') {
    await updateStatus.mutateAsync({ id: app.id, status, ideaId: app.idea_id })
  }

  const pending  = applications.filter(a => a.status === 'pending')
  const reviewed = applications.filter(a => a.status !== 'pending')

  return (
    <Modal open={open} onClose={onClose} title="📩 Collaboration Applications" size="lg">
      {ideasLoading || appsLoading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : myIdeas.length === 0 ? (
        <EmptyState icon="💡" title="No ideas yet" body="Post an idea to start receiving collaboration requests." />
      ) : (
        <>
          {/* Idea selector if multiple */}
          {myIdeas.length > 1 && (
            <div className="mb-4 text-xs text-muted">Showing applications for: <span className="font-medium text-primary">{myIdeas[0].title}</span></div>
          )}

          {pending.length === 0 && reviewed.length === 0 ? (
            <EmptyState icon="📬" title="No applications yet" body="Share your idea — collaborators will apply here." />
          ) : (
            <div className="flex flex-col gap-3">
              {pending.length > 0 && (
                <>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wide">Pending ({pending.length})</p>
                  {pending.map(app => <ApplicationRow key={app.id} app={app} onAction={handle} loading={updateStatus.isPending} />)}
                </>
              )}
              {reviewed.length > 0 && (
                <>
                  <div className="divider mt-2" />
                  <p className="text-xs font-semibold text-muted uppercase tracking-wide">Reviewed ({reviewed.length})</p>
                  {reviewed.map(app => <ApplicationRow key={app.id} app={app} onAction={handle} loading={false} />)}
                </>
              )}
            </div>
          )}
        </>
      )}
    </Modal>
  )
}

function ApplicationRow({
  app,
  onAction,
  loading,
}: {
  app: Application
  onAction: (app: Application, status: 'approved' | 'rejected') => void
  loading: boolean
}) {
  return (
    <div className="p-3 rounded-xl border border-default flex gap-3" style={{ background: 'var(--bg-tertiary)' }}>
      {app.applicant && (
        <Avatar name={app.applicant.full_name} src={app.applicant.avatar_url} size="sm" className="shrink-0 mt-0.5" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <p className="text-sm font-medium text-primary">{app.applicant?.full_name ?? 'Unknown'}</p>
          <span className="text-xs text-muted shrink-0">{timeAgo(app.created_at)}</span>
        </div>
        <p className="text-xs text-secondary mb-1">
          <span className="font-medium" style={{ color: 'var(--accent)' }}>Role: </span>
          {app.role_offered}
        </p>
        <p className="text-xs text-secondary mb-2 leading-relaxed">{app.message}</p>
        {app.portfolio_url && (
          <a href={app.portfolio_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs mb-2" style={{ color: 'var(--accent)' }}>
            <ExternalLink size={11} /> {app.portfolio_url}
          </a>
        )}

        {app.status === 'pending' ? (
          <div className="flex gap-2">
            <Button size="sm" variant="primary" onClick={() => onAction(app, 'approved')} loading={loading}>
              ✅ Accept
            </Button>
            <Button size="sm" variant="danger" onClick={() => onAction(app, 'rejected')} loading={loading}>
              Pass
            </Button>
          </div>
        ) : (
          <Badge variant={app.status === 'approved' ? 'green' : 'red'}>
            {app.status === 'approved' ? '✅ Accepted' : '❌ Passed'}
          </Badge>
        )}
      </div>
    </div>
  )
}
