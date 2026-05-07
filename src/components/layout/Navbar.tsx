import React from 'react'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { Bell, Plus, Search, LogOut, Settings, User, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, Button, Badge } from '@/components/ui'
import { useAuthStore } from '@/store/auth.store'

const NAV_TABS = [
  { to: '/ideas',      label: '🔬 Innovators'  },
  { to: '/groups',     label: '🤝 Collaborate'  },
  { to: '/market',     label: '🚀 Marketplace'  },
  { to: '/investors',  label: '💸 Investors'    },
]

export function Navbar({ onPostIdea }: { onPostIdea: () => void }) {
  const location = useLocation()
  const navigate  = useNavigate()
  const { profile, signOut } = useAuthStore()
  const [menuOpen, setMenuOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function handleSignOut() {
    await signOut()
    navigate({ to: '/auth' })
  }

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-6 h-14 border-b border-default bg-primary">
      {/* Logo */}
      <Link to="/ideas" className="flex items-center gap-2 font-mono font-bold text-sm text-primary shrink-0">
        <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }} />
        MECHA FOUNDRY
      </Link>

      {/* Tabs */}
      <nav className="flex items-center gap-1">
        {NAV_TABS.map(tab => (
          <Link
            key={tab.to}
            to={tab.to}
            className={cn(
              'nav-link text-xs',
              location.pathname.startsWith(tab.to) && 'active'
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-2 shrink-0">
        {profile?.role === 'creator' && (
          <Button variant="primary" size="sm" onClick={onPostIdea}>
            <Plus size={13} /> Post Idea
          </Button>
        )}

        <button className="btn-icon text-muted hover:text-primary transition-colors relative">
          <Bell size={16} />
          <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--danger)' }} />
        </button>

        {/* Profile menu */}
        {profile && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-tertiary transition-colors"
            >
              <Avatar name={profile.full_name} src={profile.avatar_url} size="xs" />
              <span className="text-xs font-medium text-secondary hidden sm:block">{profile.username}</span>
              <ChevronDown size={12} className="text-muted" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-52 card py-1 shadow-xl z-50 animate-fade-in">
                <div className="px-3 py-2 border-b border-default">
                  <p className="text-sm font-medium text-primary">{profile.full_name}</p>
                  <p className="text-xs text-muted">{profile.email}</p>
                  <Badge
                    variant={profile.role === 'investor' ? 'purple' : profile.role === 'creator' ? 'green' : 'blue'}
                    className="mt-1"
                  >
                    {profile.role}
                  </Badge>
                </div>
                <button
                  onClick={() => { navigate({ to: '/profile' }); setMenuOpen(false) }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-secondary hover:text-primary hover:bg-tertiary transition-colors"
                >
                  <User size={14} /> My Profile
                </button>
                <button
                  onClick={() => { navigate({ to: '/settings' }); setMenuOpen(false) }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-secondary hover:text-primary hover:bg-tertiary transition-colors"
                >
                  <Settings size={14} /> Settings
                </button>
                <div className="divider my-1" />
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-tertiary transition-colors"
                  style={{ color: 'var(--danger)' }}
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { value: 'all',          label: 'All Ideas',     color: '#8b949e' },
  { value: 'ai',           label: 'AI / ML',       color: '#58a6ff' },
  { value: 'health',       label: 'Health',        color: '#3fb950' },
  { value: 'fintech',      label: 'Fintech',       color: '#d29922' },
  { value: 'education',    label: 'Education',     color: '#bc8cff' },
  { value: 'climate',      label: 'Climate',       color: '#39d353' },
  { value: 'cybersecurity',label: 'Cybersecurity', color: '#f85149' },
  { value: 'web3',         label: 'Web3',          color: '#bc8cff' },
  { value: 'productivity', label: 'Productivity',  color: '#58a6ff' },
]

interface SidebarProps {
  activeCategory: string
  onCategoryChange: (cat: string) => void
}

export function Sidebar({ activeCategory, onCategoryChange }: SidebarProps) {
  const navigate = useNavigate()

  return (
    <aside className="w-52 shrink-0 border-r border-default py-4 px-3 flex flex-col gap-5 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto">
      <div>
        <p className="text-[11px] font-semibold text-muted uppercase tracking-widest px-2 mb-2">Browse</p>
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => onCategoryChange(cat.value)}
            className={cn(
              'flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-sm transition-all duration-150',
              activeCategory === cat.value
                ? 'text-primary bg-tertiary'
                : 'text-secondary hover:text-primary hover:bg-tertiary'
            )}
          >
            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cat.color }} />
            {cat.label}
          </button>
        ))}
      </div>

      <div>
        <p className="text-[11px] font-semibold text-muted uppercase tracking-widest px-2 mb-2">My Space</p>
        {[
          { label: '📁 My Projects', to: '/groups' },
          { label: '🔖 Saved',       to: '/saved' },
          { label: '📩 Applications', to: '/applications' },
        ].map(item => (
          <button
            key={item.to}
            onClick={() => navigate({ to: item.to as '/' })}
            className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-sm text-secondary hover:text-primary hover:bg-tertiary transition-all"
          >
            {item.label}
          </button>
        ))}
      </div>
    </aside>
  )
}

// ─── Page shell (layout + sidebar for ideas tab) ──────────────────────────────
export function PageShell({
  sidebar,
  children,
  rightPanel,
}: {
  sidebar?: React.ReactNode
  children: React.ReactNode
  rightPanel?: React.ReactNode
}) {
  return (
    <div className="flex min-h-[calc(100vh-56px)]">
      {sidebar}
      <main className="flex-1 min-w-0 py-5 px-6">{children}</main>
      {rightPanel && (
        <aside className="w-72 shrink-0 border-l border-default py-5 px-4 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto">
          {rightPanel}
        </aside>
      )}
    </div>
  )
}
