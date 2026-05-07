import React from 'react'
import { Search, SlidersHorizontal, TrendingUp, Clock, Flame } from 'lucide-react'
import { IdeaCard } from '@/components/ideas/IdeaCard'
import { ApplyModal } from '@/components/ideas/ApplyModal'
import { ApplicationsPanel } from '@/components/ideas/ApplicationsPanel'
import { Sidebar, PageShell } from '@/components/layout/Navbar'
import { Button, Spinner, EmptyState, Badge } from '@/components/ui'
import { useInfiniteIdeas } from '@/hooks/useIdeas'
import { useAuthStore } from '@/store/auth.store'
import type { Idea, IdeaCategory, QueryFilters } from '@/types'

const SORT_OPTIONS = [
  { value: 'newest',   label: 'Newest',   icon: Clock },
  { value: 'top',      label: 'Top',      icon: TrendingUp },
  { value: 'trending', label: 'Trending', icon: Flame },
] as const

export function IdeasPage() {
  const { profile } = useAuthStore()
  const [category, setCategory]       = React.useState('all')
  const [sort, setSort]               = React.useState<QueryFilters['sort']>('newest')
  const [search, setSearch]           = React.useState('')
  const [debouncedSearch, setDebounced] = React.useState('')
  const [applyTarget, setApplyTarget] = React.useState<Idea | null>(null)
  const [showApplications, setShowApplications] = React.useState(false)

  // Debounce search
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const filters: QueryFilters = {
    sort,
    search:   debouncedSearch || undefined,
    category: category !== 'all' ? (category as IdeaCategory) : undefined,
  }

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } = useInfiniteIdeas(filters)

  const ideas = data?.pages.flatMap(p => p.data) ?? []
  const totalCount = data?.pages[0]?.count ?? 0

  // Right panel — trending tags
  const rightPanel = (
    <div className="flex flex-col gap-5">
      {profile?.role === 'creator' && (
        <div>
          <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-2">Creator Tools</p>
          <Button
            variant="secondary"
            className="w-full text-sm"
            onClick={() => setShowApplications(true)}
          >
            📩 View Applications
          </Button>
        </div>
      )}

      <div>
        <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">Trending Tags</p>
        <div className="flex flex-wrap gap-1.5">
          {['ai', 'sustainability', 'react', 'python', 'mobile', 'saas', 'open-source', 'b2b', 'consumer', 'api'].map(tag => (
            <button
              key={tag}
              onClick={() => setSearch(tag)}
              className="badge badge-default hover:badge-blue transition-all cursor-pointer"
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">Stats</p>
        <div className="flex flex-col gap-2">
          {[
            { label: 'Ideas Posted', value: totalCount },
            { label: 'Active Builders', value: '1.2k' },
            { label: 'Collaborations', value: '340' },
          ].map(s => (
            <div key={s.label} className="flex justify-between items-center py-1.5 border-b border-default text-sm">
              <span className="text-muted">{s.label}</span>
              <span className="font-mono font-semibold text-primary">{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <>
      <PageShell
        sidebar={<Sidebar activeCategory={category} onCategoryChange={setCategory} />}
        rightPanel={rightPanel}
      >
        {/* Section header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-semibold text-primary">💡 Ideas Feed</h1>
            <p className="text-xs text-muted mt-0.5">{totalCount} ideas · find your next collab</p>
          </div>
        </div>

        {/* Search + sort */}
        <div className="flex gap-2 mb-5">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search ideas..."
              className="input pl-9 text-sm"
            />
          </div>
          <div className="flex gap-1 p-1 rounded-lg border border-default" style={{ background: 'var(--bg-tertiary)' }}>
            {SORT_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setSort(value)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  sort === value ? 'bg-secondary text-primary border border-default shadow-sm' : 'text-muted hover:text-secondary'
                }`}
                style={sort === value ? { background: 'var(--bg-secondary)' } : undefined}
              >
                <Icon size={12} /> {label}
              </button>
            ))}
          </div>
          <Button variant="secondary" size="sm">
            <SlidersHorizontal size={13} /> Filter
          </Button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size={24} /></div>
        ) : isError ? (
          <EmptyState icon="⚠️" title="Failed to load ideas" body="Check your connection and try again." />
        ) : ideas.length === 0 ? (
          <EmptyState icon="🔭" title="No ideas found" body="Try a different search or category." />
        ) : (
          <div className="flex flex-col gap-3">
            {ideas.map(idea => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                onApply={setApplyTarget}
                onView={(i) => console.log('view idea', i.id)}
              />
            ))}

            {hasNextPage && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="secondary"
                  onClick={() => fetchNextPage()}
                  loading={isFetchingNextPage}
                >
                  Load More
                </Button>
              </div>
            )}
          </div>
        )}
      </PageShell>

      {/* Modals */}
      <ApplyModal idea={applyTarget} open={!!applyTarget} onClose={() => setApplyTarget(null)} />
      <ApplicationsPanel open={showApplications} onClose={() => setShowApplications(false)} />
    </>
  )
}
