import React from 'react'
import { CheckCircle, Circle, Plus, Send, Users, Target, Activity } from 'lucide-react'
import { Avatar, AvatarGroup, Badge, Button, Card, EmptyState, ProgressBar, Spinner, Textarea, Modal, Input } from '@/components/ui'
import { useMyGroups, usePostGroupUpdate, useAddMilestone, useToggleMilestone } from '@/hooks/useData'
import { stageBadgeClass, stageLabel, timeAgo } from '@/lib/utils'
import { useAuthStore } from '@/store/auth.store'
import type { Group } from '@/types'

export function GroupsPage() {
  const { data: groups = [], isLoading } = useMyGroups()
  const [selected, setSelected] = React.useState<Group | null>(null)

  React.useEffect(() => {
    if (groups.length && !selected) setSelected(groups[0])
  }, [groups, selected])

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size={24} /></div>

  if (groups.length === 0) {
    return (
      <div className="max-w-lg mx-auto py-20">
        <EmptyState
          icon="🤝"
          title="No project groups yet"
          body="Post an idea and accept collaborators — a project group will be created automatically."
        />
      </div>
    )
  }

  return (
    <div className="flex gap-5 min-h-[calc(100vh-56px)]">
      {/* Group list sidebar */}
      <aside className="w-64 shrink-0 border-r border-default py-5 px-3 space-y-1">
        <p className="text-[11px] font-semibold text-muted uppercase tracking-widest px-2 mb-3">My Projects ({groups.length})</p>
        {groups.map(group => (
          <button
            key={group.id}
            onClick={() => setSelected(group)}
            className={`w-full text-left px-3 py-2.5 rounded-xl transition-all ${selected?.id === group.id ? 'bg-tertiary border border-default' : 'hover:bg-tertiary'}`}
            style={selected?.id === group.id ? { background: 'var(--bg-tertiary)' } : undefined}
          >
            <p className="text-sm font-medium text-primary truncate">{group.name}</p>
            {group.idea && (
              <p className="text-xs text-muted truncate mt-0.5">{group.idea.title}</p>
            )}
            <div className="flex items-center gap-2 mt-1.5">
              {group.idea && (
                <Badge variant={stageBadgeClass(group.idea.stage) as 'blue'|'green'|'amber'|'purple'|'red'|'default'} className="text-[10px]">
                  {stageLabel(group.idea.stage)}
                </Badge>
              )}
              <span className="text-[10px] text-muted">{group.members?.length ?? 0} members</span>
            </div>
          </button>
        ))}
      </aside>

      {/* Group detail */}
      <main className="flex-1 min-w-0 py-5 pr-5">
        {selected ? <GroupDetail group={selected} /> : null}
      </main>
    </div>
  )
}

function GroupDetail({ group }: { group: Group }) {
  const { profile } = useAuthStore()
  const [tab, setTab] = React.useState<'chat' | 'milestones' | 'members'>('chat')
  const [updateText, setUpdateText] = React.useState('')
  const [addMilestoneOpen, setAddMilestoneOpen] = React.useState(false)

  const postUpdate    = usePostGroupUpdate(group.id)
  const toggleMilestone = useToggleMilestone(group.id)

  const completedMilestones = (group.milestones ?? []).filter(m => m.completed).length
  const totalMilestones     = group.milestones?.length ?? 0
  const progress            = totalMilestones ? Math.round((completedMilestones / totalMilestones) * 100) : 0

  async function handlePostUpdate() {
    if (!updateText.trim()) return
    await postUpdate.mutateAsync(updateText.trim())
    setUpdateText('')
  }

  const TABS = [
    { id: 'chat',       label: '💬 Chat',       icon: Activity },
    { id: 'milestones', label: '🎯 Milestones', icon: Target },
    { id: 'members',    label: '👥 Members',    icon: Users },
  ] as const

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold text-primary">{group.name}</h2>
            {group.idea && (
              <p className="text-sm text-secondary mt-0.5">Idea: {group.idea.title}</p>
            )}
          </div>
          <AvatarGroup
            names={(group.members ?? []).map(m => m.profile?.full_name ?? 'Member')}
            srcs={(group.members ?? []).map(m => m.profile?.avatar_url ?? null)}
            max={5}
          />
        </div>

        {/* Progress */}
        <div className="card p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-secondary font-medium">Overall Progress</span>
            <span className="font-mono font-semibold text-primary">{progress}%</span>
          </div>
          <ProgressBar value={progress} />
          <p className="text-xs text-muted mt-2">
            {completedMilestones} of {totalMilestones} milestones complete
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-default">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${
              tab === t.id
                ? 'border-accent text-primary'
                : 'border-transparent text-muted hover:text-secondary'
            }`}
            style={tab === t.id ? { borderColor: 'var(--accent)', color: 'var(--text-primary)' } : undefined}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Chat tab */}
      {tab === 'chat' && (
        <div className="flex flex-col" style={{ height: 'calc(100vh - 320px)', minHeight: '300px' }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1 mb-3">
            {(group.recent_updates ?? []).length === 0 ? (
              <EmptyState icon="💬" title="No messages yet" body="Send the first message to your team." />
            ) : (
              [...(group.recent_updates ?? [])].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).map(update => {
                const isMe = update.author_id === profile?.id
                return (
                  <div key={update.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                    {!isMe && update.author && (
                      <Avatar name={update.author.full_name} src={update.author.avatar_url} size="xs" className="shrink-0 mt-1" />
                    )}
                    <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                      {!isMe && (
                        <span className="text-[11px] text-muted px-1">{update.author?.full_name}</span>
                      )}
                      <div
                        className="px-3 py-2 rounded-2xl text-sm leading-relaxed"
                        style={{
                          background: isMe ? 'var(--accent)' : 'var(--bg-tertiary)',
                          color: isMe ? '#fff' : 'var(--text-secondary)',
                          borderBottomRightRadius: isMe ? '4px' : '16px',
                          borderBottomLeftRadius: isMe ? '16px' : '4px',
                        }}
                      >
                        {update.content}
                      </div>
                      <span className="text-[10px] text-muted px-1">{timeAgo(update.created_at)}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Input */}
          <div className="flex gap-2 pt-3 border-t border-default">
            <Textarea
              value={updateText}
              onChange={e => setUpdateText(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handlePostUpdate() }
              }}
              placeholder="Message your team… (Enter to send)"
              rows={2}
              className="flex-1 resize-none text-sm"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handlePostUpdate}
              loading={postUpdate.isPending}
              disabled={!updateText.trim()}
              className="self-end"
            >
              <Send size={13} />
            </Button>
          </div>
        </div>
      )}

      {/* Milestones tab */}
      {tab === 'milestones' && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-end">
            <Button variant="secondary" size="sm" onClick={() => setAddMilestoneOpen(true)}>
              <Plus size={13} /> Add Milestone
            </Button>
          </div>

          {(group.milestones ?? []).length === 0 ? (
            <EmptyState icon="🎯" title="No milestones yet" body="Break your project into milestones to track progress." />
          ) : (
            [...(group.milestones ?? [])]
              .sort((a, b) => a.order_index - b.order_index)
              .map(milestone => (
                <div
                  key={milestone.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-default transition-all hover:border-emphasis"
                  style={{ background: 'var(--bg-tertiary)' }}
                >
                  <button
                    onClick={() => toggleMilestone.mutate({ id: milestone.id, completed: !milestone.completed })}
                    className="shrink-0 transition-colors"
                    style={{ color: milestone.completed ? 'var(--success)' : 'var(--border-emphasis)' }}
                  >
                    {milestone.completed
                      ? <CheckCircle size={20} />
                      : <Circle size={20} />
                    }
                  </button>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${milestone.completed ? 'line-through text-muted' : 'text-primary'}`}>
                      {milestone.title}
                    </p>
                    {milestone.description && <p className="text-xs text-muted mt-0.5">{milestone.description}</p>}
                  </div>
                  {milestone.due_date && (
                    <span className="text-xs text-muted shrink-0">{milestone.due_date}</span>
                  )}
                </div>
              ))
          )}
        </div>
      )}

      {/* Members tab */}
      {tab === 'members' && (
        <div className="grid grid-cols-2 gap-3">
          {(group.members ?? []).map(member => (
            <Card key={member.id} className="flex items-center gap-3 p-3">
              {member.profile && (
                <Avatar name={member.profile.full_name} src={member.profile.avatar_url} size="md" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary truncate">{member.profile?.full_name}</p>
                <p className="text-xs text-muted">@{member.profile?.username}</p>
                <Badge variant="default" className="mt-1 text-[10px]">{member.role}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AddMilestoneModal groupId={group.id} open={addMilestoneOpen} onClose={() => setAddMilestoneOpen(false)} />
    </div>
  )
}

function AddMilestoneModal({ groupId, open, onClose }: { groupId: string; open: boolean; onClose: () => void }) {
  const addMilestone = useAddMilestone(groupId)
  const [title, setTitle] = React.useState('')
  const [desc, setDesc]   = React.useState('')

  async function submit() {
    if (!title.trim()) return
    await addMilestone.mutateAsync({ title: title.trim(), description: desc.trim() || undefined })
    setTitle(''); setDesc(''); onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="🎯 Add Milestone" size="sm">
      <div className="flex flex-col gap-3">
        <Input label="Milestone Title *" placeholder="e.g. Launch beta to 100 users" value={title} onChange={e => setTitle(e.target.value)} />
        <Textarea label="Description (optional)" placeholder="Details about this milestone..." value={desc} onChange={e => setDesc(e.target.value)} rows={2} />
        <div className="flex justify-end gap-2 pt-2 border-t border-default">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={submit} loading={addMilestone.isPending} disabled={!title.trim()}>Add Milestone</Button>
        </div>
      </div>
    </Modal>
  )
}
