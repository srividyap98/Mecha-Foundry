import React from 'react'
import { Search, ExternalLink, Github, BookOpen, TrendingUp } from 'lucide-react'
import { Badge, Button, EmptyState, Spinner } from '@/components/ui'
import { useProducts } from '@/hooks/useData'
import { stageBadgeClass, stageLabel } from '@/lib/utils'
import type { Product } from '@/types'

const CATEGORY_EMOJIS: Record<string, string> = {
  ai: '🤖', fintech: '💸', health: '🏥', education: '🎓',
  climate: '🌱', cybersecurity: '🔐', web3: '⛓', social: '👥', productivity: '⚡', other: '🔧',
}

export function MarketplacePage() {
  const [search, setSearch]       = React.useState('')
  const [seekingOnly, setSeekingOnly] = React.useState(false)
  const [activeCategory, setActiveCategory] = React.useState('all')

  const { data: products = [], isLoading } = useProducts({ seeking_investment: seekingOnly || undefined, search: search || undefined })

  const filtered = activeCategory === 'all'
    ? products
    : products.filter(p => p.idea?.category === activeCategory)

  const categories = ['all', 'ai', 'fintech', 'health', 'education', 'climate']

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary mb-1">🚀 Marketplace</h1>
        <p className="text-secondary text-sm">Discover finished products built by Mecha Foundry teams.</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="input pl-9 text-sm" />
        </div>

        <div className="flex gap-1.5">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                activeCategory === cat
                  ? 'border-accent text-accent'
                  : 'border-default text-muted hover:text-secondary'
              }`}
              style={activeCategory === cat ? { borderColor: 'var(--accent)', color: 'var(--accent)', background: 'rgba(88,166,255,0.1)' } : undefined}
            >
              {cat === 'all' ? 'All' : `${CATEGORY_EMOJIS[cat] || ''} ${cat.charAt(0).toUpperCase() + cat.slice(1)}`}
            </button>
          ))}
        </div>

        <button
          onClick={() => setSeekingOnly(v => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
            seekingOnly ? 'border-green-600 text-green-400 bg-green-400/10' : 'border-default text-muted hover:text-secondary'
          }`}
          style={seekingOnly ? { borderColor: 'var(--success-emphasis)', color: 'var(--success)', background: 'rgba(63,185,80,0.1)' } : undefined}
        >
          <TrendingUp size={12} /> Seeking Investment
        </button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size={24} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="🔭" title="No products found" body="Be the first to ship something amazing." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(product => <ProductCard key={product.id} product={product} />)}
        </div>
      )}
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  const emoji = product.idea?.category ? CATEGORY_EMOJIS[product.idea.category] : '🔧'

  return (
    <div className="card flex flex-col overflow-hidden animate-fade-in">
      {/* Hero area */}
      <div
        className="h-28 flex items-center justify-center text-5xl"
        style={{ background: 'linear-gradient(135deg, var(--bg-tertiary), var(--bg-overlay))' }}
      >
        {emoji}
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Title + badges */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-primary text-[15px]">{product.name}</h3>
            {product.seeking_investment && (
              <Badge variant="green" className="shrink-0 text-[10px]">💸 Funding</Badge>
            )}
          </div>
          <p className="text-xs text-secondary">{product.tagline}</p>
        </div>

        {/* Team */}
        {product.group && (
          <p className="text-xs text-muted">by {product.group.name}</p>
        )}

        {/* Stage + pricing */}
        <div className="flex gap-1.5 flex-wrap">
          {product.idea?.stage && (
            <Badge variant={stageBadgeClass(product.idea.stage) as 'blue'|'green'|'amber'|'purple'|'red'|'default'}>
              {stageLabel(product.idea.stage)}
            </Badge>
          )}
          <Badge variant="default">
            {product.is_free ? 'Free' : product.pricing ?? 'Paid'}
          </Badge>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-2 border-t border-default">
          {product.live_url && (
            <a href={product.live_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-accent flex-1 justify-center">
              <ExternalLink size={12} /> Live
            </a>
          )}
          {product.github_url && (
            <a href={product.github_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-secondary">
              <Github size={12} />
            </a>
          )}
          {product.docs_url && (
            <a href={product.docs_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-secondary">
              <BookOpen size={12} />
            </a>
          )}
          {product.seeking_investment && (
            <Button variant="primary" size="sm" className="flex-1">Invest</Button>
          )}
        </div>
      </div>
    </div>
  )
}
