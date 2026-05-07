import React from 'react'
import { Search, Bookmark, MessageSquare, TrendingUp, Lock } from 'lucide-react'
import { Badge, Button, EmptyState, Modal, Textarea, Select, Spinner, Avatar } from '@/components/ui'
import { usePitches, useSendInvestorMessage } from '@/hooks/useData'
import { stageBadgeClass, stageLabel } from '@/lib/utils'
import { useAuthStore } from '@/store/auth.store'
import type { Pitch } from '@/types'

const CHECK_SIZES = [
  { value: '$10k – $50k',   label: '$10k – $50k'   },
  { value: '$50k – $250k',  label: '$50k – $250k'  },
  { value: '$250k – $1M',   label: '$250k – $1M'   },
  { value: '$1M+',          label: '$1M+'           },
]

export function InvestorsPage() {
  const { profile } = useAuthStore()
  const [search, setSearch]       = React.useState('')
  const [contactTarget, setContactTarget] = React.useState<Pitch | null>(null)
  const [stageFilter, setStageFilter] = React.useState('all')

  const { data: pitches = [], isLoading } = usePitches()

  const filtered = pitches.filter(p => {
    const matchSearch = !search || p.product?.name?.toLowerCase().includes(search.toLowerCase())
    const matchStage  = stageFilter === 'all' || p.product?.idea?.stage === stageFilter
    return matchSearch && matchStage
  })

  // Role gate
  if (profile?.role !== 'investor') {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="card p-10 flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(188,140,255,0.1)' }}>
            <Lock size={24} style={{ color: 'var(--purple)' }} />
          </div>
          <h2 className="text-xl font-bold text-primary">Investor Access Required</h2>
          <p className="text-secondary text-sm max-w-xs">
            The Investors tab is exclusively for verified investors. Switch your role to Investor to browse deal flow and contact founders.
          </p>
          <div className="flex flex-col gap-2 w-full max-w-xs text-sm text-left mt-2" style={{ color: 'var(--text-secondary)' }}>
            <p className="font-medium text-primary">To access this tab:</p>
            <ol className="list-decimal list-inside space-y-1 text-secondary">
              <li>Go to Settings → Role</li>
              <li>Select "Investor"</li>
              <li>Complete your investor profile</li>
            </ol>
          </div>
          <Button variant="primary" onClick={() => window.location.href = '/settings'}>
            Go to Settings
          </Button>

          {/* Blurred preview */}
          <div className="w-full mt-2 relative">
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl" style={{ backdropFilter: 'blur(6px)', background: 'rgba(13,17,23,0.5)' }}>
              <Badge variant="purple">🔒 Investor Only</Badge>
            </div>
            <div className="card p-4 opacity-50 pointer-events-none">
              <div className="h-4 w-48 rounded mb-2" style={{ background: 'var(--bg-overlay)' }} />
              <div className="h-3 w-32 rounded mb-4" style={{ background: 'var(--bg-overlay)' }} />
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="rounded-lg p-2 text-center" style={{ background: 'var(--bg-tertiary)' }}>
                    <div className="h-4 w-12 mx-auto rounded mb-1" style={{ background: 'var(--bg-overlay)' }} />
                    <div className="h-2 w-8 mx-auto rounded" style={{ background: 'var(--bg-overlay)' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary mb-1">💸 Deal Flow</h1>
        <p className="text-secondary text-sm">
          {filtered.length} product{filtered.length !== 1 ? 's' : ''} seeking investment
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Pitches Available', value: pitches.length },
          { label: 'Industries',        value: new Set(pitches.map(p => p.product?.idea?.category)).size },
          { label: 'Avg Stage',         value: 'MVP' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <p className="text-2xl font-mono font-bold text-primary">{s.value}</p>
            <p className="text-xs text-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-5 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search pitches..." className="input pl-9 text-sm" />
        </div>
        {['all', 'concept', 'mvp', 'beta', 'launched'].map(s => (
          <button
            key={s}
            onClick={() => setStageFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${stageFilter === s ? 'border-accent text-accent' : 'border-default text-muted hover:text-secondary'}`}
            style={stageFilter === s ? { borderColor: 'var(--accent)', color: 'var(--accent)', background: 'rgba(88,166,255,0.1)' } : undefined}
          >
            {s === 'all' ? 'All Stages' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Pitches */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size={24} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="🔭" title="No pitches found" body="Check back later or adjust your filters." />
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map(pitch => (
            <PitchCard key={pitch.id} pitch={pitch} onContact={() => setContactTarget(pitch)} />
          ))}
        </div>
      )}

      <ContactFounderModal pitch={contactTarget} open={!!contactTarget} onClose={() => setContactTarget(null)} />
    </div>
  )
}

function PitchCard({ pitch, onContact }: { pitch: Pitch; onContact: () => void }) {
  const metrics = [
    { label: 'Traction',  value: pitch.traction  },
    { label: 'Users',     value: pitch.user_count },
    { label: 'Revenue',   value: pitch.revenue    },
    { label: 'Timeline',  value: pitch.timeline   },
  ]

  return (
    <div className="card p-5 animate-fade-in">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-primary">{pitch.product?.name ?? 'Product'}</h3>
            <Badge variant="green" className="text-[10px]">💸 Seeking</Badge>
          </div>
          <p className="text-sm text-secondary">{pitch.headline}</p>
          {pitch.product?.idea && (
            <div className="flex gap-2 mt-2">
              <Badge variant={stageBadgeClass(pitch.product.idea.stage) as 'blue'|'green'|'amber'|'purple'|'red'|'default'}>
                {stageLabel(pitch.product.idea.stage)}
              </Badge>
              <Badge variant="default">{pitch.product.idea.category}</Badge>
            </div>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <Button size="sm" variant="secondary"><Bookmark size={13} /></Button>
          <Button size="sm" variant="primary" onClick={onContact}>
            <MessageSquare size={13} /> Contact
          </Button>
        </div>
      </div>

      <p className="text-sm text-secondary mb-4 leading-relaxed">{pitch.elevator_pitch}</p>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {metrics.map(m => (
          <div key={m.label} className="rounded-lg p-3 text-center" style={{ background: 'var(--bg-tertiary)' }}>
            <p className="text-sm font-mono font-bold text-primary">{m.value}</p>
            <p className="text-[10px] text-muted mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>

      {pitch.ask_amount && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg" style={{ background: 'rgba(63,185,80,0.08)', border: '1px solid var(--success-emphasis)' }}>
          <TrendingUp size={14} style={{ color: 'var(--success)' }} />
          <span className="text-xs" style={{ color: 'var(--success)' }}>
            Raising <strong>{pitch.ask_amount}</strong>
            {pitch.equity_offered && ` for ${pitch.equity_offered} equity`}
          </span>
        </div>
      )}
    </div>
  )
}

function ContactFounderModal({ pitch, open, onClose }: { pitch: Pitch | null; open: boolean; onClose: () => void }) {
  const [body, setBody]           = React.useState('')
  const [checkSize, setCheckSize] = React.useState(CHECK_SIZES[0].value)
  const sendMessage = useSendInvestorMessage()

  async function submit() {
    if (!pitch?.product || !body.trim()) return
    // In production, fetch product's creator id
    await sendMessage.mutateAsync({
      toId:      pitch.creator_id,
      productId: pitch.product_id,
      subject:   `Investment interest in ${pitch.product.name}`,
      body:      body.trim(),
      check_size: checkSize,
    })
    setBody('')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="📩 Contact Founder" size="sm">
      {pitch && (
        <div className="mb-4 px-3 py-2 rounded-lg text-sm" style={{ background: 'var(--bg-tertiary)' }}>
          <p className="text-xs text-muted">Reaching out about</p>
          <p className="font-medium text-primary">{pitch.product?.name}</p>
        </div>
      )}
      <div className="flex flex-col gap-3">
        <Select
          label="Check Size"
          options={CHECK_SIZES}
          value={checkSize}
          onChange={e => setCheckSize(e.target.value)}
        />
        <Textarea
          label="Message *"
          placeholder="Introduce yourself, your fund, and why you're interested..."
          rows={4}
          value={body}
          onChange={e => setBody(e.target.value)}
        />
        <div className="flex justify-end gap-2 pt-2 border-t border-default">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={submit} loading={sendMessage.isPending} disabled={!body.trim()}>
            Send Message
          </Button>
        </div>
      </div>
    </Modal>
  )
}
